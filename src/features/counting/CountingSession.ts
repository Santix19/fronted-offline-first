import { toIsoWithOffset } from '../../shared/utils/dates';
import type { RecordSource } from '../records/recordTypes';
import type { SensorSample } from '../sensors/sensorTypes';
import type { CountStore, CountingFeedback, CountingTally } from './countingTypes';

/** Reads the count a batch had in progress, or starts a new one. */

export async function resumeTally(store: CountStore, batchId: string): Promise<CountingTally> {
  const saved = await store.loadTally(batchId);
  if (saved) return saved;
  const now = toIsoWithOffset();
  return { batchId, total: 0, multipleCuts: 0, frames: 0, startedAt: now, updatedAt: now };
}
