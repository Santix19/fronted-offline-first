import type * as THREE from 'three';
import type { Bounds } from './school';
import { pointOnWater } from './waterPlane';
import type { StoryFrame } from './storyViewport';

export function storyWaterBounds(camera: THREE.Camera, canvas: HTMLElement, b: StoryFrame): Bounds {
  const r = canvas.getBoundingClientRect();
  const at = (x: number, y: number) => {
    const world = pointOnWater(camera, canvas, r.left + x, r.top + y);
    if (!world) throw new Error('La cámara no encuentra el agua');
    return world;
  };
  const farLeft = at(b.left, b.top), nearLeft = at(b.left, b.bottom);
  const farRight = at(b.right, b.top), nearRight = at(b.right, b.bottom);
  return { minX: Math.max(farLeft.x, nearLeft.x), maxX: Math.min(farRight.x, nearRight.x), minZ: farLeft.z, maxZ: nearLeft.z };
}
