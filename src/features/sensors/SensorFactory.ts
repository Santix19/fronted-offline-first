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

/** Infrared barrier: the usual fry counter. It can tell two fish crossing at once apart. */

class ArduinoInfraredFactory extends SensorFactory {
  readonly descriptor: SensorDescriptor = {
    kind: 'arduino_infrared',
    label: 'Contador infrarrojo (Arduino)',
    recordSource: 'contador',
    baudRate: 115200,
    countsMultipleCuts: true,
    needsPort: true,
  };

  protected createSource(): SensorSource {
    return new ArduinoSerialAdapter(this.descriptor, { countsMultipleCuts: true });
  }
}

/**
 * Ultrasonic: cheaper and it still works in cloudy water, but two fish at the same instant count as
 * one. Its frames are saved without cortes_multiples instead of with a zero that would read as a
 * measurement, because the thesis compares the counter against the manual count.
 */

class ArduinoUltrasonicFactory extends SensorFactory {
  readonly descriptor: SensorDescriptor = {
    kind: 'arduino_ultrasonic',
    label: 'Sensor ultrasónico (Arduino)',
    recordSource: 'sensor',
    baudRate: 9600,
    countsMultipleCuts: false,
    needsPort: true,
  };

  protected createSource(): SensorSource {
    return new ArduinoSerialAdapter(this.descriptor, { countsMultipleCuts: false });
  }
}

/**
 * No board at all, for tests and for the defence. Its records are stored as "manual": a simulated
 * count must never end up in the database looking like something a machine measured.
 */

class MockSensorFactory extends SensorFactory {
  readonly descriptor: SensorDescriptor = {
    kind: 'mock',
    label: 'Simulador (sin contador)',
    recordSource: 'manual',
    countsMultipleCuts: true,
    needsPort: false,
  };

  protected createSource(): SensorSource {
    return new MockSensorSource(this.descriptor);
  }
}

const FACTORIES: Record<SensorKind, SensorFactory> = {
  arduino_infrared: new ArduinoInfraredFactory(),
  arduino_ultrasonic: new ArduinoUltrasonicFactory(),
  mock: new MockSensorFactory(),
};

export function sensorFactoryFor(kind: SensorKind): SensorFactory {
  return FACTORIES[kind];
}

/** Sources this phone can really open: without Web Serial only the simulator is offered. */
