import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Batch } from '../batches/batchTypes';
import type { Pond } from '../ponds/pondTypes';
import { ENTRY_KINDS, isEntryType, planEntry } from './quickEntry';

const pond = (id: string, name: string, active = true): Pond =>
  ({ id, name, type: 'estanque', active, updatedAt: '2026-11-20T10:00:00Z', syncState: 'pending' }) as Pond;
const batch = (id: string, pondId: string, code: string, status: Batch['status'] = 'activo'): Batch =>
  ({ id, pondId, code, status, updatedAt: '2026-11-20T10:00:00Z', syncState: 'pending' }) as Batch;

test('sin estanques, cualquier dato pide crear el primero', () => {
  assert.deepEqual(planEntry('water_reading', [], []), { kind: 'needs_pond' });
  assert.deepEqual(planEntry('feeding', [pond('p1', 'E1', false)], []), { kind: 'needs_pond' });
});

test('el agua se anota por estanque: con uno solo va directo al formulario', () => {
  assert.deepEqual(planEntry('water_reading', [pond('p1', 'E1')], []), {
    kind: 'direct',
    href: '#/registrar/water_reading?estanque=p1',
  });
});

test('con varios estanques el cuidador elige, y los inactivos no aparecen', () => {
  const plan = planEntry('water_reading', [pond('p1', 'E1'), pond('p2', 'E2'), pond('p3', 'Viejo', false)], []);
  assert.equal(plan.kind, 'choose');
  assert.deepEqual(plan.kind === 'choose' && plan.targets.map((t) => t.label), ['E1', 'E2']);
});

test('la comida sin lotes explica que hace falta uno y ofrece crearlo en cada estanque', () => {
  const plan = planEntry('feeding', [pond('p1', 'E1'), pond('p2', 'E2')], []);
  assert.equal(plan.kind, 'needs_batch');
  assert.deepEqual(plan.kind === 'needs_batch' && plan.ponds.map((p) => p.href), [
    '#/lotes/nuevo?estanque=p1',
    '#/lotes/nuevo?estanque=p2',
  ]);
});

test('los lotes cerrados no cuentan', () => {
  const plan = planEntry('mortality', [pond('p1', 'E1')], [batch('b1', 'p1', 'L1', 'cerrado')]);
  assert.equal(plan.kind, 'needs_batch');
});

test('con un solo lote activo la comida va directo a su formulario', () => {
  assert.deepEqual(planEntry('feeding', [pond('p1', 'E1')], [batch('b1', 'p1', 'L1')]), {
    kind: 'direct',
    href: '#/registrar/feeding?lote=b1',
  });
});

test('con varios lotes se muestra cada uno con su estanque', () => {
  const plan = planEntry('biometry', [pond('p1', 'E1'), pond('p2', 'E2')], [batch('b1', 'p1', 'L1'), batch('b2', 'p2', 'L2')]);
  assert.equal(plan.kind, 'choose');
  assert.deepEqual(plan.kind === 'choose' && plan.targets.map((t) => `${t.label} · ${t.sub}`), ['Lote L1 · E1', 'Lote L2 · E2']);
});

test('un lote de un estanque desactivado no se ofrece', () => {
  const plan = planEntry('feeding', [pond('p1', 'E1'), pond('p2', 'Viejo', false)], [batch('b2', 'p2', 'L2')]);
  assert.equal(plan.kind, 'needs_batch');
});

test('los cinco tipos de registro están en el menú y nada más', () => {
  assert.deepEqual(ENTRY_KINDS.map((k) => k.type).sort(), ['biometry', 'feeding', 'fry_count', 'mortality', 'water_reading']);
  assert.ok(isEntryType('feeding'));
  assert.ok(!isEntryType('otra-cosa'));
});
