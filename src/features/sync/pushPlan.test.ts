import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { EventJson } from '../records/recordsApi';
import type { PondJson } from '../ponds/pondsApi';
import { buildPushRequests, readPushResponse } from './pushPlan';

const event = (i: number): EventJson => ({ tipo: 'alimentacion', id: `e${i}`, lote_id: 'b1', kg: 1, registrado_en: '2026-10-08T10:00:00-05:00', origen: 'manual' });
const pond = (i: number) => ({ id: `p${i}`, nombre: `T${i}`, tipo: 'tanque', volumen_m3: null, activo: true, actualizado_en: '2026-10-08T10:00:00-05:00' }) as PondJson;

test('nothing pending means no request', () => {
  assert.deepEqual(buildPushRequests('cel-1', [], [], []), []);
});

test('splits events in groups of 500', () => {
  const requests = buildPushRequests('cel-1', [], [], Array.from({ length: 1201 }, (_, i) => event(i)));
  assert.deepEqual(requests.map((r) => r.eventos.length), [500, 500, 201]);
  assert.ok(requests.every((r) => r.dispositivo_id === 'cel-1'));
});

test('the first group of events travels with the catalog', () => {
  const requests = buildPushRequests('cel-1', [pond(1)], [], [event(1)]);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].estanques.length, 1);
  assert.equal(requests[0].eventos.length, 1);
});

test('ponds go in a request before the events of their batches', () => {
  const ponds = Array.from({ length: 201 }, (_, i) => pond(i));
  const requests = buildPushRequests('cel-1', ponds, [], [event(1)]);
  assert.deepEqual(requests.map((r) => [r.estanques.length, r.eventos.length]), [[200, 0], [1, 1]]);
});

test('accepted and duplicated both count as done; rejected keep their reason', () => {
  const outcome = readPushResponse({
    aceptados: ['a'],
    duplicados: ['b'],
    obsoletos: ['c'],
    rechazados: [{ id: 'd', error: 'ph: debe ser menor que o igual a 14' }, { id: null, error: 'sin id' }],
    alertas_generadas: 0,
    servidor_en: '2026-10-08T15:00:00Z',
  });
  assert.deepEqual([...outcome.done], ['a', 'b']);
  assert.deepEqual([...outcome.stale], ['c']);
  assert.equal(outcome.rejected.get('d'), 'ph: debe ser menor que o igual a 14');
  assert.equal(outcome.rejected.size, 1);
});
