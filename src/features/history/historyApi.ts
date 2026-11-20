import { apiRequest } from '../../shared/http/httpClient';
import type { AlertLevel } from '../alerts/alertTypes';
import type { Batch } from '../batches/batchTypes';
import type { Pond } from '../ponds/pondTypes';
import type { FieldRecord, RecordSource } from '../records/recordTypes';
import type { AlertEntry } from './report';

/**
 * El historial completo que guarda el servidor: lo de todos los celulares, el sensor y el contador.
 *
 * El celular solo tiene lo que se anotó en él y las últimas lecturas de cada estanque, así que con
 * señal el historial se completa desde aquí. Cada consulta va por su lado: si una falla (un lote
 * recién creado que el servidor todavía no conoce, por ejemplo), las demás igual llegan y la
 * pantalla dice que el historial puede estar incompleto.
 */

const LIMIT = 1000;

interface Row {
  id: string;
  origen: string;
  registrado_en: string;
}
interface ReadingRow extends Row {
  estanque_id: string;
  temp_c: number | null;
  ph: number | null;
  oxigeno_mg_l: number | null;
}
interface FeedingRow extends Row {
  lote_id: string;
  kg: number;
}
interface MortalityRow extends Row {
  lote_id: string;
  cantidad: number;
  causa: string | null;
}
interface BiometryRow extends Row {
  lote_id: string;
  peso_promedio_g: number;
  muestra: number | null;
}
interface CountRow extends Row {
  lote_id: string;
  total: number;
  cortes_multiples: number | null;
}
interface AlertRow {
  id: string;
  estanque_id: string;
  nivel: AlertLevel;
  mensaje: string;
  medido_en: string;
  atendida?: boolean;
}

const base = (r: Row) => ({
  id: r.id,
  recordedAt: r.registrado_en,
  source: r.origen as RecordSource,
  syncState: 'synced' as const,
});

export interface ServerHistory {
  records: FieldRecord[];
  alerts: AlertEntry[];
  /** Alguna consulta falló: lo que se muestra puede no estar completo. */
  partial: boolean;
}

/** Todo lo de los estanques y lotes dados desde la fecha dada. */
export async function fetchServerHistory(ponds: Pond[], batches: Batch[], from: Date, pondId?: string): Promise<ServerHistory> {
  const since = from.toISOString();
  // Solo lo que el servidor ya conoce: lo creado sin señal todavía no existe allá
  const knownPonds = ponds.filter((p) => p.syncState === 'synced' && (!pondId || p.id === pondId));
  const knownBatches = batches.filter((b) => b.syncState === 'synced' && (!pondId || b.pondId === pondId));

  const get = <T>(path: string, query: Record<string, string | number | boolean>) =>
    apiRequest<T[]>('GET', path, { query });

  const jobs: Promise<FieldRecord[]>[] = [
    ...knownPonds.map((p) =>
      get<ReadingRow>(`/api/estanques/${p.id}/lecturas`, { desde: since, limite: 5000 }).then((rows) =>
        rows.map((r): FieldRecord => ({
          ...base(r),
          type: 'water_reading',
          pondId: r.estanque_id,
          tempC: r.temp_c ?? undefined,
          ph: r.ph ?? undefined,
          oxygenMgL: r.oxigeno_mg_l ?? undefined,
        })),
      ),
    ),
    ...knownBatches.flatMap((b) => [
      get<FeedingRow>(`/api/lotes/${b.id}/alimentaciones`, { limite: LIMIT }).then((rows) =>
        rows.map((r): FieldRecord => ({ ...base(r), type: 'feeding', batchId: r.lote_id, kg: r.kg })),
      ),
      get<MortalityRow>(`/api/lotes/${b.id}/mortalidades`, { limite: LIMIT }).then((rows) =>
        rows.map((r): FieldRecord => ({ ...base(r), type: 'mortality', batchId: r.lote_id, quantity: r.cantidad, cause: r.causa ?? undefined })),
      ),
      get<BiometryRow>(`/api/lotes/${b.id}/biometrias`, { limite: LIMIT }).then((rows) =>
        rows.map((r): FieldRecord => ({
          ...base(r),
          type: 'biometry',
          batchId: r.lote_id,
          avgWeightG: r.peso_promedio_g,
          sampleSize: r.muestra ?? undefined,
        })),
      ),
      get<CountRow>(`/api/lotes/${b.id}/conteos`, { limite: LIMIT }).then((rows) =>
        rows.map((r): FieldRecord => ({
          ...base(r),
          type: 'fry_count',
          batchId: r.lote_id,
          total: r.total,
          multipleCuts: r.cortes_multiples ?? undefined,
        })),
      ),
    ]),
  ];

  const alertQuery: Record<string, string | number | boolean> = { pendientes: false, limite: LIMIT };
  if (pondId) alertQuery.estanque_id = pondId;
  const alertJob = get<AlertRow>('/api/alertas', alertQuery).then((rows) =>
    rows.map((a): AlertEntry => ({
      id: a.id,
      pondId: a.estanque_id,
      level: a.nivel,
      message: a.mensaje,
      measuredAt: a.medido_en,
      attended: a.atendida ?? false,
    })),
  );

  const [recordResults, alertResult] = await Promise.all([Promise.allSettled(jobs), alertJob.then(
    (value) => ({ ok: true as const, value }),
    () => ({ ok: false as const, value: [] as AlertEntry[] }),
  )]);

  const records = recordResults.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  return {
    // Los lotes devuelven sus últimos registros sin filtro de fecha: se recorta aquí
    records: records.filter((r) => r.recordedAt >= since),
    alerts: alertResult.value,
    partial: !alertResult.ok || recordResults.some((r) => r.status === 'rejected'),
  };
}
