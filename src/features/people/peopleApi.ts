import { apiRequest } from '../../shared/http/httpClient';
import { fromUserJson } from '../auth/authApi';
import type { Role, User } from '../auth/authTypes';

/** Las personas de la finca, como las administra el productor. Todo esto necesita señal. */
interface UserJson {
  id: string;
  documento: string;
  nombre: string;
  rol: string;
  activo: boolean;
  debe_cambiar_clave?: boolean;
}

/** El usuario más lo que solo le interesa al productor. */
export interface Person extends User {
  active: boolean;
}

const toPerson = (json: UserJson): Person => ({ ...fromUserJson(json), active: json.activo });

export async function fetchPeople(): Promise<Person[]> {
  const list = await apiRequest<UserJson[]>('GET', '/api/usuarios');
  return list.map(toPerson);
}

export async function updatePerson(id: string, change: { role?: Role; active?: boolean }): Promise<Person> {
  const json = await apiRequest<UserJson>('PATCH', `/api/usuarios/${id}`, {
    body: { rol: change.role, activo: change.active },
  });
  return toPerson(json);
}

/**
 * Pide una clave temporal para quien olvidó la suya. Vuelve una sola vez, en esta respuesta:
 * el productor se la dicta y el cuidador la cambia al entrar.
 */
export async function resetPassword(id: string): Promise<string> {
  const json = await apiRequest<{ clave_temporal: string }>('POST', `/api/usuarios/${id}/clave-temporal`);
  return json.clave_temporal;
}
