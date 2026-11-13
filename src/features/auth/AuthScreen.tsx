import type { ReactNode } from 'react';
import { TroutImage } from '../../shared/ui/TroutImage';

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
      {mascot && (
        <div className="auth-objects" aria-hidden="true">
          <TroutImage width={240} className="auth-fish" />
        </div>
      )}
      <div className="auth-card">
        <h1 className="auth-title">
          {title}
        </h1>
        <p className="muted">{subtitle}</p>
        {children}
        {footer && <div className="auth-footer">{footer}</div>}
        {mascot && (
          <p className="auth-story">
            <a className="link" href="#/historia">Ver cómo funciona sin señal</a>
          </p>
        )}
      </div>
    </main>
  );
}
