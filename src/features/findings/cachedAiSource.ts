import type { AiSource } from './aiSource';
import type { BatchProjection, Finding } from './findingTypes';

/**
 * Proxy: controla el acceso al análisis para no preguntar dos veces lo mismo.
 *
 * Se pone entre las pantallas y el `AiSource` de verdad, y responde con lo que ya sabe cuando eso
 * es honesto. Quien pregunta no distingue la diferencia: es el mismo `AiSource`.
 *
 * ## Por qué hace falta aquí, si el backend ya tiene uno
 *
 * Porque el problema es otro. El Proxy del backend existe porque el servicio de IA duerme en
 * Render y despertarlo cuesta un minuto. Este existe porque **del otro lado hay un celular en la
 * laguna**: cada llamada que se evita es latencia que el cuidador no espera y megabytes que no
 * paga. El Proxy del servidor no ahorra ni uno de los dos, porque la petición igual tiene que
 * salir del teléfono y cruzar la red.
 *
 * Y se nota en las dos preguntas que más se repiten:
 *
 * - `available()` lo pregunta `useFindings` cada vez que se monta, y `FindingsPanel` está en la
 *   pantalla de alertas **y** en la del lote. Ir de una a la otra y volver son tres llamadas para
 *   una respuesta que no cambió.
 * - `projection()` se pide cada vez que se abre un lote. Entrar, salir y volver a entrar son dos
 *   llamadas idénticas.
 *
 * ## Qué no se guarda, y es a propósito
 *
 * **Las listas de hallazgos.** Llegan hallazgos nuevos por el stream mientras la pantalla está
 * abierta, así que una lista guardada envejece sola y sin avisar. Además `useFindings` ya las
 * tiene en el estado de React mientras la pantalla vive, que es justo lo que una caché daría.
 *
 * **Lo que falló.** Guardar un error convertiría un minuto malo en dos.
 *
 * **Nada cuando no hay señal.** Podría servirse lo guardado y sería tentador, pero este proyecto
 * no muestra algo viejo como si fuera de ahora: el resumen del lote, que sí se guarda, se muestra
 * siempre con su antigüedad al lado. Mientras eso no exista para la proyección, el panel
 * simplemente no aparece sin señal, que es la verdad.
 */

/**
 * Cuánto se cree una respuesta de salud.
 *
 * Corto para que un servicio que volvió se note enseguida, largo para que moverse entre dos
 * pantallas no vuelva a preguntar.
 */
export const SALUD_VIVE_MS = 30_000;

/**
 * Cuánto se cree una proyección.
 *
 * Responde "cuánto va a pesar y cuándo vendo", que se mueve en semanas: dos minutos de desfase no
 * cambian nada que alguien vaya a hacer. Y de todos modos, lo que de verdad la cambia —registrar
 * una mortalidad o una biometría— pasa por una sincronización, y eso la borra al instante.
 */
export const PROYECCION_VIVE_MS = 120_000;

interface Guardado<T> {
  valor: T;
  hasta: number;
}

interface Opciones {
  saludViveMs?: number;
  proyeccionViveMs?: number;
  /** El reloj. Se inyecta para que las pruebas no tengan que esperar dos minutos de verdad. */
  ahora?: () => number;
}

/**
 * Envuelve un `AiSource` y responde por él cuando ya sabe la respuesta.
 *
 * `forget()` es la otra mitad del diseño: la caché no adivina cuándo quedó vieja, se lo dicen. La
 * fachada la llama al terminar cada sincronización, que es el único momento en que los datos del
 * lote cambian de verdad. El vencimiento por tiempo es solo la red de seguridad.
 */
export function cachedAiSource(real: AiSource, opciones: Opciones = {}): AiSource {
  const saludVive = opciones.saludViveMs ?? SALUD_VIVE_MS;
  const proyeccionVive = opciones.proyeccionViveMs ?? PROYECCION_VIVE_MS;
  const ahora = opciones.ahora ?? Date.now;

  let salud: Guardado<boolean> | undefined;
  const proyecciones = new Map<string, Guardado<BatchProjection>>();

  const vigente = <T>(g: Guardado<T> | undefined): g is Guardado<T> =>
    g !== undefined && ahora() < g.hasta;

  return {
    async available(): Promise<boolean> {
      if (vigente(salud)) return salud.valor;
      const respuesta = await real.available();
      salud = { valor: respuesta, hasta: ahora() + saludVive };
      return respuesta;
    },

    async projection(batchId: string): Promise<BatchProjection> {
      const guardada = proyecciones.get(batchId);
      if (vigente(guardada)) return guardada.valor;

      // Si falla, el error sube tal cual y no se guarda nada: la pantalla tiene que poder
      // distinguir "no se pudo" de "no hay nada que mostrar"
      const respuesta = await real.projection(batchId);
      proyecciones.set(batchId, { valor: respuesta, hasta: ahora() + proyeccionVive });
      return respuesta;
    },

    /**
     * Atender un hallazgo cambia lo que el servidor sabe del lote, así que se olvida lo guardado.
     *
     * Hoy la proyección no incluye los hallazgos, de modo que estrictamente no haría falta. Se
     * hace igual porque la regla sencilla —escribir invalida— es la que no se rompe cuando alguien
     * agregue un campo el mes entrante.
     */
    async attend(id: string, deviceId: string): Promise<Finding> {
      const atendido = await real.attend(id, deviceId);
      proyecciones.clear();
      return atendido;
    },

    // Las listas pasan derecho: ver el encabezado
    pendingFindings: () => real.pendingFindings(),
    pondFindings: (pondId) => real.pondFindings(pondId),
    batchFindings: (batchId) => real.batchFindings(batchId),

    forget(batchId?: string): void {
      salud = undefined;
      if (batchId === undefined) {
        proyecciones.clear();
      } else {
        proyecciones.delete(batchId);
      }
      real.forget(batchId);
    },
  };
}
