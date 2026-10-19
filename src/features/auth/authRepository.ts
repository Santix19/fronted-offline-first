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
