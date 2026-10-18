import { ArduinoSerialAdapter } from './ArduinoSerialAdapter';
import { MockSensorSource } from './MockSensorSource';
import { DedupeSensorDecorator, LoggingSensorDecorator } from './sensorDecorators';
import type { SensorDescriptor, SensorKind, SensorSource } from './sensorTypes';

/** Cross-cutting capabilities to add to the source. Both are on unless something turns them off. */

export interface SensorOptions {
  log?: boolean;
  dedupe?: boolean;
}
