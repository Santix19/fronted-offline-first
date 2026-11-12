import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Batch } from '../batches/batchTypes';
import type { Pond } from '../ponds/pondTypes';
import type { FieldRecord } from '../records/recordTypes';
import { buildDashboard } from './dashboardMath';

const NOW = Date.parse('2026-11-11T12:00:00-05:00');
const pond = (id: string, active: boolean) => ({ id, active }) as Pond;
const batch = (id: string, status: 'activo' | 'cerrado') => ({ id, status }) as Batch;
const water = (id: string, at: string, tempC?: number) =>
  ({ id, type: 'water_reading', pondId: 'p1', recordedAt: at, tempC }) as FieldRecord;
const base = { alerts: 0, pending: 0, rejected: 0, now: NOW };

test('counts only active ponds and active batches', () => {
  const d = buildDashboard({ ...base, ponds: [pond('a', true), pond('b', false)], batches: [batch('x', 'activo'), batch('y', 'cerrado')], records: [] });
  assert.equal(d.activePonds, 1);
  assert.equal(d.activeBatches, 1);
});

test('temperature series is the latest 14 readings, oldest first, skipping readings without temperature', () => {
  const records = Array.from({ length: 20 }, (_, i) => water(`r${i}`, `2026-11-${String(i + 1).padStart(2, '0')}T08:00:00-05:00`, 10 + i));
  records.push(water('no-temp', '2026-11-10T09:00:00-05:00'));
  const d = buildDashboard({ ...base, ponds: [], batches: [], records });
  assert.equal(d.temps.length, 14);
  assert.deepEqual(d.temps.slice(0, 2), [16, 17]);
  assert.equal(d.lastTempC, 29);
});

test('records of today are the ones from the last 24 hours', () => {
  const records = [water('a', '2026-11-11T07:00:00-05:00', 12), water('b', '2026-11-10T11:00:00-05:00', 12), water('c', '2026-11-10T13:00:00-05:00', 12)];
  assert.equal(buildDashboard({ ...base, ponds: [], batches: [], records }).recordsToday, 2);
});

test('passes alerts and pending counts through', () => {
  const d = buildDashboard({ ...base, ponds: [], batches: [], records: [], alerts: 3, pending: 5, rejected: 1 });
  assert.deepEqual([d.alerts, d.waiting, d.rejected], [3, 5, 1]);
});
