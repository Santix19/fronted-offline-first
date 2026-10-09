import { getAll, getMeta, putMany, removeMany, setMeta } from '../../shared/db/repository';
import { fromAlertJson } from '../alerts/alertsApi';
import type { Alert } from '../alerts/alertTypes';
import { fromBatchJson } from '../batches/batchesApi';
import type { Batch } from '../batches/batchTypes';
import { fromPondJson } from '../ponds/pondsApi';
import type { Pond } from '../ponds/pondTypes';
import { mergeAlerts, mergeCatalog } from './catalogMerge';
import { pullChanges } from './syncApi';

const CURSOR_KEY = 'pullCursor';

/**
 * Step 3 of a sync: download what changed since the last pull, plus the pending alerts.
 * full = ignore the cursor and download everything (first time, or after a stale edit).
 */
export async function pullAndMerge(full = false): Promise<void> {
  const since = full ? undefined : await getMeta<string>(CURSOR_KEY);
  const response = await pullChanges(since);

  const ponds = mergeCatalog(await getAll<Pond>('ponds'), response.estanques.map(fromPondJson));
  const batches = mergeCatalog(await getAll<Batch>('batches'), response.lotes.map(fromBatchJson));
  const alerts = mergeAlerts(await getAll<Alert>('alerts'), response.alertas_pendientes.map(fromAlertJson));

  await putMany('ponds', ponds);
  await putMany('batches', batches);
  await putMany('alerts', alerts.put);
  await removeMany('alerts', alerts.remove);
  // Saved last: if anything above fails, the next pull asks again from the same point
  await setMeta(CURSOR_KEY, response.servidor_en);
}

export async function hasPulledBefore(): Promise<boolean> {
  return (await getMeta<string>(CURSOR_KEY)) !== undefined;
}

export function resetPullCursor(): Promise<void> {
  return setMeta<string | undefined>(CURSOR_KEY, undefined);
}
