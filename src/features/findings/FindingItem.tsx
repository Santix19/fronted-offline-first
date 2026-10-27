import { timeAgo } from '../../shared/utils/format';
import { FINDING_LABELS, type Finding } from './findingTypes';

interface FindingItemProps {
  finding: Finding;
  onAttend: (id: string) => void;
  /** En la lista general, donde se mezclan los hallazgos de todos los estanques. */
  place?: string;
}

/** Cómo se pinta cada nivel. 'informe' va neutro: no es un problema, es algo que vale saber. */
const CHIP: Record<Finding['level'], { className: string; label: string }> = {
  informe: { className: 'chip', label: 'Para saber' },
  advertencia: { className: 'chip warn', label: 'Advertencia' },
  critica: { className: 'chip danger', label: 'Crítica' },
};

/**
 * Un hallazgo, con el botón para marcarlo visto.
 *
 * Marcarlo visto no es cosmético: mientras está pendiente, silencia sus propias repeticiones, así
 * que el sensor midiendo cada pocos segundos no llena la pantalla con la misma tendencia. Una vez
 * atendido, si el problema vuelve, el aviso nuevo pasa.
 */
export function FindingItem({ finding, onAttend, place }: FindingItemProps) {
  const chip = CHIP[finding.level];
  return (
    <li className="row finding-row">
      <div className="row-main">
        <p className="row-title">{finding.message}</p>
        <p className="muted">
          {FINDING_LABELS[finding.kind]}
          {place && ` · ${place}`}
          {' · '}
          {timeAgo(finding.measuredAt ?? finding.createdAt)}
        </p>
      </div>
      <span className={chip.className}>{chip.label}</span>
      <button
        className="button secondary"
        onClick={() => onAttend(finding.id)}
        aria-label={`Marcar como visto: ${finding.message}`}
      >
        Visto
      </button>
    </li>
  );
}
