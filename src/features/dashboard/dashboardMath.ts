import type { Batch } from '../batches/batchTypes';
import type { Pond } from '../ponds/pondTypes';
import type { FieldRecord } from '../records/recordTypes';

export interface DashboardInput {
  ponds: Pond[];
  batches: Batch[];
  records: FieldRecord[];
  alerts: number;
  pending: number;
  rejected: number;
  now: number;
}

export interface Dashboard {
  activePonds: number;
  activeBatches: number;
  alerts: number;
  waiting: number;
  rejected: number;
  recordsToday: number;
  /** Latest water temperatures, oldest first, ready to draw as a line */
  temps: number[];
  lastTempC?: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const SERIES_LENGTH = 14;

/** Everything the home dashboard shows, worked out from what is already on the phone. */
export function buildDashboard(input: DashboardInput): Dashboard {
  const temps = input.records
    .filter((r) => r.type === 'water_reading' && r.tempC !== undefined)
    .sort((a, b) => Date.parse(a.recordedAt) - Date.parse(b.recordedAt))
    .slice(-SERIES_LENGTH)
    .map((r) => (r.type === 'water_reading' ? (r.tempC as number) : 0));

  return {
    activePonds: input.ponds.filter((p) => p.active).length,
    activeBatches: input.batches.filter((b) => b.status === 'activo').length,
    alerts: input.alerts,
    waiting: input.pending,
    rejected: input.rejected,
    recordsToday: input.records.filter((r) => input.now - Date.parse(r.recordedAt) <= DAY_MS).length,
    temps,
    lastTempC: temps.at(-1),
  };
}
