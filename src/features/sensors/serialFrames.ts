import { toIsoWithOffset } from '../../shared/utils/dates';
import { parseOptionalNumber } from '../../shared/utils/numbers';
import type { SensorEvent } from './sensorTypes';

/**
 * Wire protocol of the sketch: one frame per line, fields separated by ";", "-" where the board
 * did not measure anything.
 *
 *   CNT;<seq>;<fish since the previous frame>;<how many of those were ambiguous>
 *   AGUA;<seq>;<temperature C>;<pH>;<oxygen mg/L>
 *
 * Plain text on purpose: it can be read in the Arduino IDE's serial monitor while the counter is
 * being calibrated at the pond, which is where most of the work actually happens.
 *
 * The frame carries no date: the board has no clock. The phone stamps the time it arrived, which
 * is what the caretaker saw.
 */

export interface FrameDialect {
  /** false = the board cannot tell simultaneous fish apart, so its cuts field is not a measurement */
  countsMultipleCuts: boolean;
}

const ABSENT = '-';

/** undefined = not measured; null = there is something there but it is not a number (noisy cable). */
