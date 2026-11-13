import test from 'node:test';
import assert from 'node:assert/strict';
import { correctedRecord } from './correctedRecord';
import type { Feeding } from './recordTypes';

const refused: Feeding = { id: 'original', type: 'feeding', batchId: 'lote', kg: -1, source: 'manual', recordedAt: '2026-11-13T08:00:00-05:00', syncState: 'rejected', syncError: 'kg: debe ser positivo' };
test('correcting a refusal preserves its identity and removes the refusal before retrying', () => {
  const draft = { ...refused, id: 'new', kg: 2 };
  assert.deepEqual(correctedRecord(draft, refused), { ...draft, id: 'original', syncState: 'pending', syncError: undefined });
  assert.equal(refused.kg, -1);
});
test('an already uploaded event cannot be rewritten through correction', () => {
  assert.throws(() => correctedRecord(refused, { ...refused, syncState: 'synced' }));
});
test('correction cannot move the event into a different batch', () => {
  assert.throws(() => correctedRecord({ ...refused, batchId: 'otro-lote' }, refused));
});
