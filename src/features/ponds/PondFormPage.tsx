import { useEffect, useState, type FormEvent } from 'react';
import { ClockNotice } from '../../shared/ui/ClockNotice';
import { LoadingState } from '../../shared/ui/LoadingState';
import { deviceDateError } from '../../shared/utils/dates';
import { errorMessage } from '../../shared/http/ApiError';
import { facade } from '../../facade/PisciculturaFacade';
import { Choices } from '../../shared/ui/Choices';
import { Field } from '../../shared/ui/Field';
import { Page } from '../../shared/ui/Page';
import { navigate } from '../../shared/ui/router';
import { parseOptionalNumber } from '../../shared/utils/numbers';
import { POND_TYPE_LABELS, type Pond, type PondType } from './pondTypes';

/** Create a pond, or edit one when an id is given. Works without signal. */
export function PondFormPage({ pondId }: { pondId?: string }) {
  const [loading, setLoading] = useState(Boolean(pondId));
  const [loadError, setLoadError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [existing, setExisting] = useState<Pond>();
  const [name, setName] = useState('');
  const [type, setType] = useState<PondType>('estanque');
  const [volume, setVolume] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!pondId) return;
    let active = true;
    setLoading(true);
    setLoadError(undefined);
    facade.pond(pondId).then((pond) => {
      if (!active) return;
      if (!pond) { setLoadError('Este estanque no existe en el celular.'); return; }
      setExisting(pond);
      setName(pond.name);
      setType(pond.type);
      setVolume(pond.volumeM3?.toString() ?? '');
    }).catch((error) => { if (active) setLoadError(errorMessage(error)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [pondId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || loading || loadError) return;
    const clock = deviceDateError(new Date());
    if (clock) { setErrors({ form: clock }); return; }
    setBusy(true);
    try {
      const volumeM3 = parseOptionalNumber(volume);
      const found: Record<string, string> = {};
      if (!name.trim()) found.name = 'Escribe el nombre';
      else if (name.trim().length > 80) found.name = 'Máximo 80 caracteres';
      else if (await facade.pondNameTaken(name, existing?.id)) found.name = 'Ya hay un estanque con ese nombre';
      if (Number.isNaN(volumeM3) || (volumeM3 !== undefined && volumeM3 <= 0)) found.volume = 'Debe ser un número mayor que 0';
      setErrors(found);
      if (Object.keys(found).length > 0) return;

      const pond = await facade.savePond({ name, type, volumeM3 }, existing);
      navigate(`/estanques/${pond.id}`, { replace: true });
    } catch (error) { setErrors({ form: errorMessage(error) }); }
    finally { setBusy(false); }
  }

  return (
    <Page title={existing ? `Editar ${existing.name}` : 'Nuevo estanque'} backTo="/">
      {existing?.syncError && <p className="notice danger">El servidor lo rechazó: {existing.syncError}</p>}
      <ClockNotice />
      {loadError && <p className="notice danger" role="alert">{loadError}</p>}
      {loading ? <LoadingState /> : !loadError && <form className="form" onSubmit={submit} noValidate>
        {errors.form && <p className="notice danger" role="alert">{errors.form}</p>}
        <Field label="Nombre" value={name} onChange={setName} error={errors.name} hint="Como lo llaman en la finca, por ejemplo Tanque 1" />
        <Choices label="Tipo" name="type" value={type} options={POND_TYPE_LABELS} onChange={setType} />
        <Field label="Volumen" type="number" big unit="m³" value={volume} onChange={setVolume} error={errors.volume} hint="Opcional. Sirve para calcular la densidad" />
        <button className="button block" type="submit" disabled={busy}>{existing ? 'Guardar cambios' : 'Guardar estanque'}</button>
      </form>}
    </Page>
  );
}
