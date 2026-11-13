import * as THREE from 'three';
import type { Bounds } from './school';

/**
 * The fish swim on a flat sheet of water (y = 0 in the school's own space). By default that space is
 * the world, seen from above at an angle like looking into a pond. A `space` matrix places the sheet
 * anywhere else, for example tilted towards the camera behind the story.
 */
const WATER = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const inverse = new THREE.Matrix4();

function hit(camera: THREE.Camera, space?: THREE.Matrix4): THREE.Vector3 | null {
  ray.setFromCamera(ndc, camera);
  if (space) ray.ray.applyMatrix4(inverse.copy(space).invert());
  return ray.ray.intersectPlane(WATER, new THREE.Vector3());
}

/** The point on the water under a screen position, or null when that pixel looks past the sheet. */
export function pointOnWater(camera: THREE.Camera, element: HTMLElement, clientX: number, clientY: number, space?: THREE.Matrix4): THREE.Vector3 | null {
  const rect = element.getBoundingClientRect();
  ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
  return hit(camera, space);
}

/** The biggest rectangle of water fully on screen (perspective makes the far side wider than the near one). */
export function visibleWater(camera: THREE.Camera, space?: THREE.Matrix4): Bounds {
  const at = (x: number, y: number, fallbackZ: number) => {
    ndc.set(x, y);
    return hit(camera, space) ?? new THREE.Vector3(x * 4, 0, fallbackZ);
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
