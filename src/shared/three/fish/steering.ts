import type { Fish } from './fishBrain';
import type { Bounds } from './school';
import type { SchoolTuning } from './tuning';

/** Where a fish wants to go: its own drift, its neighbours (stay close, keep space, swim along), the walls. */
export function goalFor(f: Fish, school: Fish[], b: Bounds, t: SchoolTuning, avoid: { x: number; z: number } | null): number {
  const fleeing = f.mode === 'cstart' || f.mode === 'flee';
  const own = fleeing ? f.fleeHeading : f.heading + f.wander;
  let dx = Math.sin(own) * (fleeing ? 3 : 1);
  let dz = Math.cos(own) * (fleeing ? 3 : 1);
  if (!fleeing) {
    for (const o of school) {
      if (o === f) continue;
      const ox = o.x - f.x;
      const oz = o.z - f.z;
      const d = Math.hypot(ox, oz) / f.length;
      if (d > t.neighbourRadius) continue;
      const pull = d < t.personalSpace ? -1.2 * (t.personalSpace - d) / Math.max(d, 0.1) : 0.04;
      dx += (ox / f.length) * pull + Math.sin(o.heading) * 0.25;
      dz += (oz / f.length) * pull + Math.cos(o.heading) * 0.25;
    }
    if (avoid) {
      const d = Math.hypot(f.x - avoid.x, f.z - avoid.z) / f.length;
      if (d < 2.5) [dx, dz] = [dx + ((f.x - avoid.x) / f.length) * 0.8, dz + ((f.z - avoid.z) / f.length) * 0.8];
    }
  }
  // Soft walls: the closer to an edge, the harder it turns back. A fleeing fish runs along the
  // wall instead of through it, as trout do in a pond
  const m = f.length * 1.8;
  const wall = fleeing ? 9 : 3;
  dx += (Math.max(0, b.minX + m - f.x) - Math.max(0, f.x - (b.maxX - m))) / m * wall;
  dz += (Math.max(0, b.minZ + m - f.z) - Math.max(0, f.z - (b.maxZ - m))) / m * wall;
  return Math.atan2(dx, dz);
}

/** Whatever the steering did, the whole fish stays on screen: its centre keeps half a body from the edge. */
export function keepInside(f: Fish, b: Bounds): void {
  const pad = f.length * 0.55;
  f.x = Math.min(b.maxX - pad, Math.max(b.minX + pad, f.x));
  f.z = Math.min(b.maxZ - pad, Math.max(b.minZ + pad, f.z));
}

