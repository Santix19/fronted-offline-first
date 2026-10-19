import assert from 'node:assert/strict';
import { test } from 'node:test';
import { documentError, nameError, onlyErrors, passwordError, pinError } from './authValidation';

test('el documento tiene que ser un numero de 5 a 20 digitos', () => {
  assert.ok(documentError(''));
  assert.ok(documentError('123'));
  assert.ok(documentError('10851234a'), 'con letras no pasa');
  assert.ok(documentError('1085 123'), 'con espacios tampoco');
  assert.equal(documentError('1085123456'), undefined);
  assert.equal(documentError('  1085123456  '), undefined, 'se ignoran los espacios de los bordes');
});

test('la clave tiene el mismo minimo que el backend', () => {
  assert.ok(passwordError(''));
  assert.ok(passwordError('corta'));
  assert.equal(passwordError('laguna2026'), undefined);
});

test('el nombre no puede estar vacio ni pasar de 120', () => {
  assert.ok(nameError('   '));
  assert.ok(nameError('x'.repeat(121)));
  assert.equal(nameError('Don Luis'), undefined);
});

test('el PIN es de exactamente cuatro digitos', () => {
  assert.ok(pinError(''));
  assert.ok(pinError('123'));
  assert.ok(pinError('12345'));
  assert.ok(pinError('12a4'));
  assert.equal(pinError('1234'), undefined);
});

test('onlyErrors deja fuera lo que vino bien', () => {
  assert.deepEqual(onlyErrors({ a: undefined, b: undefined }), {});
  assert.deepEqual(onlyErrors({ a: 'mal', b: undefined }), { a: 'mal' });
});
