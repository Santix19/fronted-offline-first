import { facade } from '../../facade/PisciculturaFacade';
import { useLiveQuery } from '../../shared/db/useLiveQuery';
import { SyncChip } from '../../shared/ui/SyncChip';
import { formatDate, formatNumber } from '../../shared/utils/format';

/** Batches of one pond, active first. Shown inside the pond screen. */
export function BatchList({ pondId }: { pondId: string }) {
  const batches = useLiveQuery(() => facade.batches(pondId), ['batches'], [pondId]);

  return (
    <section className="section">
      <div className="section-head">
        <h2>Lotes</h2>
        <a className="button secondary" href={`#/lotes/nuevo?estanque=${pondId}`}>Nuevo lote</a>
      </div>
      {batches?.length === 0 && <p className="muted">Este estanque no tiene lotes. Crea uno cuando siembres.</p>}
      {batches && batches.length > 0 && (
        <ul className="list">
          {batches.map((batch) => (
            <li key={batch.id}>
              <a className="row" href={`#/lotes/${batch.id}`}>
                <div className="row-main">
                  <p className="row-title">Lote {batch.code}</p>
                  <p className="muted">
                    Siembra {formatDate(batch.stockingDate)}
                    {batch.initialQuantity !== undefined && ` · ${formatNumber(batch.initialQuantity, 0)} alevinos`}
                  </p>
                </div>
                {batch.syncState !== 'synced' && <SyncChip state={batch.syncState} />}
                <span className={`chip ${batch.status === 'activo' ? 'ok' : 'neutral'}`}>
                  {batch.status === 'activo' ? 'Activo' : 'Cerrado'}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
