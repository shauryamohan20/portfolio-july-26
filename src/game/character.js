import * as THREE from 'three';
import { clamp, lerp } from './utils.js';

const S = 16; // head textures are 16x16 pixels

function pixelTexture(canvas) {
  const t = new THREE.CanvasTexture(canvas);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Draws a 16x16 canvas from a list of [color, x, y, w, h] rectangles. */
function draw(rects, flip = false) {
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  if (flip) { g.translate(S, 0); g.scale(-1, 1); }
  for (const [color, x, y, w = 1, h = 1] of rects) {
    g.fillStyle = color;
    g.fillRect(x, y, w, h);
  }
  return pixelTexture(c);
}

function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `rgb(${ch(n >> 16)},${ch((n >> 8) & 255)},${ch(n & 255)})`;
}

/** A friendly default pixel face. Colors come from site.character in content.js. */
function headTextures(c) {
  const skinDark = shade(c.skin, 0.82);
  const cheek = shade(c.skin, 1.12);
  const face = draw([
    [c.skin, 0, 0, S, S],
    [c.hair, 0, 0, S, 4], // hair
    [c.hair, 0, 4, 10, 1], // side-swept fringe
    [c.hair, 0, 5, 4, 1],
    [c.hair, 0, 4, 1, 5], // sideburns
    [c.hair, 15, 4, 1, 5],
    [c.hair, 3, 7, 3, 1], // eyebrows
    [c.hair, 10, 7, 3, 1],
    [c.eyes, 4, 8, 2, 2], // eyes
    [c.eyes, 10, 8, 2, 2],
    ['#ffffff', 5, 8], // eye shine
    ['#ffffff', 11, 8],
    [cheek, 2, 11, 2, 1], // cheeks
    [cheek, 12, 11, 2, 1],
    [skinDark, 7, 10, 2, 1], // nose shadow
    ['#6b2e2e', 6, 13, 4, 1], // smile
    ['#6b2e2e', 5, 12],
    ['#6b2e2e', 10, 12],
    [skinDark, 0, 15, S, 1], // jaw shadow
  ]);
  // Side: front edge is on the left of the texture (BoxGeometry +x face).
  const sideRects = [
    [c.skin, 0, 0, S, S],
    [c.hair, 0, 0, S, 5],
    [c.hair, 6, 5, 10, 6],
    [c.hair, 10, 11, 6, 3],
    [skinDark, 7, 7, 2, 3], // ear
    [skinDark, 0, 15, S, 1],
  ];
  const back = draw([
    [c.hair, 0, 0, S, 13],
    [c.skin, 0, 13, S, 3],
    [shade(c.hair, 1.25), 3, 3, 2, 1],
    [shade(c.hair, 1.25), 10, 6, 2, 1],
  ]);
  return { face, side: draw(sideRects), sideFlip: draw(sideRects, true), back };
}

