import { getMeta, setMeta } from '../db/repository';
import { newDeviceId } from '../utils/ids';

/** Where the backend is and who this phone is. Editable from the Settings screen. */
export interface ApiConfig {
  apiUrl: string;
  apiKey: string;
  deviceId: string;
}

const KEY = 'apiConfig';

const defaults = (): ApiConfig => ({
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  apiKey: import.meta.env.VITE_API_KEY ?? '',
  deviceId: newDeviceId(),
});

let cached: ApiConfig | null = null;

export async function getApiConfig(): Promise<ApiConfig> {
  if (cached) return cached;
  const saved = await getMeta<ApiConfig>(KEY);
  cached = saved ?? defaults();
  // The device id is created once and kept forever: the backend uses it to tell phones apart
  if (!saved) await setMeta(KEY, cached);
  return cached;
}

export async function saveApiConfig(config: ApiConfig): Promise<void> {
  cached = { ...config, apiUrl: config.apiUrl.trim().replace(/\/+$/, '') };
  await setMeta(KEY, cached);
}
