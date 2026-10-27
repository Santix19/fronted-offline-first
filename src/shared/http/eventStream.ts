import { getApiConfig } from './apiConfig';
import { getSessionToken, sessionWasRejected } from './sessionToken';

/**
 * Listening to the server, so a screen finds out things instead of asking for them.
 *
 * ## Why this is hand-rolled instead of `new EventSource(url)`
 *
 * EventSource would be twenty lines instead of a hundred, and it cannot be used here: **it cannot
 * send headers**. The stream lives under `/api/`, so the backend wants the session token in
 * `Authorization` or the device key in `X-API-Key`, and EventSource has no way to put either there.
 *
 * The usual way around that is to put the token in the query string, `?token=...`. That was
 * rejected on purpose. A session token lasts 180 days, and the URL is the single most copied part
 * of a request: it lands in the access log of every proxy on the way, in the server's own logs, and
 * in browser history. A long-lived credential written into a URL is a credential that leaks
 * somewhere nobody is watching.
 *
 * So the stream is read with `fetch()`, which can set headers, and the event format is parsed here.
 * What is lost by not using EventSource is its automatic reconnection, which is replaced below —
 * and which had to be replaced anyway, because its version keeps retrying with no regard for
 * whether the phone has signal, and this app spends most of its life without any.
 */

/** One event as it arrives. `data` is already parsed. */
export interface ServerEvent {
  tipo: 'listo' | 'sincronizado' | 'hallazgo';
  en: string;
  estanque_id?: string;
  lote_id?: string;
  dispositivo_id?: string;
  aceptados?: number;
  hallazgo?: unknown;
}

export interface StreamOptions {
  /** Only this pond's events. Without it, everything comes through. */
  pondId?: string;
  /** Only this batch's events. What the counting screen uses. */
  batchId?: string;
  onEvent: (event: ServerEvent) => void;
  /** Called when the connection opens and when it drops, to show it on screen. */
  onConnected?: (connected: boolean) => void;
}

/**
 * How long to wait before reconnecting, growing each time, and the ceiling.
 *
 * The growth matters because of where this runs. A phone at the lake drops in and out of signal all
 * day; reconnecting every second would burn battery and data to no end. The ceiling matters because
 * the server sleeps on the free plan: after a long quiet spell the first attempt is the one that
 * wakes it, and whatever the delay, that attempt takes about a minute either way.
 */
const FIRST_RETRY_MS = 1_000;
const MAX_RETRY_MS = 30_000;

/**
 * The server sends a comment every 20 s so the connection does not look idle. Going much longer
 * than that without hearing anything means the connection died without saying so — which is what
 * happens when a phone loses signal mid-stream: the socket stays open and nothing ever arrives.
 */
const SILENCE_LIMIT_MS = 60_000;

/** A connection that can be closed. What `listen` gives back. */
export interface Stream {
  close: () => void;
}

/**
 * Opens the stream and keeps it open, reconnecting as needed, until `close()` is called.
 *
 * It never throws. A stream that cannot connect is not an error the screen has to handle: the app
 * works without it, exactly as it did before there was one, and the only difference is that the
 * screen refreshes when the caretaker pulls instead of on its own.
 */
export function listen(options: StreamOptions): Stream {
  let closed = false;
  let controller: AbortController | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let retryDelay = FIRST_RETRY_MS;

  const stop = () => {
    closed = true;
    if (retryTimer) clearTimeout(retryTimer);
    controller?.abort();
    options.onConnected?.(false);
  };

  const scheduleRetry = () => {
    if (closed) return;
    options.onConnected?.(false);
    retryTimer = setTimeout(connect, retryDelay);
    retryDelay = Math.min(retryDelay * 2, MAX_RETRY_MS);
  };

  const connect = async () => {
    if (closed) return;
    // Trying while the phone knows it has no signal is a guaranteed failure that costs battery.
    // The listener below brings it back the moment the browser says there is a network again.
    if (!navigator.onLine) return scheduleRetry();

    controller = new AbortController();
    try {
      const { apiUrl, apiKey } = await getApiConfig();
      const token = getSessionToken();
      const query = new URLSearchParams();
      if (options.pondId) query.set('estanque_id', options.pondId);
      if (options.batchId) query.set('lote_id', options.batchId);
      const suffix = query.toString() ? `?${query}` : '';

      const response = await fetch(`${apiUrl}/api/eventos/stream${suffix}`, {
        headers: {
          Accept: 'text/event-stream',
          'X-API-Key': apiKey,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: controller.signal,
      });

      if (response.status === 401) {
        // The session ended somewhere else. Same handling as any other call: let the app notice
        // instead of reconnecting forever with a token nobody accepts.
        if (token) sessionWasRejected();
        return stop();
      }
      if (!response.ok || !response.body) return scheduleRetry();

      // Connected. The delay goes back to the start so the next drop is picked up quickly.
      retryDelay = FIRST_RETRY_MS;
      options.onConnected?.(true);
      await read(response.body, options.onEvent, controller);
    } catch {
      // Aborted by close(), or the connection broke. Neither is worth reporting: see the comment
      // on listen().
    }
    scheduleRetry();
  };

  // A phone coming out of a tunnel should reconnect at once and not wait out the backoff
  const online = () => {
    if (closed) return;
    retryDelay = FIRST_RETRY_MS;
    if (retryTimer) clearTimeout(retryTimer);
    connect();
  };
  window.addEventListener('online', online);

  connect();

  return {
    close: () => {
      window.removeEventListener('online', online);
      stop();
    },
  };
}

/**
 * Reads the body until it ends, handing over each complete event.
 *
 * Returns when the stream closes or falls silent for longer than the heartbeat allows.
 */
async function read(
  body: ReadableStream<Uint8Array>,
  onEvent: (event: ServerEvent) => void,
  controller: AbortController,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  // A dead connection does not announce itself: the socket stays open and nothing arrives, which is
  // exactly what a phone losing signal mid-stream looks like. Anything at all resets this, the
  // server's heartbeat comment included, so the only thing that trips it is real silence.
  let silence = setTimeout(() => controller.abort(), SILENCE_LIMIT_MS);

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return;

      clearTimeout(silence);
      silence = setTimeout(() => controller.abort(), SILENCE_LIMIT_MS);

      // stream: true because a chunk can cut a multi-byte character in half, and every message
      // here is a Spanish sentence full of accents
      buffer += decoder.decode(value, { stream: true });

      // Events are separated by a blank line. The last piece may be half an event, so it stays
      // in the buffer for the next chunk.
      const pieces = buffer.split('\n\n');
      buffer = pieces.pop() ?? '';
      pieces.forEach((piece) => {
        const event = parse(piece);
        if (event) onEvent(event);
      });
    }
  } finally {
    clearTimeout(silence);
    reader.cancel().catch(() => undefined);
  }
}

/**
 * One event block into an object, or null when there is nothing to hand over.
 *
 * Null covers the heartbeat, which arrives as a comment line starting with ':' and carries no data
 * on purpose, and anything unreadable. A malformed event is dropped rather than thrown: the stream
 * is an extra, and it must never be the reason a screen stops working.
 */
function parse(block: string): ServerEvent | null {
  const data = block
    .split('\n')
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trim())
    .join('\n');
  if (!data) return null;
  try {
    return JSON.parse(data) as ServerEvent;
  } catch {
    return null;
  }
}

/** Exported for the tests, which check the parser without a network. */
export const parseEventBlock = parse;
