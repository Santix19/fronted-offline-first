import { useSyncExternalStore } from 'react';
import { getMeta, setMeta } from '../db/repository';

/**
 * Which palette the app paints. Light is the default because the app lives outdoors, under the sun
 * at the lagoon, where it reads best. "auto" follows the phone and dark is easier indoors at night;
 * both are one tap away in Ajustes.
 */
export type Theme = 'auto' | 'light' | 'dark';

export const THEME_LABELS: Record<Theme, string> = {
  auto: 'Como el celular',
  light: 'Claro (para el sol)',
  dark: 'Oscuro',
};

const KEY = 'theme';

let theme: Theme = 'light';
const listeners = new Set<() => void>();

/** "auto" leaves no attribute, so the media query in tokens.css is the one that decides. */
function paint(next: Theme): void {
  const root = document.documentElement;
  if (next === 'auto') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', next);
}

export async function loadTheme(): Promise<void> {
  const saved = await getMeta<Theme>(KEY);
  theme = saved ?? 'light';
  paint(theme);
  listeners.forEach((listener) => listener());
}

export async function setTheme(next: Theme): Promise<void> {
  theme = next;
  paint(next);
  listeners.forEach((listener) => listener());
  await setMeta(KEY, next);
}

const DARK_QUERY = '(prefers-color-scheme: dark)';

/**
 * Whether the screen is painted dark right now: chosen in Ajustes, or "auto" on a phone set to dark.
 * For what CSS cannot reach, like the 3D lagoon's colours.
 */
export function useDarkPalette(): boolean {
  const chosen = useTheme();
  const systemDark = useSyncExternalStore(
    (listener) => {
      const query = window.matchMedia(DARK_QUERY);
      query.addEventListener('change', listener);
      return () => query.removeEventListener('change', listener);
    },
    () => window.matchMedia(DARK_QUERY).matches,
  );
  return chosen === 'dark' || (chosen === 'auto' && systemDark);
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
