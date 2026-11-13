import { createContext, useContext, useRef, type ReactNode } from 'react';
import { useStagger } from '../motion/useStagger';
import { Icon } from './icons';
import { MaskedText } from './MaskedText';
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
  const content = useRef<HTMLDivElement>(null);
  useStagger(content);
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
      <main className="content">
        {/* key: the words rise again whenever the screen changes */}
        <h1 className="page-title" key={title}>
          <MaskedText text={title} />
        </h1>
        <div className="content-body" ref={content}>{children}</div>
      </main>
    </>
  );
}
