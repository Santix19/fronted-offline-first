import { getAll } from '../../shared/db/repository';
import type { Syncable } from '../../shared/db/syncable';
import { useLiveQuery } from '../../shared/db/useLiveQuery';

export interface PendingCounts {
  pending: number;
  rejected: number;
}

async function countPending(): Promise<PendingCounts> {
  const [ponds, batches, records, actions] = await Promise.all([
    getAll<Syncable>('ponds'),
    getAll<Syncable>('batches'),
    getAll<Syncable>('records'),
    getAll('actions'),
  ]);
  const rows = [...ponds, ...batches, ...records];
  return {
    pending: rows.filter((r) => r.syncState === 'pending').length + actions.length,
    rejected: rows.filter((r) => r.syncState === 'rejected').length,
  };
}

/** How many things are waiting for signal, and how many the backend refused. Updates live. */
export function usePendingCounts(): PendingCounts {
  return useLiveQuery(countPending, ['ponds', 'batches', 'records', 'actions']) ?? { pending: 0, rejected: 0 };
}
