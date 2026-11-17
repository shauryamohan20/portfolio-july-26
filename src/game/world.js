import * as THREE from 'three';
import { VoxelBatch } from './voxels.js';
import { PROPS } from './props.js';
import { mulberry32, noise2, pick, clamp, lerp, smoothstep, voxelText, textWidth } from './utils.js';

/** Length of one zone along the road (x axis), in voxels. */
// Phones get shorter zones, so the whole run takes less time there.
const COARSE = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
export const ZONE = COARSE ? 46 : 64;
const Z_BACK = -30; // terrain depth behind the road
const Z_FRONT = 14; // terrain edge nearest the camera
/** Coins in the whole run (same on phones and desktop). Collect them all for a surprise. */
export const TOTAL_COINS = 100;
export const END_PAD = COARSE ? 14 : 22; // extra ground before the first and after the last zone

/**
 * The run: zones line up left to right along one road (z = 0), in content order.
 * Adding a section to content.js adds a zone at the end; everything extends.
 */
export function createWorld(themes) {
  const N = themes.length;
  const minX = -END_PAD, maxX = N * ZONE + END_PAD;
  const flatSpots = [];

  const zoneAt = (x) => clamp(Math.floor(x / ZONE), 0, N - 1);
  const hillAmp = (x) => {
    const f = x / ZONE - 0.5;
    const i0 = Math.floor(f);
    const a = themes[clamp(i0, 0, N - 1)].hills, b = themes[clamp(i0 + 1, 0, N - 1)].hills;
    return lerp(a, b, smoothstep(0.35, 0.65, f - i0));
  };

  /** Height (top surface y) of the ground column at integer (x, z). */
  const top = (x, z) => {
    if (x < minX + 4 || x >= maxX - 4) return 9 + Math.floor(noise2(x * 0.3, z * 0.3) * 6); // end cliffs
    const cz = z + 0.5;
    if (Math.abs(cz) < 3.2) return 0;
    for (const f of flatSpots) if (Math.abs(x + 0.5 - f.x) < f.w && Math.abs(cz - f.z) < f.d) return 0;
    if (cz > 0) return cz > 5 && noise2(x * 0.2 + 50, z * 0.2) > 0.72 ? 1 : 0;
    const n = noise2(x * 0.08, z * 0.08) * 0.7 + noise2(x * 0.22 + 9, z * 0.22) * 0.3;
    return Math.floor(n * 4.6 * Math.min(1, (-cz - 3.2) / 8) * hillAmp(x));
  };

  const mats = {
    lit: new THREE.MeshLambertMaterial(),
    glow: new THREE.MeshBasicMaterial(),
  };

  function buildZone(i) {
    const th = themes[i];
    const rng = mulberry32(1000 + i * 977);
    const b = new VoxelBatch();
    const stations = [];
    const extras = new THREE.Group(); // textured meshes (billboards)
    const occupied = [];
    const x0 = i * ZONE, x1 = (i + 1) * ZONE, cx = x0 + ZONE / 2;
    const bx0 = i === 0 ? minX : x0, bx1 = i === N - 1 ? maxX : x1; // build range incl. end pads

    const ctx = {
      b, rng, th, i, L: ZONE, x0, x1, cx, top, extras,
      flat(x, z, w, d = w) { flatSpots.push({ x, z, w, d }); },
      reserve(x, z, r) { occupied.push({ x, z, r }); },
      /** A readable spot on the road: stand under the marker and press E. */
      station(s) { stations.push({ zone: i, markerY: 4.2, ...s }); occupied.push({ x: s.x, z: -4, r: 3 }); },
      /** A random free spot in this zone, z between minZ and maxZ (negative = behind the road). */
      place(minZ, maxZ, r = 1.5) {
        for (let tries = 0; tries < 50; tries++) {
          const x = Math.floor(x0 + 2 + rng() * (ZONE - 4));
          const z = Math.floor(minZ + rng() * (maxZ - minZ));
          if (occupied.some((o) => Math.hypot(o.x - x, o.z - z) < o.r + r)) continue;
          occupied.push({ x, z, r });
          return { x, z, y: top(x, z) };
        }
        return null;
      },
    };

    // Landmarks first (they flatten their ground), then scenery.
    for (const name of th.props) (PROPS[name] || PROPS.trees)(ctx);
    if (!stations.length) PROPS.signStation(ctx);
    if (i > 0) PROPS.signpost(ctx);

    // ---- Terrain ----
    const W = bx1 - bx0 + 2, D = Z_FRONT - Z_BACK + 2;
    const H = new Int8Array(W * D);
    for (let x = bx0 - 1; x <= bx1; x++) for (let z = Z_BACK - 1; z <= Z_FRONT; z++) H[(x - bx0 + 1) * D + (z - Z_BACK + 1)] = top(x, z);
    const h = (x, z) => H[(x - bx0 + 1) * D + (z - Z_BACK + 1)];
    for (let x = bx0; x < bx1; x++) {
      // Dither palettes near zone borders for a soft blend.
      let owner = th;
      const dl = x - x0, dr = x1 - x;
      if (i > 0 && dl < 10 && rng() < 0.5 * (1 - dl / 10)) owner = themes[i - 1];
      else if (i < N - 1 && dr < 10 && rng() < 0.5 * (1 - dr / 10)) owner = themes[i + 1];
      const g = owner.ground;
      const cliff = x < minX + 4 || x >= maxX - 4;
      for (let z = Z_BACK; z < Z_FRONT; z++) {
        const ht = h(x, z);
        const road = !cliff && Math.abs(z + 0.5) < 1.7;
        const col = cliff ? (ht > 12 ? owner.snow : pick(rng, owner.mountain)) : road ? pick(rng, g.path) : pick(rng, g.top);
        b.cell(x, ht - 1, z, col);
        const low = z === Z_FRONT - 1 ? -24 : Math.min(h(x - 1, z), h(x + 1, z), h(x, z - 1), h(x, z + 1));
        if (low < ht - 1) b.box(x, low, z, 1, ht - 1 - low, 1, cliff ? pick(rng, owner.mountain) : pick(rng, g.side));
      }
      // road edging stones
      if (!cliff && x % 2 === 0) {
        b.box(x, 0, -2.25, 1, 0.18, 0.5, '#8d8a80');
        b.box(x, 0, 1.75, 1, 0.18, 0.5, '#8d8a80');
      }
    }

    // ---- Distant mountains (peaks from neighbours too, so ranges connect) ----
    const peaks = [];
    for (let j = i - 1; j <= i + 1; j++) {
      const r = mulberry32(5000 + j * 131);
      for (let p = 0; p < 5; p++) peaks.push({ x: j * ZONE + r() * ZONE, z: -44 - r() * 14, h: 10 + r() * 16, r: 11 + r() * 10 });
    }
    for (let x = bx0 - (((bx0 % 2) + 2) % 2); x < bx1; x += 2) {
      for (let z = -64; z < Z_BACK; z += 2) {
        let mh = 0;
        for (const p of peaks) mh = Math.max(mh, p.h * (1 - Math.hypot(x - p.x, z - p.z) / p.r));
        mh = Math.round(mh + noise2(x * 0.3, z * 0.3) * 2);
        if (mh < 2) continue;
        const rock = pick(rng, th.mountain);
        if (mh > 16) {
          b.box(x, -3, z, 2, mh + 1, 2, rock);
          b.box(x, mh - 2, z, 2, 2, 2, th.snow);
        } else b.box(x, -3, z, 2, mh + 3, 2, rock);
      }
    }

    // Big zone name floating above the hills.
    const label = th.label;
    voxelText(b, label, Math.floor(cx - textWidth(label) / 2), 12, -24, th.textColor, { glow: th.night > 0.5 });

    // Floating diamond over each readable station.
    const markers = new THREE.Group();
    for (const s of stations) {
      const m = new THREE.Mesh(MARKER_GEO, new THREE.MeshBasicMaterial({ color: th.accent }));
      m.position.set(s.x, s.markerY, 0);
      m.userData.baseY = s.markerY;
      markers.add(m);
      s.marker = m;
    }

    const group = b.toGroup(mats);
    group.add(extras, markers);

    // ---- Coins: exactly TOTAL_COINS across the whole run, on every device ----
    // Each zone gets its share, laid out as trails of five that alternate
    // between low (just run through) and an arc (jump for the top ones).
    const coins = [];
    const share = Math.floor(TOTAL_COINS / N) + (i < TOTAL_COINS % N ? 1 : 0);
    const trails = Math.ceil(share / 5);
    let left = share;
    for (let t = 0; t < trails; t++) {
      const n = Math.min(5, left);
      left -= n;
      const centre = x0 + (ZONE * (t + 0.5)) / trails;
      const start = centre - ((n - 1) * 1.3) / 2;
      const arc = (t + i) % 2 === 1;
      for (let c = 0; c < n; c++) {
        const y = arc && n > 1 ? 1.6 + Math.sin((c / (n - 1)) * Math.PI) * 2.4 : 1.5;
        coins.push({ x: start + c * 1.3, y, z: 0, collected: false, anim: 0 });
      }
    }

    return { group, coins, stations, markers, x0, x1 };
  }

  return { N, minX, maxX, top, buildZone, mats, zoneAt, spawnX: themes.length ? ZONE * 0.18 : 0 };
}

const MARKER_GEO = new THREE.OctahedronGeometry(0.45, 0);
