import { formatNumber, timeAgo } from '../../shared/utils/format';
import type { SensorDescriptor } from '../sensors/sensorTypes';
import type { CountingTally } from './countingTypes';

interface CountingTotalsProps {
  totals?: CountingTally;
  sensor?: SensorDescriptor;
  warning: string | null;
  problem?: string;
}

/** The running total, big enough to read standing over the channel with the sun on the screen. */
export function CountingTotals({ totals, sensor, warning, problem }: CountingTotalsProps) {
  return (
    <section className="panel" aria-live="polite">
      <div className="count-total">
        <strong className="number">{formatNumber(totals?.total ?? 0, 0)}</strong>
        <span>alevinos contados{sensor ? ` · ${sensor.label}` : ''}</span>
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
