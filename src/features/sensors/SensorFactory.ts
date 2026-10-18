import { ArduinoSerialAdapter } from './ArduinoSerialAdapter';
import { MockSensorSource } from './MockSensorSource';
import { DedupeSensorDecorator, LoggingSensorDecorator } from './sensorDecorators';
import type { SensorDescriptor, SensorKind, SensorSource } from './sensorTypes';

/** Cross-cutting capabilities to add to the source. Both are on unless something turns them off. */

export interface SensorOptions {
  log?: boolean;
  dedupe?: boolean;
}

/**
 * Factory Method. Each subclass knows how to build exactly one kind of source; the base class owns
 * what is the same for all of them, which is wrapping it in the decorators that were asked for.
 * Supporting a new counter means adding a subclass: no screen and no facade changes.
 */

export abstract class SensorFactory {
  abstract readonly descriptor: SensorDescriptor;

  /** The factory method: the only thing a subclass has to decide. */
  protected abstract createSource(): SensorSource;

  /** What callers use: a source already built and decorated. */
  create(options: SensorOptions = {}): SensorSource {
    let source = this.createSource();
    // Logging goes innermost on purpose: the log must show the frames as they arrived, including
    // the repeated ones dedupe throws away, because that is exactly what reveals a loose cable
    if (options.log ?? true) source = new LoggingSensorDecorator(source);
    if (options.dedupe ?? true) source = new DedupeSensorDecorator(source);
    return source;
  }
}
