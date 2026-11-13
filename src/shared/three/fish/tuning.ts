/**
 * Everything that decides how the school feels. Speeds are in body lengths per second, so a big
 * fish and a small one look equally alive. Defaults come from how trout swim: bursts of tail
 * beats and glides, a beat that quickens with speed, and a C-start when something comes close.
 */
export interface SchoolTuning {
  /** Tail sweep at full effort, in body lengths (a trout's is about a tenth of its length) */
  amplitude: number;
  /** Tail beats per second when still, and how many more per body length per second of speed */
  beatBase: number;
  beatPerSpeed: number;
  /** Speed a burst aims for, and how fast a glide loses speed (per second) */
  burstSpeed: number;
  glideDrag: number;
  /** How long bursts and glides last, in seconds (each fish picks within the range) */
  burstTime: [number, number];
  glideTime: [number, number];
  /** Escape: top speed, how far a touch reaches (in body lengths) and how far panic spreads */
  escapeSpeed: number;
  scareRadius: number;
  panicRadius: number;
  /** How much the body curves into a turn */
  bendPerTurn: number;
  /** Schooling: how far a fish sees its neighbours, and the space it keeps (body lengths) */
  neighbourRadius: number;
  personalSpace: number;
}

export const DEFAULT_TUNING: SchoolTuning = {
  amplitude: 0.11,
  beatBase: 1.1,
  beatPerSpeed: 1.5,
  burstSpeed: 1.6,
  glideDrag: 1.1,
  burstTime: [0.35, 0.8],
  glideTime: [0.6, 1.6],
  escapeSpeed: 7,
  scareRadius: 2.6,
  panicRadius: 2.2,
  bendPerTurn: 0.22,
  neighbourRadius: 3,
  personalSpace: 1.1,
};

export function between([min, max]: [number, number]): number {
  return min + Math.random() * (max - min);
}
