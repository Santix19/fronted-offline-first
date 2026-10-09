import type { BatchJson } from '../batches/batchesApi';
import type { PondJson } from '../ponds/pondsApi';
import type { EventJson } from '../records/recordsApi';
import type { PushRequest, PushResponse } from './syncApi';

export const MAX_CATALOG_PER_PUSH = 200;
export const MAX_EVENTS_PER_PUSH = 500;

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

/**
 * Splits everything pending into requests the backend accepts.
 * Ponds go before batches and batches before events, so a new batch never arrives before its pond.
 */
export function buildPushRequests(deviceId: string, ponds: PondJson[], batches: BatchJson[], events: EventJson[]): PushRequest[] {
  const empty = (): PushRequest => ({ dispositivo_id: deviceId, estanques: [], lotes: [], eventos: [] });
  const requests: PushRequest[] = [];
  chunk(ponds, MAX_CATALOG_PER_PUSH).forEach((part) => requests.push({ ...empty(), estanques: part }));
  chunk(batches, MAX_CATALOG_PER_PUSH).forEach((part) => requests.push({ ...empty(), lotes: part }));
  chunk(events, MAX_EVENTS_PER_PUSH).forEach((part, i) => {
    // The first group of events travels with the catalog when it fits, to save one request
    const last = requests[requests.length - 1];
    if (i === 0 && last && last.eventos.length === 0) last.eventos = part;
    else requests.push({ ...empty(), eventos: part });
  });
  return requests;
}

export interface PushOutcome {
  /** accepted + duplicates: the backend has them */
  done: Set<string>;
  /** stale: the backend had a newer edit; we must download it */
  stale: Set<string>;
  rejected: Map<string, string>;
}

export function readPushResponse(response: PushResponse): PushOutcome {
  const rejected = new Map<string, string>();
  response.rechazados.forEach((r) => r.id && rejected.set(r.id, r.error));
  return {
    done: new Set([...response.aceptados, ...response.duplicados]),
    stale: new Set(response.obsoletos),
    rejected,
  };
}
