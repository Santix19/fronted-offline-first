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
