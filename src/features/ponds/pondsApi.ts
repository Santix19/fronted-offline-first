import { apiRequest } from '../../shared/http/httpClient';
import type { RecordSource, WaterReading } from '../records/recordTypes';
import type { Pond, PondType } from './pondTypes';

/**
 * Pond as the backend writes it in JSON (/api/estanques and inside /api/sync).
 * The JSON keeps the Spanish names of the contract; the rest of the app uses the English Pond type.
 */
export interface PondJson {
  id: string;
  nombre: string;
  tipo: PondType;
  volumen_m3: number | null;
  activo: boolean;
  actualizado_en: string;
}

export function fromPondJson(json: PondJson): Pond {
  return {
    id: json.id,
    name: json.nombre,
    type: json.tipo,
    volumeM3: json.volumen_m3 ?? undefined,
    active: json.activo,
    updatedAt: json.actualizado_en,
    syncState: 'synced',
  };
}

export function toPondJson(pond: Pond): PondJson {
  return {
    id: pond.id,
    nombre: pond.name,
    tipo: pond.type,
    volumen_m3: pond.volumeM3 ?? null,
    activo: pond.active,
    actualizado_en: pond.updatedAt,
  };
}

interface ReadingJson {
  id: string;
  estanque_id: string;
  temp_c: number | null;
  ph: number | null;
  oxigeno_mg_l: number | null;
  origen: RecordSource;
  registrado_en: string;
}

/**
 * GET /api/estanques/{id}/lecturas. Brings the readings the ESP32 sensor sent straight to the
 * backend, so the caretaker also sees them on the phone (they are kept as already-synced records).
 */
export async function fetchRecentReadings(pondId: string, limit = 20): Promise<WaterReading[]> {
  const rows = await apiRequest<ReadingJson[]>('GET', `/api/estanques/${pondId}/lecturas`, { query: { limite: limit } });
  return rows.map((r) => ({
    id: r.id,
    type: 'water_reading',
    pondId: r.estanque_id,
    tempC: r.temp_c ?? undefined,
    ph: r.ph ?? undefined,
    oxygenMgL: r.oxigeno_mg_l ?? undefined,
    source: r.origen,
    recordedAt: r.registrado_en,
    syncState: 'synced',
  }));
}
