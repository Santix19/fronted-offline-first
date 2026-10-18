import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseFrame } from './serialFrames';
import type { SensorEvent } from './sensorTypes';

const infrared = { countsMultipleCuts: true };

const ultrasonic = { countsMultipleCuts: false };
