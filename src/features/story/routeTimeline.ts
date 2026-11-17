import type { gsap } from 'gsap';

/**
 * The records travelling: each dot rides its path from the capsule into the phone, then one dot
 * leaves for the server. Paths draw themselves first, as if the route were being laid.
 */
export function addRoute(tl: ReturnType<typeof gsap.timeline>, root: HTMLElement, at: number): void {
  const travel = (pathId: string, dotId: string, start: number, length: number) => {
    const path = root.querySelector<SVGPathElement>(pathId);
    const dot = root.querySelector<SVGCircleElement>(dotId);
    if (!path || !dot) return;
    const total = path.getTotalLength();
    const spot = { p: 0 };
    tl.to(dot, { autoAlpha: 1, duration: 0.1 }, start);
    tl.to(spot, {
      p: 1,
      duration: length,
      ease: 'none',
      onUpdate: () => {
        const point = path.getPointAtLength(spot.p * total);
        dot.setAttribute('cx', String(point.x));
        dot.setAttribute('cy', String(point.y));
      },
    }, start);
    tl.to(dot, { autoAlpha: 0, duration: 0.1 }, start + length);
  };

  tl.from('.diagram-path', { strokeDashoffset: 1, stagger: 0.08, duration: 0.5 }, at);
  [0, 1, 2, 3].forEach((i) => travel(`#route-${i}`, `#dot-${i}`, at + 0.5 + i * 0.12, 0.5));
  travel('#route-out', '#dot-out', at + 1.3, 0.4);
}
