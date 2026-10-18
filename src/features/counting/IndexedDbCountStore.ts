import { getMeta, setMeta } from '../../shared/db/repository';
import { newId } from '../../shared/utils/ids';
import { saveRecord } from '../records/recordRepository';
import type { FryCount } from '../records/recordTypes';
import type { CommitInput, CountStore, CountingTally } from './countingTypes';

/**
 * Count engine the app really uses. The tally goes in the key/value store of the phone's database
 * (no new object store, so no schema migration), and the closed count becomes an ordinary field
 * record: from there on it travels in the same push queue as everything the caretaker types.
 */
const tallyKey = (batchId: string) => `count:${batchId}`;

export class IndexedDbCountStore implements CountStore {
  loadTally(batchId: string): Promise<CountingTally | undefined> {
    return getMeta<CountingTally>(tallyKey(batchId));
  }

  saveTally(tally: CountingTally): Promise<void> {
    return setMeta(tallyKey(tally.batchId), tally);
  }

  clearTally(batchId: string): Promise<void> {
    return setMeta<CountingTally | undefined>(tallyKey(batchId), undefined);
  }

  async commitCount(input: CommitInput): Promise<string> {
    const record: FryCount = {
      id: newId(),
      type: 'fry_count',
      batchId: input.batchId,
      total: input.total,
      multipleCuts: input.multipleCuts,
      recordedAt: input.recordedAt,
      source: input.source,
      syncState: 'pending',
    };
    await saveRecord(record);
    return record.id;
  }
}
