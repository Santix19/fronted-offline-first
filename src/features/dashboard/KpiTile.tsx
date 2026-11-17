import { CountUp } from '../../shared/ui/CountUp';
import { GlossyObject, type ObjectColor, type ObjectKind } from '../../shared/ui/GlossyObject';

export type KpiColor = 'lime' | 'blue' | 'peach' | 'white';

interface KpiTileProps {
  label: string;
  value: number;
  href: string;
  /** The card's flat backing: siblings each get a different one, never tints of one colour */
  color: KpiColor;
  object: ObjectKind;
  objectColor: ObjectColor;
  /** warn / danger only when the number asks for attention: the card gets a dark edge and a dot */
  tone?: 'warn' | 'danger';
}

/** A capability card you can tap: the number, what it counts, and one glossy object spilling off the edge. */
export function KpiTile({ label, value, href, color, object, objectColor, tone }: KpiTileProps) {
  return (
    <a className={`kpi bg-${color} ${tone ?? ''}`} href={href}>
      <GlossyObject kind={object} color={objectColor} size={104} tilt={-12} className="kpi-object" />
      <strong className="kpi-value">
        <CountUp value={value} decimals={0} />
      </strong>
      <span className="kpi-label">
        {tone && <span className="kpi-dot" aria-hidden="true" />}
        {label}
      </span>
    </a>
  );
}
