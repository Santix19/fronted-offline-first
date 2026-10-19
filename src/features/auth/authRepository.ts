import { getMeta, setMeta } from '../../shared/db/repository';
import { setSessionToken } from '../../shared/http/sessionToken';
import { decryptToken, encryptToken, fromBase64, randomBytes, toBase64 } from './pinCrypto';
import type { StoredSession, User } from './authTypes';
import type { OpenedSession } from './authApi';

const KEY = 'session';

export const loadSession = (): Promise<StoredSession | undefined> => getMeta<StoredSession>(KEY);

/**
 * Keeps the session on the phone with its token encrypted under the PIN. From here on the app
 * opens without signal: unlocking only needs the PIN and what is already stored.
 */
export async function saveSession(session: OpenedSession, pin: string): Promise<void> {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const stored: StoredSession = {
    user: session.user,
    expiresAt: session.expiresAt,
    tokenCipher: await encryptToken(session.token, pin, salt, iv),
    salt: toBase64(salt.buffer as ArrayBuffer),
    iv: toBase64(iv.buffer as ArrayBuffer),
    failedUnlocks: 0,
  };
  await setMeta(KEY, stored);
  setSessionToken(session.token);
}

/** true when the PIN was right. A wrong one is counted so a lost phone cannot be guessed open. */
export async function unlockSession(pin: string): Promise<boolean> {
  const stored = await loadSession();
  if (!stored) return false;

  const token = await decryptToken(stored.tokenCipher, pin, fromBase64(stored.salt), fromBase64(stored.iv));
  if (!token) {
    await setMeta<StoredSession>(KEY, { ...stored, failedUnlocks: stored.failedUnlocks + 1 });
    return false;
  }
  if (stored.failedUnlocks > 0) await setMeta<StoredSession>(KEY, { ...stored, failedUnlocks: 0 });
  setSessionToken(token);
  return true;
}

/**
 * Forgets the session on this phone. What the caretaker recorded is NOT deleted: those rows belong
 * to the farm, not to whoever was signed in, and some may still be waiting for signal.
 */
export async function forgetSession(): Promise<void> {
  await setMeta<StoredSession | undefined>(KEY, undefined);
  setSessionToken(undefined);
}

export const sessionUser = (stored: StoredSession | undefined): User | undefined => stored?.user;

/** An expired session cannot be unlocked: the backend would refuse its token anyway. */
export const hasExpired = (stored: StoredSession, now = new Date()): boolean =>
  new Date(stored.expiresAt) <= now;
