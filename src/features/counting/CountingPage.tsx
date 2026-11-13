import { useState } from 'react';
import { facade } from '../../facade/PisciculturaFacade';
import { useLiveQuery } from '../../shared/db/useLiveQuery';
import { ClockNotice } from '../../shared/ui/ClockNotice';
import { LoadingState } from '../../shared/ui/LoadingState';
import { deviceDateError } from '../../shared/utils/dates';
import { errorMessage } from '../../shared/http/ApiError';
import { Page } from '../../shared/ui/Page';
import { CountingControls } from './CountingControls';
import { SavedNotice } from '../records/SavedNotice';
import { clearSensorLog } from '../sensors/sensorLog';
import { CountingTotals } from './CountingTotals';
import { NetworkCounts } from './NetworkCounts';
import { useCountingSession } from './useCountingSession';

/**
 * Counting a batch with the counter plugged into the phone. The total is saved on every frame, so
 * the screen can be left (or the battery can die) without losing the fish already counted: coming
 * back resumes the same count.
 */
export function CountingPage({ batchId }: { batchId: string }) {
  const batch = useLiveQuery(() => facade.batch(batchId), ['batches'], [batchId]);
  const count = useCountingSession(batchId);
  const [problem, setProblem] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(0);
  const empty = (count.totals?.total ?? 0) === 0;
  const back = `/lotes/${batchId}`;

  async function closeCount() {
    const clock = deviceDateError(new Date());
    if (clock) { setProblem(clock); return; }
    if (busy || !count.totals) return;
    setBusy(true); setProblem(undefined);
    try {
      await count.finish();
      setSaved((n) => n + 1);
      clearSensorLog();
    } catch (error) { setProblem(errorMessage(error)); }
    finally { setBusy(false); }
  }

  return (
    <Page title="Conteo de alevinos" backTo={back} wide>
      <p className="muted">{batch ? `Lote ${batch.code}` : ''}</p>
      {saved > 0 && <SavedNotice count={saved} backHref={`#${back}`} />}

      <ClockNotice />
      {problem && <p className="notice danger" role="alert">{problem}</p>}
      <div className="counting-layout">
      <div className="counting-main">
      {!count.totals && <LoadingState label="Recuperando el conteo…" />}
      <CountingTotals totals={count.totals} sensor={count.sensor} warning={count.warning} problem={count.problem} expected={batch?.initialQuantity} />

      {/* Lo que el ESP32 sube solo por WiFi. Aparte del número de arriba, que es lo que cuenta
          este celular por el cable: ver el comentario de NetworkCounts. */}
      <NetworkCounts batchId={batchId} />

      </div>
      <div className="counting-tools">
      <CountingControls count={count} />

      <section className="section">
        <button className="button block" onClick={() => void closeCount()} disabled={empty || busy || !count.totals}>
          Guardar el conteo
        </button>
        {!empty && (
          <button className="button danger block" onClick={() => { if (window.confirm('¿Descartar el conteo en curso? Los alevinos contados se perderán.')) void count.cancel(); }}>
            Descartar este conteo
          </button>
        )}
      </section>
      </div>
      </div>
    </Page>
  );
}
