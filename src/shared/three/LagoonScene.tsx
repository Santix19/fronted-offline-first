import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { StorySchool } from './fish/StorySchool';
import { Plankton } from './Plankton';

/**
 * The live lagoon behind the story and the sign-in (2026-11-12, "make the background louder").
 * Three layers, back to front: a liquid shader in the design.md colours that ripples towards the
 * pointer, the 3D object renders swimming and floating at different depths, and glossy bubbles.
 * Loaded lazily (see LiveBackdrop); never mounted under reduced motion or without WebGL.
 */

const LIQUID_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// Domain-warped value noise blends four flat colours; a clear zone keeps the copy column readable
const LIQUID_FRAGMENT = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uPointer;
  uniform float uAspect;
  uniform vec3 uCanvas, uViolet, uBlue, uLime, uPeach;
  uniform float uClear;
  uniform float uColumn;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = vec2(uv.x * uAspect, uv.y) * 1.6;
    float t = uTime * 0.07 + uScroll * 1.5;

    // The pointer pushes a ripple through the liquid
    vec2 pointer = vec2((uPointer.x * 0.5 + 0.5) * uAspect, uPointer.y * 0.5 + 0.5) * 1.6;
    float d = distance(p, pointer);
    p += normalize(p - pointer + 0.0001) * 0.12 * sin(d * 9.0 - uTime * 2.2) * exp(-d * 1.8);

    vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
    float n = fbm(p + 2.2 * q + t * 0.6);

    vec3 col = mix(uViolet, uBlue, smoothstep(0.25, 0.75, n));
    col = mix(col, uLime, smoothstep(0.55, 0.85, q.x) * 0.85);
    col = mix(col, uPeach, smoothstep(0.6, 0.9, q.y) * 0.75);

    // Hard posterised bands: the flat, cut-paper look of design.md rather than a soft glow
    float band = floor(n * 5.0) / 5.0;
    col = mix(col, col * 1.08, step(0.5, fract(band * 2.5)));

    // Keep the copy readable: the canvas grey wins in a diagonal band through the middle-left
    float diag = (uv.x * 0.9 + (1.0 - uv.y) * 0.35);
    float clear = smoothstep(0.18, 0.42, diag) * (1.0 - smoothstep(0.62, 0.86, diag));
    // App mode: a canvas-clean column where the cards and numbers live; colour stays at the edges
    float column = uColumn * (1.0 - smoothstep(0.3, 0.5, abs(uv.x - 0.5)));
    col = mix(col, uCanvas, max(clear, column) * uClear);

    gl_FragColor = vec4(col, 1.0);
  }
