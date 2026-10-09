import { SyncChip } from '../../shared/ui/SyncChip';
import { formatDateTime, formatNumber } from '../../shared/utils/format';
import { RECORD_LABELS, type FieldRecord } from './recordTypes';

/** One line that says what was recorded, e.g. "14,2 °C · pH 7,1". */
export function describeRecord(r: FieldRecord): string {
  switch (r.type) {
    case 'water_reading':
      return [
        r.tempC !== undefined && `${formatNumber(r.tempC)} °C`,
        r.ph !== undefined && `pH ${formatNumber(r.ph, 2)}`,
        r.oxygenMgL !== undefined && `${formatNumber(r.oxygenMgL)} mg/L O₂`,
      ].filter(Boolean).join(' · ');
    case 'fry_count':
      return `${formatNumber(r.total, 0)} alevinos contados`;
    case 'mortality':
      return `${formatNumber(r.quantity, 0)} muertos${r.cause ? ` · ${r.cause}` : ''}`;
    case 'feeding':
      return `${formatNumber(r.kg, 2)} kg de alimento`;
    case 'biometry':
      return `${formatNumber(r.avgWeightG)} g promedio${r.sampleSize ? ` · muestra de ${r.sampleSize}` : ''}`;
  }
}

const SOURCE_TEXT: Record<FieldRecord['source'], string> = { sensor: 'sensor', contador: 'máquina', voz: 'voz', manual: 'a mano' };

export function RecordList({ records, empty }: { records: FieldRecord[]; empty: string }) {
  if (records.length === 0) return <p className="muted">{empty}</p>;
  return (
    <ul className="list">
      {records.map((r) => (
        <li key={r.id} className="row">
          <div className="row-main">
            <p className="row-title number">{describeRecord(r)}</p>
            <p className="muted">
              {RECORD_LABELS[r.type]} · {formatDateTime(r.recordedAt)} · {SOURCE_TEXT[r.source]}
            </p>
            {r.syncError && <p className="muted" style={{ color: 'var(--danger)' }}>{r.syncError}</p>}
          </div>
          <SyncChip state={r.syncState} />
        </li>
      ))}
    </ul>
  );
}
