import { useState, type FormEvent } from 'react';
import { facade } from '../../facade/PisciculturaFacade';
import { errorMessage } from '../../shared/http/ApiError';
import { Field } from '../../shared/ui/Field';
import { useOnline } from '../../shared/ui/useOnline';
import { AuthScreen } from './AuthScreen';
import { documentError, nameError, onlyErrors, passwordError, pinError, type AuthErrors } from './authValidation';
import { PinField } from './PinField';

/** Creating the account leaves the session already open: one less form to fill in. */
export function RegisterPage({ onLogin }: { onLogin: () => void }) {
  const online = useOnline();
  const [values, setValues] = useState({ document: '', name: '', password: '', pin: '' });
  const [errors, setErrors] = useState<AuthErrors>({});
  const [busy, setBusy] = useState(false);
  const set = (key: keyof typeof values) => (value: string) => setValues((v) => ({ ...v, [key]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    const found = onlyErrors({
      document: documentError(values.document),
      name: nameError(values.name),
      password: passwordError(values.password),
      pin: pinError(values.pin),
    });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    try {
      await facade.signUp(
        { document: values.document.trim(), name: values.name.trim(), password: values.password },
        values.pin,
      );
    } catch (error) {
      setErrors({ form: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthScreen
      title="Crear cuenta"
      subtitle="Con tu documento y una clave queda lista."
      footer={
        <p className="muted">
          ¿Ya tienes cuenta?{' '}
          <button className="link" type="button" onClick={onLogin}>
            Entrar
          </button>
        </p>
      }
    >
      <form className="form" onSubmit={submit} noValidate>
        {!online && <p className="notice warn">Crear la cuenta necesita señal. Inténtalo cuando vuelva la conexión.</p>}
        {errors.form && <p className="notice danger" role="alert">{errors.form}</p>}
        <Field label="Número de documento" type="text" inputMode="numeric" autoComplete="username"
          value={values.document} onChange={set('document')} error={errors.document}
          hint="El mismo con el que te conocen en la finca" />
        <Field label="Nombre" value={values.name} onChange={set('name')} error={errors.name}
          autoComplete="name" hint="Como quieres que aparezca, por ejemplo Don Luis" />
        <Field label="Clave" type="password" autoComplete="new-password"
          value={values.password} onChange={set('password')} error={errors.password}
          hint="Mínimo 8 caracteres" />
        <PinField label="PIN para abrir sin señal" value={values.pin} onChange={set('pin')} error={errors.pin}
          hint="4 dígitos. No lo olvides: sin él hay que entrar de nuevo con señal." />
        <button className="button block" type="submit" disabled={busy || !online}>
          {busy ? 'Creando…' : 'Crear cuenta'}
        </button>
      </form>
    </AuthScreen>
  );
}
