
/** Who is signed in on this phone. Comes from the backend when the session opens. */

export interface User {
  id: string;
  document: string;
  name: string;
  role: 'cuidador' | 'productor';
}

/**
 * The session as it is kept on the phone. The token is stored encrypted with a key derived from
 * the PIN, so reading the phone's database is not a way into the farm's data.
 */

export interface StoredSession {
  user: User;
  expiresAt: string;
  /** Token encrypted with AES-GCM, base64 */
  tokenCipher: string;
  /** Random values of this phone, base64. They are not secret: the PIN is. */
  salt: string;
  iv: string;
  /** Wrong PIN tries in a row. The app stops accepting after a few. */
  failedUnlocks: number;
}
