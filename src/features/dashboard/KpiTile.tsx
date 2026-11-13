import { CountUp } from '../../shared/ui/CountUp';

export type KpiKind = 'batches' | 'alerts' | 'ponds' | 'pending';

interface KpiTileProps {
  kind: KpiKind;
  label: string;
  value: number;
  href: string;
  /** warn / danger only when the number asks for attention */
  tone?: 'warn' | 'danger';
}

/**
 * A number of the farm you can tap. The batches tile is a window into the pond: one trout per
 * active batch, up to three (design.md: the trout is the only glossy thing on the screen).
 */
export function KpiTile({ kind, label, value, href, tone }: KpiTileProps) {
  const trout = kind === 'batches' ? Math.min(value, 3) : 0;
  return (
    <a className={`kpi kpi-${kind} ${tone ?? ''}`} href={href}>
      {Array.from({ length: trout }, (_, i) => (
        <img key={i} className={`kpi-trout kpi-trout-${i}`} src="/objects/trucha.png" alt="" width={560} height={253} decoding="async" draggable={false} />
      ))}
      <strong className="kpi-value">
        <CountUp value={value} decimals={0} />
      </strong>
      <span className="kpi-label">{label}</span>
    </a>
  );
}
