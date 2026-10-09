import { formatNumber, timeAgo } from '../../shared/utils/format';
import type { Batch } from './batchTypes';
import { useBatchSummary } from './useBatchSummary';

interface Fact {
  label: string;
  value?: number;
  unit?: string;
  decimals?: number;
}

/** Expert-system summary of a batch: population, survival, biomass and today's ration. */
export function BatchSummaryPanel({ batch }: { batch: Batch }) {
  // A batch that is not on the backend yet has no summary to ask for
  const { summary, error, loading } = useBatchSummary(batch.id, batch.syncState === 'synced');

  if (batch.syncState !== 'synced') {
    return <p className="notice">El resumen aparece cuando este lote se suba al servidor.</p>;
  }
  if (!summary) {
    return <p className="notice">{loading ? 'Calculando resumen…' : (error ?? 'Sin resumen todavía: se calcula cuando haya señal.')}</p>;
  }

  const facts: Fact[] = [
    { label: 'Ración de hoy', value: summary.dailyRationKg, unit: 'kg', decimals: 2 },
    { label: 'Población estimada', value: summary.estimatedPopulation, decimals: 0 },
    { label: 'Supervivencia', value: summary.survivalPct, unit: '%' },
    { label: 'Peso promedio', value: summary.avgWeightG, unit: 'g' },
    { label: 'Biomasa', value: summary.biomassKg, unit: 'kg' },
    { label: 'Mortalidad total', value: summary.totalMortality, decimals: 0 },
    { label: 'Días de cultivo', value: summary.cultureDays, decimals: 0 },
    { label: 'Densidad', value: summary.densityKgM3, unit: 'kg/m³' },
    { label: 'Conversión alimenticia', value: summary.feedConversionRatio, decimals: 2 },
  ];

  return (
    <section className="panel">
      <dl className="facts">
        {facts
          .filter((f) => f.value !== undefined)
          .map((f) => (
            <div key={f.label}>
              <dt>{f.label}</dt>
              <dd>
                {formatNumber(f.value, f.decimals ?? 1)} {f.unit}
              </dd>
            </div>
          ))}
      </dl>
      {summary.notes.map((note) => (
        <p key={note} className="notice warn">{note}</p>
      ))}
      <p className="muted">
        Calculado por el servidor {timeAgo(summary.fetchedAt)}
        {error && ' · sin conexión para actualizar'}
      </p>
    </section>
  );
}
