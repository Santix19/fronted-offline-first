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
