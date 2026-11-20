import { useEffect, useMemo, useRef, useState } from 'react';
import { facade } from '../../facade/PisciculturaFacade';
import { useLiveQuery } from '../../shared/db/useLiveQuery';
import { Choices } from '../../shared/ui/Choices';
import { Page } from '../../shared/ui/Page';
import { useOnline } from '../../shared/ui/useOnline';
import type { Batch } from '../batches/batchTypes';
import type { Pond } from '../ponds/pondTypes';
import type { ServerHistory } from './historyApi';
import {
  PERIOD_LABELS,
  alertsInScope,
  buildReport,
  buildTimeline,
  formatTime,
  groupByDay,
  mergeById,
  plural,
  periodStart,
  recordsInScope,
  toCsv,
  toShareText,
  type AlertEntry,
  type Names,
  type Period,
  type Report,
  type Stat,
} from './report';

/** Cuántos registros se dibujan de entrada. El reporte y el CSV usan todos, siempre. */
const PAGE = 150;

type ServerState = { status: 'idle' | 'loading' } | { status: 'done'; data: ServerHistory } | { status: 'error' };

async function loadLocal() {
  const [ponds, batches, records, alerts] = await Promise.all([
    facade.ponds(),
    facade.batches(),
    facade.localHistory(),
    facade.alerts(),
  ]);
  const localAlerts: AlertEntry[] = alerts.map((a) => ({
    id: a.id,
    pondId: a.pondId,
    level: a.level,
    message: a.message,
    measuredAt: a.measuredAt,
    attended: a.attendPending ?? false,
  }));
  return { ponds, batches, records, alerts: localAlerts };
}

function namesOf(ponds: Pond[], batches: Batch[]): Names {
  return {
    ponds: new Map(ponds.map((p) => [p.id, p.name])),
    batches: new Map(batches.map((b) => [b.id, { label: `Lote ${b.code}`, pondId: b.pondId }])),
  };
}

const n = (value: number | undefined, decimals = 1) =>
  value === undefined ? '—' : new Intl.NumberFormat('es-CO', { maximumFractionDigits: decimals }).format(value);

function StatLine({ label, s, unit }: { label: string; s: Stat; unit: string }) {
  if (s.count === 0) return null;
  return (
    <p className="muted">
      {label}: <b>{n(s.avg)}{unit}</b> (de {n(s.min)} a {n(s.max)})
    </p>
  );
}

function ReportTiles({ report }: { report: Report }) {
  const w = report.water;
  return (
    <div className="report-grid">
      <div className="report-tile">
        <p className="report-label">💧 Agua</p>
        <p className="report-value">{w.readings} <span>{w.readings === 1 ? 'lectura' : 'lecturas'}</span></p>
        <StatLine label="Temperatura" s={w.temp} unit=" °C" />
        <StatLine label="pH" s={w.ph} unit="" />
        <StatLine label="Oxígeno" s={w.oxygen} unit=" mg/L" />
        {w.readings > 0 && (
          <p className={w.outOfOptimal ? 'report-flag warn' : 'report-flag ok'}>
            {w.outOfOptimal === 0 ? 'Todas en rango' : `${w.outOfOptimal} fuera del óptimo${w.critical ? `, ${w.critical} críticas` : ''}`}
          </p>
        )}
      </div>
      <div className="report-tile">
        <p className="report-label">🍽️ Alimento</p>
        <p className="report-value">{n(report.feeding.kg, 2)} <span>kg</span></p>
        <p className="muted">{plural(report.feeding.times, 'entrega', 'entregas')}</p>
      </div>
      <div className="report-tile">
        <p className="report-label">☠️ Mortalidad</p>
        <p className="report-value">{n(report.mortality.fish, 0)} <span>{report.mortality.fish === 1 ? 'pez' : 'peces'}</span></p>
        {report.mortality.byCause.slice(0, 3).map(([cause, fish]) => (
          <p key={cause} className="muted">{cause}: {n(fish, 0)}</p>
        ))}
      </div>
      <div className="report-tile">
        <p className="report-label">🔔 Alertas</p>
        <p className="report-value">{report.alerts.total}</p>
        <p className="muted">
          {report.alerts.critical} críticas · {report.alerts.pending} sin atender
        </p>
      </div>
      {report.weights.length > 0 && (
        <div className="report-tile">
          <p className="report-label">⚖️ Peso promedio</p>
          {report.weights.map((wgt) => (
            <p key={wgt.batch} className="muted"><b>{wgt.batch}</b>: {n(wgt.avgWeightG)} g</p>
          ))}
        </div>
      )}
      {report.counts.times > 0 && (
        <div className="report-tile">
          <p className="report-label">🔢 Conteos</p>
          <p className="report-value">{n(report.counts.fish, 0)} <span>alevinos</span></p>
          <p className="muted">{plural(report.counts.times, 'conteo', 'conteos')}</p>
        </div>
      )}
    </div>
  );
}

