import { Page } from '../../shared/ui/Page';
import { PersonRow } from './PersonRow';
import { usePeople } from './usePeople';

/**
 * El panel del productor. No está en la navegación de abajo a propósito: el cuidador no entra
 * aquí, y el backend tampoco se lo permitiría.
 */
export function PeoplePage() {
  const { people, error, busy, temporary, dismissTemporary, resetPassword, toggleActive } = usePeople();

  return (
    <Page title="Personas" backTo="/ajustes">
      {error && <p className="notice danger" role="alert">{error}</p>}

      {temporary && (
        <section className="panel" aria-live="polite">
          <h2>Clave temporal de {temporary.name}</h2>
          <p className="notice warn">
            Dícte­sela ahora: <strong className="number">{temporary.password}</strong>. No vuelve a aparecer, y
            tendrá que cambiarla apenas entre.
          </p>
          <button className="button secondary" onClick={dismissTemporary}>Ya la anoté</button>
        </section>
      )}

      {people?.length === 0 && <p className="muted">Todavía no hay nadie más registrado.</p>}
      {people && people.length > 0 && (
        <ul className="list">
          {people.map((person) => (
            <PersonRow
              key={person.id}
              person={person}
              busy={busy}
              onResetPassword={() => void resetPassword(person)}
              onToggleActive={() => void toggleActive(person)}
            />
          ))}
        </ul>
      )}
    </Page>
  );
}
