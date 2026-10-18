import { toIsoWithOffset } from '../../shared/utils/dates';

/** One line of what the board sent, as the counting screen shows it. */

export interface SensorLogEntry {
  at: string;
  text: string;
  /** true = unreadable frame; it is shown in red instead of being hidden */
  bad: boolean;
}
