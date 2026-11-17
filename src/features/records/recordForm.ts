import { newId } from '../../shared/utils/ids';
import { parseOptionalNumber } from '../../shared/utils/numbers';
import type { FieldRecord, RecordSource, RecordType } from './recordTypes';

/** One input of a record form. The five forms are described as data, so one screen draws all of them. */
export interface FieldSpec {
  key: string;
  label: string;
  hint?: string;
  kind: 'number' | 'text';
}

export const RECORD_FIELDS: Record<RecordType, FieldSpec[]> = {
  water_reading: [
    { key: 'tempC', label: 'Temperatura (°C)', kind: 'number', hint: 'Óptimo para trucha: 10 a 16 °C' },
    { key: 'ph', label: 'pH', kind: 'number', hint: 'Óptimo: 6,5 a 8,5' },
    { key: 'oxygenMgL', label: 'Oxígeno disuelto (mg/L)', kind: 'number', hint: 'Opcional. Mínimo recomendado: 6' },
  ],
  fry_count: [
    { key: 'total', label: 'Total contado', kind: 'number' },
    { key: 'multipleCuts', label: 'Cortes múltiples', kind: 'number', hint: 'Opcional. Lo indica la máquina contadora' },
  ],
  mortality: [
    { key: 'quantity', label: 'Peces muertos', kind: 'number' },
    { key: 'cause', label: 'Causa', kind: 'text', hint: 'Opcional. Por ejemplo: hongos, falta de oxígeno' },
  ],
  feeding: [{ key: 'kg', label: 'Alimento entregado (kg)', kind: 'number' }],
  biometry: [
    { key: 'avgWeightG', label: 'Peso promedio (g)', kind: 'number' },
    { key: 'sampleSize', label: 'Peces pesados (muestra)', kind: 'number', hint: 'Opcional' },
  ],
};

/** Sources the caretaker can choose for each record type. */
export const SOURCE_OPTIONS: Partial<Record<RecordType, Partial<Record<RecordSource, string>>>> = {
  fry_count: { contador: 'Máquina contadora', manual: 'A mano' },
};

export type FormValues = Record<string, string>;

export interface BuildInput {
  type: RecordType;
  parentId: string;
  values: FormValues;
  source: RecordSource;
  recordedAt: string;
}

/** Turns what was typed into a record. Unreadable numbers become NaN and validation reports them. */
export function buildRecord({ type, parentId, values, source, recordedAt }: BuildInput): FieldRecord {
  const num = (key: string) => parseOptionalNumber(values[key] ?? '');
  const base = { id: newId(), recordedAt, source, syncState: 'pending' as const };
  switch (type) {
    case 'water_reading':
      return { ...base, type, pondId: parentId, tempC: num('tempC'), ph: num('ph'), oxygenMgL: num('oxygenMgL') };
    case 'fry_count':
      return { ...base, type, batchId: parentId, total: num('total') ?? NaN, multipleCuts: num('multipleCuts') };
    case 'mortality':
      return { ...base, type, batchId: parentId, quantity: num('quantity') ?? NaN, cause: values.cause?.trim() || undefined };
    case 'feeding':
      return { ...base, type, batchId: parentId, kg: num('kg') ?? NaN };
    case 'biometry':
      return { ...base, type, batchId: parentId, avgWeightG: num('avgWeightG') ?? NaN, sampleSize: num('sampleSize') };
  }
}
