import type { CountStore, CountingTally } from './countingTypes';
import { CountingSession } from './CountingSession';

/** Above this share of the stocked quantity the count cannot be right any more. */

const IMPLAUSIBLE_ABOVE = 1.05;

/** Share of ambiguous crossings over which the fish are going through too close together. */

const MAX_CUTS_SHARE = 0.15;

const MIN_FRAMES_TO_JUDGE = 10;

/**
 * Refined abstraction: the same operations plus the control the producer asked for.
 *
 * A barrier with a dirty lens counts the same fry over and over, and the mistake only becomes
 * obvious once the total has passed what was stocked. By then the whole run has to be redone, so
 * the warning has to arrive while the count is still going.
 */
