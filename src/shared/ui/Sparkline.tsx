import { useRef } from 'react';
import { duration, ease } from '../motion/presets';
import { useGsap } from '../motion/useGsap';

interface SparklineProps {
  values: number[];
  label: string;
  width?: number;
  height?: number;
}

/** A small line of recent values. It draws itself in once; under reduced motion it is simply there. */
export function Sparkline({ values, label, width = 280, height = 72 }: SparklineProps) {
  const ref = useRef<SVGSVGElement>(null);
  const pad = 6;
  const min = Math.min(...values);
  const span = Math.max(...values) - min || 1;
  const points = values.map((v, i) => [
    pad + (i * (width - 2 * pad)) / Math.max(values.length - 1, 1),
    height - pad - ((v - min) / span) * (height - 2 * pad),
  ]);
  const line = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const [lastX, lastY] = points[points.length - 1];

  useGsap(
    ref,
    (g, reduced) => {
      if (reduced) return;
      const path = ref.current?.querySelector<SVGPathElement>('.spark-line');
      if (!path) return;
      const length = path.getTotalLength();
      g.fromTo(path, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, duration: duration.reveal * 2, ease: ease.out });
      g.from('.spark-area, .spark-dot', { opacity: 0, duration: duration.reveal, delay: duration.reveal });
    },
    [line],
  );

  return (
    <svg ref={ref} className="sparkline" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      <path className="spark-area" d={`${line} L${lastX} ${height} L${points[0][0]} ${height} Z`} />
      <path className="spark-line" d={line} />
      <circle className="spark-dot" cx={lastX} cy={lastY} r="4.5" />
    </svg>
  );
}
