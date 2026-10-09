import type { StoreName } from './database';

/**
 * Tiny publish/subscribe: every write announces which store changed, and the screens that read
 * that store refresh themselves (see useLiveQuery). No external library needed.
 */
type Listener = (store: StoreName) => void;

const listeners = new Set<Listener>();

export function notifyChange(store: StoreName): void {
  listeners.forEach((listener) => listener(store));
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
