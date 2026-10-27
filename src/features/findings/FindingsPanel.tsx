import { FindingItem } from './FindingItem';
import { useFindings } from './useFindings';

interface FindingsPanelProps {
  pondId?: string;
  batchId?: string;
  /** Para la lista general, que mezcla estanques. */
  placeOf?: (finding: { pondId?: string; batchId?: string }) => string | undefined;
}

/**
 * Lo que encontró la IA, aparte de las alertas de umbral.
 *
 * Están separadas en la pantalla a propósito, y el texto del encabezado lo dice. Una alerta sale de
 * cruzar un umbral: es un hecho que el cuidador verifica bajando el sensor otra vez. Un hallazgo
 * sale de un modelo mirando la historia del estanque: es una sospecha que vale la pena confirmar.
 * Mostrarlos revueltos haría dudar de las alertas y confiar de más en los hallazgos.
 *
 * Si no hay servicio de IA, o no hay señal, la sección no aparece. Un panel vacío se lee como
 * "revisé y está todo bien", y eso es justo lo que no se sabe.
 */
export function FindingsPanel({ pondId, batchId, placeOf }: FindingsPanelProps) {
  const { available, findings, error, loading, connected, attend } = useFindings({ pondId, batchId });

  if (available !== true) return null;

  return (
    <section className="panel findings">
      <header className="panel-head">
        <h2>Lo que vio la IA</h2>
        {connected && (
          <span className="chip live" title="Conectado al servidor: los hallazgos nuevos llegan solos">
            En vivo
          </span>
        )}
      </header>
      <p className="muted panel-note">
        Sospechas del análisis, no umbrales cruzados. Vale confirmarlas antes de actuar.
      </p>

      {error && <p className="notice warn">{error}</p>}
      {loading && findings.length === 0 && <p className="muted">Consultando…</p>}

      {!loading && findings.length === 0 && !error && (
        <p className="muted">Sin hallazgos pendientes.</p>
      )}

      {findings.length > 0 && (
        <ul className="list">
          {findings.map((finding) => (
            <FindingItem
              key={finding.id}
              finding={finding}
              onAttend={attend}
              place={placeOf?.(finding)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
