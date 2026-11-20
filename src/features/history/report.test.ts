import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { FieldRecord } from '../records/recordTypes';
import {
  alertsInScope,
  buildReport,
  buildTimeline,
  groupByDay,
  mergeById,
  periodStart,
  recordsInScope,
  toCsv,
  toShareText,
  type AlertEntry,
  type Names,
} from './report';

const names: Names = {
  ponds: new Map([['p1', 'Estanque 1'], ['p2', 'Estanque 2']]),
  batches: new Map([['b1', { label: 'Lote L1', pondId: 'p1' }], ['b2', { label: 'Lote L2', pondId: 'p2' }]]),
};

const synced = { source: 'manual', syncState: 'synced' } as const;
const records: FieldRecord[] = [
  { ...synced, id: 'w1', type: 'water_reading', pondId: 'p1', recordedAt: '2026-11-20T12:00:00Z', tempC: 12, ph: 7, oxygenMgL: 8 },
  { ...synced, id: 'w2', type: 'water_reading', pondId: 'p1', recordedAt: '2026-11-19T12:00:00Z', tempC: 17, ph: 7.4 },
  { ...synced, id: 'w3', type: 'water_reading', pondId: 'p2', recordedAt: '2026-11-20T13:00:00Z', tempC: 19, ph: 6.8, oxygenMgL: 4.5 },
  { ...synced, id: 'f1', type: 'feeding', batchId: 'b1', recordedAt: '2026-11-20T14:00:00Z', kg: 2.5 },
  { source: 'manual', syncState: 'pending', id: 'f2', type: 'feeding', batchId: 'b2', recordedAt: '2026-11-20T15:00:00Z', kg: 1.25 },
  { ...synced, id: 'm1', type: 'mortality', batchId: 'b1', recordedAt: '2026-11-18T14:00:00Z', quantity: 10, cause: 'Hongos' },
  { ...synced, id: 'm2', type: 'mortality', batchId: 'b2', recordedAt: '2026-11-20T09:00:00Z', quantity: 3 },
  { ...synced, id: 'bi1', type: 'biometry', batchId: 'b1', recordedAt: '2026-11-10T14:00:00Z', avgWeightG: 20 },
  { ...synced, id: 'bi2', type: 'biometry', batchId: 'b1', recordedAt: '2026-11-19T14:00:00Z', avgWeightG: 25 },
  { ...synced, id: 'c1', type: 'fry_count', batchId: 'b2', recordedAt: '2026-11-20T10:00:00Z', total: 1500, source: 'contador' },
];
const alerts: AlertEntry[] = [
  { id: 'a1', pondId: 'p2', level: 'critica', message: 'Temperatura alta: 19 °C', measuredAt: '2026-11-20T13:00:00Z' },
  { id: 'a2', pondId: 'p1', level: 'advertencia', message: 'Temperatura alta: 17 °C', measuredAt: '2026-11-19T12:00:00Z', attended: true },
];

test('los periodos empiezan a medianoche de Colombia', () => {
  // 20 de noviembre, 10 a. m. en Colombia (15:00 UTC)
  const now = new Date('2026-11-20T15:00:00Z');
  assert.equal(periodStart('hoy', now).toISOString(), '2026-11-20T05:00:00.000Z');
  assert.equal(periodStart('7d', now).toISOString(), '2026-11-14T05:00:00.000Z');
  // A las 11 p. m. de Colombia en UTC ya es el día siguiente, pero "hoy" sigue siendo el 20
  assert.equal(periodStart('hoy', new Date('2026-11-21T04:30:00Z')).toISOString(), '2026-11-20T05:00:00.000Z');
});

test('lo del celular gana sobre lo del servidor, sin duplicar', () => {
  const merged = mergeById([{ id: 'x', v: 'servidor' }, { id: 'y', v: 'servidor' }], [{ id: 'x', v: 'celular' }]);
  assert.deepEqual(merged.map((m) => `${m.id}:${m.v}`).sort(), ['x:celular', 'y:servidor']);
});

test('el filtro por estanque incluye sus lotes', () => {
  const scope = { from: new Date('2026-11-01T00:00:00Z'), pondId: 'p1' };
  assert.deepEqual(recordsInScope(records, scope, names).map((r) => r.id).sort(), ['bi1', 'bi2', 'f1', 'm1', 'w1', 'w2']);
  assert.deepEqual(alertsInScope(alerts, scope).map((a) => a.id), ['a2']);
});

test('el filtro por fecha deja fuera lo anterior', () => {
  const scope = { from: new Date('2026-11-20T00:00:00Z') };
  assert.ok(recordsInScope(records, scope, names).every((r) => r.recordedAt >= '2026-11-20'));
});

