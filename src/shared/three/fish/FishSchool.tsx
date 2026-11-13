import { useFrame, useThree } from '@react-three/fiber';
import { use, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Fish } from './fishBrain';
import { loadTrout } from './loadTrout';
import { scare, spawnSchool, stepSchool, type Bounds } from './school';
import { createSwimMaterial, type SwimUniforms } from './swimShader';
import type { SchoolTuning } from './tuning';
import { pointOnWater } from './waterPlane';
import { useBlobShadows } from './useBlobShadows';

interface Props {
  model: string;
  count: number;
  length: number;
  bounds: Bounds;
  tuning: SchoolTuning;
  uniforms: SwimUniforms;
  shadows?: boolean;
  /** Called with the touched point so the water can ripple there */
  onTouch?: (point: THREE.Vector3) => void;
}

/** A school of trout in one draw call: one InstancedMesh, the swimming done by the shader. */
export function FishSchool({ model, count, length, bounds, tuning, uniforms, shadows = true, onTouch }: Props) {
  const asset = use(loadTrout(model));
  const { camera, gl } = useThree();
  const fish = useRef<Fish[]>([]);
  const avoid = useRef<{ x: number; z: number } | null>(null);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const live = useRef({ bounds, tuning });
  live.current = { bounds, tuning };

  const swim = useMemo(() => new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3), [count]);
  const geometry = useMemo(() => asset.geometry.clone().setAttribute('aSwim', swim), [asset, swim]);
  const material = useMemo(() => createSwimMaterial(asset.material, uniforms), [asset, uniforms]);
  const shadowMesh = useBlobShadows(count, shadows);
  // A new school only when its size or the fish size changes, never on a tuning tweak
  const spawned = useRef('');
  if (spawned.current !== `${count}:${length}`) {
    fish.current = spawnSchool(count, bounds, length, tuning);
    spawned.current = `${count}:${length}`;
  }

  // A touch or click scares them; a mouse just passing by is something to swim around
  useEffect(() => {
    const element = gl.domElement;
    const onDown = (e: PointerEvent) => {
      const p = pointOnWater(camera, element, e.clientX, e.clientY);
      if (!p) return;
      scare(fish.current, p.x, p.z, live.current.tuning);
      onTouch?.(p);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const p = pointOnWater(camera, element, e.clientX, e.clientY);
      avoid.current = p && { x: p.x, z: p.z };
    };
    const onLeave = () => (avoid.current = null);
    element.addEventListener('pointerdown', onDown);
    element.addEventListener('pointermove', onMove);
    element.addEventListener('pointerleave', onLeave);
    return () => {
      element.removeEventListener('pointerdown', onDown);
      element.removeEventListener('pointermove', onMove);
      element.removeEventListener('pointerleave', onLeave);
    };
  }, [camera, gl, onTouch]);

  const matrix = useMemo(() => new THREE.Matrix4(), []);
  const scratch = useMemo(() => ({ q: new THREE.Quaternion(), e: new THREE.Euler(0, 0, 0, 'YXZ'), p: new THREE.Vector3(), s: new THREE.Vector3() }), []);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    const dt = Math.min(delta, 1 / 20); // a dropped frame must not teleport the school
    stepSchool(fish.current, dt, live.current.bounds, live.current.tuning, avoid.current);
    const { q, e, p, s } = scratch;
    fish.current.forEach((f, i) => {
      // Banks gently into its turns, like a trout leaning on the water
      q.setFromEuler(e.set(0, f.heading, -f.turn * 0.1));
      mesh.current!.setMatrixAt(i, matrix.compose(p.set(f.x, f.y, f.z), q, s.setScalar(f.length)));
      swim.setXYZ(i, f.phase, f.amp, f.bend);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    swim.needsUpdate = true;
    shadowMesh.update(fish.current);
  });

  return (
    <>
      <instancedMesh ref={mesh} args={[geometry, material, count]} frustumCulled={false} />
      {shadows && <primitive object={shadowMesh.mesh} />}
    </>
  );
}
