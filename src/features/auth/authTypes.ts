/** Who is signed in on this phone. Comes from the backend when the session opens. */
export type Role = 'cuidador' | 'productor';

export interface User {
  id: string;
  document: string;
  name: string;
  role: Role;
  /** true = la clave es temporal, la dio el productor y solo sirve para entrar y cambiarla */
  mustChangePassword: boolean;
}

export const ROLE_LABELS: Record<Role, string> = {
  cuidador: 'Cuidador',
  productor: 'Productor',
};

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

/** What the app knows at any moment about who is using it. */
export type AuthState =
  | { status: 'loading' }
  /** No session on this phone: sign in or register */
  | { status: 'signed_out' }
  /** There is a session but it is locked: the PIN opens it, with or without signal */
  | { status: 'locked'; user: User; failedUnlocks: number }
  /** Signed in, but on a password the producer handed over: nothing else until it is changed */
  | { status: 'must_change_password'; user: User }
  | { status: 'signed_in'; user: User };

/** Tries before the session is wiped, so a lost phone is not opened by guessing. */
export const MAX_UNLOCK_TRIES = 5;