/** Descarga un archivo hecho en el celular, sin pasar por el servidor. Funciona sin señal. */
function downloadFile(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Historial y reportes: qué pasó en la finca, cuándo y dónde, y el resumen para entregarlo.
 *
 * Sin señal muestra lo que hay en el celular; con señal lo completa con lo del servidor (lo de
 * otros celulares, el sensor y el contador). Siempre dice cuál de las dos cosas está mostrando.
 */
export function HistoryPage() {
  const online = useOnline();
  const [period, setPeriod] = useState<Period>('7d');
  const [pondId, setPondId] = useState('');
  const [server, setServer] = useState<ServerState>({ status: 'idle' });
  const [shown, setShown] = useState(PAGE);
  const [notice, setNotice] = useState<string>();
  const local = useLiveQuery(loadLocal, ['ponds', 'batches', 'records', 'alerts']);

  // El catálogo más reciente, sin que cada registro nuevo vuelva a pedir todo al servidor
  const catalog = useRef<{ ponds: Pond[]; batches: Batch[] }>(undefined);
  if (local) catalog.current = { ponds: local.ponds, batches: local.batches };
  const ready = local !== undefined;

  const from = useMemo(() => periodStart(period, new Date()), [period]);

  // El papel no tiene «Mostrar más»: al imprimir va todo el historial del periodo
  useEffect(() => {
    const all = () => setShown(Number.POSITIVE_INFINITY);
    window.addEventListener('beforeprint', all);
    return () => window.removeEventListener('beforeprint', all);
  }, []);

  useEffect(() => {
    setShown(PAGE);
    if (!online || !ready || !catalog.current) {
      setServer({ status: 'idle' });
      return;
    }
    let cancelled = false;
    setServer({ status: 'loading' });
    facade
      .serverHistory(catalog.current.ponds, catalog.current.batches, from, pondId || undefined)
      .then((data) => !cancelled && setServer({ status: 'done', data }))
      .catch(() => !cancelled && setServer({ status: 'error' }));
    return () => {
      cancelled = true;
    };
  }, [online, ready, from, pondId]);

  const view = useMemo(() => {
    if (!local) return undefined;
    const names = namesOf(local.ponds, local.batches);
    const fromServer = server.status === 'done' ? server.data : { records: [], alerts: [] };
    const scope = { from, pondId: pondId || undefined };
    const records = recordsInScope(mergeById(fromServer.records, local.records), scope, names);
    const alerts = alertsInScope(mergeById(fromServer.alerts, local.alerts), scope);
    const timeline = buildTimeline(records, alerts, names);
    return { names, report: buildReport(records, alerts, names), timeline };
  }, [local, server, from, pondId]);

  const placeName = pondId ? local?.ponds.find((p) => p.id === pondId)?.name ?? 'Estanque' : 'Toda la finca';
  const title = `Reporte La Cocha · ${placeName} · ${PERIOD_LABELS[period]}`;
  const generated = new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota', dateStyle: 'long', timeStyle: 'short' }).format(new Date());

  async function share() {
    if (!view) return;
    const text = `${toShareText(view.report, title)}\n\nGenerado el ${generated}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setNotice('Resumen copiado. Pégalo en WhatsApp o donde lo necesites.');
    } catch (e) {
      // Cerrar el menú de compartir no es un error
      if (e instanceof DOMException && e.name === 'AbortError') return;
      setNotice('No se pudo compartir desde este navegador. Usa «Descargar para Excel» o «Imprimir».');
    }
  }

  function downloadCsv() {
    if (!view) return;
    const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date());
    downloadFile(`lacocha-historial-${PERIOD_LABELS[period].replace(/\s/g, '')}-${day}.csv`, toCsv(view.timeline), 'text/csv;charset=utf-8');
  }

  const groups = view ? groupByDay(view.timeline.slice(0, shown), new Date()) : [];

  return (
    <Page title="Historial y reportes" backTo="/">
      <section className="section history">
        <div className="history-filters no-print">
          <Choices label="Periodo" name="periodo" value={period} options={PERIOD_LABELS} onChange={setPeriod} />
          <div className="field">
            <label htmlFor="historial-estanque">Estanque</label>
            <select id="historial-estanque" value={pondId} onChange={(e) => setPondId(e.target.value)}>
              <option value="">Toda la finca</option>
              {local?.ponds.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        <div className="print-only print-head">
          <p><b>{title}</b></p>
          <p className="muted">Generado el {generated}</p>
        </div>

        <p className={`no-print ${!online || server.status === 'error' ? 'notice warn' : 'notice'}`}>
          {!online
            ? 'Sin señal: se muestra lo que está guardado en este celular. Con señal se completa con lo de los demás celulares, el sensor y el contador.'
            : server.status === 'loading'
              ? 'Trayendo el historial del servidor…'
              : server.status === 'error'
                ? 'No se pudo traer el historial del servidor: se muestra lo que hay en este celular.'
                : server.status === 'done' && server.data.partial
                  ? 'Incluye lo del servidor, pero una parte no respondió: puede faltar algo. Vuelve a intentarlo en un momento.'
                  : 'Incluye lo de todos los celulares, el sensor y el contador, más lo de este celular que falta subir.'}
        </p>

        {view && (
          <>
            <h2>Resumen</h2>
            <ReportTiles report={view.report} />
            {view.report.pendingUpload > 0 && (
              <p className="notice warn">
                {plural(view.report.pendingUpload, 'registro', 'registros')} de este periodo todavía no{' '}
                {view.report.pendingUpload === 1 ? 'se ha' : 'se han'} subido al servidor.
              </p>
            )}

            <div className="button-row no-print">
              <button type="button" className="button" onClick={downloadCsv} disabled={view.timeline.length === 0}>
                📥 Descargar para Excel
              </button>
              <button type="button" className="button secondary" onClick={() => window.print()}>
                🖨️ Imprimir o guardar PDF
              </button>
              <button type="button" className="button secondary" onClick={() => void share()}>
                📤 Compartir resumen
              </button>
            </div>
            {notice && <p className="notice ok no-print">{notice}</p>}

            <h2>Lo que pasó</h2>
            {view.timeline.length === 0 && (
              <p className="muted">No hay registros ni alertas en este periodo. Prueba con un periodo más largo.</p>
            )}
            {groups.map((group) => (
              <div key={group.day} className="history-day">
                <h3>{group.day}</h3>
                <ul className="list">
                  {group.entries.map((e) => (
                    <li key={e.id} className={`history-entry tone-${e.tone}`}>
                      <span className="history-time">{formatTime(e.at)}</span>
                      <div className="row-main">
                        <p className="row-title">
                          {e.title} <span className="muted">· {e.place}</span>
                        </p>
                        <p>{e.detail}</p>
                      </div>
                      {e.pending && <span className="chip warn">Por subir</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {view.timeline.length > shown && (
              <button type="button" className="button secondary block no-print" onClick={() => setShown((s) => s + PAGE)}>
                Mostrar más ({view.timeline.length - shown} restantes)
              </button>
            )}
          </>
        )}
      </section>
    </Page>
  );
}
