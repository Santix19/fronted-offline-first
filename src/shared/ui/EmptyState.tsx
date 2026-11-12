import type { ReactNode } from 'react';
import { Trout } from './Trout';

interface EmptyStateProps {
  title: string;
  hint: string;
  children?: ReactNode;
}

/** Nothing here yet: a lone trout drifting, one plain sentence and, if there is one, the next action. */
export function EmptyState({ title, hint, children }: EmptyStateProps) {
  return (
    <div className="empty">
      <Trout className="empty-trout" width={96} />
      <p>{title}</p>
      <p className="muted">{hint}</p>
      {children}
    </div>
  );
}
