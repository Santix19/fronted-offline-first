import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CountingSession, resumeTally } from './CountingSession';
import { MemoryCountStore } from './MemoryCountStore';
import { SupervisedCountingSession } from './SupervisedCountingSession';
import { pulse } from './testPulse';

/** The checks the producer asked for live in the refined abstraction, not in the plain session. */
async function supervised(expected?: number) {
  const store = new MemoryCountStore();
  return new SupervisedCountingSession(store, await resumeTally(store, 'b1'), expected);
}

test('counting past what was stocked warns instead of staying quiet', async () => {
  const session = await supervised(1000);
  const quiet = await session.register(pulse(900));
  assert.equal(quiet.warning, null);
  const loud = await session.register(pulse(200));
  assert.match(loud.warning ?? '', /lente del contador/);
});

test('too many ambiguous crossings warn once there are enough frames to judge', async () => {
  const session = await supervised(10_000);
  for (let i = 0; i < 9; i++) await session.register(pulse(10, 5));
  assert.equal(session.totals.frames, 9);
  const loud = await session.register(pulse(10, 5));
  assert.match(loud.warning ?? '', /demasiado juntos/);
});

test('without a stocked quantity there is nothing to compare against', async () => {
  const session = await supervised(undefined);
  const feedback = await session.register(pulse(999_999));
  assert.equal(feedback.warning, null);
});

test('the plain session carries no checks: the refined one adds them', async () => {
  const store = new MemoryCountStore();
  const plain = new CountingSession(store, await resumeTally(store, 'b1'));
  const feedback = await plain.register(pulse(999_999));
  assert.equal(feedback.warning, null);
});
