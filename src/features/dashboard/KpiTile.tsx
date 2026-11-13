import { lazy, Suspense, useState } from 'react';
import { useLivePond } from '../../shared/three/fish/useLivePond';
import { CountUp } from '../../shared/ui/CountUp';
import { Icon } from '../../shared/ui/icons';
import { PondGuard } from '../../shared/three/fish/PondGuard';

// three.js only downloads when a phone is going to draw the trout
const PondWindow = lazy(() => import('../../shared/three/fish/PondWindow'));

export type KpiKind = 'batches' | 'alerts' | 'ponds' | 'pending';

interface KpiTileProps {
  kind: KpiKind;
  label: string;
  value: number;
  href?: string;
  /** warn / danger only when the number asks for attention */
  tone?: 'warn' | 'danger';
}

/**
 * A number of the farm you can tap. The batches tile is a window into the pond: one trout per
 * active batch, up to three (the trout is the only glossy thing on the screen).
 */
export function KpiTile({ kind, label, value, href, tone }: KpiTileProps) {
  const trout = kind === 'batches' ? Math.min(value, 3) : 0;
  const allowed = useLivePond();
  // still: the picture. live: the school is drawn. off: this phone was too slow, the picture stays
  const [pond, setPond] = useState<'still' | 'live' | 'off'>('still');
  const swims = kind === 'batches' && value > 0 && allowed && pond !== 'off';
  const Tag = href ? 'a' : 'div';
  return (
    <Tag className={`kpi kpi-${kind} ${tone ?? ''}`} href={href}>
      {swims && (
        <PondGuard onFail={() => setPond('off')}><Suspense fallback={null}>
          <PondWindow count={Math.min(value, 6)} onReady={() => setPond('live')} onSlow={() => setPond('off')} />
        </Suspense></PondGuard>
      )}
      {pond !== 'live' && Array.from({ length: trout }, (_, i) => (
        <img key={i} className={`kpi-trout kpi-trout-${i}`} src="/objects/trucha.png" alt="" width={560} height={253} decoding="async" draggable={false} />
      ))}
      {kind === 'alerts' && <span className="kpi-icon"><Icon name="bell" size={28} /></span>}
      <strong className="kpi-value">
        <CountUp value={value} decimals={0} />
      </strong>
      <span className="kpi-label">{label}</span>
    </Tag>
  );
}
