import { CountUp } from '../../shared/ui/CountUp';

interface KpiTileProps {
  label: string;
  value: number;
  href: string;
  /** warn / danger only when the number asks for attention; otherwise the tile stays quiet */
  tone?: 'warn' | 'danger';
}

/** One number you can tap to get to the screen that explains it. */
export function KpiTile({ label, value, href, tone }: KpiTileProps) {
  return (
    <a className={`kpi ${tone ?? ''}`} href={href}>
      <strong className="kpi-value">
        <CountUp value={value} decimals={0} />
      </strong>
      <span className="kpi-label">{label}</span>
    </a>
  );
}
