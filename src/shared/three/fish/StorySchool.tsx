import { useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { FishSchool } from './FishSchool';
import { TROUT_MODELS } from './loadTrout';
import { createSwimUniforms } from './swimShader';
import { TroutStudio } from './TroutStudio';
import { DEFAULT_TUNING } from './tuning';
import { visibleWater } from './waterPlane';

// The sheet of water leans towards the camera, so the school is seen from above and a little ahead
const SPACE = new THREE.Matrix4().makeRotationX(THREE.MathUtils.degToRad(52));

/**
 * The school behind the story. The canvas there takes no taps (the copy is on top of it), so the
 * fish listen on the window: touching anywhere on the page scares the ones under the finger.
 */
export function StorySchool({ narrow }: { narrow: boolean }) {
  const { camera, size } = useThree();
  const uniforms = useMemo(createSwimUniforms, []);
  const bounds = useMemo(() => {
    camera.updateMatrixWorld();
    return visibleWater(camera, SPACE);
  }, [camera, size.width, size.height]);
  const length = Math.round(Math.min(1.5, (bounds.maxX - bounds.minX) / (narrow ? 3.2 : 6.5)) * 100) / 100;
  return (
    <>
      <TroutStudio intensity={0.35} />
      <group matrix={SPACE} matrixAutoUpdate={false}>
        <FishSchool
          model={narrow ? TROUT_MODELS.small : TROUT_MODELS.full}
          count={narrow ? 7 : 12}
          length={length}
          bounds={bounds}
          tuning={DEFAULT_TUNING}
          uniforms={uniforms}
          shadows={false}
          space={SPACE}
          listenOn="window"
        />
      </group>
    </>
  );
}
