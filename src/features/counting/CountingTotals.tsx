import { TroutImage } from '../../shared/ui/TroutImage';
import { formatNumber, timeAgo } from '../../shared/utils/format';
import type { SensorDescriptor } from '../sensors/sensorTypes';
import type { CountingTally } from './countingTypes';
import type { CSSProperties } from 'react';

interface CountingTotalsProps {
  totals?: CountingTally;
  sensor?: SensorDescriptor;
  warning: string | null;
  problem?: string;
  /** Fry stocked in this batch: the count is shown as progress towards it */
  expected?: number;
}

/**
 * The running total, big enough to read standing over the channel with the sun on the screen.
 * Every new count sends one trout across the gate, so a pulse is confirmed without reading.
 */
export function CountingTotals({ totals, sensor, warning, problem, expected }: CountingTotalsProps) {
  const total = totals?.total ?? 0;
  const display = formatNumber(total, 0);
  const percent = expected ? Math.min(100, Math.round((total / expected) * 100)) : undefined;
  return (
    <section className="panel count-panel stage-chapter" aria-live="polite">
      <p className="count-label">Alevinos contados{sensor ? ` · ${sensor.label}` : ''}</p>
      <strong key={total} className="count-number number tick" style={{ '--count-digits': Math.max(4, display.length) } as CSSProperties}>{display}</strong>
      {percent !== undefined && (
        <>
          <div className="count-bar" role="img" aria-label={`${percent} por ciento de los ${formatNumber(expected!, 0)} sembrados`}>
            <span style={{ width: `${percent}%` }} />
          </div>
          <p className="count-progress">
            <span><b>{percent} %</b> del lote</span> <span>Sembrados: {formatNumber(expected!, 0)}</span>
          </p>
        </>
      )}
      <div className="count-gate" aria-hidden="true">
        {/* key: the trout swims across again on every new count */}
        <span key={total} className={total > 0 ? 'count-fish crossing' : 'count-fish'}>
          <TroutImage width={120} />
        </span>
      </div>
      {warning && <p className="notice warn" role="alert">{warning}</p>}
      {problem && <p className="notice danger" role="alert">{problem}</p>}
      <dl className="count-facts">
        <div>
          <dd>{sensor?.countsMultipleCuts === false ? 'No se mide' : formatNumber(totals?.multipleCuts ?? 0, 0)}</dd>
          <dt>Pasaron dos juntos</dt>
        </div>
        <div>
          <dd>{totals?.frames ? timeAgo(totals.updatedAt) : '—'}</dd>
          <dt>Último pez</dt>
        </div>
      </dl>
      <p className="count-help">«Pasaron dos juntos» indica un paso ambiguo: la barrera lo cuenta como un pez. Baja el caudal para separarlos.</p>
    </section>
  );
}
