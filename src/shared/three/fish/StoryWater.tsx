import { useFrame } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import * as THREE from 'three';
import type { Bounds } from './school';
import type { RippleBus } from './TouchRipples';
import type { StoryState } from './storyBehavior';

/** A sampling ripple, the return of connection, and the gate in the example channel. */
export function StoryWater({ scene, bounds: b, bus, length }: { scene: RefObject<StoryState>; bounds: Bounds; bus: RippleBus; length: number }) {
  const gate = useRef<THREE.Mesh>(null);
  const state = useRef({ ripple: 0, chapter: -1 });
  useFrame((_, dt) => {
    const s = state.current, chapter = scene.current.chapter;
    const cx = (b.minX + b.maxX) / 2, cz = (b.minZ + b.maxZ) / 2;
    if (s.chapter !== chapter) {
      s.chapter = chapter;
      if (chapter === 1 || chapter === 3) bus.queue.push(new THREE.Vector3(cx, 0, cz));
    }
    if ((s.ripple += dt) > 5) {
      s.ripple = 0;
      bus.queue.push(new THREE.Vector3(b.minX + Math.random() * (b.maxX - b.minX), 0, b.minZ + Math.random() * (b.maxZ - b.minZ)));
    }
    if (gate.current) {
      gate.current.visible = chapter === 4;
      gate.current.position.set(cx, .02, cz);
      gate.current.scale.set(length * .08, b.maxZ - b.minZ, 1);
    }
  });
  return <mesh ref={gate} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[1, 1]} /><meshBasicMaterial color="#e8386f" /></mesh>;
}
