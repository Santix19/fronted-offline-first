import { formatNumber } from '../utils/format';

interface SparklineProps { values: number[]; label: string; width?: number; height?: number }

/** Ordered readings, a labelled scale, and the exact series available without sight. */
export function Sparkline({ values, label, width = 360, height = 120 }: SparklineProps) {
  if (!values.length) return null;
  const min = Math.floor(Math.min(...values));
  const max = Math.max(min + 1, Math.ceil(Math.max(...values)));
  const left = 42, top = 12, bottom = height - 26;
  const points = values.map((v, i) => [left + i * (width - left - 10) / Math.max(1, values.length - 1), bottom - (v - min) / (max - min) * (bottom - top)]);
  const line = points.map(([x, y], i) => (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1)).join(' ');
  const description = label + ': ' + values.map((v) => formatNumber(v)).join(', ') + ' grados Celsius. De la más antigua a la más reciente.';
  return (
    <svg className="sparkline" viewBox={'0 0 ' + width + ' ' + height} role="img" aria-label={description}>
      {[min, max].map((v) => {
        const y = v === min ? bottom : top;
        return <g key={v}><text x="0" y={y + 5}>{v}°</text><path className="spark-axis" d={'M' + left + ' ' + y + 'H' + width} /></g>;
      })}
      <path className="spark-line" d={line} />
      <circle className="spark-dot" cx={points.at(-1)![0]} cy={points.at(-1)![1]} r="4" />
      <text x={left} y={height - 2}>Antes</text>
      <text x={width - 2} y={height - 2} textAnchor="end">Última</text>
    </svg>
  );
}
