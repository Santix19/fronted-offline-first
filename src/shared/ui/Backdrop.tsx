import { useRef } from 'react';
import { useGsap } from '../motion/useGsap';

type Tone = 'convert' | 'fresh' | 'warm';

interface BackdropProps {
  /** Which gradient pair leads; the other two shapes follow in the remaining colours */
  tone?: Tone;
  /** fixed: behind the whole app. local: inside a positioned stage (story, sign-in) */
  fixed?: boolean;
}

const SHAPES: { cls: string; tone: Tone }[] = [
  { cls: 'shape-a', tone: 'convert' },
  { cls: 'shape-b', tone: 'fresh' },
  { cls: 'shape-c', tone: 'warm' },
];

/**
 * The moving background: three chamfered gradient polygons that drift, turn and shift hue on a
 * long loop (CSS), and lean towards the pointer on devices that have one (GSAP quickTo).
 * Decoration only: aria-hidden, no pointer events, still under reduced motion.
 */
export function Backdrop({ tone = 'convert', fixed = true }: BackdropProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGsap(
    ref,
    (g, reduced) => {
      if (reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches || !ref.current) return;
      const shapes = Array.from(ref.current.querySelectorAll<HTMLElement>('.backdrop-shape'));
      const movers = shapes.map((el, i) => ({
        x: g.quickTo(el, 'x', { duration: 1.4 + i * 0.4, ease: 'power3' }),
        y: g.quickTo(el, 'y', { duration: 1.4 + i * 0.4, ease: 'power3' }),
        depth: (i + 1) * 18,
      }));
      const onMove = (e: PointerEvent) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        for (const m of movers) {
          m.x(nx * m.depth);
          m.y(ny * m.depth);
        }
      };
      window.addEventListener('pointermove', onMove);
      return () => window.removeEventListener('pointermove', onMove);
    },
    [],
  );

  // The leading tone goes first, so it gets the biggest shape
  const ordered = [...SHAPES.filter((s) => s.tone === tone), ...SHAPES.filter((s) => s.tone !== tone)];

  return (
    <div ref={ref} className={`backdrop ${fixed ? 'backdrop-fixed' : 'backdrop-local'}`} aria-hidden="true">
      {ordered.map((s, i) => (
        <div key={s.cls} className={`backdrop-shape backdrop-${i} tone-${s.tone}`}>
          <div className="backdrop-fill" />
        </div>
      ))}
      <div className="backdrop-grain" />
    </div>
  );
}
