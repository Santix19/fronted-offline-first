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

test('pulses add up and the running total is saved after each one', async () => {
  const { store, session } = await open();
  await session.register(pulse(10));
  await session.register(pulse(5, 1));
  assert.equal(session.totals.total, 15);
  assert.equal(session.totals.multipleCuts, 1);
  assert.equal(session.totals.frames, 2);
  assert.equal((await store.loadTally('b1'))?.total, 15);
});

test('a count in progress is resumed, not started over', async () => {
  const store = new MemoryCountStore();
  const first = new CountingSession(store, await resumeTally(store, 'b1'));
  await first.register(pulse(40));

  const second = new CountingSession(store, await resumeTally(store, 'b1'));
  assert.equal(second.totals.total, 40);
});
