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
