import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CountingSession, resumeTally } from './CountingSession';
import type { CountStore } from './countingTypes';
import { MemoryCountStore } from './MemoryCountStore';
import { pulse } from './testPulse';

/** The Bridge is what lets all of this run with no IndexedDB and no board in sight. */

async function open() {
  const store = new MemoryCountStore();
  return { store, session: new CountingSession(store, await resumeTally(store, 'b1')) };
}
