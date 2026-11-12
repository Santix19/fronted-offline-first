import type { gsap } from 'gsap';
import { addRoute } from './routeTimeline';

type G = typeof gsap;
const CHAPTERS = ['.ch-lake', '.ch-write', '.ch-save', '.ch-sync', '.ch-route', '.ch-count', '.ch-enter'];

/** Cross-fade one chapter into the next at a position on the master timeline. */
function swap(tl: gsap.core.Timeline, from: string, to: string, at: number): void {
  tl.to(from, { autoAlpha: 0, yPercent: -8, duration: 0.5 }, at);
  tl.fromTo(to, { autoAlpha: 0, yPercent: 8 }, { autoAlpha: 1, yPercent: 0, duration: 0.5 }, at + 0.35);
}

/**
 * The whole story as ONE timeline pinned to the scroll: 5 screens of scrolling, which is about
 * 7 swipes on a phone. One timeline (not six triggers) keeps the chapters in lockstep.
 */
export function buildStory(g: G, root: HTMLElement): void {
  const stage = root.querySelector('.story-stage');
  const tl = g.timeline({
    defaults: { ease: 'power1.inOut' },
    scrollTrigger: { trigger: stage, start: 'top top', end: '+=520%', scrub: 0.6, pin: true, anticipatePin: 1 },
  });

  g.set(CHAPTERS.slice(1), { autoAlpha: 0 });
  g.set('.story-phone', { autoAlpha: 0, y: 40 });
  g.set('.chip-done, .signal-on', { autoAlpha: 0 });
  g.set('.story-queue', { textContent: 3 });
  g.set('.diagram-dot', { autoAlpha: 0 });

  tl.to('.story-fish', { yPercent: -40, stagger: 0.15, duration: 1.2, ease: 'none' }, 0);
  swap(tl, '.ch-lake', '.ch-write', 1);
  tl.to('.story-phone', { autoAlpha: 1, y: 0, duration: 0.6 }, 1.4);
  swap(tl, '.ch-write', '.ch-save', 2.4);
  swap(tl, '.ch-save', '.ch-sync', 3.6);
  tl.to('.signal-off', { autoAlpha: 0, duration: 0.2 }, 3.9);
  tl.to('.signal-on', { autoAlpha: 1, duration: 0.2 }, 3.9);
  tl.to('.chip-wait', { autoAlpha: 0, duration: 0.2 }, 4.4);
  tl.to('.chip-done', { autoAlpha: 1, duration: 0.2 }, 4.4);
  tl.to('.story-queue', { textContent: 0, snap: { textContent: 1 }, duration: 0.8 }, 4.1);

  tl.to('.story-phone', { autoAlpha: 0, y: -40, duration: 0.5 }, 5);
  swap(tl, '.ch-sync', '.ch-route', 4.9);
  addRoute(tl, root, 5.4);
  swap(tl, '.ch-route', '.ch-count', 7.1);
  const total = { n: 0 };
  tl.to(total, { n: 148, duration: 1, onUpdate: () => {
    root.querySelector('.story-total')!.textContent = String(Math.round(total.n));
  } }, 7.6);
  swap(tl, '.ch-count', '.ch-enter', 8.8);
  tl.fromTo('.story-progress-bar', { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: 9.4 }, 0);
}
