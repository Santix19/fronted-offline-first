import type { ReactNode } from 'react';

/**
 * The app's own line icons (design.md: one stroke of 2.2 px, round ends, no fills, never emoji).
 * They take the colour of the text around them, so they follow the light and dark themes for free.
 */
const PATHS = {
  back: <path d="M15 5l-7 7 7 7" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  bell: <path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4l2-2zM10 21h4" />,
  drop: <path d="M12 3c3 4.5 6 7.6 6 11a6 6 0 0 1-12 0c0-3.4 3-6.5 6-11z" />,
  thermo: <path d="M10 5a2 2 0 0 1 4 0v9.2a4 4 0 1 1-4 0zM12 9v7" />,
  fish: <path d="M3 12c3-4.5 9-5.5 13-1l4-3-1 4 1 4-4-3c-4 4.5-10 3.5-13-1zM8 11.5v.01" />,
  cloud: <path d="M7 18a4 4 0 0 1 .5-8 5.5 5.5 0 0 1 10.5 1.5A3.3 3.3 0 0 1 17.5 18zM12 12v4M10 14l2-2 2 2" />,
  pond: <path d="M3 9c3-3 6 3 9 0s6 3 9 0M3 15c3-3 6 3 9 0s6 3 9 0" />,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 24 }: { name: IconName; size?: number }) {
  return (
    <svg className="icon-line" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}

export const ICON_NAMES = Object.keys(PATHS) as IconName[];
