import type { RecordSource } from '../records/recordTypes';

/** The data sources the app knows how to open. SensorFactory turns one of these into a SensorSource. */

export type SensorKind = 'arduino_infrared' | 'arduino_ultrasonic' | 'mock';
