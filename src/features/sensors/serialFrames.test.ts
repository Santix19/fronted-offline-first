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
