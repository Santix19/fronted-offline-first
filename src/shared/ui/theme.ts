import { useSyncExternalStore } from 'react';
import { getMeta, setMeta } from '../db/repository';

/**
 * Which palette the app paints. "auto" follows the phone, which is the sensible default; the other
 * two exist because the right answer changes with where the caretaker is standing: under the sun
 * at the lagoon the light one reads better, and indoors at night the dark one is easier.
 */
export type Theme = 'auto' | 'light' | 'dark';

export const THEME_LABELS: Record<Theme, string> = {
  auto: 'Como el celular',
  light: 'Claro (para el sol)',
  dark: 'Oscuro',
};

const KEY = 'theme';

let theme: Theme = 'auto';
const listeners = new Set<() => void>();

/** "auto" leaves no attribute, so the media query in tokens.css is the one that decides. */
function paint(next: Theme): void {
  const root = document.documentElement;
  if (next === 'auto') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', next);
}

export async function loadTheme(): Promise<void> {
  const saved = await getMeta<Theme>(KEY);
  if (saved) {
    theme = saved;
    paint(saved);
    listeners.forEach((listener) => listener());
  }
}

export async function setTheme(next: Theme): Promise<void> {
  theme = next;
  paint(next);
  listeners.forEach((listener) => listener());
  await setMeta(KEY, next);
}

export function useTheme(): Theme {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => theme,
  );
}
