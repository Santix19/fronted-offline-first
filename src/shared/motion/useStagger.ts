import type { RefObject } from 'react';
import { duration, ease, staggerDelay } from './presets';
import { useGsap } from './useGsap';

/**
 * Children of a container slide up a few pixels as they appear, one after another.
 * Only the children present on arrival move; the total wait is capped by staggerDelay.
 */
export function useStagger(scope: RefObject<HTMLElement | null>, deps: unknown[] = []): void {
  useGsap(
    scope,
    (g, reduced) => {
      const items = scope.current ? Array.from(scope.current.children) : [];
      if (reduced || items.length === 0) return;
      g.from(items, {
        opacity: 0,
        y: 10,
        duration: duration.panel,
        ease: ease.out,
        delay: (i: number) => staggerDelay(i),
        clearProps: 'opacity,transform',
      });
    },
    deps,
  );
}
