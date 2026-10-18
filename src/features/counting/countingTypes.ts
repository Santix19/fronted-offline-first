import type { RecordSource } from '../records/recordTypes';

/**
 * A count in progress. It is saved after every frame: a count of a whole batch takes a long time at
 * the pond, and the app being closed or the battery dying must not throw away the fish already
 * counted.
 */

export interface CountingTally {
  batchId: string;
  total: number;
  multipleCuts: number;
  /** How many frames were applied; the control checks need it to know when to trust a ratio */
  frames: number;
  startedAt: string;
  updatedAt: string;
}
