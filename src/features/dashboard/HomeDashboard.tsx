import { useRef } from 'react';
import { facade } from '../../facade/PisciculturaFacade';
import { useStagger } from '../../shared/motion/useStagger';
import { useLiveQuery } from '../../shared/db/useLiveQuery';
import { Sparkline } from '../../shared/ui/Sparkline';
import { formatNumber } from '../../shared/utils/format';
import { buildDashboard } from './dashboardMath';
import { Icon } from '../../shared/ui/icons';
import { KpiTile } from './KpiTile';

async function load() {
  const [ponds, batches, records, alerts, pending] = await Promise.all([
    facade.ponds(),
    facade.batches(),
    facade.records(undefined, 300),
    facade.alerts(),
    facade.pendingCounts(),
  ]);
  const active = batches.filter((b) => b.status === 'activo');
  return {
    ...buildDashboard({ ponds, batches, records, alerts: alerts.length, ...pending, now: Date.now() }),
    // Feeding is the record made several times a day: one tap with one batch, a short list with more
    feedHref: active.length === 1 ? `#/registrar/feeding?lote=${active[0].id}` : active.length > 1 ? '#/lotes?registrar=feeding' : undefined,
  };
}

/** The dashboard's own shape while the phone's database answers, so nothing jumps when it arrives. */
function DashboardSkeleton() {
  return (
    <section className="dashboard" aria-label="Resumen" aria-busy="true">
      <div className="kpi-grid">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="kpi skeleton">
            <span className="skeleton-bar tall" />
            <span className="skeleton-bar" />
          </div>
        ))}
      </div>
      <div className="panel trend skeleton">
        <span className="skeleton-bar" />
        <span className="skeleton-bar chart" />
      </div>
    </section>
  );
}

/** The first thing on the home screen: what needs you, then how the water has been. */
export function HomeDashboard() {
  const data = useLiveQuery(load, ['ponds', 'batches', 'records', 'alerts']);
  const tiles = useRef<HTMLDivElement>(null);
  useStagger(tiles, [data !== undefined]);
  if (!data) return <DashboardSkeleton />;

  return (
    <section className="dashboard" aria-label="Resumen">
      {data.feedHref && (
        <a className="button block quick-action" href={data.feedHref}>Registrar alimentación <span><Icon name="arrow" /></span></a>
      )}
      <div className="kpi-grid" ref={tiles}>
        <KpiTile kind="batches" label="Lotes activos" value={data.activeBatches} href="#/lotes" />
        <KpiTile kind="alerts" label="Alertas" value={data.alerts} href="#/alertas" tone={data.alerts > 0 ? 'danger' : undefined} />
        <KpiTile kind="ponds" label="Estanques activos" value={data.activePonds} href="#/" />
        <KpiTile kind="pending" label="Por subir" value={data.waiting} href="#/sincronizacion" tone={data.waiting > 0 ? 'warn' : undefined} />
      </div>
      <div className="panel trend stage-chapter">
        <div className="trend-head">
          <h2>Temperatura del agua</h2>
          {data.lastTempC !== undefined && <span className="trend-now number">{formatNumber(data.lastTempC)} °C</span>}
        </div>
        {data.temps.length >= 2 ? (
          <Sparkline values={data.temps} label={`Últimas ${data.temps.length} lecturas de temperatura`} />
        ) : (
          <p className="muted">Con dos lecturas de agua, aquí se dibuja cómo va la temperatura.</p>
        )}
        <p className="muted">{data.recordsToday} registros en las últimas 24 horas</p>
      </div>
    </section>
  );
}
