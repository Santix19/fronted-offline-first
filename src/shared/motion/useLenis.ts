import { useEffect } from 'react';
import Lenis from 'lenis';
import { ScrollTrigger, setupGsap } from './gsapSetup';
import { prefersReducedMotion } from './reducedMotion';

/** Smooth scroll that keeps ScrollTrigger in sync. Off entirely under reduced motion. */
export function useLenis(enabled = true): void {
  useEffect(() => {
    if (!enabled || prefersReducedMotion()) return;
    const g = setupGsap();
    const lenis = new Lenis({ lerp: 0.09 });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    g.ticker.add(tick);
    g.ticker.lagSmoothing(0);
    return () => {
      g.ticker.remove(tick);
      lenis.destroy();
    };
  }, [enabled]);
}
