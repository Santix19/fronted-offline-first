import { useEffect, useState } from 'react';
import { facade } from '../../facade/PisciculturaFacade';
import { errorMessage } from '../../shared/http/ApiError';
import { useOnline } from '../../shared/ui/useOnline';
import { formatDate, formatNumber } from '../../shared/utils/format';
import type { BatchProjection } from './findingTypes';

/**
 * Hacia dónde va el lote: cuánto va a pesar, cuándo llega al peso de venta, cuántos van a quedar.
 *
 * Se pide al abrir la pantalla y no se guarda. Una proyección guardada del mes pasado, hecha con
 * los datos del mes pasado, es peor que ninguna: se ve actual y no lo es.
 */
export function ProjectionPanel({ batchId }: { batchId: string }) {
  const online = useOnline();
  const [projection, setProjection] = useState<BatchProjection>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!online) return;
    let active = true;
    facade
      .batchProjection(batchId)
      .then((p) => active && setProjection(p))
      .catch((e) => active && setError(errorMessage(e)));
    return () => {
      active = false;
    };
  }, [batchId, online]);

  // Sin señal o sin servicio no se muestra nada: el registro y las alertas de umbral siguen
  // funcionando, y una proyección en blanco se lee como un lote del que no se sabe nada
  if (!online || error || !projection) return null;

  const { tgc, tgcFitted, meanTempC, currentWeightG, projectedWeightG, daysAhead } = projection;

  return (
    <section className="panel projection">
      <header className="panel-head">
        <h2>Hacia dónde va</h2>
      </header>

      {projectedWeightG !== undefined && currentWeightG !== undefined ? (
        <dl className="facts">
          <div>
            <dt>Peso hoy</dt>
            <dd>{formatNumber(currentWeightG)} g</dd>
          </div>
          <div>
            <dt>En {daysAhead} días</dt>
            <dd>{formatNumber(projectedWeightG)} g</dd>
          </div>
          {projection.daysToTarget !== undefined && (
            <div>
              <dt>Llega a 250 g</dt>
              <dd>
                {projection.daysToTarget === 0 ? 'ya' : `en ${projection.daysToTarget} días`}
                {projection.targetDate && (
                  <span className="muted"> · {formatDate(projection.targetDate)}</span>
                )}
              </dd>
            </div>
          )}
        </dl>
      ) : (
        <p className="muted">Todavía no se puede proyectar el peso.</p>
      )}

      {projection.survivalPct !== undefined && (
        <dl className="facts">
          <div>
            <dt>Supervivencia</dt>
            <dd>{formatNumber(projection.survivalPct)}%</dd>
          </div>
          {projection.currentQuantity !== undefined && (
            <div>
              <dt>Quedan</dt>
              <dd>{formatNumber(projection.currentQuantity, 0)}</dd>
            </div>
          )}
        </dl>
      )}

      {/*
        Dicho donde se ve, y no escondido en una ayuda: la supervivencia sale de las mortalidades
        registradas, y un alevino que muere y se descompone nunca se registra. La medición de verdad
        es el contador, comparando lo que entrega al cosechar contra lo que se sembró.
      */}
      {projection.survivalPct !== undefined && (
        <p className="muted panel-note">
          La supervivencia es un techo: lo que no se alcanzó a registrar no está contado.
        </p>
      )}

      {tgc !== undefined && (
        <p className="muted panel-note">
          {tgcFitted
            ? `Calculado con el crecimiento de esta finca (coeficiente ${formatNumber(tgc, 2)})`
            : `Con el coeficiente de referencia (${formatNumber(tgc, 2)}), no el de esta finca todavía: con una segunda biometría se ajusta`}
          {meanTempC !== undefined && ` · agua a ${formatNumber(meanTempC)} °C`}
        </p>
      )}

      {/* Lo que no se pudo calcular y qué falta registrar para poder. Es la parte que evita que un
          campo vacío se lea como un cero. */}
      {projection.notes.length > 0 && (
        <ul className="notes">
          {projection.notes.map((note) => (
            <li key={note} className="muted">
              {note}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
