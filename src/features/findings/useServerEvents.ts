import { useEffect, useRef, useState } from 'react';
import { listen, type ServerEvent } from '../../shared/http/eventStream';

interface Options {
  pondId?: string;
  batchId?: string;
  /** Si no, no se abre ninguna conexión. Lo usan las pantallas sin IA configurada. */
  enabled?: boolean;
}

/**
 * Deja la pantalla escuchando al servidor mientras está montada.
 *
 * Devuelve el último evento y si la conexión está en pie. El último y no la lista: lo que las
 * pantallas hacen con un evento es volver a preguntar lo que cambió, y guardar una cola de eventos
 * solo daría una segunda fuente de verdad con la cual contradecir a la base de datos.
 *
 * El callback vive en una referencia a propósito. Si estuviera en las dependencias del efecto, cada
 * render de la pantalla cerraría la conexión y abriría otra, y en el plan gratuito de Render abrir
 * una conexión no es gratis.
 */
export function useServerEvents({ pondId, batchId, enabled = true }: Options) {
  const [event, setEvent] = useState<ServerEvent>();
  const [connected, setConnected] = useState(false);
  const latest = useRef<(e: ServerEvent) => void>(setEvent);
  latest.current = setEvent;

  useEffect(() => {
    if (!enabled) {
      setConnected(false);
      return;
    }
    const stream = listen({
      pondId,
      batchId,
      onEvent: (e) => latest.current(e),
      onConnected: setConnected,
    });
    return () => stream.close();
  }, [pondId, batchId, enabled]);

  return { event, connected };
}
