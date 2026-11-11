import {
  aiAvailable,
  attendFindingOnServer,
  fetchBatchFindings,
  fetchBatchProjection,
  fetchPendingFindings,
  fetchPondFindings,
} from './findingsApi';
import type { BatchProjection, Finding } from './findingTypes';

/**
 * Todo lo que la app necesita del análisis, y nada más.
 *
 * Existe para que haya una **interfaz común**: arriba de esto, la fachada y las pantallas piden lo
 * que necesitan sin saber si la respuesta vino del servidor o de lo que ya se sabía. Es lo que
 * permite poner un Proxy en el medio (`cachedAiSource`) sin tocar una línea de quien pregunta.
 */
export interface AiSource {
  /** Si hay servicio de IA respondiendo. */
  available(): Promise<boolean>;
  pendingFindings(): Promise<Finding[]>;
  pondFindings(pondId: string): Promise<Finding[]>;
  batchFindings(batchId: string): Promise<Finding[]>;
  /** Hacia dónde va el lote. */
  projection(batchId: string): Promise<BatchProjection>;
  /** Marca un hallazgo como visto. */
  attend(id: string, deviceId: string): Promise<Finding>;
  /**
   * Olvida lo que se sepa de un lote, o de todo si no se nombra ninguno.
   *
   * Está en la interfaz y no solo en el Proxy a propósito: quien sincroniza avisa que los datos
   * cambiaron sin tener que saber si hay algo guardando respuestas. Para el sujeto real es no
   * hacer nada, que es exactamente lo correcto.
   */
  forget(batchId?: string): void;
}

/** El sujeto real: cada pregunta es una llamada al backend. */
export function httpAiSource(): AiSource {
  return {
    available: () => aiAvailable(),
    pendingFindings: () => fetchPendingFindings(),
    pondFindings: (pondId) => fetchPondFindings(pondId),
    batchFindings: (batchId) => fetchBatchFindings(batchId),
    projection: (batchId) => fetchBatchProjection(batchId),
    attend: (id, deviceId) => attendFindingOnServer(id, deviceId),
    forget: () => undefined,
  };
}
