/**
 * Prop builders for the run.
 * ctx = { b, rng, th, i, L, x0, x1, cx, top, extras, place, flat, reserve, station }
 *  - b.box(x, y, z, w, h, d, color, glow) adds a box by its min corner
 *  - The road runs along z = 0. Negative z is behind it (away from the camera).
 *  - ctx.station({ x, label, target }) puts a readable marker on the road at x.
 *    target: { type: 'section', id } | { type: 'service', index } | { type: 'project', index }
 * Add a builder here, then name it in themes.js `props`.
 */
import * as THREE from 'three';
import { sections } from '../content.js';
import { pick, voxelText, textWidth } from './utils.js';

const projectItems = sections.find((s) => s.kind === 'projects')?.items || [];
const HD = !window.matchMedia('(pointer: coarse)').matches; // desktop gets 2880px screenshots
let renderer = null;
export const setRenderer = (r) => (renderer = r);

// Every texture load registers here so the loading screen can wait for them.
export const pendingTextures = [];

// ---------- street-lamp light: a soft additive cone plus a glowing pool on the ground ----------

const LIGHT = (() => {
  const h = 3.2, color = new THREE.Color('#ffd98a');
  const coneGeo = new THREE.ConeGeometry(2.0, h, 40, 1, true);
  const coneMat = new THREE.ShaderMaterial({
    uniforms: { color: { value: color } },
    transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec2 vUv; varying float vFacing;
      void main(){ vUv = uv;
        vec3 n = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vFacing = abs(dot(n, normalize(-mv.xyz)));
        gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 color; varying vec2 vUv; varying float vFacing;
      void main(){ float a = (0.12 + 0.55 * pow(vUv.y, 1.2)) * pow(vFacing, 0.8);
        gl_FragColor = vec4(color * a, a);
        #include <colorspace_fragment>
      }`,
  });
  const poolGeo = new THREE.CircleGeometry(2.3, 40).rotateX(-Math.PI / 2);
  const poolMat = new THREE.ShaderMaterial({
    uniforms: { color: { value: color } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec2 vP; void main(){ vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform vec3 color; varying vec2 vP;
      void main(){ float r = length(vP) / 2.3; float a = 0.85 * (1.0 - smoothstep(0.0, 1.0, r));
        gl_FragColor = vec4(color * a, a);
        #include <colorspace_fragment>
      }`,
  });
  return { h, coneGeo, coneMat, poolGeo, poolMat };
})();

// ---------- small reusable pieces ----------

function tree(ctx, x, z, y, leaves = ctx.th.leaves, trunk = ctx.th.trunk) {
  const { b, rng } = ctx;
  const h = 3 + Math.floor(rng() * 2);
  b.box(x, y, z, 1, h, 1, trunk);
  const r = 1.7 + rng() * 0.7;
  const cy = Math.floor(y + h + 0.5);
  for (let dx = -2; dx <= 2; dx++)
    for (let dy = -1; dy <= 2; dy++)
      for (let dz = -2; dz <= 2; dz++)
        if (dx * dx + dy * dy * 1.4 + dz * dz <= r * r + rng() * 0.6) b.cell(x + dx, cy + dy, z + dz, pick(rng, leaves));
}

function pine(ctx, x, z, y) {
  const { b, rng, th } = ctx;
  const leaf = () => pick(rng, th.leaves);
  b.box(x, y, z, 1, 2, 1, th.trunk);
  b.box(x - 2, y + 2, z - 2, 5, 1, 5, leaf());
  b.box(x - 1, y + 3, z - 1, 3, 2, 3, leaf());
  b.box(x, y + 5, z, 1, 1, 1, leaf());
  b.box(x, y + 6, z, 1, 0.5, 1, '#e8f4ff');
}

function bush(ctx, x, z, y) {
  const { b, rng, th } = ctx;
  b.box(x, y, z, 2, 1, 2, pick(rng, th.leaves));
  b.box(x + (rng() < 0.5 ? 0 : 1), y + 1, z + (rng() < 0.5 ? 0 : 1), 1, 1, 1, pick(rng, th.leaves));
}

/** A big signboard behind the road with white voxel letters. */
function signboard(ctx, x, z, text, color = ctx.th.accent) {
  const { b } = ctx;
  const scale = 0.45;
  const tw = textWidth(text) * scale;
  const w = Math.max(6, tw + 2);
  ctx.flat(x, z, w / 2 + 2, 3);
  b.box(x - w / 2, 0, z, 0.45, 4.2, 0.45, '#7a4d24');
  b.box(x + w / 2 - 0.45, 0, z, 0.45, 4.2, 0.45, '#7a4d24');
  b.box(x - w / 2 - 0.2, 1.8, z - 0.1, w + 0.4, 3.0, 0.45, color);
  voxelText(b, text, x - tw / 2, 2.2, z + 0.35, '#ffffff', { scale, depth: 0.15 });
}

/** Loads a screenshot as a sharp, mipmapped texture. */
function screenshotTexture(src) {
  const url = HD ? src.replace(/^\/projects\/(?!hd\/)/, '/projects/hd/') : src;
  let done;
  pendingTextures.push(new Promise((res) => { done = res; setTimeout(res, 8000); }));
  const tex = new THREE.TextureLoader().load(url, () => done(), undefined, () => done());
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 4;
  return tex;
}

/** A billboard behind the road showing a real screenshot. */
function billboard(ctx, x, z, image, frame = '#14172a', trim = '#ff5c8a') {
  const { b } = ctx;
  const w = 7.6, h = 4.75, y0 = 1.4;
  ctx.flat(x, z, w / 2 + 1, 2);
  b.box(x - w / 2 + 0.2, 0, z, 0.4, y0 + h, 0.4, '#3a3f55');
  b.box(x + w / 2 - 0.6, 0, z, 0.4, y0 + h, 0.4, '#3a3f55');
  b.box(x - w / 2 - 0.2, y0 - 0.2, z - 0.15, w + 0.4, h + 0.4, 0.3, frame);
  b.box(x - w / 2 - 0.2, y0 + h + 0.2, z - 0.15, w + 0.4, 0.25, 0.3, trim, true);
  const mat = new THREE.MeshBasicMaterial({ map: screenshotTexture(image), fog: true, toneMapped: false });
  const board = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  board.position.set(x, y0 + h / 2, z + 0.17);
  ctx.extras.add(board);
}

// ---------- builders ----------

export const PROPS = {
  // Generic: any zone without its own landmark gets a sign that opens its section.
  signStation(ctx) {
    signboard(ctx, ctx.cx, -6, ctx.th.label);
    ctx.station({ x: ctx.cx, label: ctx.th.label, target: { type: 'section', id: ctx.th.id } });
  },

  // A small wooden post at the start of each zone.
  signpost(ctx) {
    const { b, th, x0 } = ctx;
    b.box(x0 + 1.3, 0, -3.2, 0.3, 2.4, 0.3, '#7a4d24');
    b.box(x0 + 0.1, 1.5, -3.3, 2.7, 1.0, 0.4, th.accent);
    b.box(x0 + 2.8, 1.75, -3.3, 0.5, 0.5, 0.4, th.accent);
  },

  welcome(ctx) {
    const x = ctx.x0 + 22;
    signboard(ctx, x, -6, 'HELLO', ctx.th.accent);
    ctx.station({ x, label: 'Welcome', target: { type: 'section', id: ctx.th.id } });
  },

  trees(ctx) {
    for (let n = 0; n < 14; n++) {
      const p = ctx.place(-22, -6, 2.4);
      if (p) tree(ctx, p.x, p.z, p.y);
    }
  },

  bushes(ctx) {
    for (let n = 0; n < 10; n++) {
      const p = n < 4 ? ctx.place(4, 7, 1.4) : ctx.place(-16, -5, 1.4);
      if (p) bush(ctx, p.x, p.z, p.y);
    }
  },

  flowers(ctx) {
    const colors = ['#ff5c8a', '#ffd23f', '#ffffff', '#ff8a3d', '#b98cff'];
    for (let n = 0; n < 50; n++) {
      const p = n % 2 ? ctx.place(3.5, 8, 0.4) : ctx.place(-14, -4, 0.4);
      if (p) {
        ctx.b.box(p.x + 0.4, p.y, p.z + 0.4, 0.2, 0.5, 0.2, '#2f8f3a');
        ctx.b.box(p.x + 0.25, p.y + 0.5, p.z + 0.25, 0.5, 0.5, 0.5, pick(ctx.rng, colors));
      }
    }
  },

  // ---- About: the studio ----
  studio(ctx) {
    const { b, cx } = ctx;
    const x = cx - 6, z = -14;
    ctx.flat(cx, -9, 10, 6);
    ctx.reserve(cx, -10, 9);
    b.box(x, -2, z, 12, 8, 7, '#e9e4da'); // walls
    b.box(x - 0.5, 6, z - 0.5, 13, 0.6, 8, '#3a3f55'); // flat roof
    b.box(x + 1, 6.6, z + 1, 3, 1.2, 2, '#9aa0b0'); // roof unit
    voxelText(b, 'SHAURYA', x + 1.3, 4.4, z + 7, '#3a3f55', { scale: 0.34, depth: 0.12 });
    b.box(x + 5, 0, z + 7, 2, 3, 0.15, '#3a3f55'); // door
    for (const wx of [x + 1, x + 8.5]) b.box(wx, 1, z + 7, 2.5, 2, 0.15, '#9fe8ff', true); // windows
    b.box(x + 5.2, 0, z + 7.2, 1.6, 0.2, 6.5, '#d8d2c4'); // walkway to the road
    ctx.station({ x: cx, label: 'About me', target: { type: 'section', id: ctx.th.id } });
  },

  crystals(ctx) {
    const colors = ['#7ff0ff', '#c49bff', '#ff9bf0'];
    for (let n = 0; n < 9; n++) {
      const p = ctx.place(-16, -5, 1.2);
      if (!p) continue;
      const c = pick(ctx.rng, colors);
      ctx.b.box(p.x + 0.2, p.y, p.z + 0.2, 0.6, 1.5 + ctx.rng() * 2, 0.6, c, true);
      ctx.b.box(p.x + 0.8, p.y, p.z + 0.5, 0.4, 1 + ctx.rng(), 0.4, c, true);
    }
  },

  // ---- Services: one monument per Shopify service ----
  bagTower(ctx) {
    const { b, x0 } = ctx;
    const x = x0 + 14, z = -10;
    ctx.flat(x, z + 2, 6, 5);
    ctx.reserve(x, z, 6);
    b.box(x - 3.5, -2, z, 7, 10, 3, '#95bf47');
    b.box(x - 3.5, 8, z, 7, 0.5, 3, '#7aa33a');
    for (const hx of [x - 2.5, x + 1.5]) b.box(hx, 8, z + 1, 1, 3, 1, '#5e8e3e');
    b.box(x - 2.5, 11, z + 1, 5, 1, 1, '#5e8e3e');
    voxelText(b, 'S', x - 1.5, 2, z + 3, '#ffffff');
    ctx.station({ x, label: 'Shopify store builds', target: { type: 'service', index: 0 } });
  },

  liquidTower(ctx) {
    const { b, x0 } = ctx;
    const x = x0 + 32, z = -10;
    ctx.flat(x, z + 2, 6, 5);
    ctx.reserve(x, z, 6);
    b.box(x - 3, -2, z - 1.5, 6, 3, 6, '#3a3f55'); // pedestal
    // a voxel droplet of "Liquid"
    for (let dx = -3; dx <= 3; dx++)
      for (let dy = 0; dy <= 8; dy++)
        for (let dz = -3; dz <= 3; dz++) {
          const r = dy < 4 ? 3 : 3 * (1 - (dy - 4) / 5);
          if (dx * dx + dz * dz + (dy < 4 ? (dy - 3) * (dy - 3) : 0) <= r * r)
            b.cell(x + dx - 0.5, 1 + dy, z + dz, dy > 6 ? '#8fd3ff' : pick(ctx.rng, ['#3fa9f5', '#2f95e0', '#4fb6ff']));
        }
    b.box(x - 1.6, 3, z + 3.2, 0.7, 1.4, 0.3, '#ffffff', true); // shine
    ctx.station({ x, label: 'Custom Liquid themes', target: { type: 'service', index: 1 } });
  },

  boltTower(ctx) {
    const { b, x0 } = ctx;
    const x = x0 + 50, z = -10;
    ctx.flat(x, z + 2, 6, 5);
    ctx.reserve(x, z, 6);
    b.box(x - 3, -2, z - 1.5, 6, 3, 6, '#3a3f55');
    const bolt = [[1, 11], [2, 11], [0, 10], [1, 10], [0, 9], [1, 9], [-1, 8], [0, 8], [-1, 7], [0, 7], [1, 7], [2, 7], [0, 6], [1, 6], [0, 5], [1, 5], [-1, 4], [0, 4], [-1, 3], [-1, 2]];
    for (const [bx, by] of bolt) b.box(x + bx - 0.5, by, z, 1, 1, 1.2, '#ffd23f', true);
    ctx.station({ x, label: 'Apps, discounts and speed', target: { type: 'service', index: 2 } });
  },

  // ---- Stores: one billboard per Shopify store, along a shop street ----
  storeBillboards(ctx) {
    const n = projectItems.length;
    const gap = Math.min(12, (ctx.L - 12) / Math.max(1, n - 1));
    projectItems.forEach((p, k) => {
      const x = ctx.x0 + 8 + k * gap;
      billboard(ctx, x, -5.5, p.image, '#14172a', '#95bf47');
      ctx.reserve(x, -5.5, 4.5);
      ctx.station({ x, markerY: 7.4, label: p.title, target: { type: 'project', index: k } });
    });
  },

  shopStreet(ctx) {
    const { b, rng, x0, L } = ctx;
    const walls = ['#2b3060', '#353a70', '#3a2f5c', '#2f3a66', '#41365f'];
    const awnings = ['#95bf47', '#ff5c8a', '#ffd23f', '#3fd0ff', '#ff8a3d'];
    let x = x0 + 1;
    while (x < x0 + L - 5) {
      const w = 5 + Math.floor(rng() * 3), h = 7 + Math.floor(rng() * 7), z = -18;
      b.box(x, -2, z, w, h + 2, 5, pick(rng, walls));
      const aw = pick(rng, awnings);
      for (let s = 0; s < w; s++) b.box(x + s, 2.8, z + 5, 1, 0.4, 1.2, s % 2 ? aw : '#ffffff'); // striped awning
      b.box(x + 0.6, 0, z + 5, w - 1.2, 2.6, 0.12, '#ffe7a0', true); // lit shop window
      for (let wy = 4; wy < h - 1; wy += 2)
        for (let wx = 1; wx < w - 1; wx += 2) {
          const on = rng() < 0.5;
          b.box(x + wx, wy, z + 5, 0.8, 0.9, 0.12, on ? pick(rng, ['#ffd36b', '#fff3b0', '#7fd8ff']) : '#181b30', on);
        }
      x += w + 1;
    }
  },

  lamps(ctx) {
    const { b, x0, L } = ctx;
    for (let x = x0 + 3; x < x0 + L; x += 12) {
      b.box(x + 0.35, 0, 2.6, 0.3, 3.6, 0.3, '#3a3f55');
      b.box(x + 0.35, 3.6, 2.0, 0.3, 0.3, 0.9, '#3a3f55');
      b.box(x + 0.2, 3.25, 1.7, 0.6, 0.4, 0.6, '#fff1a0', true);
      // the cone of light and the warm pool it makes on the road
      const cone = new THREE.Mesh(LIGHT.coneGeo, LIGHT.coneMat);
      cone.position.set(x + 0.5, 3.25 - LIGHT.h / 2, 2.0);
      const pool = new THREE.Mesh(LIGHT.poolGeo, LIGHT.poolMat);
      pool.position.set(x + 0.5, 0.05, 2.0);
      cone.renderOrder = pool.renderOrder = 2;
      ctx.extras.add(cone, pool);
    }
  },

  // ---- App: EZ Master Discount ----
  appCart(ctx) {
    const { b, cx } = ctx;
    const x = cx - 7, z = -12;
    ctx.flat(cx - 4, -9, 9, 6);
    ctx.reserve(x + 4, z + 2, 8);
    const steel = '#cfd6e0', dark = '#5a6170';
    // basket frame: an open grid box
    for (let gx = 0; gx <= 8; gx += 2) b.box(x + gx, 3, z, 0.3, 4, 0.3, steel), b.box(x + gx, 3, z + 4, 0.3, 4, 0.3, steel);
    for (let gz = 0; gz <= 4; gz += 2) b.box(x, 3, z + gz, 0.3, 4, 0.3, steel), b.box(x + 8, 3, z + gz, 0.3, 4, 0.3, steel);
    for (const gy of [3, 5, 7]) {
      b.box(x, gy, z, 8.3, 0.3, 0.3, steel);
      b.box(x, gy, z + 4, 8.3, 0.3, 0.3, steel);
      b.box(x, gy, z, 0.3, 0.3, 4.3, steel);
      b.box(x + 8, gy, z, 0.3, 0.3, 4.3, steel);
    }
    b.box(x, 3, z, 8.3, 0.3, 4.3, steel); // floor
    b.box(x - 2.5, 7, z + 0.5, 2.5, 0.4, 3.3, dark); // handle
    b.box(x - 2.5, 6, z + 0.5, 0.4, 1.4, 0.4, dark);
    b.box(x - 2.5, 6, z + 3.4, 0.4, 1.4, 0.4, dark);
    for (const [wx, wz] of [[1, 0.2], [7, 0.2], [1, 3.6], [7, 3.6]]) b.box(x + wx, 0, z + wz, 1, 1, 0.6, '#222');
    for (const [wx, wz] of [[1, 0.6], [7, 0.6], [1, 3.6]]) b.box(x + wx, 1, z + wz, 0.3, 2, 0.3, steel);
    // products in the cart
    b.box(x + 1, 3.3, z + 1, 2, 2, 2, '#95bf47');
    b.box(x + 3.5, 3.3, z + 1.5, 2, 3, 1.5, '#ff5c8a');
    b.box(x + 6, 3.3, z + 1, 1.5, 1.5, 2, '#ffd23f');
    ctx.station({ x: cx - 3, label: 'EZ Master Discount', target: { type: 'section', id: ctx.th.id } });
  },

  discountTags(ctx) {
    const { b, rng, cx } = ctx;
    const colors = ['#95bf47', '#ffd23f', '#ff5c8a', '#3fd0ff'];
    for (let k = 0; k < 5; k++) {
      const x = cx + 6 + k * 3.6, z = -9 - (k % 2) * 3, y = 4 + rng() * 3;
      b.box(x + 0.9, 0, z + 0.2, 0.2, y, 0.2, '#5a6170'); // string/post
      const c = pick(rng, colors);
      b.box(x, y, z, 2, 2.6, 0.4, c);
      b.box(x + 0.75, y + 2.2, z - 0.05, 0.5, 0.5, 0.5, '#ffffff');
      // a 5x5 pixel "%" sign
      ['XX..X', 'XX.X.', '..X..', '.X.XX', 'X..XX'].forEach((row, r) =>
        [...row].forEach((ch, c) => ch === 'X' && b.box(x + 0.2 + c * 0.32, y + 0.4 + (4 - r) * 0.32, z + 0.4, 0.32, 0.32, 0.12, '#ffffff')));
    }
  },

  servers(ctx) {
    const { b, rng, x0, L } = ctx;
    for (let k = 0; k < 6; k++) {
      const x = x0 + 4 + k * ((L - 8) / 5), z = -20;
      b.box(x, -2, z, 3, 9, 3, '#1f2a33');
      for (let r = 0; r < 7; r++) b.box(x + 0.4, 0.4 + r, z + 3, 0.5, 0.25, 0.1, rng() < 0.6 ? '#95bf47' : '#ffd23f', true);
    }
  },

  // ---- Contact: twilight forest, mailbox, finish flag, campfire ----
  pines(ctx) {
    for (let n = 0; n < 14; n++) {
      const p = ctx.place(-22, -6, 2.4);
      if (p) pine(ctx, p.x, p.z, p.y);
    }
  },

  mailbox(ctx) {
    const { b, cx } = ctx;
    const x = cx - 8, z = -4;
    ctx.flat(x, z, 3, 2);
    b.box(x + 0.35, 0, z + 0.35, 0.3, 1.6, 0.3, '#7a4d24');
    b.box(x - 0.2, 1.6, z - 0.4, 1.4, 1.2, 1.8, '#e04040');
    b.box(x + 1.2, 1.8, z + 0.7, 0.15, 1.0, 0.2, '#ffd23f');
    ctx.station({ x: x + 0.5, label: 'Contact', target: { type: 'section', id: ctx.th.id } });
  },

  flag(ctx) {
    const { b, x1 } = ctx;
    const x = x1 - 12;
    // a finish arch over the road
    b.box(x, 0, -3, 0.6, 7, 0.6, '#dcdce6');
    b.box(x, 0, 2.4, 0.6, 7, 0.6, '#dcdce6');
    for (let s = 0; s < 6; s++)
      for (let r = 0; r < 2; r++) b.box(x - 0.2, 6 + r * 0.6, -3 + s * 0.95, 1, 0.6, 0.95, (s + r) % 2 ? '#ffffff' : '#1d1a24');
    ctx.reserve(x, -3, 2);
  },

  campfire(ctx) {
    const { b, cx } = ctx;
    const x = cx + 4, z = -7;
    ctx.flat(x, z, 2, 2);
    b.box(x - 0.5, 0, z + 0.3, 2, 0.4, 0.4, '#5a3a22');
    b.box(x + 0.3, 0, z - 0.5, 0.4, 0.4, 2, '#5a3a22');
    b.box(x + 0.1, 0.4, z + 0.1, 0.8, 0.8, 0.8, '#ff7a1a', true);
    b.box(x + 0.3, 1.2, z + 0.3, 0.4, 0.5, 0.4, '#ffd23f', true);
    ctx.reserve(x, z, 2);
  },

  fireflies(ctx) {
    const { b, rng, x0, L } = ctx;
    for (let n = 0; n < 40; n++) b.box(x0 + rng() * L, 1 + rng() * 5, -4 - rng() * 14, 0.25, 0.25, 0.25, '#d8ff6b', true);
  },
};
