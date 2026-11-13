/** Pure geometry shared by the SVG and the optional 3D school; it imports no graphics library. */
export const STORY_VIEW = { width: 1000, height: 860 };

export function storyPixel(width: number, height: number, x: number, y: number) {
  const scale = Math.max(width / STORY_VIEW.width, height / STORY_VIEW.height);
  return { x: (width - STORY_VIEW.width * scale) / 2 + x * scale, y: (height - STORY_VIEW.height * scale) / 2 + y * scale };
}

/** Keep water around the whole island even in a tall, narrow desktop pane. Its base stays put. */
export function storyIslandScale(width: number, height: number) {
  const scale = Math.max(width / STORY_VIEW.width, height / STORY_VIEW.height);
  return Math.min(1, Math.max(.3, (width / scale - 80) / 700));
}

export interface StoryFrame { left: number; right: number; top: number; bottom: number }

export interface StoryWorld { left: number; width: number; height: number; x: number; y: number; viewWidth: number; viewHeight: number; islandScale: number; islandShift: number }

const ease = (n: number) => { const t = Math.max(0, Math.min(1, n)); return t * t * (3 - 2 * t); };
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** The river drawing starts where the lagoon ends (y=860) and is 2300 units long. */
const RIVER_END = 860 + 2300;

/**
 * One long drawing: the camera follows its already-wide inlet into the river, without a wipe.
 * `drift` is how far, in screen pixels, the river has already flowed past once the descent is over.
 *
 * Desktop pans without zooming (unless a tall window forces it), at a constant speed, so the drawing
 * moves exactly as fast as the cards beside it. Phones keep the eased zoom into the river.
 */
export function storyWorldFrame(width: number, height: number, descent: number, desktop = width >= 1024 && height >= 524, drift = 0): StoryWorld {
  const panoramaHeight = desktop ? height : Math.min(410, Math.max(240, Math.min(height * .47, width)));
  const scale = Math.max(width / 1000, panoramaHeight / 860);
  const x0 = (1000 - width / scale) / 2;
  const y0 = (860 - panoramaHeight / scale) / 2;
  // The island sits centred in what the text card leaves clear, small enough to keep water around it
  const cardRight = storyCardRight(width), clear = width - cardRight;
  const islandScale = desktop ? Math.min(.72, Math.max(.3, (clear / 2 - 24) / (360 * scale))) : storyIslandScale(width, panoramaHeight);
  const islandShift = desktop ? x0 + (cardRight + clear / 2) / scale - 500 : 0;
  let x: number, y: number, viewWidth: number, viewHeight: number;
  if (desktop) {
    const t = clamp01(descent);
    const s = scale + (width / 1000 - scale) * t;
    viewWidth = width / s; viewHeight = height / s;
    x = (1000 - viewWidth) / 2; y = y0 + (860 - y0) * t;
  } else {
    const t = ease(descent);
    const mix = (a: number, b: number) => a + (b - a) * t;
    x = mix(x0, 0); y = mix(y0, 860);
    viewWidth = mix(width / scale, 1000); viewHeight = mix(height / scale, 1000);
  }
  if (drift > 0) y = Math.max(y, Math.min(y + drift * viewHeight / height, RIVER_END - viewHeight));
  return { left: 0, width, height, x, y, viewWidth, viewHeight, islandScale, islandShift };
}

/** Right edge of the desktop text cards: 36px from the edge, 44% of the rest, up to 640px (story.css). */
export function storyCardRight(width: number) {
  return 36 + Math.min((width - 72) * .44, 640);
}

/**
 * The open water beside each desktop card where its simulation plays: 48px past the card, at most
 * 640px wide (centred in what is left) and short enough for its 16:10 scene to fit between the bars.
 */
export function storySimBox(width: number, height: number) {
  const start = storyCardRight(width) + 48, end = width - 36;
  const size = Math.max(0, Math.min(640, end - start, (height - 128) / .625));
  return { left: start + (end - start - size) / 2, width: size };
}

/**
 * Where the counting barrier sits, as fractions of the screen. On a phone the step's card stays at
 * the top while the fish cross, so the lane goes lower, into the open water below it. On desktop it
 * crosses the simulation box, level with the middle of the card.
 */
export function storyGateLane(desktop: boolean) {
  return desktop ? { top: .37, bottom: .58 } : { top: .62, bottom: .83 };
}

/** Scroll needed for the descent. On desktop it equals the pan, so the drawing moves 1:1 with the page. */
export function storyDescentPixels(width: number, height: number, desktop: boolean, heroHeight: number) {
  if (!desktop) return Math.max(300, heroHeight * .9);
  const scale = Math.max(width / 1000, height / 860);
  return (860 * scale + height) / 2;
}

/** How many screen pixels of river are left below the first river view. */
export function storyRiverTravel(width: number, height: number, desktop: boolean) {
  const frame = storyWorldFrame(width, height, 1, desktop);
  return Math.max(0, (RIVER_END - frame.y - frame.viewHeight) * height / frame.viewHeight);
}

/**
 * After the descent the river keeps flowing with the page: at the page's own speed when the drawing
 * is long enough, otherwise at a steady slower speed that reaches the river's end with the last card.
 * The first `ramp` pixels ease from the descent's speed into that one, so there is no jolt.
 */
export function storyRiverDrift(past: number, remaining: number, travel: number, ramp = 240) {
  if (past <= 0 || remaining <= 0 || travel <= 0) return 0;
  const length = Math.min(ramp, remaining);
  const speed = Math.max(0, Math.min(1, (travel - length / 2) / (remaining - length / 2)));
  const s = Math.min(past, remaining);
  const moved = s < length ? s - (1 - speed) * s * s / (2 * length) : length * (1 + speed) / 2 + speed * (s - length);
  return Math.min(travel, moved);
}

export function storyWorldPixel(frame: StoryWorld, x: number, y: number) {
  return { x: frame.left + (x - frame.x) / frame.viewWidth * frame.width, y: (y - frame.y) / frame.viewHeight * frame.height };
}

/** Panels never define the river's bounds. Only the isolated counting demonstration uses a flume. */
export function storyWaterFrame(width: number, height: number, descent: number, counting = false, desktop?: boolean): StoryFrame {
  if (counting) {
    const wide = desktop ?? (width >= 1024 && height >= 524);
    const lane = storyGateLane(wide), box = storySimBox(width, height);
    const left = wide ? box.left : width * .12, right = wide ? box.left + box.width : width * .88;
    return { left, right, top: height * lane.top, bottom: height * lane.bottom };
  }
  const frame = storyWorldFrame(width, height, descent, desktop), t = ease(descent);
  const a = storyWorldPixel(frame, 280 - 190 * t, 480 + (frame.y + frame.viewHeight * .06 - 480) * t);
  const b = storyWorldPixel(frame, 800 + 110 * t, frame.y + frame.viewHeight * .94);
  return { left: Math.max(frame.left + 12, a.x), right: Math.min(width - 12, b.x), top: Math.max(0, a.y), bottom: b.y };
}
