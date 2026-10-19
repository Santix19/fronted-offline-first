import { useEffect, useState, type FormEvent } from 'react';
import { facade } from '../../facade/PisciculturaFacade';
import { type ApiConfig } from '../../shared/http/apiConfig';
import { DEVICE_ID_PATTERN } from '../../shared/utils/ids';
import { Field } from '../../shared/ui/Field';
import { Page } from '../../shared/ui/Page';
import { AccountPanel } from '../auth/AccountPanel';
import { ConnectionTest } from './ConnectionTest';
import { StorageInfo } from './StorageInfo';

/** Which backend this phone talks to, its key, and the name the backend knows the phone by. */
export function SettingsPage() {
  const [config, setConfig] = useState<ApiConfig>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    facade.config().then(setConfig);
  }, []);
  if (!config) return <Page title="Ajustes">{null}</Page>;

  const set = (key: keyof ApiConfig) => (value: string) => {
    setSaved(false);
    setConfig({ ...config, [key]: value });
  };

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!config) return;
    const found: Record<string, string> = {};
    if (!/^https?:\/\/\S+$/.test(config.apiUrl.trim())) found.apiUrl = 'Debe empezar por http:// o https://';
    if (!DEVICE_ID_PATTERN.test(config.deviceId)) found.deviceId = 'Solo letras, números, punto, guion y guion bajo';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const previous = await facade.config();
    await facade.saveConfig(config);
    // Another server has other data: download everything from it
    if (previous.apiUrl !== config.apiUrl.trim().replace(/\/+$/, '')) await facade.resetPullCursor();
    setSaved(true);
    void facade.sync();
  }

  return (
    <Page title="Ajustes">
      <AccountPanel />
      <form className="form" onSubmit={submit} noValidate>
        <Field label="Dirección del servidor" type="url" value={config.apiUrl} onChange={set('apiUrl')} error={errors.apiUrl} hint="Por ejemplo https://lacocha-backend.onrender.com" />
        <Field label="Clave del servidor" type="password" value={config.apiKey} onChange={set('apiKey')} hint="La misma API_KEY configurada en el backend" autoComplete="off" />
        <Field label="Nombre de este celular" value={config.deviceId} onChange={set('deviceId')} error={errors.deviceId} hint="Así aparece en el servidor. Ejemplo: cel-cuidador-1" />
        {saved && <p className="notice ok" role="status">Ajustes guardados.</p>}
        <button className="button block" type="submit">Guardar ajustes</button>
      </form>
      <ConnectionTest />
      <StorageInfo />
    </Page>
  );
}
