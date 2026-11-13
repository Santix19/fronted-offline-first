import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import * as THREE from 'three';
import { StorySchool, type StorySchoolProps } from './StorySchool';

/**
 * A transparent canvas between the riverbed and the illustrated water surface.
 * The canvas takes no taps, because the page scrolls on top of it;
 * the fish listen on the window, so touching the water anywhere scares the ones under the finger.
 */
export default function StoryLagoon(props: StorySchoolProps) {
  return (
    <Canvas
      orthographic
      dpr={[1, 1.5]}
      camera={{ zoom: 80, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.NeutralToneMapping, powerPreference: 'low-power' }}
    >
      <Suspense fallback={null}>
        <StorySchool {...props} />
      </Suspense>
    </Canvas>
  );
}
