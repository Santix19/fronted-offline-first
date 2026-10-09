/**
 * Reference ranges for rainbow trout, copied from the backend (service/Rules.java) so the phone
 * can colour a reading even without signal. The backend stays the one that creates alerts.
 * If the producer adjusts the ranges, change them in both places.
 */
export type WaterVariable = 'tempC' | 'ph' | 'oxygenMgL';
export type ReadingTone = 'ok' | 'warn' | 'danger' | 'none';

interface Range {
  optimalMin: number;
  optimalMax: number;
  criticalMin: number;
  criticalMax: number;
}

const RANGES: Record<WaterVariable, Range> = {
  tempC: { optimalMin: 10, optimalMax: 16, criticalMin: 6, criticalMax: 18 },
  ph: { optimalMin: 6.5, optimalMax: 8.5, criticalMin: 6, criticalMax: 9 },
  oxygenMgL: { optimalMin: 6, optimalMax: Infinity, criticalMin: 5, criticalMax: Infinity },
};

export function toneOf(variable: WaterVariable, value: number | undefined): ReadingTone {
  if (value === undefined) return 'none';
  const r = RANGES[variable];
  if (value >= r.optimalMin && value <= r.optimalMax) return 'ok';
  if (value < r.criticalMin || value > r.criticalMax) return 'danger';
  return 'warn';
}

export const TONE_TEXT: Record<ReadingTone, string> = {
  ok: 'en rango',
  warn: 'fuera del óptimo',
  danger: 'crítico',
  none: 'sin dato',
};
