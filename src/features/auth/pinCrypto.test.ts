import assert from 'node:assert/strict';
import { test } from 'node:test';
import { decryptToken, encryptToken, fromBase64, randomBytes, toBase64 } from './pinCrypto';

const SALT = randomBytes(16);

const IV = randomBytes(12);
