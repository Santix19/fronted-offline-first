import { getAll } from '../shared/db/repository';
import type { Syncable } from '../shared/db/syncable';
import type { Batch } from '../features/batches/batchTypes';
import type { Pond } from '../features/ponds/pondTypes';
import type { FieldRecord } from '../features/records/recordTypes';

/**
 * The two queries of the facade that read several stores at once. They live here so the facade
 * itself stays a list of one-line delegations and nothing else.
 */

const everything = () =>
  Promise.all([getAll<Pond>('ponds'), getAll<Batch>('batches'), getAll<FieldRecord>('records')]);

/** How many rows are waiting for signal and how many the backend refused. */

export async function countPending(): Promise<{ pending: number; rejected: number }> {
  const [[ponds, batches, records], actions] = await Promise.all([everything(), getAll('actions')]);
  const rows: Syncable[] = [...ponds, ...batches, ...records];
  return {
    pending: rows.filter((row) => row.syncState === 'pending').length + actions.length,
    rejected: rows.filter((row) => row.syncState === 'rejected').length,
  };
}
