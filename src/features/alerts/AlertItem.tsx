import { timeAgo } from '../../shared/utils/format';
import { attendAlert } from './alertRepository';
import type { Alert } from './alertTypes';

interface AlertItemProps {
  alert: Alert;
  /** Shown on the alerts screen, where alerts of every pond are mixed */
  pondName?: string;
}

/** One alert with the button to mark it attended (works offline, see alertRepository). */
export function AlertItem({ alert, pondName }: AlertItemProps) {
  const critical = alert.level === 'critica';
  return (
    <li className="row alert-row">
      <div className="row-main">
        <p className="row-title">{alert.message}</p>
        <p className="muted">
          {pondName && `${pondName} · `}
          Medido {timeAgo(alert.measuredAt)}
        </p>
      </div>
      <span className={`chip ${critical ? 'danger' : 'warn'}`}>{critical ? 'Crítica' : 'Advertencia'}</span>
      <button className="button secondary" onClick={() => attendAlert(alert.id)} aria-label={`Marcar como atendida: ${alert.message}`}>
        Atendida
      </button>
    </li>
  );
}
