import type { SyncState } from '../db/syncable';

const LOOK: Record<SyncState, { label: string; tone: string }> = {
  pending: { label: 'Por subir', tone: 'warn' },
  synced: { label: 'Subido', tone: 'ok' },
  rejected: { label: 'Rechazado', tone: 'danger' },
};

/** Shows the caretaker whether a row already reached the backend. */
export function SyncChip({ state }: { state: SyncState }) {
  const { label, tone } = LOOK[state];
  return <span className={`chip ${tone}`}>{label}</span>;
}
