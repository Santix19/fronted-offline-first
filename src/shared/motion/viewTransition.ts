import { flushSync } from 'react-dom';
import { prefersReducedMotion } from './reducedMotion';

type Doc = Document & { startViewTransition?: (update: () => void) => unknown };

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
  doc.startViewTransition(() => flushSync(update));
}
