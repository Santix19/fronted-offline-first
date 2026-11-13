import { useState } from 'react';
import { facade } from '../../facade/PisciculturaFacade';
import { Field } from '../../shared/ui/Field';
import { parseOptionalNumber } from '../../shared/utils/numbers';
import { FrameLog } from './FrameLog';
import type { useCountingSession } from './useCountingSession';

export function CountingControls({ count }: { count: ReturnType<typeof useCountingSession> }) {
  const [typed, setTyped] = useState('');
  const sources = facade.sensors();
  const empty = (count.totals?.total ?? 0) === 0;
  async function applyCorrection() {
    const value = parseOptionalNumber(typed);
    if (value === undefined || !Number.isInteger(value) || value < 0) return;
    await count.correct(value);
    setTyped('');
  }
  return <>
    <section className="section">
      <h2>Contador</h2>
      {count.connected ? (
        <button className="button secondary block" onClick={() => void count.disconnect()}>Desconectar el contador</button>
      ) : (
        <div className="button-row">
          {sources.map((source, i) => <button key={source.kind} className={empty && i === 0 ? 'button' : 'button secondary'} disabled={!count.totals} onClick={() => void count.connect(source.kind)}>Conectar {source.label.toLowerCase()}</button>)}
        </div>
      )}
      {sources.every((s) => !s.needsPort) && <p className="muted">En este navegador puedes probar con el simulador. El cable USB requiere Chrome o Edge en un computador.</p>}
    </section>
    <details className="fold">
      <summary>Corregir a mano</summary>
      <p className="muted">Úsalo si un alevín se saltó la barrera o si el contador se disparó.</p>
      <Field label="Total correcto" type="number" big value={typed} onChange={setTyped} hint="Reemplaza el total de arriba; los pasos ambiguos no cambian" />
      <button className="button secondary block" onClick={() => void applyCorrection()} disabled={typed.trim() === '' || !Number.isInteger(parseOptionalNumber(typed)) || Number(typed) < 0}>Aplicar corrección</button>
    </details>
    <FrameLog log={count.log} />
  </>;
}
