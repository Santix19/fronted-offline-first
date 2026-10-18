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
