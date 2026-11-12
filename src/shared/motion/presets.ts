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

const STAGGER_STEP = 0.06;
const STAGGER_CAP = 6;

/** Delay for the nth item of a list. Capped so a long list never makes the caretaker wait. */
export function staggerDelay(index: number): number {
  return Math.min(index, STAGGER_CAP) * STAGGER_STEP;
}
