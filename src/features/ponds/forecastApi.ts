import { apiRequest } from '../../shared/http/httpClient';

/** Un día del pronóstico de la temperatura del agua. */
export interface ForecastDay {
  /** "2026-11-21" */
  date: string;
  lowC: number;
  highC: number;
  meanC: number;
}

/**
 * Pronóstico de la temperatura del agua de un estanque.
 *
 * `days` viene vacío cuando el estanque todavía tiene muy pocas lecturas; entonces `message` dice
 * cuántas faltan.
 */
export interface WaterForecast {
  days: ForecastDay[];
  /** Cuánto se equivoca el modelo en promedio, en °C. */
  typicalErrorC?: number;
  /** Cuántas horas tarda el agua en seguir un cambio del aire. */
  reactionHours?: number;
  readingsUsed: number;
  message?: string;
}

interface ForecastJson {
  dias: { fecha: string; minima: number; maxima: number; promedio: number }[];
  error_tipico: number | null;
  reaccion_horas: number | null;
  lecturas_usadas: number;
  mensaje: string | null;
}

/**
 * La IA puede estar dormida en Render (un minuto en despertar) y el backend la espera hasta 90 s,
 * así que aquí se espera un poco más que eso.
 */
const FORECAST_TIMEOUT_MS = 100_000;

/** GET /api/estanques/{id}/pronostico-temperatura */
export async function fetchWaterForecast(pondId: string, days = 2): Promise<WaterForecast> {
  const json = await apiRequest<ForecastJson>('GET', `/api/estanques/${pondId}/pronostico-temperatura`, {
    query: { dias: days },
    timeoutMs: FORECAST_TIMEOUT_MS,
  });
  return {
    days: json.dias.map((d) => ({ date: d.fecha, lowC: d.minima, highC: d.maxima, meanC: d.promedio })),
    typicalErrorC: json.error_tipico ?? undefined,
    reactionHours: json.reaccion_horas ?? undefined,
    readingsUsed: json.lecturas_usadas,
    message: json.mensaje ?? undefined,
  };
}
