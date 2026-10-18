import { useState } from 'react';
import { facade } from '../../facade/PisciculturaFacade';
import { useLiveQuery } from '../../shared/db/useLiveQuery';
import { Field } from '../../shared/ui/Field';
import { Page } from '../../shared/ui/Page';
import { parseOptionalNumber } from '../../shared/utils/numbers';
import { SavedNotice } from '../records/SavedNotice';
import { clearSensorLog } from '../sensors/sensorLog';
import { CountingTotals } from './CountingTotals';
import { FrameLog } from './FrameLog';
import { useCountingSession } from './useCountingSession';

/**
 * Counting a batch with the counter plugged into the phone. The total is saved on every frame, so
 * the screen can be left (or the battery can die) without losing the fish already counted: coming
 * back resumes the same count.
 */
export function CountingPage({ batchId }: { batchId: string }) {
  const batch = useLiveQuery(() => facade.batch(batchId), ['batches'], [batchId]);
  const count = useCountingSession(batchId);
  const [typed, setTyped] = useState('');
  const [saved, setSaved] = useState(0);
  const sources = facade.sensors();
  const empty = (count.totals?.total ?? 0) === 0;
  const back = `/lotes/${batchId}`;

  async function applyCorrection() {
    const value = parseOptionalNumber(typed);
    if (value === undefined || Number.isNaN(value) || value < 0) return;
    await count.correct(value);
    setTyped('');
  }

  async function closeCount() {
    await count.finish();
    setSaved((n) => n + 1);
    clearSensorLog();
  }

  return (
    <Page title="Conteo de alevinos" backTo={back}>
      <p className="muted">{batch ? `Lote ${batch.code}` : ''}</p>
      {saved > 0 && <SavedNotice count={saved} backHref={`#${back}`} />}

      <CountingTotals totals={count.totals} sensor={count.sensor} warning={count.warning} problem={count.problem} />

      <section className="section">
        <h2>Contador</h2>
        {count.connected ? (
          <button className="button secondary block" onClick={() => void count.disconnect()}>
            Desconectar el contador
          </button>
        ) : (
          <div className="button-row">
            {sources.map((source) => (
              <button key={source.kind} className="button" onClick={() => void count.connect(source.kind)}>
                Conectar {source.label.toLowerCase()}
              </button>
            ))}
          </div>
        )}
        {sources.every((source) => !source.needsPort) && (
          <p className="muted">Este navegador no puede abrir el puerto USB. Para usar el Arduino abre la app en Chrome.</p>
        )}
      </section>

      <section className="section">
        <h2>Corregir a mano</h2>
        <p className="muted">Úsalo si un alevín se saltó la barrera o si el contador se disparó.</p>
        <Field
          label="Total correcto"
          type="number"
          value={typed}
          onChange={setTyped}
          hint="Reemplaza el total de arriba; los cortes múltiples no cambian"
        />
        <button className="button secondary block" onClick={() => void applyCorrection()} disabled={typed.trim() === ''}>
          Aplicar corrección
        </button>
      </section>

      <FrameLog log={count.log} />

      <section className="section">
        <button className="button block" onClick={() => void closeCount()} disabled={empty}>
          Guardar el conteo
        </button>
        <button className="button danger block" onClick={() => void count.cancel()} disabled={empty}>
          Descartar este conteo
        </button>
      </section>
    </Page>
  );
}
