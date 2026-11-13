import { storySimBox, storyWaterFrame, storyWorldFrame } from '../../shared/three/fish/storyViewport';

export const STORY_DESKTOP = '(min-width: 1024px) and (min-height: 600px)';

/** SVG and WebGL use the same camera path, including the water already visible in the entrance. */
export function paintStoryWorld(root: HTMLElement, descent: number, drift = 0) {
  const rect = root.querySelector('.lg-scene-art')?.getBoundingClientRect();
  if (!rect?.width || !rect.height) return;
  const compact = root.dataset.compact === 'true';
  const desktop = !compact && matchMedia(STORY_DESKTOP).matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const frame = storyWorldFrame(rect.width, rect.height, compact ? 0 : reduced ? Number(descent > .5) : descent, desktop, compact ? 0 : drift);
  root.style.setProperty('--sc-island-scale', String(frame.islandScale));
  root.style.setProperty('--sc-island-shift', `${frame.islandShift.toFixed(2)}px`);
  // The counting barrier and the desktop simulations share these boxes with the 3D school
  const lane = storyWaterFrame(rect.width, rect.height, 1, true, desktop);
  const sim = storySimBox(rect.width, rect.height);
  const px = (name: string, value: number) => root.style.setProperty(name, `${value.toFixed(1)}px`);
  px('--lg-lane-left', lane.left); px('--lg-lane-width', lane.right - lane.left);
  px('--lg-lane-top', lane.top); px('--lg-lane-height', lane.bottom - lane.top);
  px('--lg-sim-left', sim.left); px('--lg-sim-width', sim.width);
  const view = [frame.x, frame.y, frame.viewWidth, frame.viewHeight].map((v) => v.toFixed(3)).join(' ');
  root.querySelectorAll<HTMLElement>('.lg-world').forEach((world) => {
    world.style.left = `${frame.left}px`;
    world.style.width = `${frame.width}px`;
    world.querySelector('svg')?.setAttribute('viewBox', view);
  });
}
