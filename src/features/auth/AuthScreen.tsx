import type { ReactNode } from 'react';

interface AuthScreenProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * The frame of the three screens that come before the app: signing in, registering and the PIN.
 * They have no bottom navigation and no sync indicator on purpose, because none of that works
 * until there is someone signed in.
 */
