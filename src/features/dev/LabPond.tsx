import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, type RefObject } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { FishSchool } from '../../shared/three/fish/FishSchool';
import { TROUT_MODELS } from '../../shared/three/fish/loadTrout';
import type { SwimUniforms } from '../../shared/three/fish/swimShader';
import { TouchRipples, useRippleBus } from '../../shared/three/fish/TouchRipples';
import type { SchoolTuning } from '../../shared/three/fish/tuning';
import { visibleWater } from '../../shared/three/fish/waterPlane';

export interface LabView {
  count: number;
  size: number;
  tilt: number;
  small: boolean;
  shadows: boolean;
  waves: number;
}

/** The glossy model needs something to reflect; a generated studio costs one frame at start, nothing after. */
function Studio() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

/** Frames per second, written straight into the panel so measuring does not cost a React render. */
function FrameMeter({ out }: { out: RefObject<HTMLElement | null> }) {
  const acc = useMemo(() => ({ frames: 0, time: 0, worst: 0 }), []);
  useFrame((_, delta) => {
    acc.frames++;
    acc.time += delta;
    acc.worst = Math.max(acc.worst, delta);
    if (acc.time < 0.5 || !out.current) return;
    out.current.textContent = `${Math.round(acc.frames / acc.time)} fps · peor cuadro ${Math.round(acc.worst * 1000)} ms`;
    Object.assign(acc, { frames: 0, time: 0, worst: 0 });
  });
  return null;
}

export function LabPond({ view, tuning, uniforms, fps }: { view: LabView; tuning: SchoolTuning; uniforms: SwimUniforms; fps: RefObject<HTMLElement | null> }) {
  const { camera, size } = useThree();
  const ripples = useRippleBus();
  // The camera looks down into the pond; the slider sets how steeply
  const bounds = useMemo(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const a = (view.tilt * Math.PI) / 180;
    cam.position.set(0, 9 * Math.sin(a), 9 * Math.cos(a));
    cam.aspect = size.width / size.height;
    cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();
    return visibleWater(cam);
  }, [camera, size.width, size.height, view.tilt]);
  // Fish size follows the width of the water: about four fish across
  const length = Math.round(Math.min(1.3, Math.max(0.35, (bounds.maxX - bounds.minX) / 3.8)) * view.size * 100) / 100;
  const onTouch = useCallback((p: THREE.Vector3) => ripples.queue.push(p), [ripples]);

  return (
    <>
      <Studio />
      <FrameMeter out={fps} />
      <hemisphereLight args={['#ffffff', '#7fb3e6', 1.1]} />
      <directionalLight position={[-3, 7, 3]} intensity={1.5} />
      <TouchRipples bus={ripples} size={length} />
      <FishSchool
        key={view.small ? 'small' : 'full'}
        model={view.small ? TROUT_MODELS.small : TROUT_MODELS.full}
        count={view.count}
        length={length}
        bounds={bounds}
        tuning={tuning}
        uniforms={uniforms}
        shadows={view.shadows}
        onTouch={onTouch}
      />
    </>
  );
}
