import { getAll } from '../../shared/db/repository';
import { useLiveQuery } from '../../shared/db/useLiveQuery';
import type { Batch } from '../batches/batchTypes';
import type { Pond } from '../ponds/pondTypes';
import { discardRecord } from '../records/recordRepository';
import { RECORD_LABELS, type FieldRecord } from '../records/recordTypes';
import { formatDateTime } from '../../shared/utils/format';

interface RejectedItem {
  id: string;
  title: string;
  error: string;
  /** Records are discarded; ponds and batches are fixed by editing them */
  editHref?: string;
}

async function loadRejected(): Promise<RejectedItem[]> {
  const [ponds, batches, records] = await Promise.all([
    getAll<Pond>('ponds'),
    getAll<Batch>('batches'),
    getAll<FieldRecord>('records'),
  ]);
  const error = (row: { syncError?: string }) => row.syncError ?? 'Rechazado por el servidor';
  return [
    ...ponds.filter((p) => p.syncState === 'rejected').map((p) => ({ id: p.id, title: `Estanque ${p.name}`, error: error(p), editHref: `#/estanques/${p.id}/editar` })),
    ...batches.filter((b) => b.syncState === 'rejected').map((b) => ({ id: b.id, title: `Lote ${b.code}`, error: error(b), editHref: `#/lotes/${b.id}/editar` })),
    ...records.filter((r) => r.syncState === 'rejected').map((r) => ({ id: r.id, title: `${RECORD_LABELS[r.type]} · ${formatDateTime(r.recordedAt)}`, error: error(r) })),
  ];
}

/** What the backend refused, with its reason, so nothing is lost silently. */
export function RejectedList() {
  const items = useLiveQuery(loadRejected, ['ponds', 'batches', 'records']) ?? [];
  if (items.length === 0) return null;

  return (
    <section className="section">
      <h2>Rechazados por el servidor</h2>
      <p className="muted">El servidor no aceptó estos datos. Lee el motivo y corrígelo o descártalo.</p>
      <ul className="list">
        {items.map((item) => (
          <li key={item.id} className="row">
            <div className="row-main">
              <p className="row-title">{item.title}</p>
              <p className="muted">{item.error}</p>
            </div>
            {item.editHref ? (
              <a className="button secondary" href={item.editHref}>Corregir</a>
            ) : (
              <button className="button danger" onClick={() => discardRecord(item.id)}>Descartar</button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
