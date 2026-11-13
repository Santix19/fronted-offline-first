import { useEffect, useState, type ReactNode } from 'react';
import { facade } from '../../facade/PisciculturaFacade';
import { StoryPage } from '../story/StoryPage';
import { loadStorySeen, useStorySeen } from '../story/storySeen';
import { getAuthState, useAuthState } from './authStatus';
import { ChangePasswordPage } from './ChangePasswordPage';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { UnlockPage } from './UnlockPage';
import { LoadingState } from '../../shared/ui/LoadingState';

/**
 * What the caretaker sees before the app: nothing while it is working out who is there, the PIN
 * when there is a session on this phone, and signing in or registering when there is not.
 *
 * The rest of the app only ever renders with someone signed in, so no screen below has to wonder.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const auth = useAuthState();
  const [registering, setRegistering] = useState(false);
  const storySeen = useStorySeen();

  useEffect(() => {
    // Only at start-up. Watching the story from Ajustes unmounts this gate, and coming back must not
    // lock a session that is already open
    if (getAuthState().status === 'loading') void facade.restoreSession();
    void loadStorySeen();
  }, []);

  switch (auth.status) {
    case 'loading':
      return <main className="auth"><LoadingState label="Abriendo La Cocha…" /></main>;
    case 'locked':
      return <UnlockPage user={auth.user} failedUnlocks={auth.failedUnlocks} />;
    case 'must_change_password':
      return <ChangePasswordPage user={auth.user} />;
    case 'signed_out':
      // Nothing until we know whether the story was watched: no flash of the login behind it
      if (storySeen === undefined) return <main className="auth"><LoadingState label="Abriendo La Cocha…" /></main>;
      // First time on this phone: the story comes before signing in or registering
      if (!storySeen) return <StoryPage />;
      return registering ? (
        <RegisterPage onLogin={() => setRegistering(false)} />
      ) : (
        <LoginPage onRegister={() => setRegistering(true)} />
      );
    case 'signed_in':
      return <>{children}</>;
  }
}
