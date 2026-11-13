import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { FishSchool } from './FishSchool';
import { FrameBudget } from './FrameBudget';
import { TROUT_MODELS } from './loadTrout';
import { createSwimUniforms } from './swimShader';
import { TouchRipples, useRippleBus } from './TouchRipples';
import { TroutStudio } from './TroutStudio';
import { DEFAULT_TUNING } from './tuning';
import { StoryWater } from './StoryWater';
import { storyWaterBounds } from './storyFraming';
import { storyWaterFrame } from './storyViewport';
import type { StoryState } from './storyBehavior';

const RIVER_TUNING = { ...DEFAULT_TUNING, neighbourRadius: 1.8, personalSpace: 1.25 };

export interface StorySchoolProps {
  scene: RefObject<StoryState>;
  chapter: number;
  onCount: (n: number) => void;
  onSlow: () => void;
  onReady: () => void;
}

/** The same camera and school descend into the river; scroll changes framing, never the model. */
export function StorySchool({ scene, chapter, onCount, onSlow, onReady }: StorySchoolProps) {
  const { camera, size, gl } = useThree();
  const desktop = size.height > 400 && matchMedia('(min-width: 1024px) and (min-height: 600px)').matches;
  const uniforms = useMemo(createSwimUniforms, []);
  const ripples = useRippleBus();
  const framing = useMemo(() => {
    const cam = camera as THREE.OrthographicCamera;
    cam.position.set(0, 6.9, 5.8); cam.zoom = 80;
    cam.lookAt(0, 0, 0); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const frame = storyWaterFrame(size.width, size.height, scene.current.descent ?? 0, chapter === 4, desktop);
    const open = storyWaterBounds(cam, gl.domElement, frame);
    return { open, deep: { ...open }, last: '', length: { current: 1 }, deepLength: { current: .5 } };
  }, [camera, gl, size.width, size.height, desktop]);
  const bounds = framing.open;
  const schoolScene = useRef<StoryState>({ chapter, progress: 0, crossed: 0 });
  schoolScene.current.chapter = chapter;
  useFrame(() => {
    const descent = scene.current.descent ?? 0;
    const key = `${descent}:${chapter === 4}`;
    if (key !== framing.last) {
      framing.last = key;
      const frame = storyWaterFrame(size.width, size.height, descent, chapter === 4, desktop);
      Object.assign(bounds, storyWaterBounds(camera, gl.domElement, frame));
      const depth = bounds.maxZ - bounds.minZ;
      Object.assign(framing.deep, { ...bounds, minZ: bounds.minZ + depth * .08, maxZ: bounds.minZ + depth * .8 });
      const pixels = Math.min(60, size.width * .11) * (1 - descent) + Math.min(180, size.width * .24) * descent;
      framing.length.current = (bounds.maxX - bounds.minX) / (frame.right - frame.left) * pixels;
      framing.deepLength.current = framing.length.current * .52;
    }
    schoolScene.current.progress = scene.current.progress;
    schoolScene.current.descent = descent;
    schoolScene.current.focus = { x: (bounds.minX + bounds.maxX) / 2, z: (bounds.minZ + bounds.maxZ) / 2 };
  });
  useEffect(onReady, [onReady]);
  const onTouch = useCallback((p: THREE.Vector3) => ripples.queue.push(p), [ripples]);
  return <>
    <TroutStudio />
    <hemisphereLight args={['#c4dfe3', '#426c7b', .65]} />
    <directionalLight position={[-3, 7, 3]} intensity={.7} />
    <TouchRipples bus={ripples} size={1} />
    <StoryWater scene={schoolScene} bounds={bounds} bus={ripples} length={1} />
    <FrameBudget onSlow={onSlow} />
    {chapter !== 4 && <FishSchool model={TROUT_MODELS.small} count={5} length={1} sizeScale={framing.deepLength} bounds={framing.deep} tuning={RIVER_TUNING} uniforms={uniforms} shadows={false} dim submerged />}
    <FishSchool model={TROUT_MODELS.full} count={chapter === 4 ? 12 : 8} length={1} sizeScale={framing.length} bounds={bounds} tuning={RIVER_TUNING} uniforms={uniforms} shadows={false} submerged scene={schoolScene} onCount={onCount} onTouch={onTouch} listenOn="window" />
  </>;
}
