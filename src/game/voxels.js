import * as THREE from 'three';
import { hex } from './utils.js';

// One shared unit cube. Every voxel in the world is an instance of it.
export const BOX = new THREE.BoxGeometry(1, 1, 1);

const _m = new THREE.Matrix4();
const _p = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();
const _c = new THREE.Color();

/**
 * Collects boxes, then turns them into (at most) two InstancedMeshes:
 * one lit (Lambert, flat-shaded) and one "glow" (unlit, for windows, lamps, fire).
 */
export class VoxelBatch {
  constructor() {
    this.lit = [];
    this.glow = [];
  }

  /** Box from its min corner (x, y, z) with size (w, h, d). */
  box(x, y, z, w, h, d, color, glow = false) {
    (glow ? this.glow : this.lit).push(x + w / 2, y + h / 2, z + d / 2, w, h, d, hex(color));
  }

  cell(x, y, z, color, glow = false) {
    this.box(x, y, z, 1, 1, 1, color, glow);
  }

  get count() {
    return (this.lit.length + this.glow.length) / 7;
  }

  toGroup(mats) {
    const g = new THREE.Group();
    if (this.lit.length) g.add(toMesh(this.lit, mats.lit));
    if (this.glow.length) g.add(toMesh(this.glow, mats.glow));
    return g;
  }
}

function toMesh(arr, mat) {
  const n = arr.length / 7;
  const mesh = new THREE.InstancedMesh(BOX, mat, n);
  for (let i = 0; i < n; i++) {
    const o = i * 7;
    _p.set(arr[o], arr[o + 1], arr[o + 2]);
    _s.set(arr[o + 3], arr[o + 4], arr[o + 5]);
    _m.compose(_p, _q, _s);
    mesh.setMatrixAt(i, _m);
    mesh.setColorAt(i, _c.setHex(arr[o + 6]));
  }
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingSphere();
  mesh.matrixAutoUpdate = false;
  mesh.updateMatrix();
  return mesh;
}
