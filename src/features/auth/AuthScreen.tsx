import type { ReactNode } from 'react';
import { LiveBackdrop } from '../../shared/ui/LiveBackdrop';
import { TroutImage } from '../../shared/ui/TroutImage';
import { MaskedText } from '../../shared/ui/MaskedText';

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
      <LiveBackdrop />
      {mascot && (
        <div className="auth-objects" aria-hidden="true">
          <TroutImage width={240} className="float auth-fish" />
        </div>
      )}
      <div className="auth-card cut-corner">
        <h1 className="auth-title">
          <MaskedText text={title} mode="chars" />
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
