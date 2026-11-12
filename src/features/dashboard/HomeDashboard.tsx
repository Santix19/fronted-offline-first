import { useRef } from 'react';
import { facade } from '../../facade/PisciculturaFacade';
import { useStagger } from '../../shared/motion/useStagger';
import { useLiveQuery } from '../../shared/db/useLiveQuery';
import { CapsuleRibbon } from '../../shared/ui/CapsuleRibbon';
import { GlossyObject } from '../../shared/ui/GlossyObject';
import { Sparkline } from '../../shared/ui/Sparkline';
import { formatNumber } from '../../shared/utils/format';
import { buildDashboard } from './dashboardMath';
import { KpiTile } from './KpiTile';
import { recordCapsules } from './recordCapsules';

async function load() {
  const [ponds, batches, records, alerts, pending] = await Promise.all([
    facade.ponds(),
    facade.batches(),
    facade.records(undefined, 300),
    facade.alerts(),
    facade.pendingCounts(),
  ]);
  return {
    ...buildDashboard({ ponds, batches, records, alerts: alerts.length, ...pending, now: Date.now() }),
    recent: recordCapsules(records),
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
      <div className="kpi-grid" ref={tiles}>
        <KpiTile label="Estanques activos" value={data.activePonds} href="#/" color="blue" object="drop" objectColor="lime" />
        <KpiTile label="Lotes activos" value={data.activeBatches} href="#/" color="lime" object="fish" objectColor="blue" />
        <KpiTile label="Alertas" value={data.alerts} href="#/alertas" color="peach" object="bell" objectColor="violet"
          tone={data.alerts > 0 ? 'danger' : undefined} />
        <KpiTile label="Por subir" value={data.waiting} href="#/sincronizacion" color="white" object="cloud" objectColor="blue"
          tone={data.waiting > 0 ? 'warn' : undefined} />
      </div>
      <CapsuleRibbon items={data.recent} label="Últimos registros" />
      <div className="panel trend stage-chapter cut-corner">
        <GlossyObject kind="thermo" color="peach" size={120} tilt={16} className="float trend-object" />
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
