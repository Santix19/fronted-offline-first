import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { sampleFrame } from './frameSample';

/** Ignore warm-up and hidden tabs; turn decoration off below 28 fps. Shared by both ponds. */
export function FrameBudget({ onSlow }: { onSlow: () => void }) {
  const sample = useRef({ frames: 0, elapsed: 0 });
  useFrame((_, dt) => {
    if (sampleFrame(sample.current, dt, document.hidden)) onSlow();
  });
  return null;
}
