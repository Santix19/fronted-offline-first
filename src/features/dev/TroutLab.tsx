import { Canvas } from '@react-three/fiber';
import { Suspense, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { createSwimUniforms } from '../../shared/three/fish/swimShader';
import { DEFAULT_TUNING } from '../../shared/three/fish/tuning';
import { LabPond, type LabView } from './LabPond';
import { TroutLabPanel } from './TroutLabPanel';
import './troutLab.css';

/**
 * #/dev/trucha, only in development: the school alone, with live
 * controls, to judge on a real phone whether the swimming looks like a trout before it goes anywhere.
 * Touch the water: the nearest fish curl into a C and shoot off, and the panic spreads.
 */
export default function TroutLab() {
  const [view, setView] = useState<LabView>({ count: 10, size: 1, tilt: 55, small: false, shadows: true, waves: 0.85 });
  const [tuning, setTuning] = useState(DEFAULT_TUNING);
  const uniforms = useMemo(createSwimUniforms, []);
  uniforms.uWaves.value = view.waves;
  const fps = useRef<HTMLSpanElement>(null);

  return (
    <div className="trout-lab">
      <Canvas
        className="trout-lab-canvas"
        dpr={[1, 1.5]}
        camera={{ fov: 40, near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.NeutralToneMapping, powerPreference: 'low-power' }}
      >
        <Suspense fallback={null}>
          <LabPond view={view} tuning={tuning} uniforms={uniforms} fps={fps} />
        </Suspense>
      </Canvas>
      <TroutLabPanel view={view} tuning={tuning} onView={setView} onTuning={setTuning} fps={fps} />
    </div>
  );
}
