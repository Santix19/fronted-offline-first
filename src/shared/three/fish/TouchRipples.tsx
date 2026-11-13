import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/** Rings spreading on the water where a finger touched it: the touch is answered at once, even before the fish move. */
export interface RippleBus {
  queue: THREE.Vector3[];
}

export function useRippleBus(): RippleBus {
  return useMemo(() => ({ queue: [] }), []);
}

const POOL = 4;
const LIFE = 0.9; // seconds

export function TouchRipples({ bus, size }: { bus: RippleBus; size: number }) {
  const rings = useMemo(
    () =>
      Array.from({ length: POOL }, () => {
        const mesh = new THREE.Mesh(
          new THREE.RingGeometry(0.92, 1, 48).rotateX(-Math.PI / 2),
          new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, depthWrite: false }),
        );
        return { mesh, age: LIFE };
      }),
    [],
  );
  const next = useRef(0);

  useFrame((_, delta) => {
    while (bus.queue.length) {
      const ring = rings[next.current++ % POOL];
      ring.mesh.position.copy(bus.queue.shift()!).setY(0.02);
      ring.age = 0;
    }
    for (const ring of rings) {
      ring.age = Math.min(LIFE, ring.age + delta);
      const k = ring.age / LIFE;
      ring.mesh.scale.setScalar(size * (0.15 + k * 1.6));
      (ring.mesh.material as THREE.MeshBasicMaterial).opacity = 0.55 * (1 - k) * (1 - k);
    }
  });

  return (
    <>
      {rings.map((ring, i) => (
        <primitive key={i} object={ring.mesh} />
      ))}
    </>
  );
}
