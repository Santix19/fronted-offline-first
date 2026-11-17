import { formatNumber, timeAgo } from '../../shared/utils/format';
import type { SensorDescriptor } from '../sensors/sensorTypes';
import type { CountingTally } from './countingTypes';

interface CountingTotalsProps {
  totals?: CountingTally;
  /** Fish crossing the barrier right now, in a batch the board has not closed */
  live?: number;
  sensor?: SensorDescriptor;
  warning: string | null;
  problem?: string;
}

/** The running total, big enough to read standing over the channel with the sun on the screen. */
export function CountingTotals({ totals, live = 0, sensor, warning, problem }: CountingTotalsProps) {
  return (
    <section className="panel" aria-live="polite">
      <div className="count-total">
        <strong key={(totals?.total ?? 0) + live} className="number tick">{formatNumber((totals?.total ?? 0) + live, 0)}</strong>
        <span>alevinos contados{sensor ? ` · ${sensor.label}` : ''}</span>
        {live > 0 && <span className="muted live-note">{formatNumber(live, 0)} de la tanda en curso, todavía sin cerrar</span>}
      </div>
      {warning && <p className="notice warn" role="alert">{warning}</p>}
      {problem && <p className="notice danger" role="alert">{problem}</p>}
      <dl className="facts">
        <div>
          <dt>Cortes múltiples</dt>
          <dd>{sensor?.countsMultipleCuts === false ? 'No los mide' : formatNumber(totals?.multipleCuts ?? 0, 0)}</dd>
        </div>
        <div>
          <dt>Tramas recibidas</dt>
          <dd>{formatNumber(totals?.frames ?? 0, 0)}</dd>
        </div>
        <div>
          <dt>Último pulso</dt>
          <dd>{totals?.frames ? timeAgo(totals.updatedAt) : '—'}</dd>
        </div>
      </dl>
    </section>
  );
}
