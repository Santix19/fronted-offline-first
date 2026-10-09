import type { FieldRecord } from './recordTypes';

/**
 * Event as POST /api/sync/push expects it: the "tipo" field tells the backend which event it is.
 * Records are not sent one by one; the sync module sends them in groups of up to 500.
 */
export type EventJson = Record<string, string | number | null> & { tipo: string; id: string };

export function toEventJson(record: FieldRecord): EventJson {
  const base = { id: record.id, registrado_en: record.recordedAt, origen: record.source };
  switch (record.type) {
    case 'water_reading':
      return {
        ...base,
        tipo: 'lectura_agua',
        estanque_id: record.pondId,
        temp_c: record.tempC ?? null,
        ph: record.ph ?? null,
        oxigeno_mg_l: record.oxygenMgL ?? null,
      };
    case 'fry_count':
      return { ...base, tipo: 'conteo', lote_id: record.batchId, total: record.total, cortes_multiples: record.multipleCuts ?? null };
    case 'mortality':
      return { ...base, tipo: 'mortalidad', lote_id: record.batchId, cantidad: record.quantity, causa: record.cause ?? null };
    case 'feeding':
      return { ...base, tipo: 'alimentacion', lote_id: record.batchId, kg: record.kg };
    case 'biometry':
      return { ...base, tipo: 'biometria', lote_id: record.batchId, peso_promedio_g: record.avgWeightG, muestra: record.sampleSize ?? null };
  }
}
