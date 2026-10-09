import { useLiveQuery } from '../../shared/db/useLiveQuery';
import { Page } from '../../shared/ui/Page';
import { SyncChip } from '../../shared/ui/SyncChip';
import { formatNumber } from '../../shared/utils/format';
import { AlertItem } from '../alerts/AlertItem';
import { listAlerts } from '../alerts/alertRepository';
import { BatchList } from '../batches/BatchList';
import { RecordList } from '../records/RecordList';
import { getPond } from './pondRepository';
import { POND_TYPE_LABELS } from './pondTypes';
import { WaterBand } from './WaterBand';
import { listRecords } from '../records/recordRepository';
import type { WaterReading } from '../records/recordTypes';

async function loadPond(pondId: string) {
  const [pond, alerts, readings] = await Promise.all([getPond(pondId), listAlerts(pondId), listRecords(pondId, 10)]);
  return { pond, alerts, readings: readings as WaterReading[] };
}

/** One pond: water state, its alerts, its batches and the latest readings. */
export function PondDetailPage({ pondId }: { pondId: string }) {
  const data = useLiveQuery(() => loadPond(pondId), ['ponds', 'alerts', 'records'], [pondId]);
  if (!data) return <Page title="Estanque" backTo="/">{null}</Page>;
  const { pond, alerts, readings } = data;
  if (!pond) return <Page title="Estanque" backTo="/"><p className="notice warn">Este estanque no existe en el celular.</p></Page>;

  return (
    <Page title={pond.name} backTo="/">
      <section className="section">
        <div className="section-head">
          <p className="muted">
            {POND_TYPE_LABELS[pond.type]}
            {pond.volumeM3 !== undefined && ` · ${formatNumber(pond.volumeM3)} m³`}
          </p>
          <SyncChip state={pond.syncState} />
        </div>
        <WaterBand reading={readings[0]} />
        <div className="button-row">
          <a className="button" href={`#/registrar/water_reading?estanque=${pond.id}`}>Registrar lectura de agua</a>
          <a className="button secondary" href={`#/estanques/${pond.id}/editar`}>Editar estanque</a>
        </div>
      </section>

      {alerts.length > 0 && (
        <section className="section">
          <h2>Alertas pendientes</h2>
          <ul className="list">{alerts.map((a) => <AlertItem key={a.id} alert={a} />)}</ul>
        </section>
      )}

      <BatchList pondId={pond.id} />

      <section className="section">
        <h2>Últimas lecturas</h2>
        <RecordList records={readings} empty="Aún no hay lecturas de este estanque." />
      </section>
    </Page>
  );
}
