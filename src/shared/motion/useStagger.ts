import type { RefObject } from 'react';
import { loud } from './presets';
import { useGsap } from './useGsap';

const LOUD_CAP = 6;

/**
 * Children of a container rise from a slight tilt, one after another (the loud card preset).
 * Only the first few are staggered; the rest arrive with the last one so a long list never waits.
 */
export function useStagger(scope: RefObject<HTMLElement | null>, deps: unknown[] = []): void {
  useGsap(
    scope,
    (g, reduced) => {
      const items = scope.current ? Array.from(scope.current.children) : [];
      if (reduced || items.length === 0) return;
      g.from(items, {
        ...loud.card,
        stagger: undefined,
        delay: (i: number) => Math.min(i, LOUD_CAP) * loud.card.stagger,
        clearProps: 'opacity,visibility,transform',
      });
    },
    deps,
  );
}
