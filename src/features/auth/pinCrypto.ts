
/**
 * The PIN never leaves the phone and is never stored, not even hashed: it is what derives the key
 * that encrypts the session token. A wrong PIN simply fails to decrypt, so there is nothing to
 * compare against and nothing to steal from the phone's database.
 *
 * PBKDF2 with many rounds on purpose: a PIN is four digits, so the only thing that makes guessing
 * expensive is how slow deriving the key is.
 */

const ROUNDS = 310_000;

const ALGORITHM = 'AES-GCM';

const encoder = new TextEncoder();
