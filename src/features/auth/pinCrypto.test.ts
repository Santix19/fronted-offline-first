import assert from 'node:assert/strict';
import { test } from 'node:test';
import { decryptToken, encryptToken, fromBase64, randomBytes, toBase64 } from './pinCrypto';

const SALT = randomBytes(16);

const IV = randomBytes(12);

const TOKEN = 'un-token-de-sesion-cualquiera';

test('el PIN correcto devuelve el token y uno equivocado no devuelve nada', async () => {
  const cipher = await encryptToken(TOKEN, '1234', SALT, IV);

  assert.equal(await decryptToken(cipher, '1234', SALT, IV), TOKEN);
  // Sin excepcion ni basura: AES-GCM se niega, que es lo que la pantalla cuenta como intento fallido
  assert.equal(await decryptToken(cipher, '9999', SALT, IV), undefined);
});

test('el token cifrado no deja ver el token', async () => {
  const cipher = await encryptToken(TOKEN, '1234', SALT, IV);

  assert.ok(!cipher.includes(TOKEN));
  assert.ok(!atob(cipher).includes(TOKEN));
});

test('el mismo PIN en dos celulares no produce el mismo cifrado', async () => {
  const unCelular = await encryptToken(TOKEN, '1234', randomBytes(16), randomBytes(12));
  const otroCelular = await encryptToken(TOKEN, '1234', randomBytes(16), randomBytes(12));

  // Cada celular tiene su propia sal: ver dos bases no dice que usan el mismo PIN
  assert.notEqual(unCelular, otroCelular);
});
