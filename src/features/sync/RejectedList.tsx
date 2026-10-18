import { facade } from '../../facade/PisciculturaFacade';
import { useLiveQuery } from '../../shared/db/useLiveQuery';
import { RECORD_LABELS } from '../records/recordTypes';
import { formatDateTime } from '../../shared/utils/format';

interface RejectedItem {
  id: string;
  title: string;
  error: string;
  /** Records are discarded; ponds and batches are fixed by editing them */
  editHref?: string;
}

async function loadRejected(): Promise<RejectedItem[]> {
  const { ponds, batches, records } = await facade.rejected();
  const error = (row: { syncError?: string }) => row.syncError ?? 'Rechazado por el servidor';
  return [
    ...ponds.map((p) => ({ id: p.id, title: `Estanque ${p.name}`, error: error(p), editHref: `#/estanques/${p.id}/editar` })),
    ...batches.map((b) => ({ id: b.id, title: `Lote ${b.code}`, error: error(b), editHref: `#/lotes/${b.id}/editar` })),
    ...records.map((r) => ({ id: r.id, title: `${RECORD_LABELS[r.type]} · ${formatDateTime(r.recordedAt)}`, error: error(r) })),
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
              <button className="button danger" onClick={() => facade.discardRecord(item.id)}>Descartar</button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
