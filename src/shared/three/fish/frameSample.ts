export interface FrameSample { frames: number; elapsed: number }

/** False while warming up, then a decision every 90 visible frames. Long tab gaps restart it. */
export function sampleFrame(sample: FrameSample, dt: number, hidden: boolean): boolean {
  if (hidden || dt > 1) { sample.frames = 0; sample.elapsed = 0; return false; }
  if (++sample.frames <= 20) return false;
  sample.elapsed += dt;
  if (sample.frames < 110) return false;
  const slow = sample.elapsed / 90 > 1 / 28;
  sample.frames = 20; sample.elapsed = 0;
  return slow;
}
