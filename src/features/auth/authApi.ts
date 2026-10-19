import { apiRequest } from '../../shared/http/httpClient';
import type { User } from './authTypes';

/** The JSON of /api/auth, in Spanish like the rest of the backend. */
interface UserJson {
  id: string;
  documento: string;
  nombre: string;
  rol: string;
}

interface SessionJson {
  token: string;
  expira_en: string;
  usuario: UserJson;
}

export interface OpenedSession {
  token: string;
  expiresAt: string;
  user: User;
}

const fromUserJson = (json: UserJson): User => ({
  id: json.id,
  document: json.documento,
  name: json.nombre,
  role: json.rol === 'productor' ? 'productor' : 'cuidador',
});

const fromSessionJson = (json: SessionJson): OpenedSession => ({
  token: json.token,
  expiresAt: json.expira_en,
  user: fromUserJson(json.usuario),
});

export interface Credentials {
  document: string;
  password: string;
  name?: string;
}

export async function registerOnServer(data: Required<Credentials>, deviceId: string): Promise<OpenedSession> {
  const json = await apiRequest<SessionJson>('POST', '/api/auth/registro', {
    body: { documento: data.document, nombre: data.name, clave: data.password, dispositivo_id: deviceId },
    // The phone has no session yet, so this call travels with the device key only
    anonymous: true,
  });
  return fromSessionJson(json);
}

export async function loginOnServer(data: Credentials, deviceId: string): Promise<OpenedSession> {
  const json = await apiRequest<SessionJson>('POST', '/api/auth/sesion', {
    body: { documento: data.document, clave: data.password, dispositivo_id: deviceId },
    anonymous: true,
  });
  return fromSessionJson(json);
}

/** Closes the session on the server so a lost phone's token stops working. */
export function logoutOnServer(): Promise<void> {
  return apiRequest('DELETE', '/api/auth/sesion');
}
