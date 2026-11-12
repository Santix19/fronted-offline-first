import { flushSync } from 'react-dom';
import { prefersReducedMotion } from './reducedMotion';

interface Transition {
  ready: Promise<void>;
  finished: Promise<void>;
  updateCallbackDone: Promise<void>;
}
type Doc = Document & { startViewTransition?: (update: () => void) => Transition };

/**
 * Run a state change inside a same-document View Transition so the old screen dissolves into the new one.
 * Browsers without the API, and phones asking for less motion, just apply the change.
 */
export function withViewTransition(update: () => void): void {
  const doc = document as Doc;
  if (!doc.startViewTransition || prefersReducedMotion()) {
    update();
    return;
  }
  const transition = doc.startViewTransition(() => flushSync(update));
  // Navigating again mid-transition skips the old one and rejects its promises. That is normal, not an error.
  for (const promise of [transition.ready, transition.finished, transition.updateCallbackDone]) promise.catch(() => {});
}
