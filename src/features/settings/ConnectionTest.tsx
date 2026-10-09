import { useState } from 'react';
import { errorMessage } from '../../shared/http/ApiError';
import { checkHealth } from '../sync/syncApi';

/** GET /salud: tells whether the server is up. On Render's free plan the first try can take a minute. */
export function ConnectionTest() {
  const [state, setState] = useState<{ tone: string; text: string }>();

  async function test() {
    setState({ tone: '', text: 'Probando… si el servidor estaba dormido puede tardar hasta un minuto.' });
    try {
      const health = await checkHealth();
      setState({ tone: 'ok', text: `El servidor responde${health.version ? ` (versión ${health.version})` : ''}.` });
    } catch (error) {
      setState({ tone: 'danger', text: errorMessage(error) });
    }
  }

  return (
    <section className="panel">
      <h2>Conexión</h2>
      <button className="button secondary" onClick={test}>Probar conexión</button>
      {state && <p className={`notice ${state.tone}`} role="status">{state.text}</p>}
    </section>
  );
}
