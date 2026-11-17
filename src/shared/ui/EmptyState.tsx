import type { ReactNode } from 'react';
import { GlossyObject, type ObjectColor, type ObjectKind } from './GlossyObject';

interface EmptyStateProps {
  title: string;
  hint: string;
  children?: ReactNode;
  object?: ObjectKind;
  color?: ObjectColor;
}

/** Nothing here yet: one glossy object floating, one plain sentence and, if there is one, the next action. */
export function EmptyState({ title, hint, children, object = 'fish', color = 'blue' }: EmptyStateProps) {
  return (
    <div className="empty">
      <GlossyObject kind={object} color={color} size={120} tilt={-12} className="float empty-object" />
      <p>{title}</p>
      <p className="muted">{hint}</p>
      {children}
    </div>
  );
}
