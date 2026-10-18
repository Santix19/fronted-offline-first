import { appendSensorLog } from './sensorLog';
import type { SensorDescriptor, SensorEvent, SensorSource } from './sensorTypes';

/**
 * Base of the Decorator: a SensorSource that wraps another one and forwards everything untouched.
 * Each subclass overrides only what it adds, and they stack in any order, so a capability can be
 * turned on or off without the counting screen or the adapter knowing about it.
 */

export abstract class SensorSourceDecorator implements SensorSource {
  constructor(protected readonly inner: SensorSource) {}

  get descriptor(): SensorDescriptor {
    return this.inner.descriptor;
  }

  open(): Promise<void> {
    return this.inner.open();
  }

  close(): Promise<void> {
    return this.inner.close();
  }

  subscribe(listener: (event: SensorEvent) => void): () => void {
    return this.inner.subscribe(listener);
  }
}

/** Writes every frame to the log the counting screen shows, good frames and bad frames alike. */

export class LoggingSensorDecorator extends SensorSourceDecorator {
  override subscribe(listener: (event: SensorEvent) => void): () => void {
    return this.inner.subscribe((event) => {
      const line = describe(event);
      appendSensorLog(line, event.type === 'problem');
      listener(event);
    });
  }
}

/**
 * Drops a frame whose sequence number is exactly the one before it: the port echoes the last line
 * when it is re-plugged, and a repeated pulse would inflate the count of a lot. A *lower* number is
 * not a repeat, it means the board restarted, so it goes through.
 */
