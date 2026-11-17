import type { ReactNode } from 'react';

const base = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;

/** Four line icons in one stroke weight. The wave is the water of the ponds; the others are plain on purpose. */
export const NAV_ICONS: Record<string, ReactNode> = {
  ponds: (
    <svg {...base}>
      <path d="M2 8c2.5-2 4.5-2 7 0s4.5 2 7 0 4-2 6 0" />
      <path d="M2 14c2.5-2 4.5-2 7 0s4.5 2 7 0 4-2 6 0" />
      <path d="M2 20c2.5-2 4.5-2 7 0s4.5 2 7 0 4-2 6 0" />
    </svg>
  ),
  alerts: (
    <svg {...base}>
      <path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  ),
  sync: (
    <svg {...base}>
      <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.7M20 4v4.7h-4.7" />
      <path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.3M4 20v-4.7h4.7" />
    </svg>
  ),
  settings: (
    <svg {...base}>
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="8" cy="17" r="2" />
    </svg>
  ),
};
