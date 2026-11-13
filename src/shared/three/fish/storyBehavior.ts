import type { Fish } from './fishBrain';
import type { Bounds } from './school';
import type { SchoolTuning } from './tuning';

/** Shared with the story through a ref: scroll never causes a React render per frame. */
export interface StoryState { chapter: number; progress: number; crossed: number; descent?: number; drift?: number; focus?: { x: number; z: number } }

export function storyGoal(f: Fish, b: Bounds, scene: StoryState, index: number): number | undefined {
  if (scene.chapter !== 4) return undefined;
  const depth = b.maxZ - b.minZ;
  const cz = scene.focus?.z ?? (b.minZ + b.maxZ) / 2;
  const x = b.maxX + f.length * 2;
  const z = cz + Math.sin(index) * Math.min(depth * .12, f.length * .5);
  return Math.atan2(x - f.x, z - f.z);
}

/** Only the counting demonstration overrides free swimming. */
export function storyTuning(t: SchoolTuning, chapter: number): SchoolTuning {
  if (chapter === 4) return { ...t, burstSpeed: 2.4, glideDrag: .45 };
  return t;
}

/** Each example fish crosses once. Re-entering the chapter starts a fresh demonstration. */
export function lineUp(school: Fish[], b: Bounds, scene?: StoryState): void {
  const cz = scene?.focus?.z ?? (b.minZ + b.maxZ) / 2;
  school.forEach((f, i) => {
    f.x = b.minX + f.length * .65;
    f.z = cz + Math.sin(i) * f.length * .3;
    f.heading = Math.PI / 2;
    f.mode = 'burst';
    f.timer = 3;
    f.speed = .6;
    f.storyDelay = i * .55;
  });
}
