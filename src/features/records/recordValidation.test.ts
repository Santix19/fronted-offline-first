import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { FieldRecord } from './recordTypes';
import { validateRecord } from './recordValidation';

const now = new Date('2026-10-08T12:00:00-05:00');
const base = { id: 'x', recordedAt: '2026-10-08T11:00:00-05:00', source: 'manual', syncState: 'pending' } as const;

test('a water reading needs at least one value', () => {
  const errors = validateRecord({ ...base, type: 'water_reading', pondId: 'p' }, now);
  assert.ok(errors.form);
});

test('pH out of 0-14 is rejected, like the backend does', () => {
  const errors = validateRecord({ ...base, type: 'water_reading', pondId: 'p', ph: 20 }, now);
  assert.ok(errors.ph);
  assert.deepEqual(validateRecord({ ...base, type: 'water_reading', pondId: 'p', ph: 7.1, tempC: 14 }, now), {});
});

test('mortality must be a whole number above zero', () => {
  const record = (quantity: number): FieldRecord => ({ ...base, type: 'mortality', batchId: 'b', quantity });
  assert.ok(validateRecord(record(0), now).quantity);
  assert.ok(validateRecord(record(2.5), now).quantity);
  assert.deepEqual(validateRecord(record(3), now), {});
});

test('a clock that was never set (before 2024) is caught', () => {
  const errors = validateRecord({ ...base, recordedAt: '2000-01-01T00:00:00Z', type: 'feeding', batchId: 'b', kg: 1 }, now);
  assert.ok(errors.recordedAt);
});

test('more than one day in the future is rejected', () => {
  const errors = validateRecord({ ...base, recordedAt: '2026-10-10T12:00:00-05:00', type: 'feeding', batchId: 'b', kg: 1 }, now);
  assert.ok(errors.recordedAt);
});
