import { getAll, putMany } from '../../shared/db/repository';
import type { Syncable } from '../../shared/db/syncable';
import type { StoreName } from '../../shared/db/database';
import { toBatchJson } from '../batches/batchesApi';
import type { Batch } from '../batches/batchTypes';
import { toPondJson } from '../ponds/pondsApi';
import type { Pond } from '../ponds/pondTypes';
import { toEventJson } from '../records/recordsApi';
import type { FieldRecord } from '../records/recordTypes';
import { stateAfterPush } from './catalogMerge';
import { buildPushRequests, readPushResponse, type PushOutcome } from './pushPlan';
import { pushChanges } from './syncApi';

const pendingIn = async <T extends Syncable>(store: StoreName) =>
  (await getAll<T>(store)).filter((row) => row.syncState === 'pending');

/** Step 1 of a sync: upload everything pending. Returns whether the backend had newer edits. */
export async function pushPending(deviceId: string): Promise<{ hadStale: boolean; uploaded: number }> {
  const ponds = await pendingIn<Pond>('ponds');
  const batches = await pendingIn<Batch>('batches');
  const records = await pendingIn<FieldRecord>('records');
  const sentAt = new Map<string, string>([...ponds, ...batches].map((row) => [row.id, row.updatedAt]));

  const requests = buildPushRequests(deviceId, ponds.map(toPondJson), batches.map(toBatchJson), records.map(toEventJson));
  let hadStale = false;
  let uploaded = 0;

  // One request at a time: if the signal drops halfway, what already arrived is marked and kept
  for (const request of requests) {
    const outcome = readPushResponse(await pushChanges(request));
    hadStale ||= outcome.stale.size > 0;
    uploaded += outcome.done.size;
    await markCatalog<Pond>('ponds', outcome, sentAt);
    await markCatalog<Batch>('batches', outcome, sentAt);
    await markRecords(outcome);
  }
  return { hadStale, uploaded };
}

async function markCatalog<T extends Pond | Batch>(store: 'ponds' | 'batches', outcome: PushOutcome, sentAt: Map<string, string>) {
  const rows = await getAll<T>(store);
  const changed = rows
    .filter((row) => sentAt.has(row.id) && (outcome.done.has(row.id) || outcome.stale.has(row.id) || outcome.rejected.has(row.id)))
    // A stale edit lost against a newer one; the full pull that follows brings the winner
    .map((row) => stateAfterPush(row, sentAt.get(row.id)!, outcome.rejected.get(row.id)));
  await putMany(store, changed);
}

async function markRecords(outcome: PushOutcome) {
  const records = await getAll<FieldRecord>('records');
  const changed = records
    .filter((r) => r.syncState === 'pending' && (outcome.done.has(r.id) || outcome.rejected.has(r.id)))
    .map((r): FieldRecord => {
      const error = outcome.rejected.get(r.id);
      return error ? { ...r, syncState: 'rejected', syncError: error } : { ...r, syncState: 'synced', syncError: undefined };
    });
  await putMany('records', changed);
}

/** True when something is waiting to be uploaded (used to sync shortly after a local change). */
export async function hasPendingWork(): Promise<boolean> {
  if ((await getAll('actions')).length > 0) return true;
  for (const store of ['records', 'ponds', 'batches'] as const) {
    if ((await pendingIn(store)).length > 0) return true;
  }
  return false;
}
