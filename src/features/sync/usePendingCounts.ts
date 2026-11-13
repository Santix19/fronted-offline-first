import { facade } from '../../facade/PisciculturaFacade';
import { useLiveQuery } from '../../shared/db/useLiveQuery';

export interface PendingCounts {
  pending: number;
  rejected: number;
  loading: boolean;
}

/** How many things are waiting for signal, and how many the backend refused. Updates live. */
export function usePendingCounts(): PendingCounts {
  const counts = useLiveQuery(() => facade.pendingCounts(), ['ponds', 'batches', 'records', 'actions']);
  return { pending: counts?.pending ?? 0, rejected: counts?.rejected ?? 0, loading: !counts };
}
