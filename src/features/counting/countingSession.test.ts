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

test('closing the count stores it and clears the tally', async () => {
  const { store, session } = await open();
  await session.register(pulse(8, 2));
  await session.finish('contador', true);
  assert.deepEqual(store.committed.map((c) => [c.total, c.multipleCuts, c.source]), [[8, 2, 'contador']]);
  assert.equal(await store.loadTally('b1'), undefined);
});

test('a device that cannot measure cuts saves none instead of a zero', async () => {
  const { store, session } = await open();
  await session.register(pulse(8, 3));
  await session.finish('sensor', false);
  assert.equal(store.committed[0].multipleCuts, undefined);
});

test('discarding a count records nothing', async () => {
  const { store, session } = await open();
  await session.register(pulse(8));
  await session.cancel();
  assert.deepEqual(store.committed, []);
  assert.equal(await store.loadTally('b1'), undefined);
});

test('a hand correction replaces the total', async () => {
  const { session } = await open();
  await session.register(pulse(100));
  await session.correct(97);
  assert.equal(session.totals.total, 97);
  await session.correct(-5);
  assert.equal(session.totals.total, 0);
});

test('two frames at once cannot leave the older total saved', async () => {
  const saved: number[] = [];
  // A store whose first write is the slow one: exactly how writes end up out of order
  const delays = [20, 0];
  const store: CountStore = {
    loadTally: async () => undefined,
    saveTally: (tally) =>
      new Promise((resolve) => setTimeout(() => (saved.push(tally.total), resolve()), delays.shift() ?? 0)),
    clearTally: async () => undefined,
    commitCount: async () => 'id',
  };

  const session = new CountingSession(store, await resumeTally(store, 'b1'));
  await Promise.all([session.register(pulse(10)), session.register(pulse(5))]);

  assert.equal(session.totals.total, 15);
  assert.deepEqual(saved, [10, 15], 'the 10 must not land after the 15');
});
