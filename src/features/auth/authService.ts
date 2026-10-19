import { getApiConfig } from '../../shared/http/apiConfig';
import { onSessionRejected } from '../../shared/http/sessionToken';
import { changePasswordOnServer, loginOnServer, logoutOnServer, registerOnServer, type Credentials } from './authApi';
import { setMeta } from '../../shared/db/repository';
import { forgetSession, hasExpired, loadSession, saveSession, unlockSession } from './authRepository';
import { setAuthState } from './authStatus';
import { MAX_UNLOCK_TRIES } from './authTypes';

/**
 * The whole story of who is signed in: opening a session against the backend, keeping it on the
 * phone under a PIN, and unlocking it later with or without signal. The facade is the only caller.
 */

/**
 * When the backend refuses our token the session ended somewhere else: it expired, or the producer
 * closed it because this phone was lost. The app goes back to the sign-in instead of showing an
 * error on every screen. What was recorded stays on the phone, waiting for whoever signs in next.
 */
onSessionRejected(() => {
  void forgetSession().then(() => setAuthState({ status: 'signed_out' }));
});

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
  // Una clave que dio el productor abre la puerta y nada más: lo primero es cambiarla
  setAuthState(session.user.mustChangePassword
    ? { status: 'must_change_password', user: session.user }
    : { status: 'signed_in', user: session.user });
}

export async function signUp(credentials: Required<Credentials>, pin: string): Promise<void> {
  const { deviceId } = await getApiConfig();
  const session = await registerOnServer(credentials, deviceId);
  await saveSession(session, pin);
  setAuthState({ status: 'signed_in', user: session.user });
}

/**
 * Cambia la clave propia y deja de ser temporal. Necesita señal, pero es lo primero que se hace
 * tras recibir una del productor, que siempre ocurre con alguien al lado.
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await changePasswordOnServer(currentPassword, newPassword);
  const stored = await loadSession();
  if (stored) {
    const user = { ...stored.user, mustChangePassword: false };
    await setMeta('session', { ...stored, user });
    setAuthState({ status: 'signed_in', user });
  }
}

/** Opens the saved session with the PIN. Works with no signal: nothing here calls the backend. */
export async function unlock(pin: string): Promise<boolean> {
  if (await unlockSession(pin)) {
    const stored = await loadSession();
    if (stored) {
      setAuthState(stored.user.mustChangePassword
        ? { status: 'must_change_password', user: stored.user }
        : { status: 'signed_in', user: stored.user });
    }
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
export async function signOut(): Promise<void> {
  try {
    if (navigator.onLine) await logoutOnServer();
  } catch {
    // The phone is the one that must forget: a server that did not answer cannot stop that
  }
  await forgetSession();
  setAuthState({ status: 'signed_out' });
}
