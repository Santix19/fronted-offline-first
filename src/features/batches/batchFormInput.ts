import { parseOptionalNumber } from '../../shared/utils/numbers';
import type { BatchStatus } from './batchTypes';
import type { BatchFormValues } from './batchValidation';

/** The form's text becomes catalogue values only after validation. */
export function batchFormInput(values: BatchFormValues, pondId: string, status: BatchStatus) {
  return {
    pondId,
    code: values.code,
    stockingDate: values.stockingDate || undefined,
    initialQuantity: parseOptionalNumber(values.quantity),
    initialWeightG: parseOptionalNumber(values.weight),
    status,
  };
}
