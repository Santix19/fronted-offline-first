import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseFrame } from './serialFrames';
import type { SensorEvent } from './sensorTypes';

const infrared = { countsMultipleCuts: true };
const ultrasonic = { countsMultipleCuts: false };
const at = '2026-10-18T09:00:00-05:00';

const sampleOf = (event: SensorEvent | null) => {
  assert.ok(event && event.type === 'sample');
  return event.sample;
};

test('a count frame becomes a domain sample', () => {
  const sample = sampleOf(parseFrame('CNT;7;12;2', infrared, at));
  assert.deepEqual(sample, { kind: 'fry_pulse', seq: 7, count: 12, multipleCuts: 2, at });
});

test('a board that cannot measure cuts never reports them', () => {
  const sample = sampleOf(parseFrame('CNT;7;12;5', ultrasonic, at));
  assert.equal(sample.kind === 'fry_pulse' && sample.multipleCuts, 0);
});

test('a water frame leaves the fields it did not measure empty', () => {
  const sample = sampleOf(parseFrame('AGUA;3;13.4;-;7.1', infrared, at));
  assert.deepEqual(sample, { kind: 'water', seq: 3, tempC: 13.4, ph: undefined, oxygenMgL: 7.1, at });
});

test('the boot banner and blank lines are not data', () => {
  assert.equal(parseFrame('# contador la cocha v1', infrared, at), null);
  assert.equal(parseFrame('   ', infrared, at), null);
});

test('a noisy frame is reported, never counted', () => {
  for (const line of ['CNT;;5;0', 'CNT;4;??;0', 'CNT;4;3;x', 'AGUA;2;-;-;-', 'XX;1;2']) {
    const event = parseFrame(line, infrared, at);
    assert.ok(event && event.type === 'problem', `debería rechazar ${line}`);
  }
});

test('a count cannot be negative or fractional', () => {
  assert.equal(parseFrame('CNT;4;-3;0', infrared, at)?.type, 'problem');
  assert.equal(parseFrame('CNT;4;2.5;0', infrared, at)?.type, 'problem');
});

test('the live echo of a crossing is progress, not a sample to save', () => {
  assert.deepEqual(parseFrame('PASO;5', infrared, at), { type: 'echo', running: 5 });
  assert.deepEqual(parseFrame('PASO;0', infrared, at), { type: 'echo', running: 0 });
});

test('a garbled echo is reported, never shown as a number', () => {
  const event = parseFrame('PASO;abc', infrared, at);
  assert.ok(event && event.type === 'problem');
  assert.ok(parseFrame('PASO;-3', infrared, at)?.type === 'problem');
});

test('calibration lines from the ESP32 are not data and not errors', () => {
  assert.equal(parseFrame('LECTURA;1500;libre', infrared, at), null);
  assert.equal(parseFrame('CORTE;12 ms', infrared, at), null);
});

test('a tag nobody knows is still reported', () => {
  assert.ok(parseFrame('XYZ;1;2', infrared, at)?.type === 'problem');
});
