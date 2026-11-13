import { useEffect, useRef, useState, type RefObject } from 'react';
import type { StoryState } from '../../shared/three/fish/storyBehavior';
import { storyDescentPixels, storyRiverDrift, storyRiverTravel } from '../../shared/three/fish/storyViewport';
import { paintStoryWorld, STORY_DESKTOP } from './paintStoryWorld';

/** Native scrolling, six chapters, four diamonds. Geometry is read only on scroll or resize. */
export function useStoryProgress(root: RefObject<HTMLElement | null>) {
  const scene = useRef<StoryState>({ chapter: 0, progress: 0, crossed: 0 });
  const [chapter, setChapter] = useState(0);
  const requested = useRef<number | null>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const sections = root.current?.querySelectorAll<HTMLElement>('[data-chapter]');
      if (!sections) return;
      const header = root.current?.querySelector('.lg-header')?.getBoundingClientRect().bottom ?? 0;
      const bottom = root.current?.querySelector('.lg-progress')?.getBoundingClientRect().top ?? innerHeight;
      // A step counts as current once its top passes 40% of the visible water (at most 280px down)
      const middle = header + Math.min(280, (bottom - header) * .4);
      let active = 0, progress = 0;
      sections.forEach((section, i) => {
        const box = section.getBoundingClientRect();
        if (box.top <= middle) {
          active = i;
          progress = Math.min(1, Math.max(0, (middle - box.top) / box.height));
        }
      });
      if (scrollY < 4) active = 0;
      else if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) active = 5;
      if (requested.current !== null) active = requested.current;
      scene.current.chapter = active;
      scene.current.progress = progress;
      const hero = sections[0].getBoundingClientRect();
      const compact = root.current?.dataset.compact === 'true';
      const art = root.current?.querySelector('.lg-scene-art')?.getBoundingClientRect();
      const desktop = !compact && matchMedia(STORY_DESKTOP).matches;
      // Pixels scrolled since the story began; the drawing is driven by this, linearly, never by time
      const scrolled = header - hero.top;
      const distance = art?.height ? storyDescentPixels(art.width, art.height, desktop, hero.height) : Math.max(300, hero.height * .9);
      const descent = compact ? 0 : Math.min(1, Math.max(0, scrolled / distance));
      const remaining = document.documentElement.scrollHeight - innerHeight - distance;
      const drift = compact || !art?.height ? 0 : storyRiverDrift(scrolled - distance, remaining, storyRiverTravel(art.width, art.height, desktop));
      scene.current.descent = descent;
      scene.current.drift = drift;
      root.current?.style.setProperty('--lg-descent', String(descent));
      if (root.current) {
        paintStoryWorld(root.current, descent, drift);
        root.current.dataset.river = String(descent > .5);
        root.current.dataset.transition = String(descent > 0 && hero.bottom > header + 32);
      }
      setChapter(active);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const release = () => { requested.current = null; schedule(); };
    const key = (event: KeyboardEvent) => { if (['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' ','Tab'].includes(event.key)) release(); };
    update();
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    addEventListener('wheel', release, { passive: true });
    addEventListener('touchmove', release, { passive: true });
    addEventListener('keydown', key);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener('scroll', schedule); removeEventListener('resize', schedule);
      removeEventListener('wheel', release); removeEventListener('touchmove', release); removeEventListener('keydown', key);
    };
  }, [root]);
  const go = (step: number) => {
    const section = root.current?.querySelector<HTMLElement>(`[data-chapter="${step}"]`);
    const header = root.current?.querySelector('.lg-header')?.getBoundingClientRect().bottom ?? 0;
    if (section) {
      requested.current = step;
      scene.current.chapter = step;
      setChapter(step);
      const top = scrollY + section.getBoundingClientRect().top - header - 16;
      scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }
    section?.focus({ preventScroll: true });
  };
  return { scene, chapter, go };
}
