import { getAll, putMany, removeMany } from '../../shared/db/repository';
import { fetchRecentReadings } from '../ponds/pondsApi';
import type { Pond } from '../ponds/pondTypes';
import type { FieldRecord } from '../records/recordTypes';

const KEEP_PER_POND = 50;

/**
 * Step 4 of a sync: bring the latest readings of each pond (the sensor sends them straight to the
 * backend) and keep only the newest ones already synced, so the phone storage does not grow forever.
 */
export async function refreshReadings(): Promise<void> {
  const ponds = (await getAll<Pond>('ponds')).filter((p) => p.active && p.syncState === 'synced');
  for (const pond of ponds) {
    await putMany('records', await fetchRecentReadings(pond.id));
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
