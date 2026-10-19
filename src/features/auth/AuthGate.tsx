import { useEffect, useState, type ReactNode } from 'react';
import { facade } from '../../facade/PisciculturaFacade';
import { useAuthState } from './authStatus';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { UnlockPage } from './UnlockPage';

/**
 * What the caretaker sees before the app: nothing while it is working out who is there, the PIN
 * when there is a session on this phone, and signing in or registering when there is not.
 *
 * The rest of the app only ever renders with someone signed in, so no screen below has to wonder.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const auth = useAuthState();
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    void facade.restoreSession();
  }, []);

  switch (auth.status) {
    case 'loading':
      return null;
    case 'locked':
      return <UnlockPage user={auth.user} failedUnlocks={auth.failedUnlocks} />;
    case 'signed_out':
      return registering ? (
        <RegisterPage onLogin={() => setRegistering(false)} />
      ) : (
        <LoginPage onRegister={() => setRegistering(true)} />
      );
    case 'signed_in':
      return <>{children}</>;
  }
}
