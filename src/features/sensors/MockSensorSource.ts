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

  async open(): Promise<void> {
    this.timer ??= setInterval(() => this.tick(), this.everyMs);
  }

  async close(): Promise<void> {
    clearInterval(this.timer);
    this.timer = undefined;
  }

  subscribe(listener: (event: SensorEvent) => void): () => void {
    return this.events.subscribe(listener);
  }

  private tick(): void {
    this.seq += 1;
    const count = 3 + Math.floor(Math.random() * 6);
    const line = this.seq % 10 === 0 ? `CNT;${this.seq};??;0` : `CNT;${this.seq};${count};${count > 7 ? 1 : 0}`;
    const event = parseFrame(line, { countsMultipleCuts: this.descriptor.countsMultipleCuts });
    if (event) this.events.emit(event);
  }
}
