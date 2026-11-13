import test from 'node:test';
import assert from 'node:assert/strict';
import { storyCardRight, storyDescentPixels, storyGateLane, storySimBox, storyIslandScale, storyPixel, storyRiverDrift, storyRiverTravel, storyWaterFrame, storyWorldFrame, storyWorldPixel } from './storyViewport';

test('the island stays complete with water on either side in mobile and tall desktop frames', () => {
  for (const [width,height] of [[320,320],[375,375],[834,824],[594,1280],[844,280]]) {
    const scale=storyIslandScale(width,height);
    const left=storyPixel(width,height,500+(140-500)*scale,430);
    const right=storyPixel(width,height,500+(840-500)*scale,430);
    assert.ok(left.x>0, `left edge at ${width}x${height}`);
    assert.ok(right.x<width, `right edge at ${width}x${height}`);
  }
});

test('the river gives fish the whole water column, independently of narrative panels', () => {
  for (const [width, height] of [[320,824],[375,824],[1440,824],[1024,1290]]) {
    const start = storyWaterFrame(width,height,0);
    const river = storyWaterFrame(width,height,1);
    assert.ok((river.right-river.left)*(river.bottom-river.top) > (start.right-start.left)*(start.bottom-start.top));
    assert.ok(river.left >= 0 && river.right <= width && river.top >= 0 && river.bottom < height);
    assert.ok(river.bottom-river.top>height*.85);
    assert.ok(river.right-river.left>width*.8);
    for (const t of [.1,.5,.9]) {
      const frame = storyWaterFrame(width,height,t);
      assert.ok(frame.right>frame.left && frame.bottom>frame.top);
    }
  }
});

test('the broad inlet already exists in the first view and its camera path has no discontinuity', () => {
  for (const [width,height] of [[375,824],[1440,824],[1024,1290]]) {
    const start = storyWorldFrame(width,height,0);
    const left = storyWorldPixel(start,115,860), right = storyWorldPixel(start,935,860);
    assert.ok(right.x-left.x>start.width*.75);
    const end = storyWorldFrame(width,height,1);
    assert.equal(end.y,860);
    assert.equal(end.left,0);
    let previous=start;
    for(let i=1;i<=100;i++) {
      const next=storyWorldFrame(width,height,i/100);
      assert.ok(Math.abs(next.y-previous.y)<20);
      assert.ok(Math.abs(next.left-previous.left)<width*.01);
      previous=next;
    }
  }
});
test('the first water frame stays below the island in every entry viewport', () => {
  assert.deepEqual(storyPixel(1000,860,500,430),{x:500,y:430});
  for (const [width,height] of [[320,824],[375,824],[1440,824],[1024,1290]]) {
    const island = storyWorldPixel(storyWorldFrame(width,height,0),500,434);
    assert.ok(storyWaterFrame(width,height,0).top>island.y);
  }
});

test('on desktop the drawing pans exactly as fast as the page during the descent', () => {
  for (const [width,height] of [[1440,824],[1920,1004],[1280,644]]) {
    const distance = storyDescentPixels(width,height,true,height);
    for (const t of [0,.25,.5,.75]) {
      const a = storyWorldFrame(width,height,t,true), b = storyWorldFrame(width,height,t+.01,true);
      const moved = storyWorldPixel(a,500,700).y - storyWorldPixel(b,500,700).y;
      assert.ok(Math.abs(moved - distance*.01) < .5, `${width}x${height} t=${t}: ${moved} vs ${distance*.01}`);
    }
  }
});

test('the river keeps flowing after the descent, without jumps, and stops at its end', () => {
  for (const [width,height,desktop] of [[1440,824,true],[390,768,false]] as const) {
    const travel = storyRiverTravel(width,height,desktop), remaining = 3000;
    assert.ok(travel > 0);
    let previous = 0;
    for (let past = 0; past <= remaining; past += 10) {
      const drift = storyRiverDrift(past,remaining,travel);
      assert.ok(drift >= previous && drift - previous <= 10.001, `jump at ${past}`);
      previous = drift;
    }
    assert.ok(Math.abs(previous - Math.min(travel,remaining)) < 1);
    const end = storyWorldFrame(width,height,1,desktop,previous);
    assert.ok(end.y + end.viewHeight <= 860 + 2300 + .001);
  }
});

test('on desktop the island stays clear of the text card', () => {
  for (const [width,height] of [[1024,576],[1280,644],[1440,824],[1920,1004],[1024,1290]]) {
    const frame = storyWorldFrame(width,height,0,true);
    const cardRight = storyCardRight(width);
    const left = storyWorldPixel(frame,500+frame.islandShift+(140-500)*frame.islandScale,430).x;
    const right = storyWorldPixel(frame,500+frame.islandShift+(840-500)*frame.islandScale,430).x;
    assert.ok(left > cardRight, `${width}x${height}: ${left} <= ${cardRight}`);
    assert.ok(right < width, `${width}x${height}: ${right} >= ${width}`);
  }
});

test('on a phone the counting lane sits in the open water below the step card', () => {
  const phone = storyWaterFrame(390,768,1,true,false), desk = storyWaterFrame(1440,824,1,true,true);
  assert.equal(phone.top, 768*storyGateLane(false).top);
  assert.ok(phone.top > 768*.5 && phone.bottom < 768*.85);
  assert.equal(desk.top, 824*storyGateLane(true).top);
});

test('on desktop each simulation, and the counting lane, sit in the open water right of the card', () => {
  for (const [width,height] of [[1024,576],[1280,644],[1440,824],[1920,1004]]) {
    const box = storySimBox(width,height), cardRight = storyCardRight(width);
    assert.ok(box.width > 300, `${width}x${height}: box ${box.width}`);
    assert.ok(box.left >= cardRight + 48 - .001 && box.left + box.width <= width - 36 + .001);
    assert.ok(box.width * .625 <= height - 128 + .001);
    const lane = storyWaterFrame(width,height,1,true,true);
    assert.ok(lane.left >= cardRight + 48 - .001, `${width}x${height}: lane starts under the card`);
    assert.equal(lane.right, box.left + box.width);
  }
});
