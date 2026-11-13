import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { Fish } from './fishBrain';

/**
 * A soft dark oval on the pond floor under each fish. From above, this is what makes a fish read
 * as swimming *in* water rather than pasted on it. One draw call for all of them.
 */
const FLOOR = -0.9; // in fish lengths below the water sheet

function softDot(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

export function useBlobShadows(count: number, enabled: boolean) {
  const shadows = useMemo(() => {
    const material = new THREE.MeshBasicMaterial({ map: softDot(), color: '#050303', transparent: true, opacity: 0.3, depthWrite: false });
    const mesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), material, count);
    mesh.frustumCulled = false;
    mesh.renderOrder = -1;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler(-Math.PI / 2, 0, 0, 'YXZ');
    const p = new THREE.Vector3();
    const s = new THREE.Vector3();
    return {
      mesh,
      update(fish: Fish[], visible?: (fish: Fish) => boolean) {
        if (!enabled) return;
        fish.forEach((f, i) => {
          const floor = FLOOR * f.length;
          // The light is up and to the left, so the shadow falls a little right of the fish
          p.set(f.x + (f.y - floor) * 0.35, floor, f.z + (f.y - floor) * 0.2);
          q.setFromEuler(e.set(-Math.PI / 2, f.heading, 0));
          const length = !visible || visible(f) ? f.length : 0;
          mesh.setMatrixAt(i, m.compose(p, q, s.set(length * 0.3, length * 0.95, 1)));
        });
        mesh.instanceMatrix.needsUpdate = true;
      },
    };
  }, [count, enabled]);

  useEffect(
    () => () => {
      shadows.mesh.geometry.dispose();
      (shadows.mesh.material as THREE.MeshBasicMaterial).map?.dispose();
      (shadows.mesh.material as THREE.Material).dispose();
    },
    [shadows],
  );
  return shadows;
}