export class Character {
  constructor(colors) {
    const c = {
      skin: '#c98d62', hair: '#1d1a24', eyes: '#1d1a24', jacket: '#1f2c5c',
      shirt: '#a9c9f5', pants: '#232838', shoes: '#141414', ...colors,
    };
    const tex = headTextures(c);
    const mat = (col) => new THREE.MeshLambertMaterial({ color: col, flatShading: true });
    const jacket = mat(c.jacket), shirt = mat(c.shirt), pants = mat(c.pants), shoe = mat(c.shoes);
    const skin = mat(c.skin), hair = mat(c.hair);
    this.suit = { jacket, pants, shoe };
    const geo = (w, h, d) => new THREE.BoxGeometry(w, h, d);

    this.root = new THREE.Group();
    this.body = new THREE.Group();
    this.root.add(this.body);

    const limb = (w, h, d, m, end, endMat) => {
      const pivot = new THREE.Group();
      const mesh = new THREE.Mesh(geo(w, h, d), m);
      mesh.position.y = -h / 2;
      pivot.add(mesh);
      if (end) {
        const e = new THREE.Mesh(geo(...end.size), endMat);
        e.position.set(0, -h + end.y, end.z);
        pivot.add(e);
      }
      return pivot;
    };

    const hipY = 1.0;
    this.legL = limb(0.36, 0.9, 0.4, pants, { size: [0.4, 0.2, 0.58], y: 0, z: 0.09 }, shoe);
    this.legR = limb(0.36, 0.9, 0.4, pants, { size: [0.4, 0.2, 0.58], y: 0, z: 0.09 }, shoe);
    this.legL.position.set(0.21, hipY, 0);
    this.legR.position.set(-0.21, hipY, 0);

    const torso = new THREE.Mesh(geo(0.92, 0.95, 0.52), jacket);
    torso.position.y = hipY + 0.475;
    const shirtV = new THREE.Mesh(geo(0.3, 0.68, 0.04), shirt);
    shirtV.position.set(0, hipY + 0.6, 0.27);
    const belt = new THREE.Mesh(geo(0.94, 0.1, 0.54), pants);
    belt.position.y = hipY + 0.05;

    const shoulderY = 1.88;
    this.armL = limb(0.26, 0.85, 0.3, jacket, { size: [0.24, 0.2, 0.26], y: -0.1, z: 0 }, skin);
    this.armR = limb(0.26, 0.85, 0.3, jacket, { size: [0.24, 0.2, 0.26], y: -0.1, z: 0 }, skin);
    this.armL.position.set(0.6, shoulderY, 0);
    this.armR.position.set(-0.6, shoulderY, 0);

    const neck = new THREE.Mesh(geo(0.3, 0.12, 0.3), skin);
    neck.position.y = 2.01;

    // Head: a cube with a pixel face, plus a hair cap that gives it a silhouette.
    const lam = (o) => new THREE.MeshLambertMaterial(o);
    const headMats = [
      lam({ map: tex.side }), lam({ map: tex.sideFlip }), lam({ color: c.hair }),
      lam({ color: c.skin }), lam({ map: tex.face }), lam({ map: tex.back }),
    ];
    this.head = new THREE.Group();
    this.head.position.y = 2.06;
    const headMesh = new THREE.Mesh(geo(1.1, 1.1, 1.0), headMats);
    headMesh.position.y = 0.55;
    const cap = new THREE.Mesh(geo(1.18, 0.26, 1.08), hair);
    cap.position.set(0, 1.12, -0.02);
    const quiff = new THREE.Mesh(geo(0.6, 0.16, 0.5), hair);
    quiff.position.set(-0.18, 1.3, 0.2);
    const backHair = new THREE.Mesh(geo(1.18, 0.7, 0.1), hair);
    backHair.position.set(0, 0.8, -0.54);
    this.head.add(headMesh, cap, quiff, backHair);

    this.body.add(this.legL, this.legR, torso, shirtV, belt, this.armL, this.armR, neck, this.head);
    // Hidden until every coin is collected: a voxel crown.
    const gold = new THREE.MeshStandardMaterial({ color: 0xffd23f, emissive: 0x6a4a00, metalness: 0.7, roughness: 0.3 });
    this.crown = new THREE.Group();
    const band = new THREE.Mesh(geo(1.0, 0.22, 0.9), gold);
    this.crown.add(band);
    for (const [px, pz] of [[-0.38, 0.33], [0, 0.33], [0.38, 0.33], [-0.38, -0.33], [0.38, -0.33]]) {
      const spike = new THREE.Mesh(geo(0.18, 0.28, 0.18), gold);
      spike.position.set(px, 0.24, pz);
      this.crown.add(spike);
    }
    const gem = new THREE.Mesh(geo(0.16, 0.16, 0.06), new THREE.MeshBasicMaterial({ color: 0xff3d7f }));
    gem.position.set(0, 0.02, 0.47);
    this.crown.add(gem);
    this.crown.position.y = 1.48;
    this.crown.visible = false;
    this.head.add(this.crown);
    this.root.traverse((o) => { if (o.isMesh) o.castShadow = true; });

    this.phase = 0;
    this.run = 0; // 0 = idle, 1 = running (blended)
    this.idleTime = 0;
    this.yaw = Math.PI / 2;
    this.jumpY = 0;
    this.vy = 0;
  }

