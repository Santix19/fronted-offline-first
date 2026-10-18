import { newId } from '../../shared/utils/ids';
import type { CommitInput, CountStore, CountingTally } from './countingTypes';

/**
 * Count engine without a database. The tests use it to check the counting rules without IndexedDB,
 * and the defence uses it to count without leaving anything behind on the phone.
 */
export class MemoryCountStore implements CountStore {
  private readonly tallies = new Map<string, CountingTally>();
  /** Counts closed during this session, so a test can assert what was stored. */
  readonly committed: CommitInput[] = [];

  async loadTally(batchId: string): Promise<CountingTally | undefined> {
    return this.tallies.get(batchId);
  }

  async saveTally(tally: CountingTally): Promise<void> {
    this.tallies.set(tally.batchId, tally);
  }

  async clearTally(batchId: string): Promise<void> {
    this.tallies.delete(batchId);
  }

  async commitCount(input: CommitInput): Promise<string> {
    this.committed.push(input);
    return newId();
  }
}
