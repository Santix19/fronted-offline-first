import { apiRequest } from '../../shared/http/httpClient';
import type { AlertJson } from '../alerts/alertsApi';
import type { BatchJson } from '../batches/batchesApi';
import type { PondJson } from '../ponds/pondsApi';
import type { EventJson } from '../records/recordsApi';

/** Body of POST /api/sync/push. Limits: 200 ponds, 200 batches and 500 events per request. */
export interface PushRequest {
  dispositivo_id: string;
  estanques: PondJson[];
  lotes: BatchJson[];
  eventos: EventJson[];
}

/** Everything that appears in any of the four lists can leave the phone's queue. */
export interface PushResponse {
  aceptados: string[];
  duplicados: string[];
  obsoletos: string[];
  rechazados: { id: string | null; error: string }[];
  alertas_generadas: number;
  servidor_en: string;
}

export interface PullResponse {
  estanques: PondJson[];
  lotes: BatchJson[];
  alertas_pendientes: AlertJson[];
  /** Server time: it is the cursor for the next pull (never the phone's clock) */
  servidor_en: string;
}

export function pushChanges(body: PushRequest): Promise<PushResponse> {
  return apiRequest<PushResponse>('POST', '/api/sync/push', { body });
}

export function pullChanges(since?: string): Promise<PullResponse> {
  return apiRequest<PullResponse>('GET', '/api/sync/pull', { query: { desde: since } });
}

/** GET /salud does not need the key: it tells whether the server is up. */
export function checkHealth(): Promise<{ estado: string; version?: string }> {
  return apiRequest('GET', '/salud');
}
