import type { ReactNode } from 'react';

export interface Capsule {
  /** One or two characters, or a tiny icon, in the dark circle */
  mark: ReactNode;
  label: string;
  value?: string;
  /** A dark action pill at the end of the capsule */
  action?: string;
}

interface CapsuleRibbonProps {
  items: Capsule[];
  /** Run the strip the other way (for a second, stacked ribbon) */
  reverse?: boolean;
  label: string;
}

/**
 * White capsules that drift across the screen without an end (design.md activity ribbon).
 * Two copies of the track translate together; the copy is aria-hidden so a screen reader hears
 * the list once. It bleeds past both edges on purpose and pauses under a hovering pointer.
 */
export function CapsuleRibbon({ items, reverse = false, label }: CapsuleRibbonProps) {
  if (items.length === 0) return null;
  const track = (hidden: boolean) => (
    <ul className="ribbon-track" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <li key={`${item.label}-${i}`} className="capsule">
          <span className="capsule-mark">{item.mark}</span>
          <span className="capsule-label">{item.label}</span>
          {item.value && <span className="capsule-value number">{item.value}</span>}
          {item.action && <span className="capsule-action">{item.action}</span>}
        </li>
      ))}
    </ul>
  );
  return (
    <div className={`ribbon ${reverse ? 'ribbon-reverse' : ''}`} role="region" aria-label={label}>
      <div className="ribbon-move">
        {track(false)}
        {track(true)}
      </div>
    </div>
  );
}
