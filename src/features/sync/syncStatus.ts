import { useSyncExternalStore } from 'react';
import { getMeta, setMeta } from '../../shared/db/repository';

/** What the sync indicator shows. Kept in memory; the last successful time is also saved. */
export interface SyncStatus {
  running: boolean;
  lastSuccessAt?: string;
  lastError?: string;
  lastUploaded?: number;
}

let status: SyncStatus = { running: false };
const listeners = new Set<() => void>();

export function getSyncStatus(): SyncStatus {
  return status;
}

export function updateSyncStatus(change: Partial<SyncStatus>): void {
  status = { ...status, ...change };
  if (change.lastSuccessAt) void setMeta('lastSyncAt', change.lastSuccessAt);
  listeners.forEach((listener) => listener());
}

export async function loadSavedSyncStatus(): Promise<void> {
  const lastSuccessAt = await getMeta<string>('lastSyncAt');
  if (lastSuccessAt) updateSyncStatus({ lastSuccessAt });
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(subscribe, getSyncStatus);
}
