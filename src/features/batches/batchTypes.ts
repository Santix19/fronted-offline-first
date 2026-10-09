import type { Syncable } from '../../shared/db/syncable';

export type BatchStatus = 'activo' | 'cerrado';

/** A stocking of fish in one pond. Editable offline like ponds: the newest updatedAt wins. */
export interface Batch extends Syncable {
  id: string;
  pondId: string;
  code: string;
  stockingDate?: string;
  initialQuantity?: number;
  initialWeightG?: number;
  status: BatchStatus;
  updatedAt: string;
}

/**
 * Calculated by the backend's expert system (GET /api/lotes/{id}/resumen).
 * It needs signal, so the last one is kept on the phone with the time it was fetched.
 * Optional fields exist only in the newer backend version.
 */
export interface BatchSummary {
  batchId: string;
  fetchedAt: string;
  cultureDays?: number;
  initialQuantity?: number;
  estimatedPopulation?: number;
  totalMortality: number;
  survivalPct?: number;
  avgWeightG?: number;
  biomassKg?: number;
  densityKgM3?: number;
  lastTemperatureC?: number;
  lastReadingAt?: string;
  feedingRatePct?: number;
  dailyRationKg?: number;
  feedLastWeekKg?: number;
  feedConversionRatio?: number;
  pendingAlerts: number;
  notes: string[];
}
