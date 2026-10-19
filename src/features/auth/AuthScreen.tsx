import type { ReactNode } from 'react';
import { Trout } from '../../shared/ui/Trout';

interface AuthScreenProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  /** La trucha grande solo en la primera pantalla; en el PIN estorbaría al teclado */
  mascot?: boolean;
}

/**
 * The frame of the three screens that come before the app: signing in, registering and the PIN.
 * They have no bottom navigation and no sync indicator on purpose, because none of that works
 * until there is someone signed in.
 */
export function AuthScreen({ title, subtitle, children, footer, mascot = true }: AuthScreenProps) {
  return (
    <main className="auth">
      <div className="auth-card">
        {mascot && <Trout className="trout-hero" width={260} title="Trucha arcoíris de La Cocha" />}
        <h1>{title}</h1>
        <p className="muted">{subtitle}</p>
        {children}
        {footer && <div className="auth-footer">{footer}</div>}
      </div>
    </main>
  );
}
