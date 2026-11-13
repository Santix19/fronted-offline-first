import { useLayoutEffect, type RefObject } from 'react';
import { paintStoryWorld } from './paintStoryWorld';
import type { StoryState } from '../../shared/three/fish/storyBehavior';

/** Text enlargement yields the picture's sticky space, without user-agent or device guesses. */
export function useStoryLayout(root: RefObject<HTMLElement | null>, sceneState: RefObject<StoryState>) {
  useLayoutEffect(() => {
    const measure = () => {
      if (root.current) root.current.dataset.compact = String(parseFloat(getComputedStyle(document.documentElement).fontSize) > 22);
      if (root.current) {
        if (root.current.dataset.compact === 'true') { sceneState.current.descent = 0; sceneState.current.drift = 0; }
        paintStoryWorld(root.current, sceneState.current.descent ?? 0, sceneState.current.drift ?? 0);
      }
    };
    const observer = new ResizeObserver(measure);
    observer.observe(document.documentElement);
    const scene = root.current?.querySelector('.lg-scene-art');
    if (scene) observer.observe(scene);
    measure();
    return () => observer.disconnect();
  }, [root, sceneState]);
}
