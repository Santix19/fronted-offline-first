import { deviceDateError } from '../../shared/utils/dates';
import type { FieldRecord } from './recordTypes';

/**
 * Same limits as the backend DTOs. Checking them here keeps a bad record out of the queue,
 * because once the caretaker is back on land it is hard to know what was meant.
 * Returns field -> message; an empty object means the record is valid.
 */
export type ValidationErrors = Record<string, string>;

const between = (value: number | undefined, min: number, max: number) =>
  value === undefined || (value >= min && value <= max);

const isWhole = (value: number | undefined) => value === undefined || Number.isInteger(value);

export function validateRecord(record: FieldRecord, now = new Date()): ValidationErrors {
  const errors: ValidationErrors = {};
  const dateError = deviceDateError(new Date(record.recordedAt), now);
  if (dateError) errors.recordedAt = dateError;

  switch (record.type) {
    case 'water_reading':
      if (record.tempC === undefined && record.ph === undefined && record.oxygenMgL === undefined) {
        errors.form = 'Escribe al menos la temperatura, el pH o el oxígeno';
      }
      if (!between(record.tempC, -5, 40)) errors.tempC = 'La temperatura debe estar entre -5 y 40 °C';
      if (!between(record.ph, 0, 14)) errors.ph = 'El pH debe estar entre 0 y 14';
      if (!between(record.oxygenMgL, 0, 30)) errors.oxygenMgL = 'El oxígeno debe estar entre 0 y 30 mg/L';
      break;
    case 'fry_count':
      if (!isWhole(record.total) || record.total < 0) errors.total = 'El total debe ser un número entero, 0 o más';
      if (!isWhole(record.multipleCuts) || (record.multipleCuts ?? 0) < 0) errors.multipleCuts = 'Debe ser un número entero, 0 o más';
      break;
    case 'mortality':
      if (!isWhole(record.quantity) || record.quantity < 1) errors.quantity = 'La cantidad debe ser un número entero mayor que 0';
      if ((record.cause ?? '').length > 120) errors.cause = 'La causa no puede pasar de 120 caracteres';
      break;
    case 'feeding':
      if (!(record.kg > 0 && record.kg <= 1000)) errors.kg = 'Los kilos deben ser mayores que 0 y hasta 1000';
      break;
    case 'biometry':
      if (!(record.avgWeightG > 0 && record.avgWeightG <= 5000)) errors.avgWeightG = 'El peso debe ser mayor que 0 y hasta 5000 g';
      if (!isWhole(record.sampleSize) || (record.sampleSize !== undefined && record.sampleSize < 1)) {
        errors.sampleSize = 'La muestra debe ser un número entero mayor que 0';
      }
      break;
  }
  return errors;
}
