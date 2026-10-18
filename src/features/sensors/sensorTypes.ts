import type { RecordSource } from '../records/recordTypes';

/** The data sources the app knows how to open. SensorFactory turns one of these into a SensorSource. */

export type SensorKind = 'arduino_infrared' | 'arduino_ultrasonic' | 'mock';

/**
 * A reading already translated to the language of the system. Whatever the hardware sends on the
 * wire, the rest of the app only ever sees one of these.
 *
 * fry_pulse carries how many fish passed *since the previous frame* (a delta, not a total):
 * the Arduino is a dumb counter and the phone is the one that keeps the running total.
 */

export type SensorSample =
  | { kind: 'fry_pulse'; seq: number; count: number; multipleCuts: number; at: string }
