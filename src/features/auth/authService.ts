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

export async function signUp(credentials: Required<Credentials>, pin: string): Promise<void> {
  const { deviceId } = await getApiConfig();
  const session = await registerOnServer(credentials, deviceId);
  await saveSession(session, pin);
  setAuthState({ status: 'signed_in', user: session.user });
}

/** Opens the saved session with the PIN. Works with no signal: nothing here calls the backend. */

export async function unlock(pin: string): Promise<boolean> {
  if (await unlockSession(pin)) {
    const stored = await loadSession();
    if (stored) setAuthState({ status: 'signed_in', user: stored.user });
    return true;
  }
  const stored = await loadSession();
  if (!stored || stored.failedUnlocks >= MAX_UNLOCK_TRIES) {
    await forgetSession();
    setAuthState({ status: 'signed_out' });
    return false;
  }
  setAuthState({ status: 'locked', user: stored.user, failedUnlocks: stored.failedUnlocks });
  return false;
}

/**
 * Signs out. The server is told when there is signal so a lost phone's token dies; without signal
 * the session is dropped from this phone anyway, which is what the caretaker asked for.
 */