  /** Easter egg: a gold suit and a crown. */
  makeGolden() {
    const { jacket, pants, shoe } = this.suit;
    jacket.color.set('#e6b422');
    pants.color.set('#8a6a10');
    shoe.color.set('#ffd23f');
    this.crown.visible = true;
  }

  jump() {
    if (this.jumpY <= 0.001) this.vy = 8.5;
  }

  /**
   * @param dt seconds
   * @param o { running, speed, moveYaw, camYaw }
   */
  update(dt, o) {
    const target = o.running ? 1 : 0;
    this.run = lerp(this.run, target, 1 - Math.exp(-dt * 10));
    this.idleTime = o.running || o.pose ? 0 : this.idleTime + dt;
    this.phase += dt * clamp(6 + o.speed * 0.9, 6, 20) * (this.run > 0.05 ? 1 : 0.25);

    // Facing: along the path while running, toward the camera while idle.
    const wantYaw = o.face ?? (o.running ? o.moveYaw : o.camYaw);
    let dy = wantYaw - this.yaw;
    dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    this.yaw += dy * (1 - Math.exp(-dt * 8));
    this.root.rotation.y = this.yaw;

    const r = this.run, s = Math.sin(this.phase);
    this.legL.rotation.x = s * 0.95 * r;
    this.legR.rotation.x = -s * 0.95 * r;
    this.armL.rotation.x = -s * 1.0 * r;
    this.armR.rotation.x = s * 1.0 * r;
    this.armL.rotation.z = 0.08;
    this.armR.rotation.z = -0.08;
    this.body.rotation.x = 0.14 * r;

    const breathe = Math.sin(this.idleTime * 2.4) * 0.03;
    this.body.position.y = Math.abs(s) * 0.2 * r + breathe * (1 - r);

    // Idle wave every few seconds.
    const w = this.idleTime % 7;
    if (!o.running && this.idleTime > 1.5 && w > 2 && w < 3.8) {
      this.armR.rotation.x = -2.7;
      this.armR.rotation.z = -0.3 + Math.sin(this.idleTime * 14) * 0.35;
    }

    // Turn the head a little toward the camera while running so the face reads.
    let hy = o.camYaw - this.yaw;
    hy = Math.atan2(Math.sin(hy), Math.cos(hy));
    this.head.rotation.y = clamp(hy, -1.0, 1.0) * (0.55 * r + 0.2 * (1 - r));
    this.head.rotation.x = -0.05 * r;

    // Riding poses: in the plane (hands on the controls) or hanging from the parachute.
    if (o.pose === 'seated') {
      this.armL.rotation.x = this.armR.rotation.x = -0.9;
      this.legL.rotation.x = this.legR.rotation.x = -1.2;
    } else if (o.pose === 'hang') {
      this.armL.rotation.x = this.armR.rotation.x = -2.8;
      this.armL.rotation.z = 0.25;
      this.armR.rotation.z = -0.25;
      const sway = Math.sin(this.phase * 0.6) * 0.25;
      this.legL.rotation.x = sway;
      this.legR.rotation.x = -sway;
    }

    // Jump physics.
    if (this.jumpY > 0 || this.vy > 0) {
      this.vy -= 26 * dt;
      this.jumpY = Math.max(0, this.jumpY + this.vy * dt);
      if (this.jumpY === 0) this.vy = 0;
    }
    this.body.position.y += this.jumpY;
  }
}
