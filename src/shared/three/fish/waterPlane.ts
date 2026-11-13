import * as THREE from 'three';
import type { Bounds } from './school';

/**
 * The fish swim on a horizontal sheet of water (y = 0) seen from above at an angle, like looking
 * into a pond: from there the side-to-side swimming is fully visible and the flank still shows.
 */
const WATER = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();

/** The point on the water under a screen position, or null when that pixel looks above the horizon. */
export function pointOnWater(camera: THREE.Camera, element: HTMLElement, clientX: number, clientY: number): THREE.Vector3 | null {
  const rect = element.getBoundingClientRect();
  ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  return ray.ray.intersectPlane(WATER, new THREE.Vector3());
}

/** The biggest rectangle of water fully on screen (perspective makes the far side wider than the near one). */
export function visibleWater(camera: THREE.Camera): Bounds {
  const at = (x: number, y: number, fallbackZ: number) => {
    ray.setFromCamera(ndc.set(x, y), camera);
    return ray.ray.intersectPlane(WATER, new THREE.Vector3()) ?? new THREE.Vector3(x * 4, 0, fallbackZ);
  };
  const nearLeft = at(-1, -1, 4);
  const nearRight = at(1, -1, 4);
  const farLeft = at(-1, 1, -8);
  return {
    minX: Math.max(nearLeft.x, farLeft.x),
    maxX: nearRight.x,
    minZ: farLeft.z,
    maxZ: nearLeft.z,
  };
}
