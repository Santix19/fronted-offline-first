import type { gsap } from 'gsap';
import { ScrollTrigger } from '../../shared/motion/gsapSetup';
import { ease } from '../../shared/motion/presets';
import { addRoute } from './routeTimeline';

type G = typeof gsap;
const CHAPTERS = ['.ch-lake', '.ch-write', '.ch-save', '.ch-sync', '.ch-route', '.ch-count', '.ch-enter'];

/**
 * One chapter leaves through a diagonal wipe while the next rises; then the new heading's words
 * jump up tilted out of their masks and its glossy object drops in spinning.
 */
function swap(tl: gsap.core.Timeline, from: string, to: string, at: number): void {
  const has = (selector: string) => document.querySelector(selector) !== null;
  tl.to(from, { autoAlpha: 0, yPercent: -12, scale: 0.94, duration: 0.5 }, at);
  tl.fromTo(
    to,
    { autoAlpha: 0, yPercent: 10, clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' },
    { autoAlpha: 1, yPercent: 0, clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', duration: 0.6, ease: ease.out },
    at + 0.3,
  );
  if (has(`${to} .mask-word`)) tl.from(`${to} .mask-word > span`, { yPercent: 120, rotate: 10, transformOrigin: '0% 100%', stagger: 0.06, duration: 0.5, ease: ease.out }, at + 0.45);
  if (has(`${to} .glossy`)) tl.from(`${to} .glossy`, { y: 90, rotate: -40, scale: 0.5, autoAlpha: 0, duration: 0.7, ease: 'back.out(2)' }, at + 0.5);
}

/**
 * The whole story as ONE timeline pinned to the scroll: 5 screens of scrolling, which is about
 * 7 swipes on a phone. One timeline (not six triggers) keeps the chapters in lockstep.
 */
export function buildStory(g: G, root: HTMLElement): void {
  const stage = root.querySelector('.story-stage');
  const tl = g.timeline({
    defaults: { ease: ease.fluid },
    scrollTrigger: { trigger: stage, start: 'top top', end: '+=520%', scrub: 0.6, pin: true, anticipatePin: 1 },
  });

  g.set(CHAPTERS.slice(1), { autoAlpha: 0 });
  g.set('.story-phone', { autoAlpha: 0, y: 60 });
  g.set('.story-backing', { autoAlpha: 0 });
  g.set('.chip-done, .signal-on', { autoAlpha: 0 });
  g.set('.story-queue', { textContent: 3 });
  g.set('.diagram-dot', { autoAlpha: 0 });

  // The poster headline tips back and lifts away as the first scroll begins
  tl.to('.ch-lake .display', { yPercent: -20, rotate: -4, duration: 1, ease: 'none' }, 0);
  swap(tl, '.ch-lake', '.ch-write', 1);
  tl.fromTo('.story-phone', { rotate: -14, scale: 0.8 }, { autoAlpha: 1, y: 0, rotate: -4, scale: 1, duration: 0.7, ease: ease.out }, 1.4);
  tl.fromTo('.story-backing', { autoAlpha: 0, scale: 0.6, rotate: 20 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.7, ease: ease.out }, 1.3);
  swap(tl, '.ch-write', '.ch-save', 2.4);
  swap(tl, '.ch-save', '.ch-sync', 3.6);
  tl.to('.signal-off', { autoAlpha: 0, duration: 0.2 }, 3.9);
  tl.to('.signal-on', { autoAlpha: 1, duration: 0.2 }, 3.9);
  tl.to('.chip-wait', { autoAlpha: 0, duration: 0.2 }, 4.4);
  tl.to('.chip-done', { autoAlpha: 1, duration: 0.2 }, 4.4);
  tl.to('.story-queue', { textContent: 0, snap: { textContent: 1 }, duration: 0.8 }, 4.1);

  tl.to('.story-phone', { autoAlpha: 0, y: -80, rotate: 8, duration: 0.5 }, 5);
  tl.to('.story-backing', { autoAlpha: 0, scale: 1.4, rotate: -20, duration: 0.5 }, 5);
  swap(tl, '.ch-sync', '.ch-route', 4.9);
  addRoute(tl, root, 5.4);
  swap(tl, '.ch-route', '.ch-count', 7.1);
  const total = { n: 0 };
  tl.to(total, { n: 148, duration: 1, onUpdate: () => {
    root.querySelector('.story-total')!.textContent = String(Math.round(total.n));
  } }, 7.6);
  swap(tl, '.ch-count', '.ch-enter', 8.8);
  tl.fromTo('.story-progress-bar', { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: 9.4 }, 0);
  // The serif and mono load after first paint and change line breaks: measure the pin again once they are in
  void document.fonts?.ready.then(() => ScrollTrigger.refresh());
}
