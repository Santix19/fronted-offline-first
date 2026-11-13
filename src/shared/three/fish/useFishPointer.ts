import { useEffect, useRef, type RefObject } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Fish } from './fishBrain';
import { scare } from './school';
import type { Bounds } from './school';
import type { SchoolTuning } from './tuning';
import { pointOnWater } from './waterPlane';

export function useFishPointer(fish: RefObject<Fish[]>, tuning: RefObject<SchoolTuning>, onTouch?: (p: THREE.Vector3) => void, space?: THREE.Matrix4, listenOn: 'canvas' | 'window' = 'canvas', region?: RefObject<{ bounds: Bounds }>) {
  const { camera, gl } = useThree();
  const avoid = useRef<{ x: number; z: number } | null>(null);
  const inside = (p: THREE.Vector3 | null) => {
    const b = region?.current.bounds;
    return p && (!b || (p.x >= b.minX && p.x <= b.maxX && p.z >= b.minZ && p.z <= b.maxZ));
  };
  // A touch or click scares them; a mouse just passing by is something to swim around
  useEffect(() => {
    const element = gl.domElement;
    const target: HTMLElement | Window = listenOn === 'window' ? window : element;
    const onDown = (e: PointerEvent) => {
      const p = pointOnWater(camera, element, e.clientX, e.clientY, space);
      if (!p || !inside(p) || (listenOn === 'window' && (e.target as Element)?.closest?.('.lg-piece, .lg-plate, button, a'))) return;
      scare(fish.current, p.x, p.z, tuning.current);
      onTouch?.(p);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const p = pointOnWater(camera, element, e.clientX, e.clientY, space);
      avoid.current = p && inside(p) ? { x: p.x, z: p.z } : null;
    };
    const onLeave = () => (avoid.current = null);
    const down = onDown as EventListener;
    const move = onMove as EventListener;
    target.addEventListener('pointerdown', down);
    target.addEventListener('pointermove', move);
    element.addEventListener('pointerleave', onLeave);
    return () => {
      target.removeEventListener('pointerdown', down);
      target.removeEventListener('pointermove', move);
      element.removeEventListener('pointerleave', onLeave);
    };
  }, [camera, gl, onTouch, space, listenOn]);


  return avoid;
}
