import type { ReactNode } from 'react';
import { TroutImage } from './TroutImage';

interface EmptyStateProps {
  title: string;
  hint: string;
  children?: ReactNode;
}

/** Nothing here yet: the trout, one plain sentence and, if there is one, the next action. */
export function EmptyState({ title, hint, children }: EmptyStateProps) {
  return (
    <div className="empty">
      <TroutImage width={132} className="empty-object" />
      <p>{title}</p>
      <p className="muted">{hint}</p>
      {children}
    </div>
  );
}