`;

function scrollProgress(): number {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? window.scrollY / max : 0;
}

/**
 * The four liquid colours. Story: the design.md set. App (Nico, 2026-11-12): light blues, no violet.
 * Night: the app in the dark theme. Every one is dark enough for white titles and for the muted
 * grey (#a1a8b7) at 4.5:1; before, the dark theme painted white text on this light lagoon at about
 * 1.1:1 (E2 in docs/rediseno/inventario.md).
 */
const LIQUID_PALETTES = {
  story: ['#b9b0ee', '#e8386f', '#a9b83a', '#ff9e5e'],
  sky: ['#a9cbff', '#73a6ff', '#d9e9ff', '#c4defc'],
  night: ['#0d1a30', '#163257', '#183a63', '#112645'],
} as const;

/** The calm middle where the cards sit: the page colour of each theme (--mist). */
const CANVAS = { light: '#f3ebdd', dark: '#1b1413' } as const;

interface LiquidProps {
  clearStrength: number;
  column: boolean;
  palette: keyof typeof LIQUID_PALETTES;
  canvas: string;
}

function Liquid({ clearStrength, column, palette, canvas }: LiquidProps) {
  const [c1, c2, c3, c4] = LIQUID_PALETTES[palette];
  const size = useThree((s) => s.size);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uPointer: { value: new THREE.Vector2(0.4, 0.2) },
      uAspect: { value: 1 },
      uCanvas: { value: new THREE.Color(canvas) },
      uViolet: { value: new THREE.Color(c1) },
      uBlue: { value: new THREE.Color(c2) },
      uLime: { value: new THREE.Color(c3) },
      uPeach: { value: new THREE.Color(c4) },
      uClear: { value: clearStrength },
      uColumn: { value: column ? 1 : 0 },
    }),
    [],
  );

  // Switching the theme in Ajustes repaints the lagoon at once, without rebuilding the scene
  useEffect(() => {
    uniforms.uCanvas.value.set(canvas);
    [uniforms.uViolet, uniforms.uBlue, uniforms.uLime, uniforms.uPeach].forEach((u, i) => u.value.set(LIQUID_PALETTES[palette][i]));
  }, [uniforms, palette, canvas]);

  useFrame((state, delta) => {
    uniforms.uTime.value += delta;
    uniforms.uAspect.value = size.width / size.height;
    uniforms.uScroll.value += (scrollProgress() - uniforms.uScroll.value) * 0.08;
    // The ripple trails the pointer instead of snapping to it
    uniforms.uPointer.value.lerp(state.pointer, 0.06);
  });

  return (
    <mesh frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial vertexShader={LIQUID_VERTEX} fragmentShader={LIQUID_FRAGMENT} uniforms={uniforms} depthWrite={false} />
    </mesh>
  );
}

type Swimmer = { src: string; size: number; z: number; y: number; speed: number; phase: number; swims: boolean };

const SWIMMERS: Swimmer[] = [
  { src: '/objects/drop.webp', size: 1.1, z: -2, y: -2.6, speed: 0.4, phase: 0.8, swims: false },
  { src: '/objects/thermo.webp', size: 1.0, z: -3, y: 2.8, speed: 0.3, phase: 2.2, swims: false },
  { src: '/objects/cloud.webp', size: 1.4, z: -5, y: 3.4, speed: 0.2, phase: 4.1, swims: false },
];

/** One render on a plane: fish cross the water and turn at the edges; the rest bob and drift. */
function Floater({ s, texture }: { s: Swimmer; texture: THREE.Texture }) {
  const ref = useRef<THREE.Mesh>(null);
  const viewport = useThree((st) => st.viewport);
  const image = texture.image as HTMLImageElement | undefined;
  const aspect = image ? image.width / image.height : 1;

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime * s.speed + s.phase;
    const vp = viewport.getCurrentViewport(state.camera, new THREE.Vector3(0, 0, s.z));
    // Sizes are tuned for a wide screen; a narrow phone gets them scaled to its width
    const fit = Math.min(1, vp.width / 9);
    const size = s.size * fit;
    const half = vp.width / 2 + size;
    const scroll = scrollProgress();
    if (s.swims) {
      // Back and forth across the screen; the fish faces the way it swims
      const x = Math.sin(t * 0.5) * half;
      const heading = Math.cos(t * 0.5) >= 0 ? 1 : -1;
      mesh.position.set(x, s.y + Math.sin(t * 2.4) * 0.25 - scroll * 3, s.z);
      mesh.scale.x += (heading * size * aspect - mesh.scale.x) * 0.08;
      mesh.scale.y = size;
      mesh.rotation.z = Math.sin(t * 2.4) * 0.12;
    } else {
      mesh.position.set(Math.sin(t) * 0.8 + (s.phase % 2 ? 1 : -1) * vp.width * 0.32, s.y + Math.sin(t * 1.3) * 0.4 - scroll * 4, s.z);
      mesh.rotation.z = Math.sin(t * 0.9) * 0.35;
      mesh.scale.set(size * aspect, size, 1);
    }
    // Everything leans towards the pointer, nearer objects more
    mesh.position.x += state.pointer.x * (1.2 / (1 - s.z * 0.3));
    mesh.position.y += state.pointer.y * (0.8 / (1 - s.z * 0.3));
  });

  return (
    <mesh ref={ref} scale={[s.size * aspect, s.size, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

function Floaters() {
  const sources = [...new Set(SWIMMERS.map((s) => s.src))];
  const textures = useLoader(THREE.TextureLoader, sources);
  const bySrc = useMemo(() => {
    const map = new Map<string, THREE.Texture>();
    sources.forEach((src, i) => {
      textures[i].colorSpace = THREE.SRGBColorSpace;
      map.set(src, textures[i]);
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textures]);
  return (
    <>
      {SWIMMERS.map((s, i) => (
        <Floater key={i} s={s} texture={bySrc.get(s.src)!} />
      ))}
    </>
  );
}

const BUBBLES = 28;

/** Glossy bubbles rising from below, wobbling as they go: real 3D, lit by one soft key light. */
function Bubbles() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(
    () =>
      Array.from({ length: BUBBLES }, () => ({
        x: (Math.random() - 0.5) * 12,
        z: -Math.random() * 5,
        r: 0.06 + Math.random() * 0.18,
        speed: 0.4 + Math.random() * 0.8,
        offset: Math.random() * 20,
      })),
    [],
  );

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    seeds.forEach((b, i) => {
      const y = ((t * b.speed + b.offset) % 12) - 6;
      dummy.position.set(b.x + Math.sin(t * 1.5 + b.offset) * 0.2, y, b.z);
      dummy.scale.setScalar(b.r);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, BUBBLES]}>
      <sphereGeometry args={[1, 24, 16]} />
      <meshStandardMaterial color="#ffffff" roughness={0.05} metalness={0.1} transparent opacity={0.55} />
    </instancedMesh>
  );
}

export type LagoonMode = 'story' | 'app';

/**
 * story: the full lagoon (liquid, swimming renders, bubbles, specks) for the screens seen once.
 * app: behind the data all day, so the liquid stays pale through the content column and the
 * loudness comes from the particle current; no big renders crossing the numbers.
 */
export default function LagoonScene({ mode = 'story', dark = false }: { mode?: LagoonMode; dark?: boolean }) {
  const narrow = window.innerWidth < 700;
  const app = mode === 'app';
  // The story keeps its own light lagoon in both themes; the app follows the theme (E2)
  const night = app && dark;
  return (
    <Canvas
      className="lagoon-canvas"
      dpr={app ? 1 : [1, 1.5]}
      camera={{ position: [0, 0, 6], fov: 50 }}
      gl={{ antialias: false, alpha: false, powerPreference: 'low-power' }}
      // The canvas sits behind the copy and takes no taps; the pointer is read from the whole page
      eventSource={document.body}
      eventPrefix="client"
      aria-hidden="true"
    >
      <Liquid
        clearStrength={app ? 0.9 : 0.7}
        column={app}
        palette={night ? 'night' : app ? 'sky' : 'story'}
        canvas={night ? CANVAS.dark : CANVAS.light}
      />
      <hemisphereLight args={['#ffffff', app ? '#a9cbff' : '#c66ef5', 1.2]} />
      <directionalLight position={[-4, 6, 5]} intensity={2} />
      <Plankton count={app ? (narrow ? 1800 : 6000) : narrow ? 1500 : 4000} palette={app ? 'sky' : 'story'} />
      {!app && (
        <Suspense fallback={null}>
          <Floaters />
          <StorySchool narrow={narrow} />
        </Suspense>
      )}
      <Bubbles />
    </Canvas>
  );
}
