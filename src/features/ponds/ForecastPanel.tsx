import { useEffect, useState } from 'react';
import { facade } from '../../facade/PisciculturaFacade';
import { errorMessage } from '../../shared/http/ApiError';
import { useOnline } from '../../shared/ui/useOnline';
import { formatDate, formatNumber } from '../../shared/utils/format';
import type { WaterForecast } from './forecastApi';
import { TONE_TEXT, toneOf } from './waterRanges';

/** "Mañana", "Pasado mañana" o la fecha, contando desde hoy en este celular. */
function dayName(isoDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((new Date(`${isoDate}T00:00:00`).getTime() - today.getTime()) / 86_400_000);
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Mañana';
  if (days === 2) return 'Pasado mañana';
  return formatDate(isoDate);
}

/**
 * Cómo va a estar la temperatura del agua los próximos días, según el modelo de IA.
 *
 * Se pide al abrir el estanque y no se guarda: un pronóstico de ayer se ve actual y no lo es. Sin
 * señal no aparece, y si el servicio falla dice que no se pudo, en vez de quedar en blanco.
 */
export function ForecastPanel({ pondId }: { pondId: string }) {
  const online = useOnline();
  const [forecast, setForecast] = useState<WaterForecast>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!online) return;
    let active = true;
    setForecast(undefined);
    setError(undefined);
    facade
      .waterForecast(pondId, 2)
      .then((f) => active && setForecast(f))
      .catch((e) => active && setError(errorMessage(e)));
    return () => {
      active = false;
    };
  }, [pondId, online]);

  if (!online) return null;

  return (
    <section className="panel forecast">
      <header className="panel-head">
        <h2>🌡️ Temperatura del agua (pronóstico IA)</h2>
      </header>

      {error ? (
        <p className="muted">No se pudo calcular el pronóstico: {error}</p>
      ) : !forecast ? (
        <p className="muted">Calculando… (si el servicio estaba dormido puede tardar un minuto)</p>
      ) : forecast.days.length === 0 ? (
        <p className="muted">{forecast.message ?? 'Todavía no hay suficientes lecturas para pronosticar.'}</p>
      ) : (
        <>
          <dl className="facts">
            {forecast.days.map((day) => (
              <div key={day.date}>
                <dt>
                  {dayName(day.date)} · {TONE_TEXT[toneOf('tempC', day.meanC)]}
                </dt>
                <dd>
                  {formatNumber(day.lowC)}–{formatNumber(day.highC)}
                  <span className="unit">°C</span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="muted panel-note">
            Calculado con {forecast.readingsUsed} lecturas de este estanque y el pronóstico del clima de El Encano
            {forecast.typicalErrorC !== undefined && ` · margen típico ±${formatNumber(forecast.typicalErrorC)} °C`}
            {forecast.reactionHours !== undefined &&
              ` · el agua sigue al aire con unas ${formatNumber(forecast.reactionHours, 0)} h de retraso`}
          </p>
        </>
      )}
    </section>
  );
}
