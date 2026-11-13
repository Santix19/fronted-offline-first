import { goalFor, keepInside } from './steering';
import { stepFish, type Fish } from './fishBrain';
import { between, type SchoolTuning } from './tuning';
import { storyGoal, storyTuning, type StoryState } from './storyBehavior';

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

/** Advances the whole school one frame. A fish that starts escaping spreads the panic to its neighbours. */
export function stepSchool(school: Fish[], dt: number, b: Bounds, t: SchoolTuning, avoid: { x: number; z: number } | null, scene?: StoryState): void {
  const tuning = scene ? storyTuning(t, scene.chapter) : t;
  for (const [index, f] of school.entries()) {
    if (scene?.chapter === 4 && (f.storyDelay ?? 0) > 0) { f.storyDelay = Math.max(0, f.storyDelay! - dt); continue; }
    f.wander = Math.max(-1, Math.min(1, f.wander + (Math.random() - 0.5) * dt * 4));
    const directed = scene && f.mode !== 'flee' && f.mode !== 'cstart' ? storyGoal(f, b, scene, index) : undefined;
    const escaped = stepFish(f, directed ?? goalFor(f, school, b, t, avoid), dt, tuning);
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
