import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

/**
 * The optimised trout (public/models, made from the 28 MB original with gltf-transform:
 * 5,484 triangles and 1024 px textures; the small one 1,828 and 512 px).
 * The model's nose already points to +Z and its tail to -Z, which is what the swim shader expects.
 */
export const TROUT_MODELS = { full: '/models/trucha.glb', small: '/models/trucha-lod.glb' } as const;

export interface TroutAsset {
  geometry: THREE.BufferGeometry;
  material: THREE.MeshStandardMaterial;
}

const cache = new Map<string, Promise<TroutAsset>>();

/** Loads the trout once per address; every school that asks again gets the same promise. */
export function loadTrout(url: string): Promise<TroutAsset> {
  if (!cache.has(url)) cache.set(url, read(url));
  return cache.get(url)!;
}

async function read(url: string): Promise<TroutAsset> {
  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(url);
  gltf.scene.updateMatrixWorld(true);
  let mesh: THREE.Mesh | undefined;
  gltf.scene.traverse((o) => {
    if (!mesh && (o as THREE.Mesh).isMesh) mesh = o as THREE.Mesh;
  });
  if (!mesh) throw new Error(`${url}: no mesh in the trout model`);
  return { geometry: toBodySpace(mesh.geometry, mesh.matrixWorld), material: mesh.material as THREE.MeshStandardMaterial };
}

/**
 * The file stores positions as compressed integers plus a node transform. The shader needs plain
 * numbers in the fish's own space: centred, exactly 1 unit from tail to nose.
 */
function toBodySpace(source: THREE.BufferGeometry, matrix: THREE.Matrix4): THREE.BufferGeometry {
  const pos = source.getAttribute('position');
  const nor = source.getAttribute('normal');
  const normalMatrix = new THREE.Matrix3().getNormalMatrix(matrix);
  const positions = new Float32Array(pos.count * 3);
  const normals = new Float32Array(pos.count * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(matrix).toArray(positions, i * 3);
    if (nor) v.fromBufferAttribute(nor, i).applyMatrix3(normalMatrix).normalize().toArray(normals, i * 3);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute('uv', source.getAttribute('uv'));
  geometry.setIndex(source.getIndex());

  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const centre = box.getCenter(new THREE.Vector3());
  const length = box.max.z - box.min.z;
  geometry.translate(-centre.x, -centre.y, -centre.z);
  geometry.scale(1 / length, 1 / length, 1 / length);
  if (!nor) geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}
