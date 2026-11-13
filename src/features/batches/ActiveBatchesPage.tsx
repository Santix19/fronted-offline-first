import { facade } from '../../facade/PisciculturaFacade';
import { useLiveQuery } from '../../shared/db/useLiveQuery';
import { EmptyState } from '../../shared/ui/EmptyState';
import { Page } from '../../shared/ui/Page';
import { formatNumber } from '../../shared/utils/format';
import { RECORD_LABELS, type RecordType } from '../records/recordTypes';

async function load() {
  const [batches, ponds] = await Promise.all([facade.batches(), facade.ponds()]);
  const pondName = new Map(ponds.map((p) => [p.id, p.name]));
  return batches
    .filter((b) => b.status === 'activo')
    .map((b) => ({ id: b.id, code: b.code, pond: pondName.get(b.pondId) ?? 'Estanque', quantity: b.initialQuantity }));
}

/**
 * Every active batch of the farm in one list, read from the phone. With `record` it is the step
 * that asks "which batch?" before a record form, so a daily record does not need the pond first.
 */
export function ActiveBatchesPage({ record }: { record?: string }) {
  const batches = useLiveQuery(load, ['batches', 'ponds']);
  const type = record && record in RECORD_LABELS && record !== 'water_reading' ? (record as RecordType) : undefined;
  const href = (id: string) => (type ? `#/registrar/${type}?lote=${id}` : `#/lotes/${id}`);

  return (
    <Page title={type ? '¿En qué lote?' : 'Lotes activos'} backTo="/">
      {type && <p className="muted">{RECORD_LABELS[type]}: elige el lote.</p>}
      {batches && batches.length === 0 && (
        <EmptyState title="No hay lotes activos en este celular." hint="Abre un estanque para crear el primero." />
      )}
      {batches && batches.length > 0 && (
        <ul className="list">
          {batches.map((b) => (
            <li key={b.id}>
              <a className="row" href={href(b.id)}>
                <div className="row-main">
                  <p className="row-title">Lote {b.code}</p>
                  <p className="muted">{b.pond}{b.quantity ? ` · ${formatNumber(b.quantity)} alevinos` : ''}</p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
