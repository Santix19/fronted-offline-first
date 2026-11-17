import { useEffect, useState, type FormEvent } from 'react';
import { facade } from '../../facade/PisciculturaFacade';
import { Choices } from '../../shared/ui/Choices';
import { Field } from '../../shared/ui/Field';
import { Page } from '../../shared/ui/Page';
import { navigate } from '../../shared/ui/router';
import { parseOptionalNumber } from '../../shared/utils/numbers';
import { POND_TYPE_LABELS, type Pond, type PondType } from './pondTypes';

/** Create a pond, or edit one when an id is given. Works without signal. */
export function PondFormPage({ pondId }: { pondId?: string }) {
  const [existing, setExisting] = useState<Pond>();
  const [name, setName] = useState('');
  const [type, setType] = useState<PondType>('estanque');
  const [volume, setVolume] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!pondId) return;
    facade.pond(pondId).then((pond) => {
      if (!pond) return;
      setExisting(pond);
      setName(pond.name);
      setType(pond.type);
      setVolume(pond.volumeM3?.toString() ?? '');
    });
  }, [pondId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
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
  }

  return (
    <Page title={existing ? `Editar ${existing.name}` : 'Nuevo estanque'} backTo="/">
      {existing?.syncError && <p className="notice danger">El servidor lo rechazó: {existing.syncError}</p>}
      <form className="form" onSubmit={submit} noValidate>
        <Field label="Nombre" value={name} onChange={setName} error={errors.name} hint="Como lo llaman en la finca, por ejemplo Tanque 1" />
        <Choices label="Tipo" name="type" value={type} options={POND_TYPE_LABELS} onChange={setType} />
        <Field label="Volumen (m³)" type="number" value={volume} onChange={setVolume} error={errors.volume} hint="Opcional. Sirve para calcular la densidad" />
        <button className="button block" type="submit">{existing ? 'Guardar cambios' : 'Guardar estanque'}</button>
      </form>
    </Page>
  );
}
