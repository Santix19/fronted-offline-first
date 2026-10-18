import { parseFrame } from './serialFrames';
import { SensorBroadcast } from './sensorBroadcast';
import type { SensorDescriptor, SensorEvent, SensorSource } from './sensorTypes';

/**
 * Source without hardware, for tests and for the defence: no board and no cable needed. It writes
 * the same frames the sketch writes and sends them through the same parser, so a demo exercises the
 * real protocol. One frame in ten is unreadable on purpose, like a noisy cable at the pond.
 */
export class MockSensorSource implements SensorSource {
  private readonly events = new SensorBroadcast();

  private timer?: ReturnType<typeof setInterval>;

  private seq = 0;

  constructor(readonly descriptor: SensorDescriptor, private readonly everyMs = 700) {}
}

