import { useEffect, useState, type FormEvent } from 'react';
import { Choices } from '../../shared/ui/Choices';
import { Field } from '../../shared/ui/Field';
import { Page } from '../../shared/ui/Page';
import { navigate } from '../../shared/ui/router';
import { toLocalDate } from '../../shared/utils/dates';
import { parseOptionalNumber } from '../../shared/utils/numbers';
import { codeTaken, getBatch, saveBatch } from './batchRepository';
import type { Batch, BatchStatus } from './batchTypes';
import { validateBatchForm, type BatchFormValues } from './batchValidation';

const STATUS_LABELS: Record<BatchStatus, string> = { activo: 'Activo', cerrado: 'Cerrado' };

/** Create a batch in a pond (pondId) or edit an existing one (batchId). Works without signal. */
export function BatchFormPage({ pondId, batchId }: { pondId?: string; batchId?: string }) {
  const [existing, setExisting] = useState<Batch>();
  const [values, setValues] = useState<BatchFormValues>({ code: '', stockingDate: toLocalDate(), quantity: '', weight: '' });
  const [status, setStatus] = useState<BatchStatus>('activo');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (key: keyof BatchFormValues) => (value: string) => setValues((v) => ({ ...v, [key]: value }));

  useEffect(() => {
    if (!batchId) return;
    getBatch(batchId).then((batch) => {
      if (!batch) return;
      setExisting(batch);
      setStatus(batch.status);
      setValues({
        code: batch.code,
        stockingDate: batch.stockingDate ?? '',
        quantity: batch.initialQuantity?.toString() ?? '',
        weight: batch.initialWeightG?.toString() ?? '',
      });
    });
  }, [batchId]);

  const targetPond = existing?.pondId ?? pondId;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!targetPond) return;
    const found = validateBatchForm(values);
    if (!found.code && (await codeTaken(targetPond, values.code, existing?.id))) found.code = 'Ya hay un lote con ese código en este estanque';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const batch = await saveBatch(
      {
        pondId: targetPond,
        code: values.code,
        stockingDate: values.stockingDate || undefined,
        initialQuantity: parseOptionalNumber(values.quantity),
        initialWeightG: parseOptionalNumber(values.weight),
        status,
      },
      existing,
    );
    navigate(`/lotes/${batch.id}`, { replace: true });
  }

  if (!targetPond && !batchId) return <Page title="Nuevo lote" backTo="/"><p className="notice warn">Abre un estanque para crear un lote.</p></Page>;

  return (
    <Page title={existing ? `Editar lote ${existing.code}` : 'Nuevo lote'} backTo={targetPond ? `/estanques/${targetPond}` : '/'}>
      {existing?.syncError && <p className="notice danger">El servidor lo rechazó: {existing.syncError}</p>}
      <form className="form" onSubmit={submit} noValidate>
        <Field label="Código del lote" value={values.code} onChange={set('code')} error={errors.code} hint="Por ejemplo L12" />
        <Field label="Fecha de siembra" type="date" value={values.stockingDate} onChange={set('stockingDate')} error={errors.stockingDate} max={toLocalDate()} />
        <div className="field-pair">
          <Field label="Alevinos sembrados" type="number" value={values.quantity} onChange={set('quantity')} error={errors.quantity} />
          <Field label="Peso inicial (g)" type="number" value={values.weight} onChange={set('weight')} error={errors.weight} />
        </div>
        {existing && <Choices label="Estado" name="status" value={status} options={STATUS_LABELS} onChange={setStatus} />}
        <button className="button block" type="submit">{existing ? 'Guardar cambios' : 'Guardar lote'}</button>
      </form>
    </Page>
  );
}
