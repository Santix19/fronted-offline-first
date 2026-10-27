import { useCallback, useEffect, useState } from 'react';
import { facade } from '../../facade/PisciculturaFacade';
import { useOnline } from '../../shared/ui/useOnline';
import { formatNumber, timeAgo } from '../../shared/utils/format';
import { useServerEvents } from '../findings/useServerEvents';
import type { ServerCount } from './networkCountsApi';

/**
 * Lo que el contador subió solo, por WiFi, mientras esta pantalla está abierta.
 *
 * Es la cosa que antes no se podía hacer. El contador por cable solo funciona en Chrome de
 * escritorio, porque Web Serial no existe en Android; y se midió que una página servida por HTTPS
 * tampoco puede hablarle a un aparato de la red local por ws:// sin cifrar, así que el ESP32 no
 * puede montar su propio WiFi para que el celular se le conecte. El camino que sí funciona es el
 * que está aquí: el ESP32 le habla al servidor, el servidor tiene certificado, y el servidor le
 * cuenta al navegador.
 *
 * ## Dos números, y no uno
 *
 * El número grande de arriba es lo que contó *este celular* por el cable. Este panel es lo que
 * tiene *el servidor*, que incluye lo que subió el ESP32 y lo que subieron otros celulares.
 * Sumarlos en un solo número sería lo cómodo y estaría mal: si el mismo paso de alevinos se midió
 * por los dos lados, el total quedaría al doble, y nadie podría notarlo mirando la pantalla.
 * Separados, la comparación entre los dos es justo lo que la tesis mide.
 */
export function NetworkCounts({ batchId }: { batchId: string }) {
  const online = useOnline();
  const [counts, setCounts] = useState<ServerCount[]>();

  const load = useCallback(() => {
    facade
      .serverCounts(batchId)
      .then(setCounts)
      // Sin servidor este panel simplemente no aparece: el conteo por cable sigue andando igual
      .catch(() => setCounts(undefined));
  }, [batchId]);

  const { event, connected } = useServerEvents({ batchId, enabled: online });

  useEffect(() => {
    if (online) load();
  }, [online, load]);

  // El stream avisa que llegó algo y la pantalla va y pregunta el total. No lo trae el evento:
  // así solo hay un lugar calculando el número que el cuidador lee.
  useEffect(() => {
    if (event?.tipo === 'sincronizado') load();
  }, [event, load]);

  if (!online || !counts) return null;

  const fromCounter = counts.filter((c) => c.source === 'contador');
  const total = fromCounter.reduce((sum, c) => sum + c.total, 0);

  return (
    <section className="panel network-counts" aria-live="polite">
      <header className="panel-head">
        <h2>Lo que subió el contador</h2>
        {connected ? (
          <span className="chip live" title="Conectado al servidor: las tandas nuevas llegan solas">
            En vivo
          </span>
        ) : (
          <span className="chip" title="Sin conexión al servidor: se verá al sincronizar">
            Sin conexión
          </span>
        )}
      </header>

      {fromCounter.length === 0 ? (
        <p className="muted">
          El contador todavía no ha subido ninguna tanda a este lote.
        </p>
      ) : (
        <>
          <div className="count-total secondary">
            <strong className="number">{formatNumber(total, 0)}</strong>
            <span>
              en {fromCounter.length} {fromCounter.length === 1 ? 'tanda' : 'tandas'} · última{' '}
              {timeAgo(fromCounter[0].recordedAt)}
            </span>
          </div>
          <p className="muted panel-note">
            Aparte de lo que cuenta este celular por el cable: si el mismo paso se midió por los dos
            lados, sumarlos daría el doble.
          </p>
        </>
      )}
    </section>
  );
}
