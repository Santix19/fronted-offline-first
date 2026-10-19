import { getApiConfig } from '../../shared/http/apiConfig';
import { loginOnServer, logoutOnServer, registerOnServer, type Credentials } from './authApi';
import { forgetSession, hasExpired, loadSession, saveSession, unlockSession } from './authRepository';
import { setAuthState } from './authStatus';
import { MAX_UNLOCK_TRIES } from './authTypes';

/**
 * The whole story of who is signed in: opening a session against the backend, keeping it on the
 * phone under a PIN, and unlocking it later with or without signal. The facade is the only caller.
 */

/** Runs when the app starts: decides whether to show the PIN, the sign-in, or go straight in. */

export async function restoreSession(): Promise<void> {
  const stored = await loadSession();
  if (!stored) return setAuthState({ status: 'signed_out' });
  if (hasExpired(stored) || stored.failedUnlocks >= MAX_UNLOCK_TRIES) {
    // Too many wrong tries or an expired session: the token on this phone is useless either way
    await forgetSession();
    return setAuthState({ status: 'signed_out' });
  }
  setAuthState({ status: 'locked', user: stored.user, failedUnlocks: stored.failedUnlocks });
}

export async function signIn(credentials: Credentials, pin: string): Promise<void> {
  const { deviceId } = await getApiConfig();
  const session = await loginOnServer(credentials, deviceId);
  await saveSession(session, pin);
  setAuthState({ status: 'signed_in', user: session.user });
}
