import { facade } from '../../facade/PisciculturaFacade';
import { useLiveQuery } from '../../shared/db/useLiveQuery';

export interface PendingCounts {
  pending: number;
  rejected: number;
}

/** How many things are waiting for signal, and how many the backend refused. Updates live. */
export function usePendingCounts(): PendingCounts {
  return useLiveQuery(() => facade.pendingCounts(), ['ponds', 'batches', 'records', 'actions']) ?? { pending: 0, rejected: 0 };
}
