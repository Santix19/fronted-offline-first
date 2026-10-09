import { apiRequest } from '../../shared/http/httpClient';
import type { Batch, BatchStatus, BatchSummary } from './batchTypes';

/** Batch as the backend writes it in JSON (/api/lotes and inside /api/sync). */
export interface BatchJson {
  id: string;
  estanque_id: string;
  codigo: string;
  fecha_siembra: string | null;
  cantidad_inicial: number | null;
  peso_inicial_g: number | null;
  estado: BatchStatus;
  actualizado_en: string;
}

export function fromBatchJson(json: BatchJson): Batch {
  return {
    id: json.id,
    pondId: json.estanque_id,
    code: json.codigo,
    stockingDate: json.fecha_siembra ?? undefined,
    initialQuantity: json.cantidad_inicial ?? undefined,
    initialWeightG: json.peso_inicial_g ?? undefined,
    status: json.estado,
    updatedAt: json.actualizado_en,
    syncState: 'synced',
  };
}

export function toBatchJson(batch: Batch): BatchJson {
  return {
    id: batch.id,
    estanque_id: batch.pondId,
    codigo: batch.code,
    fecha_siembra: batch.stockingDate ?? null,
    cantidad_inicial: batch.initialQuantity ?? null,
    peso_inicial_g: batch.initialWeightG ?? null,
    estado: batch.status,
    actualizado_en: batch.updatedAt,
  };
}

type SummaryJson = Record<string, number | string | string[] | null | undefined>;

/** GET /api/lotes/{id}/resumen */
export async function fetchBatchSummary(batchId: string): Promise<BatchSummary> {
  const json = await apiRequest<SummaryJson>('GET', `/api/lotes/${batchId}/resumen`);
  const num = (key: string) => (typeof json[key] === 'number' ? (json[key] as number) : undefined);
  return {
    batchId,
    fetchedAt: new Date().toISOString(),
    cultureDays: num('dias_cultivo'),
    initialQuantity: num('cantidad_inicial'),
    estimatedPopulation: num('poblacion_estimada'),
    totalMortality: num('mortalidad_total') ?? 0,
    survivalPct: num('supervivencia_pct'),
    avgWeightG: num('peso_promedio_g'),
    biomassKg: num('biomasa_kg'),
    densityKgM3: num('densidad_kg_m3'),
    lastTemperatureC: num('ultima_temperatura_c'),
    lastReadingAt: (json.ultima_lectura_en as string | null) ?? undefined,
    feedingRatePct: num('tasa_alimentacion_pct'),
    dailyRationKg: num('racion_diaria_kg'),
    feedLastWeekKg: num('alimento_ultima_semana_kg'),
    feedConversionRatio: num('conversion_alimenticia'),
    pendingAlerts: num('alertas_pendientes') ?? 0,
    notes: Array.isArray(json.notas) ? json.notas : [],
  };
}
