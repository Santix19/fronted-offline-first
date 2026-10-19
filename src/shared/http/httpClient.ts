import { getApiConfig } from './apiConfig';
import { ApiError } from './ApiError';
import { getSessionToken, sessionWasRejected } from './sessionToken';

type Query = Record<string, string | number | boolean | undefined>;

interface RequestOptions {
  body?: unknown;
  query?: Query;
  /** true for signing in and registering: the phone has no token yet */
  anonymous?: boolean;
}

/**
 * Render's free plan sleeps after 15 min and takes about a minute to wake up,
 * so the first call waits long; once the server answered, calls fail fast.
 */
const COLD_START_TIMEOUT_MS = 90_000;
const NORMAL_TIMEOUT_MS = 20_000;
let serverAwake = false;

/** The only place that talks to the backend. Every feature api file goes through here. */
export async function apiRequest<T>(method: 'GET' | 'POST' | 'PATCH' | 'DELETE', path: string, options: RequestOptions = {}): Promise<T> {
  if (!navigator.onLine) throw new ApiError('offline', 'Sin conexión');

  const { apiUrl, apiKey } = await getApiConfig();
  const token = getSessionToken();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), serverAwake ? NORMAL_TIMEOUT_MS : COLD_START_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(apiUrl + path + toQueryString(options.query), {
      method,
      // Both credentials travel: the device key, which the backend has always required, and the
      // session token when there is one. The backend takes either, so a phone that has not signed
      // in yet keeps working exactly as before.
      headers: {
        'X-API-Key': apiKey,
        ...(token && !options.anonymous ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    serverAwake = false;
    const timedOut = error instanceof DOMException && error.name === 'AbortError';
    throw new ApiError(timedOut ? 'timeout' : 'offline', timedOut ? 'El servidor no respondió a tiempo' : 'No se pudo contactar el servidor');
  } finally {
    clearTimeout(timer);
  }

  serverAwake = true;
  // A token the backend refuses is a session that ended somewhere else: the app has to notice
  // instead of carrying on as if someone were still signed in
  if (response.status === 401 && token && !options.anonymous) sessionWasRejected();
  if (!response.ok) throw await ApiError.fromResponse(response);
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

function toQueryString(query: Query | undefined): string {
  if (!query) return '';
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => value !== undefined && params.set(key, String(value)));
  const text = params.toString();
  return text ? `?${text}` : '';
}
