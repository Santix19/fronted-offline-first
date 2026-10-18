import { toIsoWithOffset } from '../../shared/utils/dates';
import type { RecordSource } from '../records/recordTypes';
import type { SensorSample } from '../sensors/sensorTypes';
import type { CountStore, CountingFeedback, CountingTally } from './countingTypes';

/** Reads the count a batch had in progress, or starts a new one. */
export async function resumeTally(store: CountStore, batchId: string): Promise<CountingTally> {
  const saved = await store.loadTally(batchId);
  if (saved) return saved;
  const now = toIsoWithOffset();
  return { batchId, total: 0, multipleCuts: 0, frames: 0, startedAt: now, updatedAt: now };
}

/**
 * Abstraction side of the Bridge: the counting and control operations, written once.
 *
 * It holds a CountStore without knowing whether that is IndexedDB or memory, and it receives
 * samples without knowing whether they come from a board or from the simulator. Changing the
 * storage engine or the counter model does not touch these rules, and new rules do not touch them.
 */
export class CountingSession {
  /**
   * Frames can arrive faster than the store writes them. Chaining the writes keeps an older total
   * from landing after a newer one, which would make a resumed count go backwards.
   */
  private queue: Promise<unknown> = Promise.resolve();

  constructor(
    protected readonly store: CountStore,
    protected tally: CountingTally,
  ) {}

  get totals(): CountingTally {
    return this.tally;
  }

  /** Applies one frame to the running total and saves it. Water samples are not this session's job. */
  register(sample: SensorSample): Promise<CountingFeedback> {
    if (sample.kind !== 'fry_pulse') return Promise.resolve(this.feedback());
    // Applied right away, saved in turn: the screen never lags behind the fish
    this.tally = {
      ...this.tally,
      total: this.tally.total + sample.count,
      multipleCuts: this.tally.multipleCuts + sample.multipleCuts,
      frames: this.tally.frames + 1,
      updatedAt: sample.at,
    };
    return this.save();
  }

  /** Control: the caretaker fixes the total by hand (a fry that jumped over the barrier). */
  correct(total: number): Promise<CountingFeedback> {
    this.tally = { ...this.tally, total: Math.max(0, Math.trunc(total)), updatedAt: toIsoWithOffset() };
    return this.save();
  }

  /** Closes the count: it becomes a record pending upload and the tally disappears. */
  async finish(source: RecordSource, countsMultipleCuts: boolean): Promise<string> {
    // After the pending writes, so the tally is not saved again right after being cleared
    await this.queue;
    const id = await this.store.commitCount({
      batchId: this.tally.batchId,
      total: this.tally.total,
      multipleCuts: countsMultipleCuts ? this.tally.multipleCuts : undefined,
      source,
      recordedAt: toIsoWithOffset(),
    });
    await this.store.clearTally(this.tally.batchId);
    return id;
  }

  /** Throws the count away without recording anything (the run had to be started over). */
  async cancel(): Promise<void> {
    await this.queue;
    await this.store.clearTally(this.tally.batchId);
  }

  private save(): Promise<CountingFeedback> {
    const snapshot = this.tally;
    const next = this.queue.then(
      () => this.store.saveTally(snapshot),
      () => this.store.saveTally(snapshot),
    );
    this.queue = next.catch(() => undefined);
    return next.then(() => this.feedback());
  }

  /** The refined abstractions add their checks here. */
  protected warning(): string | null {
    return null;
  }

  protected feedback(): CountingFeedback {
    return { totals: this.tally, warning: this.warning() };
  }
}
