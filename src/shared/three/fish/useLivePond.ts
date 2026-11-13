import { useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from '../../motion/reducedMotion';

let webglSupported: boolean | undefined;
function canDraw(): boolean {
  if (webglSupported !== undefined) return webglSupported;
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    const supported = Boolean(context);
    context?.getExtension('WEBGL_lose_context')?.loseContext();
    return (webglSupported = supported);
  } catch {
    return false;
  }
}

const savesData = () => Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);

/**
 * Whether this phone should get the live trout at all. They are decoration, so every doubt says no:
 * reduced motion, data saver, no WebGL. And never before the screen itself is drawn and idle.
 * This file must not import three.js: it runs in the main bundle to decide whether to download it.
 */
export function useLivePond(): boolean {
  const reduced = useReducedMotion();
  const supported = useMemo(canDraw, []);
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    const start = () => setIdle(true);
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(start, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(start, 1200);
    return () => clearTimeout(id);
  }, []);
  return idle && !reduced && !savesData() && supported;
}
