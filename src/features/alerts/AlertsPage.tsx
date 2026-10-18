import { facade } from '../../facade/PisciculturaFacade';
import { useLiveQuery } from '../../shared/db/useLiveQuery';
import { Page } from '../../shared/ui/Page';
import { AlertItem } from './AlertItem';

async function loadAlerts() {
  const [alerts, ponds] = await Promise.all([facade.alerts(), facade.ponds()]);
  return { alerts, pondNames: new Map(ponds.map((p) => [p.id, p.name])) };
}

/** Every pending alert, critical first. The backend's expert system creates them from the readings. */
export function AlertsPage() {
  const data = useLiveQuery(loadAlerts, ['alerts', 'ponds']);

  return (
    <Page title="Alertas">
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
    </Page>
  );
}
