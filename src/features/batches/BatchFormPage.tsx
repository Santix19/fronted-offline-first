import { useEffect, useState, type FormEvent } from 'react';
import { ClockNotice } from '../../shared/ui/ClockNotice';
import { LoadingState } from '../../shared/ui/LoadingState';
import { deviceDateError } from '../../shared/utils/dates';
import { errorMessage } from '../../shared/http/ApiError';
import { facade } from '../../facade/PisciculturaFacade';
import { Page } from '../../shared/ui/Page';
import { navigate } from '../../shared/ui/router';
import { toLocalDate } from '../../shared/utils/dates';
import { batchFormInput } from './batchFormInput';
import type { Batch, BatchStatus } from './batchTypes';
import { validateBatchForm, type BatchFormValues } from './batchValidation';
import { BatchFields } from './BatchFields';

/** Create a batch in a pond (pondId) or edit an existing one (batchId). Works without signal. */
export function BatchFormPage({ pondId, batchId }: { pondId?: string; batchId?: string }) {
  const [loading, setLoading] = useState(Boolean(batchId));
  const [loadError, setLoadError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [existing, setExisting] = useState<Batch>();
  const [values, setValues] = useState<BatchFormValues>({ code: '', stockingDate: toLocalDate(), quantity: '', weight: '' });
  const [status, setStatus] = useState<BatchStatus>('activo');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (key: keyof BatchFormValues) => (value: string) => setValues((v) => ({ ...v, [key]: value }));

  useEffect(() => {
    if (!batchId) return;
    let active = true;
    setLoading(true);
    setLoadError(undefined);
    facade.batch(batchId).then((batch) => {
      if (!active) return;
      if (!batch) { setLoadError('Este lote no existe en el celular.'); return; }
      setExisting(batch);
      setStatus(batch.status);
      setValues({
        code: batch.code,
        stockingDate: batch.stockingDate ?? '',
        quantity: batch.initialQuantity?.toString() ?? '',
        weight: batch.initialWeightG?.toString() ?? '',
      });
    }).catch((error) => { if (active) setLoadError(errorMessage(error)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [batchId]);

  const targetPond = existing?.pondId ?? pondId;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || loading || loadError) return;
    const clock = deviceDateError(new Date());
    if (clock) { setErrors({ form: clock }); return; }
    setBusy(true);
    try {
      if (!targetPond) return;
      const found = validateBatchForm(values);
      if (!found.code && (await facade.batchCodeTaken(targetPond, values.code, existing?.id))) found.code = 'Ya hay un lote con ese código en este estanque';
      setErrors(found);
      if (Object.keys(found).length > 0) return;

      const batch = await facade.saveBatch(batchFormInput(values, targetPond, status), existing);
      navigate(`/lotes/${batch.id}`, { replace: true });
    } catch (error) { setErrors({ form: errorMessage(error) }); }
    finally { setBusy(false); }
  }

  if (!targetPond && !batchId) return <Page title="Nuevo lote" backTo="/"><p className="notice warn">Abre un estanque para crear un lote.</p></Page>;

  return (
    <Page title={existing ? `Editar lote ${existing.code}` : 'Nuevo lote'} backTo={targetPond ? `/estanques/${targetPond}` : '/'}>
      {existing?.syncError && <p className="notice danger">El servidor lo rechazó: {existing.syncError}</p>}
      <ClockNotice />
      {loadError && <p className="notice danger" role="alert">{loadError}</p>}
      {loading ? <LoadingState /> : !loadError && <form className="form" onSubmit={submit} noValidate>
        {errors.form && <p className="notice danger" role="alert">{errors.form}</p>}
        <BatchFields values={values} errors={errors} set={set} status={status} setStatus={setStatus} editing={Boolean(existing)} />
        <button className="button block" type="submit" disabled={busy}>{existing ? 'Guardar cambios' : 'Guardar lote'}</button>
      </form>}
    </Page>
  );
}
