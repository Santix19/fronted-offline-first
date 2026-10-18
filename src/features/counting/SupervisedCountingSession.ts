import type { CountStore, CountingTally } from './countingTypes';
import { CountingSession } from './CountingSession';

/** Above this share of the stocked quantity the count cannot be right any more. */

const IMPLAUSIBLE_ABOVE = 1.05;

/** Share of ambiguous crossings over which the fish are going through too close together. */

const MAX_CUTS_SHARE = 0.15;
