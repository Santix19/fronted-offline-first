/**
 * Lo que encuentra el servicio de IA.
 *
 * Es otra cosa que una alerta, y la pantalla las muestra aparte a propósito. Una alerta sale de
 * cruzar un umbral: es un hecho, y el cuidador lo verifica bajando el sensor otra vez. Un hallazgo
 * sale de un modelo mirando la historia del estanque: es una sospecha que vale la pena confirmar.
 * Presentarlos iguales le quita credibilidad a la primera y se la regala al segundo.
 */

/** 'informe' es el que agrega la IA: lo que vale saber pero no amerita caminar al estanque. */
export type FindingLevel = 'informe' | 'advertencia' | 'critica';

/**
 * De qué ruta del servicio de IA salió. Son las que ese servicio expone, y cada una responde una
 * pregunta distinta — de ahí que la pantalla las nombre distinto y no las junte en "la IA dijo".
 */
export type FindingKind =
  | 'anomalia'
  | 'tendencia'
  | 'combinacion'
  | 'crecimiento'
  | 'mortalidad';

export interface Finding {
  id: string;
  /** Uno de los dos: los del agua son de un estanque, los del lote son de un lote. */
  pondId?: string;
  batchId?: string;
  kind: FindingKind;
  level: FindingLevel;
  variable?: string;
  score: number;
  /** La frase que armó el servicio, en español. Se muestra tal cual llegó. */
  message: string;
  measuredAt?: string;
  createdAt: string;
  attended: boolean;
}

/**
 * Hacia dónde va un lote.
 *
 * Casi todo es opcional porque casi todo puede faltar, y eso no es descuido: un lote sin biometrías
 * no tiene peso del cual partir, y uno sin lecturas de temperatura no se puede proyectar, porque la
 * trucha crece con el calor acumulado del agua y no con los días que pasan. Lo que no se pudo
 * calcular viene explicado en 'notes', y la pantalla muestra eso en vez de un cero.
 */
export interface BatchProjection {
  daysAhead: number;
  /** Coeficiente térmico de crecimiento. */
  tgc?: number;
  /** false significa que es el de la literatura y no el de esta finca. */
  tgcFitted: boolean;
  meanTempC?: number;
  currentWeightG?: number;
  projectedWeightG?: number;
  daysToTarget?: number;
  targetDate?: string;
  currentQuantity?: number;
  projectedQuantity?: number;
  /** Es un techo y no una medición: lo que no se alcanzó a registrar no está contado. */
  survivalPct?: number;
  deathsPerDay?: number;
  /**
   * Lo que no se pudo calcular y qué falta registrar para poder.
   *
   * Los hallazgos del lote no vienen aquí: el servidor los guarda y llegan por
   * /api/lotes/{id}/hallazgos, que es lo que ve el panel de hallazgos. Así este panel muestra
   * números y el otro muestra avisos, sin dos listas del mismo aviso.
   */
  notes: string[];
}

/** Cómo se nombra cada clase de hallazgo al cuidador. */
export const FINDING_LABELS: Record<FindingKind, string> = {
  anomalia: 'Fuera de lo normal',
  tendencia: 'Viene cambiando',
  combinacion: 'Combinación rara',
  crecimiento: 'Crecimiento',
  mortalidad: 'Mortalidad',
};

/** Para una clase que este celular todavía no conoce: el servidor puede ir adelante de la app. */
export function findingLabel(kind: string): string {
  return FINDING_LABELS[kind as FindingKind] ?? 'Hallazgo';
}
