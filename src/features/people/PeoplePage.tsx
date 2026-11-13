import { LoadingState } from '../../shared/ui/LoadingState';
import { Page } from '../../shared/ui/Page';
import { PersonRow } from './PersonRow';
import { usePeople } from './usePeople';
import { EmptyState } from '../../shared/ui/EmptyState';
import { useOnline } from '../../shared/ui/useOnline';

/**
 * El panel del productor. No está en la navegación de abajo a propósito: el cuidador no entra
 * aquí, y el backend tampoco se lo permitiría.
 */
export function PeoplePage() {
  const online = useOnline();
  const { people, error, busy, temporary, dismissTemporary, resetPassword, toggleActive } = usePeople();

  return (
    <Page title="Personas" backTo="/ajustes" layout="cards">
      {!online && <p className="notice warn">Administrar personas necesita señal. Los registros de la finca siguen disponibles en el celular.</p>}
      {online && !people && !error && <LoadingState label="Cargando personas…" />}
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

      {people?.length === 0 && <EmptyState title="Todavía no hay nadie más registrado." hint="Las personas aparecen aquí cuando crean su cuenta con señal." />}
      {people && people.length > 0 && (
        <ul className="list">
          {people.map((person) => (
            <PersonRow
              key={person.id}
              person={person}
              busy={busy || !online}
              onResetPassword={() => void resetPassword(person)}
              onToggleActive={() => void toggleActive(person)}
            />
          ))}
        </ul>
      )}
    </Page>
  );
}
