import { getAll, removeMany } from '../../shared/db/repository';
import { ApiError } from '../../shared/http/ApiError';
import { attendAlertOnServer } from '../alerts/alertsApi';
import type { PendingAction } from '../alerts/alertTypes';

/** Step 2 of a sync: actions that are not events (alerts attended without signal). */
export async function sendPendingActions(): Promise<void> {
  const actions = await getAll<PendingAction>('actions');
  for (const action of actions.sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    try {
      await attendAlertOnServer(action.alertId);
    } catch (error) {
      // No signal or server down: keep it for next time. A 404 means it no longer exists: drop it.
      if (!(error instanceof ApiError) || error.isTemporary || error.kind === 'auth') throw error;
    }
    await removeMany('actions', [action.id]);
    await removeMany('alerts', [action.alertId]);
  }
}
