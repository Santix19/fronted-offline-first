import { useEffect, useState } from 'react';
import { facade } from '../../facade/PisciculturaFacade';
import { errorMessage } from '../../shared/http/ApiError';
import { useOnline } from '../../shared/ui/useOnline';
import type { BatchSummary } from './batchTypes';

/**
 * The summary is calculated by the backend. Show the saved one at once, then ask for a fresh one
 * when there is signal. Without signal the caretaker still sees the last one, with its age.
 */
export function useBatchSummary(batchId: string, canFetch: boolean) {
  const online = useOnline();
  const [summary, setSummary] = useState<BatchSummary>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    facade.cachedSummary(batchId).then((cached) => active && cached && setSummary(cached));
    if (online && canFetch) {
      setLoading(true);
      facade
        .refreshSummary(batchId)
        .then((fresh) => {
          if (!active) return;
          setSummary(fresh);
          setError(undefined);
        })
        .catch((e) => active && setError(errorMessage(e)))
        .finally(() => active && setLoading(false));
    }
    return () => {
      active = false;
    };
  }, [batchId, online, canFetch]);

  return { summary, error, loading };
}
