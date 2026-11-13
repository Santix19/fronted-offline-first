import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleFrame } from './frameSample';

test('decoration turns off below 28 fps, including a slowdown after a good first sample', () => {
  const sample = {frames:0,elapsed:0};
  for(let i=0;i<110;i++) assert.equal(sampleFrame(sample,1/60,false),false);
  let slow=false;
  for(let i=0;i<90;i++) slow=sampleFrame(sample,1/20,false)||slow;
  assert.equal(slow,true);
});
test('a hidden tab or a long pause restarts the warm-up without condemning the graphics', () => {
  const sample={frames:109,elapsed:4};
  assert.equal(sampleFrame(sample,3,false),false);
  assert.deepEqual(sample,{frames:0,elapsed:0});
  assert.equal(sampleFrame(sample,.1,true),false);
  assert.equal(sample.frames,0);
});
