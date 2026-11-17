import { getAll, putMany, removeMany } from '../../shared/db/repository';
import { fetchRecentCounts } from '../batches/batchesApi';
import type { Batch } from '../batches/batchTypes';
import { fetchRecentReadings } from '../ponds/pondsApi';
import type { Pond } from '../ponds/pondTypes';
import type { FieldRecord } from '../records/recordTypes';

const KEEP_PER_POND = 50;

/**
 * Step 4 of a sync: bring what the devices sent straight to the backend without passing through
 * this phone — the water sensor of each pond and the fry counter of each batch — and keep only the
 * newest ones already synced, so the phone storage does not grow forever.
 *
 * This is what makes the counter board visible in the app: it uploads on its own, and the counts
 * come down here like any other record.
 */
export async function refreshReadings(): Promise<void> {
  const ponds = (await getAll<Pond>('ponds')).filter((p) => p.active && p.syncState === 'synced');
  for (const pond of ponds) {
    await putMany('records', await fetchRecentReadings(pond.id));
  }

  const batches = (await getAll<Batch>('batches')).filter((b) => b.status === 'activo' && b.syncState === 'synced');
  for (const batch of batches) {
    await putMany('records', await fetchRecentCounts(batch.id));
  }
  await pruneOldReadings();
}

async function pruneOldReadings(): Promise<void> {
  const byPond = new Map<string, FieldRecord[]>();
  for (const record of await getAll<FieldRecord>('records')) {
    // Only synced readings are pruned: nothing pending or rejected is ever deleted here
    if (record.type !== 'water_reading' || record.syncState !== 'synced') continue;
    byPond.set(record.pondId, [...(byPond.get(record.pondId) ?? []), record]);
  }
  const old = [...byPond.values()].flatMap((readings) =>
    readings.sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)).slice(KEEP_PER_POND).map((r) => r.id),
  );
  await removeMany('records', old);
}
