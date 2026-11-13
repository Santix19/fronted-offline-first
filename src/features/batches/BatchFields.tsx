import { Choices } from '../../shared/ui/Choices';
import { Field } from '../../shared/ui/Field';
import { toLocalDate } from '../../shared/utils/dates';
import type { BatchStatus } from './batchTypes';
import type { BatchFormValues } from './batchValidation';

interface Props {
  values: BatchFormValues;
  errors: Record<string, string>;
  set: (key: keyof BatchFormValues) => (value: string) => void;
  status: BatchStatus;
  setStatus: (status: BatchStatus) => void;
  editing: boolean;
}

export function BatchFields({ values, errors, set, status, setStatus, editing }: Props) {
  return <>
    <Field label="Código del lote" value={values.code} onChange={set('code')} error={errors.code} hint="Por ejemplo L12" />
    <Field label="Fecha de siembra" type="date" value={values.stockingDate} onChange={set('stockingDate')} error={errors.stockingDate} max={toLocalDate()} />
    <Field label="Alevinos sembrados" type="number" big value={values.quantity} onChange={set('quantity')} error={errors.quantity} />
    <Field label="Peso inicial" type="number" big unit="g" value={values.weight} onChange={set('weight')} error={errors.weight} />
    {editing && <Choices label="Estado" name="status" value={status} options={{ activo: 'Activo', cerrado: 'Cerrado' }} onChange={setStatus} />}
  </>;
}
