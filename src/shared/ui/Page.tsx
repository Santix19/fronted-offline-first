import { createContext, useContext, type ReactNode } from 'react';
import { goBack } from './router';

/**
 * What the app shell shows on the right side of every top bar (the connection state).
 * Passed through context so shared/ does not depend on any feature folder.
 */
export const TopBarExtra = createContext<ReactNode>(null);

interface PageProps {
  title: string;
  /** Where "back" goes when there is no history (opened from a shortcut) */
  backTo?: string;
  children: ReactNode;
}

/** Frame of every screen: top bar with title, optional back button and the connection state. */
export function Page({ title, backTo, children }: PageProps) {
  const extra = useContext(TopBarExtra);
  return (
    <>
      <header className="top-bar">
        {backTo && (
          <button className="back" onClick={() => goBack(backTo)} aria-label="Volver">
            ‹
          </button>
        )}
        <h1>{title}</h1>
        {extra}
      </header>
      <main className="content">{children}</main>
    </>
  );
}
