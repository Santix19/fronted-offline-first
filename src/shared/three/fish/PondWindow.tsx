import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { FishSchool } from './FishSchool';
import { TROUT_MODELS } from './loadTrout';
import { createSwimUniforms } from './swimShader';
import { TroutStudio } from './TroutStudio';
import { DEFAULT_TUNING } from './tuning';
import { visibleWater } from './waterPlane';

interface PondWindowProps {
  count: number;
  /** The fish are on screen: the still picture underneath can go */
  onReady: () => void;
  /** This phone cannot draw them smoothly: go back to the still picture */
  onSlow: () => void;
}

const SLOW_FRAME = 1 / 28; // seconds; slower than this on average and the trout are not worth it
const SAMPLE = 90; // frames measured after the first ones, which include start-up work

/** Tells the tile when the school is drawn, and measures whether the phone keeps up. */
function Watch({ onReady, onSlow }: Pick<PondWindowProps, 'onReady' | 'onSlow'>) {
  const seen = useRef({ frames: 0, time: 0, done: false });
  useEffect(onReady, [onReady]);
  useFrame((_, delta) => {
    const s = seen.current;
    if (s.done || ++s.frames <= 20) return;
    s.time += delta;
    if (s.frames < 20 + SAMPLE) return;
    s.done = true;
    if (s.time / SAMPLE > SLOW_FRAME) onSlow();
  });
  return null;
}

function Pond({ count, onReady, onSlow }: PondWindowProps) {
  const { camera, size } = useThree();
  const uniforms = useMemo(createSwimUniforms, []);
  const bounds = useMemo(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(0, 6.9, 5.8); // looking down into the pond at about 50 degrees: backs and flanks both show
    cam.aspect = size.width / size.height;
    cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();
    return visibleWater(cam);
  }, [camera, size.width, size.height]);
  const length = Math.round(((bounds.maxX - bounds.minX) / 2.8) * 100) / 100;
  return (
    <>
      <TroutStudio />
      <hemisphereLight args={['#ffffff', '#3a2d2a', 1.1]} />
      <directionalLight position={[-3, 7, 3]} intensity={1.5} />
      <FishSchool model={TROUT_MODELS.small} count={count} length={length} bounds={bounds} tuning={DEFAULT_TUNING} uniforms={uniforms} shadows={false} />
      <Watch onReady={onReady} onSlow={onSlow} />
    </>
  );
}

/**
 * The live pond inside the home tile: one trout per active batch, in the light model, in the only
 * WebGL canvas of the work screens. Nothing is drawn while the tile is off screen.
 */
export default function PondWindow(props: PondWindowProps) {
  const box = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (!box.current) return;
    const watcher = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    watcher.observe(box.current);
    return () => watcher.disconnect();
  }, []);
  return (
    <div ref={box} className="pond-window" aria-hidden="true">
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={[1, 1.5]}
        camera={{ fov: 40, near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.NeutralToneMapping, powerPreference: 'low-power' }}
      >
        <Suspense fallback={null}>
          <Pond {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
}
