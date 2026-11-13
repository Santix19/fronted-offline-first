import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readingWarning } from './readingWarning';

test('a value in range says nothing', () => {
  assert.equal(readingWarning('tempC', '13'), undefined);
  assert.equal(readingWarning('ph', '7,2'), undefined);
});

test('low oxygen warns before saving', () => {
  assert.match(readingWarning('oxygenMgL', '5,5') ?? '', /fuera de lo ideal/);
  assert.match(readingWarning('oxygenMgL', '4,6') ?? '', /nivel crítico/);
});

test('an empty or unreadable value is left to validation', () => {
  assert.equal(readingWarning('tempC', ''), undefined);
  assert.equal(readingWarning('tempC', 'abc'), undefined);
});

test('fields that are not water readings never warn', () => {
  assert.equal(readingWarning('kg', '9999'), undefined);
});
