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

export interface CommitInput {
  batchId: string;
  total: number;
  /** Left out when the device cannot measure it, so a zero is never read as a measurement */
  multipleCuts?: number;
  source: RecordSource;
  recordedAt: string;
}

/**
 * Implementor side of the Bridge: where a count lives while it is being taken, and where it ends up
 * when it is closed. IndexedDbCountStore is the real engine and MemoryCountStore is the one tests
 * and demos use. The abstraction never knows which of the two it is holding, so the counting rules
 * and the storage engine change independently.
 */
