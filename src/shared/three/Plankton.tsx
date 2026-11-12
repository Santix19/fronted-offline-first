import { useFrame, useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * A current of GPU particles: thousands of glossy specks in the design.md colours, drifting up
 * through the water in a curling flow, swirling away from the pointer and lagging behind scroll.
 * All motion happens in the vertex shader: one draw call, no per-frame CPU work but four uniforms.
 */

const VERTEX = /* glsl */ `
  attribute vec4 aSeed;       // x: phase, y: speed, z: size, w: colour pick
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uPointer;      // in world units on the z = 0 plane
  uniform vec2 uHalf;         // half the visible width and height at z = 0
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vAlpha;

  uniform vec3 uViolet, uBlue, uLime, uPeach, uInk;

  void main() {
    vec3 p = position;
    float t = uTime * aSeed.y;

    // Rise and wrap: every speck climbs and re-enters from below
    float span = uHalf.y * 2.0 + 2.0;
    p.y = mod(p.y + t * 0.6 - uScroll * 3.0 + uHalf.y + 1.0, span) - uHalf.y - 1.0;

    // A curling current: two crossed sine fields read as eddies in water
    p.x += sin(p.y * 0.9 + uTime * 0.4 + aSeed.x) * 0.45 + sin(p.y * 0.23 + aSeed.x * 3.0) * 0.8;
    p.z += cos(p.x * 0.7 + uTime * 0.3 + aSeed.x) * 0.3;

    // The pointer pushes specks aside, a little swirl around it
    vec2 d = p.xy - uPointer;
    float r = length(d);
    float push = exp(-r * 1.4) * 1.3;
    p.xy += normalize(d + 0.0001) * push + vec2(-d.y, d.x) * push * 0.35;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSeed.z * uPixelRatio * (9.0 / -mv.z);

    vec3 c = aSeed.w < 0.32 ? uViolet : aSeed.w < 0.62 ? uBlue : aSeed.w < 0.9 ? uLime : uPeach;
    vColor = c;
    // Nearer specks are stronger; far ones fade into the water
    vAlpha = clamp(0.25 + (p.z + 4.0) * 0.12, 0.2, 0.75);
  }
`;

const FRAGMENT = /* glsl */ `
  precision highp float;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    // A tiny glossy bead: a solid disc with a white highlight up and left, like the 3D objects
    float edge = 1.0 - smoothstep(0.42, 0.5, d);
    float shine = smoothstep(0.22, 0.0, length(uv - vec2(-0.14, 0.16)));
    vec3 col = mix(vColor * 0.85, vColor, smoothstep(0.5, 0.0, d));
    col = mix(col, vec3(1.0), shine * 0.75);
    gl_FragColor = vec4(col, edge * vAlpha);
  }
`;

/** Speck colours. Sky (signed-in screens): blues with a few lime specks, never violet. */
const SPECK_PALETTES = {
  story: ['#c66ef5', '#73a6ff', '#b8e23a', '#ff9f7a'],
  sky: ['#8fb9ff', '#5b93f5', '#b9d6ff', '#c9ec5a'],
} as const;

export function Plankton({ count, palette = 'story' }: { count: number; palette?: keyof typeof SPECK_PALETTES }) {
  const [s1, s2, s3, s4] = SPECK_PALETTES[palette];
  const viewport = useThree((s) => s.viewport);
  const dpr = useThree((s) => s.viewport.dpr);

  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = -Math.random() * 6 + 1;
      seeds[i * 4] = Math.random() * 6.283;
      seeds[i * 4 + 1] = 0.25 + Math.random() * 0.9;
      // Mostly fine specks, a few fat beads
      seeds[i * 4 + 2] = Math.random() < 0.95 ? 3 + Math.random() * 5 : 10 + Math.random() * 7;
      seeds[i * 4 + 3] = Math.random();
    }
    return { positions, seeds };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uPointer: { value: new THREE.Vector2(99, 99) },
      uHalf: { value: new THREE.Vector2(4, 4) },
      uPixelRatio: { value: 1 },
      uViolet: { value: new THREE.Color(s1) },
      uBlue: { value: new THREE.Color(s2) },
      uLime: { value: new THREE.Color(s3) },
      uPeach: { value: new THREE.Color(s4) },
      uInk: { value: new THREE.Color('#0a0a0a') },
    }),
    [],
  );

  const target = useMemo(() => new THREE.Vector2(), []);

  useFrame((state, delta) => {
    uniforms.uTime.value += delta;
    uniforms.uPixelRatio.value = dpr;
    uniforms.uHalf.value.set(viewport.width / 2, viewport.height / 2);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const scroll = max > 0 ? window.scrollY / max : 0;
    uniforms.uScroll.value += (scroll - uniforms.uScroll.value) * 0.08;
    // Pointer in world units on the z = 0 plane, eased so the swirl trails the finger
    target.set((state.pointer.x * viewport.width) / 2, (state.pointer.y * viewport.height) / 2);
    uniforms.uPointer.value.lerp(target, 0.1);
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 4]} />
      </bufferGeometry>
      <shaderMaterial vertexShader={VERTEX} fragmentShader={FRAGMENT} uniforms={uniforms} transparent depthWrite={false} />
    </points>
  );
}
