import * as THREE from 'three';

/**
 * How a trout's body moves, without a skeleton: the spine is a function the GPU evaluates for
 * every vertex. t is the place on the body (0 nose, 1 tail). Each fish sends three numbers per frame
 * (aSwim): the tail-beat phase, how wide the tail sweeps, and how much the whole body curves (a turn,
 * or the C of an escape). The phase is integrated on the CPU so the beat can speed up without jumps.
 *
 * Two steps: the travelling wave is a small sideways shift (it never gets steep), and the curve is a
 * true arc around the pivot, like Blender's Bend modifier, so even a full C keeps the fish its length.
 */
const SPINE = /* glsl */ `
attribute vec3 aSwim;
uniform float uWaves;
uniform float uHead;
const float TAU = 6.2831853;
const float PIVOT_Z = 0.15; // a trout turns around a point about a third of the way back from the nose

// The head barely moves and the sweep grows towards the tail (subcarangiform swimming)
float envelope(float t) { return uHead + (1.0 - uHead) * t * t; }
float waveX(float t) { return sin(aSwim.x - TAU * uWaves * t) * aSwim.y * envelope(t); }
// d(waveX)/dt, to tilt the normals with the wave so the light slides along the body
float waveSlope(float t) {
  float k = TAU * uWaves;
  float a = aSwim.x - k * t;
  return aSwim.y * (2.0 * (1.0 - uHead) * t * sin(a) - envelope(t) * k * cos(a));
}
// Bends a point (x across the body, z along it) onto an arc of curvature k through the pivot
vec2 arcBend(vec2 xz, float k) {
  float d = xz.y - PIVOT_Z;
  float a = k * d;
  float big = step(0.001, abs(k));
  float sx = mix(0.5 * k * d * d, (1.0 - cos(a)) / (k + (1.0 - big)), big);
  float sz = mix(d, sin(a) / (k + (1.0 - big)), big);
  return vec2(sx + xz.x * cos(a), PIVOT_Z + sz - xz.x * sin(a));
}
vec2 arcNormal(vec2 n, float a) { return vec2(n.x * cos(a) + n.y * sin(a), -n.x * sin(a) + n.y * cos(a)); }
`;

export interface SwimUniforms {
  uWaves: { value: number };
  uHead: { value: number };
}

export function createSwimUniforms(): SwimUniforms {
  // A trout carries a little less than one full wave along its body
  return { uWaves: { value: 0.85 }, uHead: { value: 0.07 } };
}

/** The model's own glossy material, taught to swim. Lighting, textures and gloss stay exactly as they were. */
export function createSwimMaterial(base: THREE.MeshStandardMaterial, uniforms: SwimUniforms): THREE.MeshStandardMaterial {
  const material = base.clone();
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = SPINE + shader.vertexShader
      .replace(
        '#include <beginnormal_vertex>',
        `#include <beginnormal_vertex>
        // The wave shears the body sideways (matching normal correction), then the arc turns it
        float swimT = clamp(0.5 - position.z, 0.0, 1.0);
        float swimK = 2.0 * aSwim.z;
        objectNormal.z += waveSlope(swimT) * objectNormal.x;
        objectNormal.xz = arcNormal(objectNormal.xz, swimK * (position.z - PIVOT_Z));
        objectNormal = normalize(objectNormal);`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        transformed.x += waveX(swimT);
        transformed.xz = arcBend(transformed.xz, swimK);`,
      );
  };
  material.customProgramCacheKey = () => 'trout-swim-v1';
  return material;
}
