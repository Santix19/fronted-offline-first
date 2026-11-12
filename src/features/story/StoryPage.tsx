import { useRef } from 'react';
import { useGsap } from '../../shared/motion/useGsap';
import { useLenis } from '../../shared/motion/useLenis';
import { useReducedMotion } from '../../shared/motion/reducedMotion';
import { CountChapter, EnterChapter, LakeChapter, SaveChapter, SyncChapter, WriteChapter } from './StoryChapters';
import { StoryPhone } from './StoryPhone';
import { buildStory } from './storyTimeline';

/**
 * "La laguna, sin señal": how the app works with no signal, told as one pinned scroll.
 * It is public on purpose (before signing in), so the first thing a new caretaker can do is understand.
 * Under reduced motion nothing pins: the chapters stack and the phone shows how it ends.
 */
export function StoryPage() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useLenis(!reduced);

  useGsap(
    root,
    (g, isReduced) => {
      if (!isReduced && root.current) buildStory(g, root.current);
    },
    [reduced],
  );

  return (
    <div ref={root} className={`story ${reduced ? 'story-static' : 'story-pinned'}`}>
      <div className="story-progress" aria-hidden="true">
        <div className="story-progress-bar" />
      </div>
      <div className="story-stage">
        <LakeChapter />
        <WriteChapter />
        <SaveChapter />
        <SyncChapter />
        <StoryPhone />
        <CountChapter />
        <EnterChapter />
      </div>
      <a className="story-skip" href="#/">Saltar</a>
    </div>
  );
}
