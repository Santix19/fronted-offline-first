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

  | { kind: 'water'; seq: number; tempC?: number; ph?: number; oxygenMgL?: number; at: string };

/**
 * What a source reports. A bad frame is not an exception: the cable is noisy outdoors and one
 * unreadable line must not stop a count that is already halfway through.
 */

export type SensorEvent =
  | { type: 'sample'; sample: SensorSample }

  | { type: 'problem'; message: string; frame?: string };

/** What a source is and how it behaves, so the screens do not have to know each model. */

export interface SensorDescriptor {
  kind: SensorKind;
  /** Shown to the caretaker, in Spanish */
  label: string;
  /** The "origen" the backend stores for records built from this source */
  recordSource: RecordSource;
  /** Serial speed the sketch uses. Sources without a port do not have one. */
  baudRate?: number;
  /**
   * false = the device cannot tell two fish crossing at the same instant apart. Then the record is
   * saved without cortes_multiples instead of with a zero that would look like a measurement.
   */
  countsMultipleCuts: boolean;
  /** true = the caretaker has to pick the USB port (Web Serial) */
  needsPort: boolean;
}
