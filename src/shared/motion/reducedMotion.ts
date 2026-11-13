import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/** The CSS kill switch stops feedback motion; this also prevents starting a 3D pond. */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(QUERY).matches;
}

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

/** Reactive version: components re-render if the setting flips while the app is open. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => false);
}
