import { apiRequest } from '../../shared/http/httpClient';
import type { BatchProjection, Finding, FindingKind, FindingLevel } from './findingTypes';

/** Hallazgo tal como lo escribe el backend (/api/hallazgos). */
export interface FindingJson {
  id: string;
  estanque_id: string | null;
  lote_id: string | null;
  clase: FindingKind;
  nivel: FindingLevel;
  variable: string | null;
  puntaje: number;
  mensaje: string;
  medido_en: string | null;
  creado_en: string;
  atendido: boolean;
}

export function fromFindingJson(json: FindingJson): Finding {
  return {
    id: json.id,
    pondId: json.estanque_id ?? undefined,
    batchId: json.lote_id ?? undefined,
    kind: json.clase,
    level: json.nivel,
    variable: json.variable ?? undefined,
    score: json.puntaje,
    message: json.mensaje,
    measuredAt: json.medido_en ?? undefined,
    createdAt: json.creado_en,
    attended: json.atendido,
  };
}

interface ProjectionJson {
  lote_id: string;
  dias_adelante: number;
  tgc: number | null;
  tgc_ajustado: boolean;
  temp_media_c: number | null;
  peso_actual_g: number | null;
  peso_proyectado_g: number | null;
  dias_para_objetivo: number | null;
  fecha_objetivo: string | null;
  cantidad_actual: number | null;
  cantidad_proyectada: number | null;
  supervivencia_pct: number | null;
  muertes_por_dia: number | null;
  hallazgos: FindingJson[];
  notas: string[];
}

/** GET /api/ia/disponible. Decide si la pantalla muestra la sección o la deja fuera. */
export async function aiAvailable(): Promise<boolean> {
  const json = await apiRequest<{ disponible: boolean }>('GET', '/api/ia/disponible');
  return json.disponible;
}

/** GET /api/hallazgos */
export async function fetchPendingFindings(): Promise<Finding[]> {
  const json = await apiRequest<FindingJson[]>('GET', '/api/hallazgos');
  return json.map(fromFindingJson);
}

/** GET /api/estanques/{id}/hallazgos */
export async function fetchPondFindings(pondId: string): Promise<Finding[]> {
  const json = await apiRequest<FindingJson[]>('GET', `/api/estanques/${pondId}/hallazgos`);
  return json.map(fromFindingJson);
}

/** GET /api/lotes/{id}/hallazgos */
export async function fetchBatchFindings(batchId: string): Promise<Finding[]> {
  const json = await apiRequest<FindingJson[]>('GET', `/api/lotes/${batchId}/hallazgos`);
  return json.map(fromFindingJson);
}

/** POST /api/hallazgos/{id}/atender */
export async function attendFindingOnServer(id: string, deviceId: string): Promise<Finding> {
  const json = await apiRequest<FindingJson>('POST', `/api/hallazgos/${id}/atender`, {
    query: { dispositivo_id: deviceId },
  });
  return fromFindingJson(json);
}

/**
 * GET /api/lotes/{id}/proyeccion
 *
 * El backend responde 503 cuando no hay servicio de IA, y eso sube como ApiError a propósito: la
 * pantalla tiene que poder decir "no disponible" y no mostrar una proyección en blanco, que se lee
 * como un lote del que no se sabe nada.
 */
export async function fetchBatchProjection(batchId: string): Promise<BatchProjection> {
  const json = await apiRequest<ProjectionJson>('GET', `/api/lotes/${batchId}/proyeccion`);
  return {
    batchId: json.lote_id,
    daysAhead: json.dias_adelante,
    tgc: json.tgc ?? undefined,
    tgcFitted: json.tgc_ajustado,
    meanTempC: json.temp_media_c ?? undefined,
    currentWeightG: json.peso_actual_g ?? undefined,
    projectedWeightG: json.peso_proyectado_g ?? undefined,
    daysToTarget: json.dias_para_objetivo ?? undefined,
    targetDate: json.fecha_objetivo ?? undefined,
    currentQuantity: json.cantidad_actual ?? undefined,
    projectedQuantity: json.cantidad_proyectada ?? undefined,
    survivalPct: json.supervivencia_pct ?? undefined,
    deathsPerDay: json.muertes_por_dia ?? undefined,
    findings: json.hallazgos.map(fromFindingJson),
    notes: json.notas,
  };
}
