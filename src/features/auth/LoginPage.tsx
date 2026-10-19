import { useState, type FormEvent } from 'react';
import { facade } from '../../facade/PisciculturaFacade';
import { errorMessage } from '../../shared/http/ApiError';
import { Field } from '../../shared/ui/Field';
import { useOnline } from '../../shared/ui/useOnline';
import { AuthScreen } from './AuthScreen';
import { documentError, onlyErrors, passwordError, pinError, type AuthErrors } from './authValidation';
import { PinField } from './PinField';

/** Signing in needs signal: it is the one moment the phone has to talk to the backend. */
export function LoginPage({ onRegister }: { onRegister: () => void }) {
  const online = useOnline();
  const [document, setDocument] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [errors, setErrors] = useState<AuthErrors>({});
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const found = onlyErrors({
      document: documentError(document),
      password: passwordError(password),
      pin: pinError(pin),
    });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    try {
      await facade.signIn({ document: document.trim(), password }, pin);
    } catch (error) {
      setErrors({ form: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthScreen
      title="Entrar"
      subtitle="Usa tu número de documento y tu clave."
      footer={
        <p className="muted">
          ¿Primera vez?{' '}
          <button className="link" type="button" onClick={onRegister}>
            Crear una cuenta
          </button>
        </p>
      }
    >
      <form className="form" onSubmit={submit} noValidate>
        {!online && <p className="notice warn">Para entrar por primera vez necesitas señal. Después la app abre con tu PIN.</p>}
        {errors.form && <p className="notice danger" role="alert">{errors.form}</p>}
        <Field label="Número de documento" type="text" inputMode="numeric" autoComplete="username"
          value={document} onChange={setDocument} error={errors.document} />
        <Field label="Clave" type="password" autoComplete="current-password"
          value={password} onChange={setPassword} error={errors.password} />
        <PinField label="PIN para abrir sin señal" value={pin} onChange={setPin} error={errors.pin}
          hint="4 dígitos. Con este PIN abres la app en la laguna." />
        <button className="button block" type="submit" disabled={busy || !online}>
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </AuthScreen>
  );
}
