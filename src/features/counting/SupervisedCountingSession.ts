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
export class SupervisedCountingSession extends CountingSession {
  constructor(
    store: CountStore,
    tally: CountingTally,
    /** What the batch was stocked with. Without it there is nothing to compare against. */
    private readonly expected?: number,
  ) {
    super(store, tally);
  }

  protected override warning(): string | null {
    const { total, multipleCuts, frames } = this.tally;
    if (this.expected !== undefined && this.expected > 0 && total > this.expected * IMPLAUSIBLE_ABOVE) {
      return `Ya van ${total} alevinos y el lote se sembró con ${this.expected}. Revisa el lente del contador.`;
    }
    if (frames >= MIN_FRAMES_TO_JUDGE && multipleCuts > total * MAX_CUTS_SHARE) {
      return 'Muchos cortes múltiples: los alevinos están pasando demasiado juntos. Baja el caudal.';
    }
    return null;
  }
}
