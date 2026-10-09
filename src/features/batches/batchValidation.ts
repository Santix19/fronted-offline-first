import { toLocalDate } from '../../shared/utils/dates';
import { parseOptionalNumber } from '../../shared/utils/numbers';

/** What the batch form holds: text, exactly as typed. */
export interface BatchFormValues {
  code: string;
  stockingDate: string;
  quantity: string;
  weight: string;
}

/** Same limits as the backend (Catalog.BatchSync). Returns field -> message. */
export function validateBatchForm(values: BatchFormValues, today = toLocalDate()): Record<string, string> {
  const errors: Record<string, string> = {};
  const quantity = parseOptionalNumber(values.quantity);
  const weight = parseOptionalNumber(values.weight);

  if (!values.code.trim()) errors.code = 'Escribe el código del lote';
  else if (values.code.trim().length > 40) errors.code = 'Máximo 40 caracteres';
  if (values.stockingDate && values.stockingDate > today) errors.stockingDate = 'La siembra no puede ser en el futuro';
  if (Number.isNaN(quantity) || (quantity !== undefined && (quantity < 0 || !Number.isInteger(quantity)))) {
    errors.quantity = 'Debe ser un número entero, 0 o más';
  }
  if (Number.isNaN(weight) || (weight !== undefined && weight <= 0)) errors.weight = 'Debe ser un número mayor que 0';
  return errors;
}
