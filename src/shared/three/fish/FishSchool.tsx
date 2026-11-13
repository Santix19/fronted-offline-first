import { useFrame } from '@react-three/fiber';
import { use, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Fish } from './fishBrain';
import { loadTrout } from './loadTrout';
import { spawnSchool, stepSchool, type Bounds } from './school';
import { createSwimMaterial, type SwimUniforms } from './swimShader';
import type { SchoolTuning } from './tuning';
import { useFishPointer } from './useFishPointer';
import { useBlobShadows } from './useBlobShadows';
import type { StoryState } from './storyBehavior';
import { useStorySchool } from './useStorySchool';
import type { RefObject } from 'react';

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
  /** Where the sheet of water is, when it is not the world's own floor */
  space?: THREE.Matrix4;
  /** canvas: only touches on the canvas. window: the canvas sits behind the page and takes no taps */
  listenOn?: 'canvas' | 'window';
  scene?: RefObject<StoryState>;
  onCount?: (n: number) => void;
  dim?: boolean;
  submerged?: boolean;
  /** Presentation size follows the story's scroll framing without respawning on every scroll. */
  sizeScale?: RefObject<number>;
}

/** A school of trout in one draw call: one InstancedMesh, the swimming done by the shader. */
export function FishSchool({ model, count, length, bounds, tuning, uniforms, shadows = true, onTouch, space, listenOn = 'canvas', scene, onCount, dim = false, sizeScale, submerged = false }: Props) {
  const asset = use(loadTrout(model));
  const fish = useRef<Fish[]>([]);
  const tuningRef = useRef(tuning);
  tuningRef.current = tuning;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const live = useRef({ bounds, tuning });
  live.current = { bounds, tuning };
  const avoid = useFishPointer(fish, tuningRef, onTouch, space, listenOn, live);

  const swim = useMemo(() => new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3), [count]);
  const geometry = useMemo(() => asset.geometry.clone().setAttribute('aSwim', swim), [asset, swim]);
  const material = useMemo(() => {
    const m = createSwimMaterial(asset.material, uniforms);
    if (dim) m.color.multiplyScalar(.4);
    if (submerged) {
      m.color.multiply(new THREE.Color('#a9c9cd'));
      m.roughness = .72;
      m.metalness = 0;
      m.envMapIntensity = .45;
    }
    return m;
  }, [asset, uniforms, dim, submerged]);
  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);
  const shadowMesh = useBlobShadows(count, shadows);
  // A new school only when its size or the fish size changes, never on a tuning tweak
  const spawned = useRef('');
  const appliedScale = useRef(1);
  const previousArea = useRef({ ...bounds });
  if (spawned.current !== `${count}:${length}`) {
    fish.current = spawnSchool(count, bounds, length, tuning);
    if (submerged) fish.current.forEach((f, i) => {
      // Start throughout the river, instead of growing a tight knot from the lagoon's tiny school.
      f.x = bounds.minX + (bounds.maxX - bounds.minX) * (i % 2 ? .83 : .33);
      f.z = bounds.minZ + (bounds.maxZ - bounds.minZ) * ((Math.floor(i / 2) + .5) / Math.ceil(count / 2));
      f.heading = i % 2 ? .8 : Math.PI - .8;
    });
    if (scene) fish.current.slice(0, 2).forEach((f) => { f.length *= submerged ? 1.55 : 1.3; f.y = submerged ? -.12 : .06; });
    spawned.current = `${count}:${length}`;
    appliedScale.current = 1;
  }

  const matrix = useMemo(() => new THREE.Matrix4(), []);
  const story = useStorySchool(scene, onCount);
  const scratch = useMemo(() => ({ q: new THREE.Quaternion(), e: new THREE.Euler(0, 0, 0, 'YXZ'), p: new THREE.Vector3(), s: new THREE.Vector3() }), []);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    const dt = Math.min(delta, 1 / 20); // a dropped frame must not teleport the school
    const previous = previousArea.current;
    if (sizeScale && (previous.minX !== bounds.minX || previous.maxX !== bounds.maxX || previous.minZ !== bounds.minZ || previous.maxZ !== bounds.maxZ)) {
      fish.current.forEach((f) => {
        f.x = bounds.minX + (f.x - previous.minX) / (previous.maxX - previous.minX) * (bounds.maxX - bounds.minX);
        f.z = bounds.minZ + (f.z - previous.minZ) / (previous.maxZ - previous.minZ) * (bounds.maxZ - bounds.minZ);
      });
      Object.assign(previous, bounds);
    }
    const scale = sizeScale?.current ?? 1;
    if (scale !== appliedScale.current) {
      fish.current.forEach((f) => { f.length *= scale / appliedScale.current; });
      appliedScale.current = scale;
    }
    story.prepare(fish.current, live.current.bounds);
    stepSchool(fish.current, dt, live.current.bounds, live.current.tuning, avoid.current, scene?.current);
    const { q, e, p, s } = scratch;
    fish.current.forEach((f, i) => {
      story.crossed(f, bounds);
      // Banks gently into its turns, like a trout leaning on the water
      q.setFromEuler(e.set(0, f.heading, -f.turn * 0.1));
      mesh.current!.setMatrixAt(i, matrix.compose(p.set(f.x, f.y, f.z), q, s.setScalar(story.scaleFor(f, bounds))));
      swim.setXYZ(i, f.phase, f.amp, f.bend);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    swim.needsUpdate = true;
    shadowMesh.update(fish.current, (f) => story.scaleFor(f, bounds) > 0);
  });

  return (
    <>
      <instancedMesh ref={mesh} args={[geometry, material, count]} frustumCulled={false} />
      {shadows && <primitive object={shadowMesh.mesh} />}
    </>
  );
}