test('el reporte suma, promedia y cuenta lo fuera de rango', () => {
  const r = buildReport(records, alerts, names);
  assert.equal(r.water.readings, 3);
  assert.equal(r.water.temp.avg, 16);
  assert.equal(r.water.temp.min, 12);
  assert.equal(r.water.temp.max, 19);
  assert.equal(r.water.oxygen.count, 2);
  // 17 °C fuera del óptimo; 19 °C y 4,5 mg/L críticos
  assert.equal(r.water.outOfOptimal, 2);
  assert.equal(r.water.critical, 1);
  assert.deepEqual(r.feeding, { times: 2, kg: 3.75 });
  assert.deepEqual(r.mortality.byCause, [['Hongos', 10], ['Sin causa anotada', 3]]);
  assert.equal(r.mortality.fish, 13);
  assert.deepEqual(r.weights, [{ batch: 'Lote L1', avgWeightG: 25, at: '2026-11-19T14:00:00Z' }]);
  assert.deepEqual(r.counts, { times: 1, fish: 1500 });
  assert.deepEqual(r.alerts, { total: 2, critical: 1, pending: 1 });
  assert.equal(r.pendingUpload, 1);
});

test('un conteo sin total no daña la suma ni sale como NaN', () => {
  const broken = { ...synced, id: 'cx', type: 'fry_count', batchId: 'b1', recordedAt: '2026-11-20T10:00:00Z' } as unknown as FieldRecord;
  const r = buildReport([broken, records[9]], [], names);
  assert.deepEqual(r.counts, { times: 2, fish: 1500 });
  assert.equal(buildTimeline([broken], [], names)[0].detail, 'sin total');
});

test('un periodo sin datos no inventa promedios', () => {
  const r = buildReport([], [], names);
  assert.deepEqual(r.water.temp, { count: 0 });
  assert.equal(r.feeding.kg, 0);
});

test('el historial va de lo más nuevo a lo más viejo, con lugar y detalle legibles', () => {
  const t = buildTimeline(records, alerts, names);
  assert.equal(t[0].id, 'f2');
  assert.equal(t[0].place, 'Lote L2 · Estanque 2');
  assert.equal(t[0].detail, '1,25 kg');
  assert.equal(t[0].pending, true);
  const water = t.find((e) => e.id === 'w3')!;
  assert.equal(water.detail, '19 °C · pH 6,8 · 4,5 mg/L de oxígeno');
  assert.equal(water.tone, 'danger');
  assert.equal(t.find((e) => e.id === 'c1')!.detail, '1.500 alevinos · contador');
  assert.equal(t.find((e) => e.id === 'a2')!.detail, 'Temperatura alta: 17 °C · atendida');
});

test('agrupa por día de Colombia con Hoy y Ayer', () => {
  const now = new Date('2026-11-20T20:00:00Z');
  const groups = groupByDay(buildTimeline(records, alerts, names), now);
  assert.deepEqual(groups.slice(0, 3).map((g) => g.day), ['Hoy', 'Ayer', 'Miércoles, 18 de noviembre']);
  // 09:00 UTC del 20 son las 4 a. m. del 20 en Colombia: sigue siendo hoy
  assert.ok(groups[0].entries.some((e) => e.id === 'm2'));
});

test('el CSV abre bien en Excel en español', () => {
  const csv = toCsv(buildTimeline(records.slice(0, 1), [], names));
  assert.ok(csv.startsWith('﻿Fecha;Tipo;Lugar;Detalle;Estado\r\n'));
  assert.match(csv, /;Agua;Estanque 1;12 °C · pH 7 · 8 mg\/L de oxígeno;En el servidor\r\n$/);
});

test('el CSV protege los textos con punto y coma o comillas', () => {
  const csv = toCsv([{ id: 'x', at: '2026-11-20T12:00:00Z', kind: 'mortality', title: 'Mortalidad', detail: 'causa "rara"; ver', place: 'L1', tone: 'warn', pending: true }]);
  assert.match(csv, /;"causa ""rara""; ver";Por subir/);
});

test('el resumen para compartir dice lo importante', () => {
  const text = toShareText(buildReport(records, alerts, names), 'Reporte La Cocha · 7 días');
  assert.match(text, /^\*Reporte La Cocha · 7 días\*/);
  assert.match(text, /Temperatura promedio 16 °C \(de 12 a 19\)/);
  assert.match(text, /Alimento: 3,75 kg en 2 entregas/);
  assert.match(text, /Hongos: 10/);
  assert.match(text, /1 registro todavía no se ha subido/);
});
