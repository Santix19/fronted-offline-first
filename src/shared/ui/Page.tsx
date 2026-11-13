import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { Icon } from './icons';
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
  wide?: boolean;
  /** How the screen arranges itself on a wide screen (responsive.css); phones stack it as always */
  layout?: 'cards' | 'sync' | 'settings';
}

/** Frame of every screen: top bar with title, optional back button and the connection state. */
export function Page({ title, backTo, children, wide = false, layout }: PageProps) {
  const extra = useContext(TopBarExtra);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, [title]);
  return (
    <>
      <header className="top-bar">
        {backTo && (
          <button className="back" onClick={() => goBack(backTo)} aria-label="Volver">
            <Icon name="back" />
          </button>
        )}
        <span className="wordmark" aria-hidden="true">La Cocha</span>
        {extra}
      </header>
      <main id="contenido" tabIndex={-1} className={`content${wide ? ' content-wide' : ''}${layout ? ` page-${layout}` : ''}`}>
        <h1 className="page-title" ref={heading} tabIndex={-1}>{title}</h1>
        <div className="content-body">{children}</div>
      </main>
    </>
  );
}
