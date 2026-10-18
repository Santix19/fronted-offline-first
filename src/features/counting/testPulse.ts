import type { SensorSample } from '../sensors/sensorTypes';

/** One count frame, as the adapter hands it over. Shared by the counting tests. */
export const pulse = (count: number, multipleCuts = 0): SensorSample => ({
  kind: 'fry_pulse',
  seq: 1,
  count,
  multipleCuts,
  at: '2026-10-18T09:00:00-05:00',
});
