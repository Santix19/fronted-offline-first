import type { Syncable } from '../../shared/db/syncable';
import type { Alert } from '../alerts/alertTypes';

interface CatalogRow extends Syncable {
  id: string;
  updatedAt: string;
}

const isNewer = (a: string, b: string) => new Date(a).getTime() > new Date(b).getTime();

/**
 * Downloaded ponds or batches vs the ones on the phone. The newest edit wins, the same rule
 * the backend uses: a local edit not yet uploaded is kept only if it is newer than the server's.
 */
export function mergeCatalog<T extends CatalogRow>(local: T[], remote: T[]): T[] {
  const byId = new Map(local.map((row) => [row.id, row]));
  return remote.filter((server) => {
    const mine = byId.get(server.id);
    return !mine || mine.syncState === 'synced' || !isNewer(mine.updatedAt, server.updatedAt);
  });
}

/**
 * After a push: the row is synced only if it was not edited again while the request was travelling.
 * sentAt is the updatedAt that was sent.
 */
export function stateAfterPush<T extends CatalogRow>(row: T, sentAt: string, error?: string): T {
  if (row.updatedAt !== sentAt) return row;
  return error ? { ...row, syncState: 'rejected', syncError: error } : { ...row, syncState: 'synced', syncError: undefined };
}

/**
 * The pull brings the full list of pending alerts, so it replaces the local one.
 * Alerts attended on the phone but not yet confirmed stay hidden.
 */
export function mergeAlerts(local: Alert[], remote: Alert[]): { put: Alert[]; remove: string[] } {
  const attendedHere = new Set(local.filter((a) => a.attendPending).map((a) => a.id));
  const remoteIds = new Set(remote.map((a) => a.id));
  return {
    put: remote.map((a) => (attendedHere.has(a.id) ? { ...a, attendPending: true } : a)),
    remove: local.filter((a) => !remoteIds.has(a.id) && !a.attendPending).map((a) => a.id),
  };
}
