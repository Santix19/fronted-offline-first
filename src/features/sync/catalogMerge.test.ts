import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Alert } from '../alerts/alertTypes';
import type { Pond } from '../ponds/pondTypes';
import { mergeAlerts, mergeCatalog, stateAfterPush } from './catalogMerge';

const pond = (id: string, updatedAt: string, syncState: Pond['syncState'] = 'synced'): Pond =>
  ({ id, name: id, type: 'tanque', active: true, updatedAt, syncState });

const alert = (id: string, attendPending = false): Alert =>
  ({ id, pondId: 'p', variable: 'ph', level: 'critica', message: '', measuredAt: '2026-10-08T10:00:00Z', attendPending });

test('server rows replace synced local rows and add new ones', () => {
  const result = mergeCatalog([pond('a', '2026-10-08T10:00:00Z')], [pond('a', '2026-10-08T09:00:00Z'), pond('b', '2026-10-08T09:00:00Z')]);
  assert.deepEqual(result.map((p) => p.id), ['a', 'b']);
});

test('a newer local edit not yet uploaded is kept', () => {
  const local = [pond('a', '2026-10-08T12:00:00-05:00', 'pending')];
  assert.deepEqual(mergeCatalog(local, [pond('a', '2026-10-08T16:00:00Z')]), []);
});

test('an older local edit loses against a newer server edit', () => {
  const local = [pond('a', '2026-10-08T08:00:00-05:00', 'pending')];
  assert.equal(mergeCatalog(local, [pond('a', '2026-10-08T16:00:00Z')]).length, 1);
});

test('after a push, a row edited again in the meantime stays pending', () => {
  const row = pond('a', '2026-10-08T12:00:05Z', 'pending');
  assert.equal(stateAfterPush(row, '2026-10-08T12:00:00Z').syncState, 'pending');
  assert.equal(stateAfterPush(row, row.updatedAt).syncState, 'synced');
  assert.equal(stateAfterPush(row, row.updatedAt, 'nombre: ya existe').syncError, 'nombre: ya existe');
});

test('alerts attended elsewhere disappear; attended here stay hidden', () => {
  const result = mergeAlerts([alert('old'), alert('mine', true)], [alert('mine'), alert('new')]);
  assert.deepEqual(result.remove, ['old']);
  assert.equal(result.put.find((a) => a.id === 'mine')?.attendPending, true);
  assert.notEqual(result.put.find((a) => a.id === 'new')?.attendPending, true);
});
