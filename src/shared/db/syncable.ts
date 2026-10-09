/**
 * Every row the phone can create or edit carries its sync state:
 * pending  = saved on the phone, not yet on the backend
 * synced   = the backend has it
 * rejected = the backend refused it (syncError says why); it stays visible so the caretaker can fix it
 */
export type SyncState = 'pending' | 'synced' | 'rejected';

export interface Syncable {
  syncState: SyncState;
  syncError?: string;
}
