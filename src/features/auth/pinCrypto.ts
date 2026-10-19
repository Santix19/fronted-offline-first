
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

const decoder = new TextDecoder();

export const toBase64 = (bytes: ArrayBuffer): string => btoa(String.fromCharCode(...new Uint8Array(bytes)));

export const fromBase64 = (text: string): Uint8Array =>
  Uint8Array.from(atob(text), (character) => character.charCodeAt(0));

export const randomBytes = (length: number): Uint8Array => crypto.getRandomValues(new Uint8Array(length));

async function keyFromPin(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey('raw', encoder.encode(pin), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: ROUNDS, hash: 'SHA-256' },
    material,
    { name: ALGORITHM, length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptToken(token: string, pin: string, salt: Uint8Array, iv: Uint8Array): Promise<string> {
  const key = await keyFromPin(pin, salt);
  const cipher = await crypto.subtle.encrypt({ name: ALGORITHM, iv: iv as BufferSource }, key, encoder.encode(token));
  return toBase64(cipher);
}
