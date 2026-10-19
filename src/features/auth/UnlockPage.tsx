import { useState, type FormEvent } from 'react';
import { facade } from '../../facade/PisciculturaFacade';
import { AuthScreen } from './AuthScreen';
import { MAX_UNLOCK_TRIES, type User } from './authTypes';
import { PinField } from './PinField';

interface UnlockPageProps {
  user: User;
  failedUnlocks: number;
}

/**
 * The everyday screen: the caretaker opens the app at the pond and types the PIN. Nothing here
 * talks to the backend, so it works exactly the same with no signal at all.
 */
export function UnlockPage({ user, failedUnlocks }: UnlockPageProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string>();
  const left = MAX_UNLOCK_TRIES - failedUnlocks;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pin.length < 4) return setError('El PIN es de 4 dígitos');
    setPin('');
    if (!(await facade.unlock(pin))) {
      setError(left > 1 ? `PIN incorrecto. Te quedan ${left - 1} intentos.` : 'PIN incorrecto.');
    }
  }

  return (
    <AuthScreen
      title={`Hola, ${user.name}`}
      subtitle="Escribe tu PIN para abrir la app."
      footer={
        <p className="muted">
          ¿Olvidaste el PIN?{' '}
          <button className="link" type="button" onClick={() => void facade.signOut()}>
            Entrar con tu clave
          </button>{' '}
          (necesita señal).
        </p>
      }
    >
      <form className="form" onSubmit={submit} noValidate>
        {error && <p className="notice danger" role="alert">{error}</p>}
        {failedUnlocks > 0 && !error && (
          <p className="notice warn">Hubo {failedUnlocks} intento(s) fallido(s) antes.</p>
        )}
        <PinField label="PIN" value={pin} onChange={setPin} />
        <button className="button block" type="submit" disabled={pin.length < 4}>
          Abrir
        </button>
      </form>
    </AuthScreen>
  );
}
