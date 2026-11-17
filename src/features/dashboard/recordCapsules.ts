import type { Capsule } from '../../shared/ui/CapsuleRibbon';
import { formatNumber } from '../../shared/utils/format';
import type { FieldRecord } from '../records/recordTypes';

/** The newest records as ribbon capsules: a mark, a short name, the one number that matters. */
export function recordCapsules(records: FieldRecord[], limit = 10): Capsule[] {
  return [...records]
    .sort((a, b) => Date.parse(b.recordedAt) - Date.parse(a.recordedAt))
    .slice(0, limit)
    .map((r) => {
      const action = r.syncState === 'pending' ? 'Por subir' : r.syncState === 'rejected' ? 'Revisar' : undefined;
      switch (r.type) {
        case 'water_reading':
          return r.tempC !== undefined
            ? { mark: '°C', label: 'Temperatura', value: formatNumber(r.tempC), action }
            : { mark: 'pH', label: 'pH del agua', value: formatNumber(r.ph), action };
        case 'fry_count':
          return { mark: '#', label: 'Conteo', value: formatNumber(r.total, 0), action };
        case 'mortality':
          return { mark: '✕', label: 'Mortalidad', value: formatNumber(r.quantity, 0), action };
        case 'feeding':
          return { mark: 'kg', label: 'Alimento', value: formatNumber(r.kg), action };
        case 'biometry':
          return { mark: 'g', label: 'Biometría', value: formatNumber(r.avgWeightG, 0), action };
      }
    });
}
