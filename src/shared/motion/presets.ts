/**
 * The motion vocabulary of the app, in seconds for GSAP. The same values live as CSS variables in
 * tokens.css; keep both in step. One curve, a few speeds: every screen should move like the same water.
 */
export const ease = {
  /** Confident arrival: fast start, long settle */
  out: 'expo.out',
  /** Shared elements and pills that glide between places */
  fluid: 'power3.inOut',
  /** Exits: quicker than entrances, never dramatic */
  in: 'power2.in',
} as const;

export const duration = {
  micro: 0.12,
  state: 0.22,
  panel: 0.42,
  reveal: 0.64,
} as const;

const STAGGER_STEP = 0.04;
const STAGGER_CAP = 5;

/** Delay for the nth item of a list. Capped so a long list never makes the caretaker wait. */
export function staggerDelay(index: number): number {
  return Math.min(index, STAGGER_CAP) * STAGGER_STEP;
}

/**
 * The loud vocabulary (design.md, 2026-11-12): arrivals are big, tilted and long-tailed; taps stay quick.
 * Every heading, backdrop and object reads from here, so nobody writes an ad hoc animation.
 */
export const loud = {
  /** A heading's words rise tilted through their masks */
  words: { yPercent: 120, rotate: 8, transformOrigin: '0% 100%', duration: 0.95, ease: 'expo.out', stagger: 0.06 },
  /** Poster headlines: every letter jumps in from below with a small overshoot */
  chars: { yPercent: 130, rotate: -12, scaleY: 1.4, transformOrigin: '50% 100%', duration: 1.1, ease: 'expo.out', stagger: 0.025 },
  /** Cards and art panels open through a diagonal clip */
  clip: {
    clipPath: 'polygon(0% 100%, 0% 100%, 0% 100%, 0% 100%)',
    duration: 0.75,
    ease: 'expo.out',
  },
  /** Glossy objects drop in with a spin and settle. Loud brief (2026-11-12) wants toy-like bounce: avoid-ai-design-ignore: M4 */
  object: { y: 80, rotate: -25, scale: 0.6, autoAlpha: 0, duration: 1.2, ease: 'elastic.out(1, 0.6)' },
  /** List items and cards: up from a tilt, staggered */
  card: { y: 48, rotate: 2, autoAlpha: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08 },
} as const;
