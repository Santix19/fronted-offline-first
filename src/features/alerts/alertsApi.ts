import { apiRequest } from '../../shared/http/httpClient';
import type { Alert, AlertLevel } from './alertTypes';

/** Alert as the backend writes it (/api/alertas and alertas_pendientes in the pull). */
export interface AlertJson {
  id: string;
  estanque_id: string;
  variable: string;
  valor: number | null;
  nivel: AlertLevel;
  mensaje: string;
  medido_en: string;
}

export function fromAlertJson(json: AlertJson): Alert {
  return {
    id: json.id,
    pondId: json.estanque_id,
    variable: json.variable,
    value: json.valor ?? undefined,
    level: json.nivel,
    message: json.mensaje,
    measuredAt: json.medido_en,
  };
}

/** POST /api/alertas/{id}/atender */
export async function attendAlertOnServer(alertId: string): Promise<void> {
  await apiRequest('POST', `/api/alertas/${alertId}/atender`);
}
