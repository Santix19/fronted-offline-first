import { facade } from '../../facade/PisciculturaFacade';
import { useLiveQuery } from '../../shared/db/useLiveQuery';
import { Page } from '../../shared/ui/Page';
import { SyncChip } from '../../shared/ui/SyncChip';
import { formatDate, formatNumber } from '../../shared/utils/format';
import { FindingsPanel } from '../findings/FindingsPanel';
import { ProjectionPanel } from '../findings/ProjectionPanel';
import { RecordList } from '../records/RecordList';
import { RECORD_LABELS, type RecordType } from '../records/recordTypes';
import { BatchSummaryPanel } from './BatchSummaryPanel';

/** Batch records, in the order the caretaker usually needs them in the day. */
const BATCH_RECORDS: RecordType[] = ['feeding', 'mortality', 'biometry', 'fry_count'];

async function loadBatch(batchId: string) {
  const batch = await facade.batch(batchId);
  const pond = batch && (await facade.pond(batch.pondId));
  return { batch, pond, records: await facade.records(batchId, 20) };
}

export function BatchDetailPage({ batchId }: { batchId: string }) {
  const data = useLiveQuery(() => loadBatch(batchId), ['batches', 'ponds', 'records'], [batchId]);
  if (!data) return <Page title="Lote" backTo="/">{null}</Page>;
  const { batch, pond, records } = data;
  if (!batch) return <Page title="Lote" backTo="/"><p className="notice warn">Este lote no existe en el celular.</p></Page>;
  const back = `/estanques/${batch.pondId}`;

  return (
    <Page title={`Lote ${batch.code}`} backTo={back}>
      <section className="section">
        <div className="section-head">
          <p className="muted">
            {pond?.name ?? 'Estanque'} · siembra {formatDate(batch.stockingDate)}
            {batch.initialQuantity !== undefined && ` · ${formatNumber(batch.initialQuantity, 0)} alevinos`}
          </p>
          <SyncChip state={batch.syncState} />
        </div>
        {batch.status === 'cerrado' && <p className="notice">Este lote está cerrado (cosechado).</p>}
        <BatchSummaryPanel batch={batch} />
      </section>

      {/* Lo que el resumen no dice: hacia dónde va, y qué encontró el análisis */}
      <ProjectionPanel batchId={batch.id} />
      <FindingsPanel batchId={batch.id} />

      {batch.status === 'activo' && (
        <section className="section">
          <h2>Registrar</h2>
          <div className="button-row">
            {BATCH_RECORDS.map((type) => (
              <a key={type} className="button" href={`#/registrar/${type}?lote=${batch.id}`}>{RECORD_LABELS[type]}</a>
            ))}
            <a className="button" href={`#/lotes/${batch.id}/conteo`}>Contar con el contador</a>
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <h2>Registros de este celular</h2>
          <a className="button secondary" href={`#/lotes/${batch.id}/editar`}>Editar lote</a>
        </div>
        <RecordList records={records} empty="Aún no hay registros de este lote." />
      </section>
    </Page>
  );
}
