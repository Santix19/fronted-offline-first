import { facade } from '../../facade/PisciculturaFacade';
import { useLiveQuery } from '../../shared/db/useLiveQuery';
import { Page } from '../../shared/ui/Page';
import { FindingsPanel } from '../findings/FindingsPanel';
import { AlertItem } from './AlertItem';

async function loadAlerts() {
  const [alerts, ponds] = await Promise.all([facade.alerts(), facade.ponds()]);
  return { alerts, pondNames: new Map(ponds.map((p) => [p.id, p.name])) };
}

/**
 * Every pending alert, and below them what the AI found.
 *
 * Two sections and not one list. An alert comes from crossing a threshold: it is a fact, and the
 * caretaker checks it by lowering the sensor again. A finding comes from a model looking at the
 * pond's history: it is a suspicion worth confirming. Mixed together, the first loses credibility
 * and the second borrows some it has not earned.
 *
 * The alerts come from the phone's own database, so they are there without signal. The findings
 * live on the server, which is where the history they were worked out from lives, so that section
 * simply does not appear when there is no signal — which is the truth of it.
 */
export function AlertsPage() {
  const data = useLiveQuery(loadAlerts, ['alerts', 'ponds']);

  return (
    <Page title="Alertas">
      <section className="section">
        <h2>Umbrales cruzados</h2>
        {data && data.alerts.length === 0 && (
          <div className="empty">
            <p>No hay alertas pendientes.</p>
            <p className="muted">Cuando una lectura salga del rango para la trucha, la alerta aparece aquí después de sincronizar.</p>
          </div>
        )}
        {data && data.alerts.length > 0 && (
          <ul className="list">
            {data.alerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} pondName={data.pondNames.get(alert.pondId)} />
            ))}
          </ul>
        )}
      </section>

      <FindingsPanel placeOf={(f) => (f.pondId ? data?.pondNames.get(f.pondId) : undefined)} />
    </Page>
  );
}
