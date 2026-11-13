import { useRef, type RefObject } from 'react';
import type { Fish } from './fishBrain';
import { lineUp, type StoryState } from './storyBehavior';
import type { Bounds } from './school';

export function useStorySchool(scene?: RefObject<StoryState>, onCount?: (n: number) => void) {
  const chapter = useRef(-1);
  const currentSchool = useRef<Fish[] | null>(null);
  const currentBounds = useRef<Bounds | null>(null);
  const counted = useRef(new Set<Fish>());
  return {
    prepare(fish: Fish[], bounds: Bounds) {
      if (scene && (chapter.current !== scene.current.chapter || currentSchool.current !== fish || currentBounds.current !== bounds)) {
        currentSchool.current = fish;
        currentBounds.current = bounds;
        chapter.current = scene.current.chapter;
        fish.forEach((f) => { f.storyDelay = undefined; });
        if (chapter.current === 4) {
          lineUp(fish, bounds, scene.current);
          counted.current.clear();
          scene.current.crossed = 0;
          onCount?.(0);
        }
      }
    },
    crossed(f: Fish, bounds: Bounds) {
      if (scene?.current.chapter === 4 && f.x >= (bounds.minX + bounds.maxX) / 2 && !counted.current.has(f)) {
        counted.current.add(f);
        onCount?.(++scene.current.crossed);
      }
    },
    scaleFor(f: Fish, bounds: Bounds) {
      if (scene?.current.chapter === 4 && ((f.storyDelay ?? 0) > 0 || (counted.current.has(f) && f.x >= bounds.maxX - f.length * .56))) return 0;
      return f.length;
    },
  };
}
