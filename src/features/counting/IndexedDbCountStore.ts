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
