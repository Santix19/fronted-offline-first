import { getAll, putOne, removeMany } from '../../shared/db/repository';
import { parentIdOf, type FieldRecord, type WaterReading } from './recordTypes';

/** Saves a new record on the phone. It stays "pending" until a push confirms it. */
export function saveRecord(record: FieldRecord): Promise<void> {
  return putOne('records', record);
}

/** Newest first. Filter by the pond (water readings) or batch (the rest) they belong to. */
export async function listRecords(parentId?: string, limit = 50): Promise<FieldRecord[]> {
  const records = await getAll<FieldRecord>('records');
  return records
    .filter((r) => !parentId || parentIdOf(r) === parentId)
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))
    .slice(0, limit);
}

/** Latest water reading of each pond, for the water band on the home screen. */
export async function latestReadingsByPond(): Promise<Map<string, WaterReading>> {
  const latest = new Map<string, WaterReading>();
  for (const record of await getAll<FieldRecord>('records')) {
    if (record.type !== 'water_reading') continue;
    const current = latest.get(record.pondId);
    if (!current || record.recordedAt > current.recordedAt) latest.set(record.pondId, record);
  }
  return latest;
}

/** A rejected record can be thrown away once the caretaker read why. */
export function discardRecord(id: string): Promise<void> {
  return removeMany('records', [id]);
}
