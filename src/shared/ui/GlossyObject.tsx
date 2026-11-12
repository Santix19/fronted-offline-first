import { useId, useState } from 'react';

export type ObjectKind = 'fish' | 'drop' | 'thermo' | 'bell' | 'cloud' | 'coin';
export type ObjectColor = 'lime' | 'blue' | 'peach' | 'violet' | 'coral' | 'ink';

/** Silhouettes on a 200×200 box. One thick shape each: the bevel and light do the rest. */
const PATHS: Record<ObjectKind, string> = {
  fish: 'M22 100C52 52 120 44 158 96L194 62 186 100 194 138 158 104C120 156 52 148 22 100Z',
  drop: 'M100 18C128 64 160 98 160 132A60 60 0 0 1 40 132C40 98 72 64 100 18Z',
  thermo: 'M82 34A18 18 0 0 1 118 34V112A42 42 0 1 1 82 112Z',
  bell: 'M100 26C64 26 46 54 46 88V118L28 146H172L154 118V88C154 54 136 26 100 26ZM82 154A18 18 0 0 0 118 154Z',
  cloud: 'M58 146A38 38 0 0 1 62 70A48 48 0 0 1 152 80A34 34 0 0 1 150 146Z',
  coin: 'M100 26A74 74 0 1 1 99.9 26Z',
};

/** Satin plastic: a lit face, a darker extrusion, a deep edge */
const MATERIAL: Record<ObjectColor, { light: string; face: string; side: string; edge: string }> = {
  lime: { light: '#f6ffd0', face: '#c8f04a', side: '#8db21c', edge: '#4f6a05' },
  blue: { light: '#dce9ff', face: '#73a6ff', side: '#3d6fd6', edge: '#1d3f8f' },
  peach: { light: '#fff0e8', face: '#ffab86', side: '#e77a4f', edge: '#a3401b' },
  violet: { light: '#f3dcff', face: '#c66ef5', side: '#8e3fc4', edge: '#55187f' },
  coral: { light: '#ffe6da', face: '#ff8c5f', side: '#d9572a', edge: '#8a2a0c' },
  ink: { light: '#5b6070', face: '#1f2128', side: '#0a0a0a', edge: '#000000' },
};

interface GlossyObjectProps {
  kind: ObjectKind;
  color: ObjectColor;
  size?: number;
  /** Degrees; objects sit slightly tilted, never square to the card */
  tilt?: number;
  className?: string;
}

/**
 * A sculptural object (design.md "glossy object metaphors"). The rendered 3D image in
 * public/objects (Gemini renders, cut out to WebP, 2026-11-12) is the default; if it fails to load
 * the layered SVG below takes its place, so the object never leaves a hole.
 */
export function GlossyObject(props: GlossyObjectProps) {
  const [broken, setBroken] = useState(false);
  const { kind, size = 160, tilt = -10, className = '' } = props;
  if (broken) return <SvgObject {...props} />;
  return (
    <img
      className={`glossy glossy-img ${className}`}
      src={`/objects/${kind}.webp`}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      draggable={false}
      decoding="async"
      style={{ rotate: `${tilt}deg` }}
      onError={() => setBroken(true)}
    />
  );
}

/**
 * The fallback, as layered SVG: a translated darker
 * duplicate for the extruded edge, a gradient front face, an inset rim and one soft highlight at
 * the upper left. Decorative, so it is hidden from screen readers.
 */
function SvgObject({ kind, color, size = 160, tilt = -10, className = '' }: GlossyObjectProps) {
  const id = useId().replace(/:/g, '');
  const m = MATERIAL[color];
  const d = PATHS[kind];
  return (
    <svg
      className={`glossy ${className}`}
      width={size}
      height={size}
      viewBox="-10 -10 230 230"
      aria-hidden="true"
      style={{ rotate: `${tilt}deg` }}
    >
      <defs>
        <linearGradient id={`${id}-face`} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor={m.light} />
          <stop offset="0.45" stopColor={m.face} />
          <stop offset="1" stopColor={m.side} />
        </linearGradient>
        <linearGradient id={`${id}-side`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={m.side} />
          <stop offset="1" stopColor={m.edge} />
        </linearGradient>
        <radialGradient id={`${id}-shine`} cx="0.3" cy="0.22" r="0.35">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <path d={d} />
        </clipPath>
      </defs>
      {/* Extrusion: three stacked offsets read as a thick edge */}
      <path d={d} fill={m.edge} transform="translate(14 16)" />
      <path d={d} fill={`url(#${id}-side)`} transform="translate(9 10)" />
      <path d={d} fill={`url(#${id}-side)`} transform="translate(4 5)" />
      {/* Front face with an inset lighter rim */}
      <path d={d} fill={`url(#${id}-face)`} />
      <path d={d} fill="none" stroke={m.light} strokeOpacity="0.55" strokeWidth="5" transform="translate(-1.5 -1.5)" clipPath={`url(#${id}-clip)`} />
      <rect x="-10" y="-10" width="230" height="230" fill={`url(#${id}-shine)`} clipPath={`url(#${id}-clip)`} />
      {kind === 'fish' && <circle cx="58" cy="92" r="7" fill={m.edge} />}
      {kind === 'coin' && <circle cx="100" cy="100" r="50" fill="none" stroke={m.side} strokeWidth="8" opacity="0.6" />}
      {kind === 'thermo' && <rect x="94" y="48" width="12" height="80" rx="6" fill={m.edge} opacity="0.45" />}
    </svg>
  );
}
