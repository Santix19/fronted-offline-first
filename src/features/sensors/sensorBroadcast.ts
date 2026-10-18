import type { SensorEvent } from './sensorTypes';

/** Fan-out of events to every subscriber. Shared by the sources so each one stays short. */
export class SensorBroadcast {
  private readonly listeners = new Set<(event: SensorEvent) => void>();

  subscribe(listener: (event: SensorEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(event: SensorEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }
}
