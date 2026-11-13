import { stepFish, type Fish } from './fishBrain';
import { between, type SchoolTuning } from './tuning';

/** The water a school may use, on the horizontal plane (world units). */
export interface Bounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export function spawnSchool(count: number, b: Bounds, length: number, t: SchoolTuning): Fish[] {
  const heading = Math.random() * Math.PI * 2;
  return Array.from({ length: count }, () => ({
    x: b.minX + Math.random() * (b.maxX - b.minX),
    z: b.minZ + Math.random() * (b.maxZ - b.minZ),
    y: -Math.random() * 0.5 * length,
    heading: heading + (Math.random() - 0.5) * 1.2,
    turn: 0,
    speed: 0.6,
    phase: Math.random() * 6.28,
    amp: 0,
    bend: 0,
    mode: Math.random() < 0.5 ? 'burst' : 'glide',
    timer: between(t.glideTime),
    length: length * (0.75 + Math.random() * 0.4),
    vigour: 0.8 + Math.random() * 0.4,
    wander: 0,
    fleeHeading: 0,
    cSide: 1,
    scareIn: -1,
    scareHeading: 0,
  }));
}

/** Where a fish wants to go: its own drift, its neighbours (stay close, keep space, swim along), the walls. */
function goalFor(f: Fish, school: Fish[], b: Bounds, t: SchoolTuning, avoid: { x: number; z: number } | null): number {
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
function keepInside(f: Fish, b: Bounds): void {
  const pad = f.length * 0.55;
  f.x = Math.min(b.maxX - pad, Math.max(b.minX + pad, f.x));
  f.z = Math.min(b.maxZ - pad, Math.max(b.minZ + pad, f.z));
}

/** Advances the whole school one frame. A fish that starts escaping spreads the panic to its neighbours. */
export function stepSchool(school: Fish[], dt: number, b: Bounds, t: SchoolTuning, avoid: { x: number; z: number } | null): void {
  for (const f of school) {
    f.wander = Math.max(-1, Math.min(1, f.wander + (Math.random() - 0.5) * dt * 4));
    const escaped = stepFish(f, goalFor(f, school, b, t, avoid), dt, t);
    keepInside(f, b);
    if (!escaped) continue;
    for (const o of school) {
      const d = Math.hypot(o.x - f.x, o.z - f.z) / o.length;
      if (o.mode === 'cstart' || o.mode === 'flee' || o.scareIn >= 0 || d > t.panicRadius) continue;
      o.scareIn = 0.06 + Math.random() * 0.1;
      o.scareHeading = f.fleeHeading;
    }
  }
}

/** A touch at (x, z): the nearest fish react first, so the panic ripples outwards from the finger. */
export function scare(school: Fish[], x: number, z: number, t: SchoolTuning): void {
  for (const f of school) {
    const d = Math.hypot(f.x - x, f.z - z) / f.length;
    if (d > t.scareRadius || f.mode === 'cstart' || f.mode === 'flee' || f.scareIn >= 0) continue;
    f.scareIn = d * 0.03 + Math.random() * 0.03;
    f.scareHeading = Math.atan2(f.x - x, f.z - z);
  }
}
