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
