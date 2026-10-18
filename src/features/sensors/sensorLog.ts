import { toIsoWithOffset } from '../../shared/utils/dates';

/** One line of what the board sent, as the counting screen shows it. */

export interface SensorLogEntry {
  at: string;
  text: string;
  /** true = unreadable frame; it is shown in red instead of being hidden */
  bad: boolean;
}

/**
 * Last frames read, kept in memory only. It is a diagnosis aid, not data: at the pond there is no
 * laptop with the serial monitor to see why the counter is behaving oddly.
 */

const MAX_ENTRIES = 40;

let entries: SensorLogEntry[] = [];

const listeners = new Set<() => void>();

export function appendSensorLog(text: string, bad: boolean): void {
  entries = [{ at: toIsoWithOffset(), text, bad }, ...entries].slice(0, MAX_ENTRIES);
  listeners.forEach((listener) => listener());
}

export function getSensorLog(): SensorLogEntry[] {
  return entries;
}
