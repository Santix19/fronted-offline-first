import { useLiveQuery } from '../../shared/db/useLiveQuery';
import { Page } from '../../shared/ui/Page';
import { SyncChip } from '../../shared/ui/SyncChip';
import { listAlerts } from '../alerts/alertRepository';
import { latestReadingsByPond } from '../records/recordRepository';
import { listPonds } from './pondRepository';
import { POND_TYPE_LABELS } from './pondTypes';
import { WaterBand } from './WaterBand';

async function loadHome() {
  const [ponds, readings, alerts] = await Promise.all([listPonds(), latestReadingsByPond(), listAlerts()]);
  return { ponds, readings, alerts };
}

/** Home screen: every pond with the state of its water at a glance. */
export function PondListPage() {
  const data = useLiveQuery(loadHome, ['ponds', 'records', 'alerts']);

  return (
    <Page title="La Cocha">
      <section className="section">
        <div className="section-head">
          <h2>Estanques</h2>
          <a className="button secondary" href="#/estanques/nuevo">Agregar</a>
        </div>

        {data && data.ponds.length === 0 && (
          <div className="empty">
            <p>Todavía no hay estanques en este celular.</p>
            <p className="muted">Si ya existen en el servidor, aparecen al sincronizar. Si no, agrega el primero.</p>
            <a className="button" href="#/estanques/nuevo">Agregar estanque</a>
          </div>
        )}

        {data && data.ponds.length > 0 && (
          <ul className="list">
            {data.ponds.map((pond) => {
              const alertCount = data.alerts.filter((a) => a.pondId === pond.id).length;
              return (
                <li key={pond.id}>
                  <a className="pond-row" href={`#/estanques/${pond.id}`}>
                    <div className="head">
                      <span className="name">{pond.name}</span>
                      <span className="muted">{POND_TYPE_LABELS[pond.type]}</span>
                      {alertCount > 0 && <span className="chip danger">{alertCount} alerta{alertCount > 1 ? 's' : ''}</span>}
                      {pond.syncState !== 'synced' && <SyncChip state={pond.syncState} />}
                    </div>
                    <WaterBand reading={data.readings.get(pond.id)} />
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </Page>
  );
}
