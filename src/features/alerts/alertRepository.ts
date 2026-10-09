import { getAll, getOne, putOne } from '../../shared/db/repository';
import { newId } from '../../shared/utils/ids';
import type { Alert, PendingAction } from './alertTypes';

/** Pending alerts, critical ones first, then the newest. */
export async function listAlerts(pondId?: string): Promise<Alert[]> {
  const alerts = await getAll<Alert>('alerts');
  return alerts
    .filter((a) => !a.attendPending && (!pondId || a.pondId === pondId))
    .sort((a, b) => (a.level === b.level ? b.measuredAt.localeCompare(a.measuredAt) : a.level === 'critica' ? -1 : 1));
}

/**
 * Works without signal: the alert disappears from the list right away and an action is queued.
 * The sync module tells the backend when there is signal.
 */
export async function attendAlert(alertId: string): Promise<void> {
  const alert = await getOne<Alert>('alerts', alertId);
  if (!alert) return;
  await putOne<Alert>('alerts', { ...alert, attendPending: true });
  await putOne<PendingAction>('actions', {
    id: newId(),
    kind: 'attend_alert',
    alertId,
    createdAt: new Date().toISOString(),
  });
}
