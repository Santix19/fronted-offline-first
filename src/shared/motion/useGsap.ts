import { useLayoutEffect, type RefObject } from 'react';
import type { gsap } from 'gsap';
import { setupGsap } from './gsapSetup';
import { prefersReducedMotion } from './reducedMotion';

/**
 * Run GSAP code scoped to a container and clean it all up on unmount.
 * Under reduced motion the callback gets `reduced = true` so it can jump straight to the end state.
 */
export function useGsap(
  scope: RefObject<Element | null>,
  build: (g: typeof gsap, reduced: boolean) => void,
  deps: unknown[] = [],
): void {
  useLayoutEffect(() => {
    const g = setupGsap();
    const context = g.context(() => build(g, prefersReducedMotion()), scope);
    return () => context.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
