import { formatNumber, timeAgo } from '../../shared/utils/format';
import type { WaterReading } from '../records/recordTypes';
import { TONE_TEXT, toneOf, type WaterVariable } from './waterRanges';

interface ReadingProps {
  variable: WaterVariable;
  label: string;
  unit: string;
  value?: number;
}

function Reading({ variable, label, unit, value }: ReadingProps) {
  const tone = toneOf(variable, value);
  return (
    <div className={`reading ${tone}`}>
      <span className="value">
        {formatNumber(value)}
        {value !== undefined && unit && <span className="unit">{unit}</span>}
      </span>
      <span className="label">
        {label} · {TONE_TEXT[tone]}
      </span>
    </div>
  );
}

/** The latest water reading of a pond, coloured by the trout ranges. */
export function WaterBand({ reading }: { reading?: WaterReading }) {
  return (
    <div>
      <div className="water-band">
        <Reading variable="tempC" label="Temperatura" unit="°C" value={reading?.tempC} />
        <Reading variable="ph" label="pH" unit="" value={reading?.ph} />
        {reading?.oxygenMgL !== undefined && <Reading variable="oxygenMgL" label="Oxígeno" unit="mg/L" value={reading.oxygenMgL} />}
      </div>
      <p className="muted" style={{ marginTop: 6 }}>
        {reading ? `Última lectura ${timeAgo(reading.recordedAt)}` : 'Aún no hay lecturas en este celular'}
      </p>
    </div>
  );
}
