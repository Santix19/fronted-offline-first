import { useState, type FormEvent } from 'react';
import { facade } from '../../facade/PisciculturaFacade';
import { errorMessage } from '../../shared/http/ApiError';
import { Field } from '../../shared/ui/Field';
import { AuthScreen } from './AuthScreen';
import { onlyErrors, passwordError, type AuthErrors } from './authValidation';
import type { User } from './authTypes';

/**
 * Lo primero que ve quien entró con la clave que le dio el productor. No hay forma de saltarla:
 * una clave que un tercero conoce no puede quedarse puesta.
 */
export function ChangePasswordPage({ user }: { user: User }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [errors, setErrors] = useState<AuthErrors>({});
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const found = onlyErrors({ current: passwordError(current), next: passwordError(next) });
    if (!found.next && next === current) found.next = 'La clave nueva tiene que ser distinta';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    try {
      await facade.changePassword(current, next);
    } catch (error) {
      setErrors({ form: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthScreen
      title={`Hola, ${user.name}`}
      subtitle="Tu clave es temporal: el productor te la dio. Elige una tuya para seguir."
    >
      <form className="form" onSubmit={submit} noValidate>
        {errors.form && <p className="notice danger" role="alert">{errors.form}</p>}
        <Field label="Clave que te dieron" type="password" autoComplete="current-password"
          value={current} onChange={setCurrent} error={errors.current} />
        <Field label="Tu clave nueva" type="password" autoComplete="new-password"
          value={next} onChange={setNext} error={errors.next} hint="Mínimo 8 caracteres" />
        <button className="button block" type="submit" disabled={busy}>
          {busy ? 'Guardando…' : 'Guardar mi clave'}
        </button>
      </form>
    </AuthScreen>
  );
}
