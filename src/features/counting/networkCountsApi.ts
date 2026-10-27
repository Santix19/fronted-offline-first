import { apiRequest } from '../../shared/http/httpClient';

/** Un conteo tal como lo escribe el backend (GET /api/lotes/{id}/conteos). */
interface FryCountJson {
  id: string;
  lote_id: string;
  total: number | null;
  cortes_multiples: number | null;
  origen: string;
  dispositivo_id: string;
  registrado_en: string;
}

export interface ServerCount {
  id: string;
  total: number;
  multipleCuts?: number;
  /** 'contador' cuando lo midió la máquina, 'manual' cuando lo escribió alguien. */
  source: string;
  deviceId: string;
  recordedAt: string;
}

/**
 * Los conteos que el servidor tiene de este lote, lo más nuevo primero.
 *
 * La pantalla los pide cuando el stream avisa que llegó algo. Se piden y no se reciben por el
 * stream a propósito: así hay un solo lugar calculando el total, y el número que lee el cuidador es
 * el que está en la base de datos y no una cuenta paralela del navegador.
 */
export async function fetchServerCounts(batchId: string, limit = 20): Promise<ServerCount[]> {
  const json = await apiRequest<FryCountJson[]>('GET', `/api/lotes/${batchId}/conteos`, {
    query: { limite: limit },
  });
  return json.map((c) => ({
    id: c.id,
    total: c.total ?? 0,
    multipleCuts: c.cortes_multiples ?? undefined,
    source: c.origen,
    deviceId: c.dispositivo_id,
    recordedAt: c.registrado_en,
  }));
}
