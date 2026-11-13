import test from 'node:test';
import assert from 'node:assert/strict';
import { lineUp, storyGoal, storyTuning, type StoryState } from './storyBehavior';
import { spawnSchool, stepSchool } from './school';
import { DEFAULT_TUNING as tuning } from './tuning';

const bounds = { minX:-4, maxX:4, minZ:-5, maxZ:5 };
test('the narrative leaves the school swimming freely outside the counting demonstration', () => {
  const fish = spawnSchool(1,bounds,1,tuning)[0];
  for (const chapter of [0,1,2,3,5]) {
    assert.equal(storyGoal(fish,bounds,{chapter,progress:.5,crossed:0},0),undefined);
    assert.equal(storyTuning(tuning,chapter),tuning);
  }
});
test('the story school stays inside the water through every chapter', () => {
  const school = spawnSchool(12,bounds,1,tuning);
  for (let chapter = 0; chapter <= 5; chapter++) {
    const scene: StoryState = { chapter, progress:.5, crossed:0 };
    for (let frame = 0; frame < 300; frame++) stepSchool(school,1/60,bounds,tuning,null,scene);
    for (const f of school) {
      assert.ok(Number.isFinite(f.heading));
      assert.ok(f.x >= bounds.minX + f.length * .55 && f.x <= bounds.maxX - f.length * .55);
      assert.ok(f.z >= bounds.minZ + f.length * .55 && f.z <= bounds.maxZ - f.length * .55);
    }
  }
});
test('each fish in the counting demonstration starts before the gate and crosses it', () => {
  const school = spawnSchool(12,bounds,1,tuning);
  lineUp(school,bounds);
  assert.ok(school.every((f) => f.x < 0));
  const scene: StoryState = { chapter:4, progress:0, crossed:0 };
  const crossed = new Set();
  for (let frame = 0; frame < 600; frame++) {
    stepSchool(school,1/60,bounds,tuning,null,scene);
    school.forEach((f,i) => { if (f.x >= 0) crossed.add(i); });
    if (frame===179) assert.ok(crossed.size<12, 'the example must not send the whole school through at once');
  }
  assert.equal(crossed.size,12);
});
