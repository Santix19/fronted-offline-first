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
