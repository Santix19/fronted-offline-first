import { useCallback, useEffect, useState } from 'react';
import { facade } from '../../facade/PisciculturaFacade';
import { errorMessage } from '../../shared/http/ApiError';
import { useOnline } from '../../shared/ui/useOnline';
import type { Finding } from './findingTypes';
import { useServerEvents } from './useServerEvents';

interface Options {
  pondId?: string;
  batchId?: string;
}

/**
 * Los hallazgos de la IA, y los nuevos a medida que aparecen.
 *
 * No se guardan en la base del celular, al contrario de las alertas, y vale decir por qué: un
 * hallazgo nace de la historia completa del estanque, que vive en el servidor. Guardar una copia en
 * el celular daría una lista que envejece sin que nadie la pueda recalcular, y el cuidador vería
 * una sospecha de la semana pasada presentada como de hoy. Sin señal la sección no aparece, que es
 * la verdad: la IA no alcanza al estanque, y el registro y las alertas de umbral sí.
 */
export function useFindings({ pondId, batchId }: Options = {}) {
  const online = useOnline();
  const [available, setAvailable] = useState<boolean>();
  const [findings, setFindings] = useState<Finding[]>([]);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = pondId
        ? await facade.pondFindings(pondId)
        : batchId
          ? await facade.batchFindings(batchId)
          : await facade.pendingFindings();
      setFindings(list);
      setError(undefined);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [pondId, batchId]);

  useEffect(() => {
    if (!online) {
      setAvailable(undefined);
      return;
    }
    let active = true;
    facade
      .aiAvailable()
      .then((yes) => {
        if (!active) return;
        setAvailable(yes);
        if (yes) load();
      })
      .catch(() => active && setAvailable(false));
    return () => {
      active = false;
    };
  }, [online, load]);

  // Un hallazgo llega entero por el stream, así que entra directo sin volver a preguntar. Es el
  // único evento del que se usa el contenido: es chico y su texto se guardó tal cual se mandó, de
  // modo que no hay una segunda fuente con la cual discrepar.
  const { event, connected } = useServerEvents({ pondId, batchId, enabled: online && available === true });
  useEffect(() => {
    if (event?.tipo !== 'hallazgo' || !event.hallazgo) return;
    const incoming = facade.readFinding(event.hallazgo);
    setFindings((current) => (current.some((f) => f.id === incoming.id) ? current : [incoming, ...current]));
  }, [event]);

  const attend = useCallback(async (id: string) => {
    // Se quita de la lista de una vez: el cuidador acaba de decir que lo vio, y esperar la
    // respuesta del servidor para que desaparezca lo hace sentir trabado
    setFindings((current) => current.filter((f) => f.id !== id));
    try {
      await facade.attendFinding(id);
    } catch (e) {
      setError(errorMessage(e));
      load();
    }
  }, [load]);

  return { available, findings, error, loading, connected, attend, reload: load };
}
