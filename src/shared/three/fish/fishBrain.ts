import { between, type SchoolTuning } from './tuning';

/**
 * One trout. It swims like trout do: a burst of tail beats, then a glide with the tail almost
 * still. When scared it curls into a C (cstart) for a tenth of a second, then shoots off (flee).
 */
export type SwimMode = 'burst' | 'glide' | 'cstart' | 'flee';

export interface Fish {
  x: number;
  z: number;
  y: number;
  heading: number; // radians around the vertical; 0 swims towards +Z
  turn: number; // radians per second, also curves the body and banks it
  speed: number; // body lengths per second
  phase: number; // tail-beat phase sent to the shader
  amp: number; // tail sweep sent to the shader
  bend: number; // body curve sent to the shader
  mode: SwimMode;
  timer: number;
  length: number; // world units
  vigour: number; // each fish is a little faster or lazier than the rest
  wander: number; // the direction it would drift to on its own
  fleeHeading: number;
  cSide: number;
  scareIn: number; // seconds until it reacts to a scare, -1 when calm
  scareHeading: number;
  storyDelay?: number;
}

const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const ease = (rate: number, dt: number) => 1 - Math.exp(-rate * dt);

export function startEscape(f: Fish): void {
  f.fleeHeading = f.scareHeading + (Math.random() - 0.5) * 0.9;
  f.cSide = Math.sign(wrap(f.fleeHeading - f.heading)) || 1;
  f.mode = 'cstart';
  f.timer = 0.09 + Math.random() * 0.04;
  f.scareIn = -1;
}

/** One frame of one fish, steering towards goal (radians). Returns true the frame it starts escaping. */
export function stepFish(f: Fish, goal: number, dt: number, t: SchoolTuning): boolean {
  let escaped = false;
  if (f.scareIn >= 0 && (f.scareIn -= dt) < 0) {
    startEscape(f);
    escaped = true;
  }
  f.timer -= dt;
  let amp = t.amplitude;
  let maxTurn = 1.4;
  let turnRate = 6;
  if (f.mode === 'burst') {
    f.speed += (t.burstSpeed * f.vigour - f.speed) * ease(3, dt);
    if (f.timer <= 0) [f.mode, f.timer] = ['glide', between(t.glideTime)];
  } else if (f.mode === 'glide') {
    // Water brakes a fast fish much harder than a slow one, so an escape ends in a few lengths
    f.speed *= Math.exp(-t.glideDrag * dt * Math.max(1, f.speed / t.burstSpeed) ** 1.5);
    amp *= 0.12;
    if (f.timer <= 0 || f.speed < 0.25) [f.mode, f.timer] = ['burst', between(t.burstTime)];
  } else if (f.mode === 'cstart') {
    f.speed *= Math.exp(-5 * dt);
    [amp, maxTurn, turnRate] = [0, 9, 60];
    if (f.timer <= 0) [f.mode, f.timer] = ['flee', 0.35 + Math.random() * 0.25];
  } else {
    f.speed += (t.escapeSpeed * f.vigour - f.speed) * ease(14, dt);
    [amp, maxTurn] = [t.amplitude * 1.5, 3.5];
    if (f.timer <= 0) [f.mode, f.timer] = ['glide', between(t.glideTime) * 1.6];
  }

  f.turn += (clamp(wrap(goal - f.heading) * 3, -maxTurn, maxTurn) - f.turn) * ease(turnRate, dt);
  f.heading = wrap(f.heading + f.turn * dt);
  const cBend = f.mode === 'cstart' ? f.cSide * 1.1 : 0;
  f.bend += (clamp(f.turn * t.bendPerTurn, -0.5, 0.5) + cBend - f.bend) * ease(f.mode === 'cstart' ? 35 : 9, dt);
  f.amp += (amp - f.amp) * ease(f.mode === 'flee' ? 20 : 5, dt);
  const beat = f.mode === 'glide' ? t.beatBase * 0.6 : t.beatBase + t.beatPerSpeed * f.speed;
  f.phase = (f.phase + Math.PI * 2 * beat * dt) % (Math.PI * 2000);

  f.x += Math.sin(f.heading) * f.speed * f.length * dt;
  f.z += Math.cos(f.heading) * f.speed * f.length * dt;
  return escaped;
}
