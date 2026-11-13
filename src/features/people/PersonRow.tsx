import { ROLE_LABELS } from '../auth/authTypes';
import type { Person } from './peopleApi';

interface PersonRowProps {
  person: Person;
  busy: boolean;
  onResetPassword: () => void;
  onToggleActive: () => void;
}

/** Una persona de la finca y lo que el productor puede hacerle. */
export function PersonRow({ person, busy, onResetPassword, onToggleActive }: PersonRowProps) {
  return (
    // Who on top with the state beside it, the two actions on their own line: on a phone the
    // three side by side broke the name word by word
    <li className="row person-row">
      <div className="row-main">
        <p className="row-title">{person.name}</p>
        <p className="muted">
          Documento {person.document}<br />{ROLE_LABELS[person.role]}
          {person.mustChangePassword && ' · clave temporal sin cambiar'}
        </p>
      </div>
      <span className={`chip ${person.active ? 'ok' : 'neutral'}`}>{person.active ? 'Activo' : 'De baja'}</span>
      <div className="person-actions">
        <button className="button secondary" onClick={onResetPassword} disabled={busy}>
          Reiniciar clave
        </button>
        <button className={`button ${person.active ? 'danger' : 'secondary'}`} onClick={onToggleActive} disabled={busy}>
          {person.active ? 'Dar de baja' : 'Reactivar'}
        </button>
      </div>
    </li>
  );
}
