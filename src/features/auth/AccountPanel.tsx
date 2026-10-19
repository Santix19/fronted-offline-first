import { useState } from 'react';
import { facade } from '../../facade/PisciculturaFacade';
import { useLiveQuery } from '../../shared/db/useLiveQuery';
import { useAuthState } from './authStatus';

/**
 * Who is signed in on this phone, and the way out. Signing out warns first when something is
 * still waiting for signal: those rows stay on the phone, but nobody can upload them until
 * someone signs in again, and that is worth saying out loud before it happens.
 */
export function AccountPanel() {
  const auth = useAuthState();
  const counts = useLiveQuery(() => facade.pendingCounts(), ['ponds', 'batches', 'records', 'actions']);
  const [confirming, setConfirming] = useState(false);
  if (auth.status !== 'signed_in') return null;
  const pending = counts?.pending ?? 0;

  return (
    <section className="panel">
      <h2>Tu cuenta</h2>
      <p>
        <strong>{auth.user.name}</strong>
        <br />
        <span className="muted">Documento {auth.user.document} · {auth.user.role}</span>
      </p>
      {confirming && pending > 0 && (
        <p className="notice warn">
          Quedan {pending} registros por subir. Si cierras sesión siguen guardados, pero nadie podrá subirlos
          hasta que alguien vuelva a entrar.
        </p>
      )}
      {auth.user.role === 'productor' && !confirming && (
        <p>
          <a className="button secondary" href="#/personas">Administrar personas</a>
        </p>
      )}
      {confirming ? (
        <div className="button-row">
          <button className="button danger" onClick={() => void facade.signOut()}>Sí, cerrar sesión</button>
          <button className="button secondary" onClick={() => setConfirming(false)}>Seguir aquí</button>
        </div>
      ) : (
        <button className="button secondary" onClick={() => setConfirming(true)}>Cerrar sesión</button>
      )}
    </section>
  );
}
