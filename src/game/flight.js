import * as THREE from 'three';
import { sections } from '../content.js';
import { VoxelBatch } from './voxels.js';
import { SKY_ALT } from './world.js';
import { clamp, lerp, voxelText, textWidth } from './utils.js';

/**
 * The plane ride through the Skills zone.
 *
 * Run onto the launch pad and it bounces you up into a passing plane. The plane
 * flies you through the sky while each skill floats past on its own island
 * (press E / A to read it, hold Space / ▲ to climb for the sky coins). At the end
 * of the zone you jump out, a parachute opens and you float down into the next zone.
 *
 * The plane moves slowly over the ground while the sky (islands, coins, clouds)
 * streams past along a "track", so the ride lasts long enough to read, on phones too.
 * Every move here is eased (springs and smooth-damp), so nothing jumps.
 */
const BOARD_TIME = 1.0; // seconds from the pad to the cockpit
const BOARD_HEIGHT = 8; // the bounce reaches this high before the plane scoops you up
const FLY_SPEED = 9; // track units per second (hold → to go faster, ← to slow down)
const CLIMB = 4; // how much higher the plane flies while you hold jump
const PLANE_SCALE = 0.68;
const PLANE_DY = 0.34; // plane origin above the rider's feet (the body hides the legs)
const CHUTE_FALL = 5; // parachute descent speed, slower near the ground
const easeOut = (k) => 1 - Math.pow(1 - k, 3);
const easeOutBack = (k) => 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2);

/** Critically damped follow (like Unity's SmoothDamp). Returns [value, velocity]. */
function smoothDamp(cur, target, vel, time, dt) {
  const omega = 2 / time, x = omega * dt;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const change = cur - target;
  const temp = (vel + omega * change) * dt;
  return [target + (change + temp) * exp, (vel - omega * temp) * exp];
}

const services = sections.find((s) => s.kind === 'services')?.items || [];
const COARSE = window.matchMedia('(pointer: coarse)').matches;
const ISLAND_WORD = { store: 'STORES', liquid: 'LIQUID', bolt: 'SPEED' };

export class Flight {
  constructor({ scene, audio, mats, card }) {
    this.scene = scene;
    this.audio = audio;
    this.mats = mats;
    this.card = card;
    this.state = 'idle'; // idle | board | fly | drop
    this.zone = null;
    this.alt = 0; // the rider's height while boarding, flying or floating down
    this.cool = 0;
    this.s = 0;
    this.buildPlane();
    this.buildChute();
  }

  get active() {
    return this.state !== 'idle';
  }

  /** The zone that has the launch pad (built by world.js). */
  setZone(z) {
    this.zone = z;
    this.buildSky(z.flight);
  }

  // ------------------------------------------------------------ models

  buildPlane() {
    const g = new THREE.Group();
    const mat = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o });
    const red = mat('#d93a3a'), cream = mat('#f4ead2'), dark = mat('#2b2f45'), glass = mat('#9fe3ff', { transparent: true, opacity: 0.55 });
    const box = (m, x0, x1, y0, y1, z0, z1) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), m);
      b.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
      b.castShadow = true;
      g.add(b);
    };
    box(red, -4.6, 3.4, -0.5, 1.25, -0.95, 0.95); // fuselage (open cockpit at x = 0)
    box(cream, -2.6, -2.1, -0.52, 1.27, -0.97, 0.97); // stripe
    box(cream, 3.4, 4.3, -0.25, 1.0, -0.75, 0.75); // nose
    box(dark, 4.3, 4.6, 0.2, 0.55, -0.2, 0.2); // hub
    box(glass, 1.3, 1.55, 1.25, 2.0, -0.7, 0.7); // windshield
    box(cream, -1.3, 0.9, 0.0, 0.3, -5.2, 5.2); // wing
    box(red, -1.3, 0.9, 0.0, 0.3, -5.4, -5.2); // wing tips
    box(red, -1.3, 0.9, 0.0, 0.3, 5.2, 5.4);
    box(cream, -4.6, -3.4, 0.5, 0.75, -2.1, 2.1); // tailplane
    box(red, -4.6, -3.7, 1.25, 2.9, -0.12, 0.12); // fin
    box(dark, 1.0, 1.6, -1.2, -0.5, -0.9, -0.5); // wheels
    box(dark, 1.0, 1.6, -1.2, -0.5, 0.5, 0.9);
    this.prop = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.4, 0.38), dark);
    this.prop.position.set(4.65, 0.38, 0);
    g.add(this.prop);
    g.scale.setScalar(PLANE_SCALE);
    g.visible = false;
    this.plane = g;
    this.scene.add(g);
  }

  /** A striped voxel parachute. Its origin sits at the rider's shoulders. */
  buildChute() {
    const g = new THREE.Group();
    const red = new THREE.MeshLambertMaterial({ color: '#ff5c8a' });
    const white = new THREE.MeshLambertMaterial({ color: '#fff6e0' });
    const yellow = new THREE.MeshLambertMaterial({ color: '#ffd23f' });
    const line = new THREE.MeshBasicMaterial({ color: '#3a3f55' });
    const canopy = new THREE.Group();
    for (let i = -3; i <= 3; i++) {
      const seg = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 2.6), [red, white, yellow][(i + 3) % 3]);
      seg.position.set(i * 0.74, -(i * i) * 0.1, 0);
      seg.rotation.z = -i * 0.14;
      canopy.add(seg);
    }
    canopy.position.y = 3.9;
    g.add(canopy);
    // Lines from the canopy's edges down to the shoulders.
    for (const [x0, z0] of [[-2.3, -1], [2.3, -1], [-2.3, 1], [2.3, 1]]) {
      const a = new THREE.Vector3(x0, 3.0, z0), b = new THREE.Vector3(x0 * 0.12, 0.1, z0 * 0.3);
      const l = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, a.distanceTo(b)), line);
      l.position.copy(a).add(b).multiplyScalar(0.5);
      l.lookAt(b);
      g.add(l);
    }
    g.traverse((o) => o.isMesh && (o.castShadow = true));
    g.visible = false;
    this.chute = g;
    this.chuteOpen = 0;
    this.scene.add(g);
  }

  /** Floating islands (one per skill) and clouds that stream past the plane. */
  buildSky(f) {
    const mats = this.mats;
    this.islands = f.islands.map((isl) => {
      const b = new VoxelBatch();
      const item = services[isl.index] || {};
      // Island: a grassy top with rock tapering underneath.
      for (let x = -6; x <= 6; x++)
        for (let z = -4; z <= 4; z++) {
          const r = (x * x) / 36 + (z * z) / 16;
          if (r > 1) continue;
          b.cell(x - 0.5, -1, z - 0.5, (x + z) % 3 ? '#4aa6a0' : '#56b5ae');
          const depth = Math.round((1 - r) * 5);
          if (depth > 0) b.box(x - 0.5, -1 - depth, z - 0.5, 1, depth, 1, depth > 3 ? '#4d3f6a' : '#5a4a7a');
        }
      MONUMENTS[item.icon]?.(b);
      const word = ISLAND_WORD[item.icon] || 'SKILL';
      const s = 0.7;
      voxelText(b, word, -(textWidth(word) * s) / 2, 11.5, 0, '#ffd23f', { scale: s, depth: 0.6, glow: true });
      const group = b.toGroup(mats);
      group.visible = false;
      this.scene.add(group);
      return { ...isl, group };
    });

    // Clouds: a loop of puffs, some behind the plane and some passing underneath.
    this.clouds = [];
    for (let k = 0; k < 12; k++) {
      const front = k % 3 === 0;
      const c = { track: k * 11 + (k % 2) * 4, y: front ? -7 - (k % 2) * 2 : -3 + ((k * 7) % 13), z: front ? 5 + (k % 2) * 2 : -12 - ((k * 5) % 12) };
      const b = new VoxelBatch();
      const w = 4 + (k % 3) * 2;
      b.box(-w / 2, 0, -1.5, w, 1.4, 3, '#ffffff');
      b.box(-w / 2 + 1, 1.4, -1, w - 2.5, 1.2, 2, '#ffffff');
      b.box(-w / 2 - 1, 0.3, -1, 1.2, 0.9, 2, '#f1edff');
      c.group = b.toGroup(mats);
      c.group.visible = false;
      this.scene.add(c.group);
      this.clouds.push(c);
    }
  }

  /** Everything the ride shows, for the warm-up render behind the loading screen. */
  skyObjects() {
    return [this.plane, this.chute, ...(this.islands || []).map((i) => i.group), ...(this.clouds || []).map((c) => c.group)];
  }

  // ------------------------------------------------------------ launch pad

  /** Checked every frame while running on the ground. */
  checkPads(game, dt) {
    this.cool = Math.max(0, this.cool - dt);
    if (this.active || this.cool > 0 || game.vx < 0.2 || game.character.jumpY > 1.2) return;
    const p = game.zones[game.zoneIndex]?.pads?.find((q) => q.kind === 'launch' && Math.abs(q.x - game.x) < 1.3);
    if (p) this.launch(game, p);
  }

  launch(game, p) {
    const f = this.zone.flight;
    this.state = 'board';
    this.t = 0;
    this.s = 0;
    this.speed = 3; // the sky starts slow and speeds up
    this.startX = game.x;
    this.xv = Math.max(game.vx, 6); // keep the run's momentum
    this.alt = this.alt0 = game.character.jumpY;
    this.altV = 0;
    game.character.jumpY = 0;
    game.character.vy = 0;
    game.held.clear();
    this.audio?.sfx('boost');
    if (this.audio?.songName === 'main') this.audio.playSong('flight');
    this.plane.visible = true;
    this.plane.rotation.set(0, 0, 0);
    this.chute.visible = false;
    this.islands.forEach((i) => (i.group.visible = true));
    this.clouds.forEach((c) => (c.group.visible = true));
    this.showCard({ kicker: 'Skills in the sky', title: COARSE ? 'Hold ▲ to climb for the coins' : 'Hold Space to climb for the coins' });
    this.hintUntil = 3.5;
    this.anchor = null;
  }

  // ------------------------------------------------------------ frame

  /** Runs the board / fly / drop states and moves the rider (game.x, this.alt). */
  update(game, dt, input) {
    const f = this.zone.flight;
    this.prop.rotation.x += dt * 40;
    this.t += dt;

    if (this.state === 'board') {
      // A smooth bounce up (slowing to the top) while the plane glides in underneath,
      // arriving with the same speed as the rider, so the pick-up has no jolt.
      const k = clamp(this.t / BOARD_TIME, 0, 1);
      const rise = 1 - Math.pow(1 - k, 2);
      this.alt = lerp(this.alt0, BOARD_HEIGHT, rise);
      [game.x, this.xv] = smoothDamp(game.x, f.catchX, this.xv, 0.45, dt);
      const e = 1 - easeOut(k); // 1 → 0, slowing to a stop beside the rider
      this.plane.position.set(game.x - 26 * e, this.alt + PLANE_DY - 3 * e, 0);
      this.plane.rotation.z = 0.25 * e; // nose up while it climbs to meet you
      if (k >= 1) {
        this.state = 'fly';
        this.altV = 0; // the bounce peaks here, so the climb starts from rest
        this.audio?.sfx('coin');
      }
      return;
    }

    if (this.state === 'fly') {
      this.speed = lerp(this.speed, FLY_SPEED + input.dir * 5, 1 - Math.exp(-dt * 1.5));
      this.s += this.speed * dt;
      const groundX = lerp(f.catchX, f.dropX, clamp(this.s / f.length, 0, 1));
      [game.x, this.xv] = smoothDamp(game.x, groundX, this.xv, 0.6, dt);
      // Spring toward cruising height (higher while climbing): eases in and out.
      const target = SKY_ALT + (input.climb ? CLIMB : 0);
      const kSpring = input.climb ? 9 : 6;
      this.altV += (kSpring * (target - this.alt) - 2 * Math.sqrt(kSpring) * this.altV) * dt;
      this.alt += this.altV * dt;
      this.plane.position.set(game.x, this.alt + PLANE_DY, 0);
      this.plane.rotation.z = lerp(this.plane.rotation.z, clamp(this.altV * 0.03, -0.22, 0.3), 1 - Math.exp(-dt * 6));
      this.plane.rotation.x = Math.sin(this.t * 1.7) * 0.05;
      this.placeSky(game.x);
      if (this.hintUntil > 0) this.hintUntil -= dt;
      this.updateCard();
      if (this.s >= f.length) this.drop(game);
      return;
    }

    if (this.state === 'drop') {
      // Hop out, fall for a moment, then the parachute opens and you float down.
      const td = this.t - this.dropAt;
      if (td > 0.4) this.chuteOpen = Math.min(1, this.chuteOpen + dt / 0.55);
      const open = this.chuteOpen;
      const fall = this.alt < 5 ? lerp(2.2, CHUTE_FALL, this.alt / 5) : CHUTE_FALL;
      this.vy -= 22 * dt * (1 - open);
      if (open > 0) this.vy = lerp(this.vy, -fall, 1 - Math.exp(-dt * 4 * open));
      this.alt = Math.max(0, this.alt + this.vy * dt);
      // Drift forward; ← → steer a little.
      this.dvx = lerp(this.dvx, 4 + input.dir * 3, 1 - Math.exp(-dt * 2));
      game.x += this.dvx * dt;
      this.flyAway(dt);
      this.placeChute(game);
      if (this.alt === 0) this.land(game);
    }
  }

  drop(game) {
    this.state = 'drop';
    this.dropAt = this.t;
    this.vy = this.altV + 2; // a small hop out of the cockpit
    this.dvx = this.xv;
    this.planeVX = this.xv;
    this.chuteOpen = 0;
    this.chute.visible = true;
    this.chute.scale.setScalar(0.001);
    this.anchor = game.x; // the sky stays put in the world while you float down
    this.planeV = 2;
    this.hideCard();
    game.hud?.setPrompt(null);
    this.audio?.sfx('jump');
  }

  land(game) {
    this.state = 'idle';
    this.alt = 0;
    game.vx = this.dvx; // keep running at the drift speed, then ease to your input
    this.cool = 0.5;
    this.fold = 0;
    this.islands.forEach((i) => (i.group.visible = false));
    this.clouds.forEach((c) => (c.group.visible = false));
    if (this.audio?.songName === 'flight') this.audio.playSong('main');
  }

  /** Runs every frame, also on the ground: the plane flying off and the parachute folding away. */
  afterFrame(game, dt) {
    if (this.state === 'idle' && this.plane.visible) this.flyAway(dt);
    if (this.state === 'idle' && this.chute.visible) {
      this.fold += dt / 0.4;
      const k = Math.min(1, this.fold);
      this.chute.scale.set(1 - 0.6 * k, Math.max(0.001, 1 - k), 1 - 0.6 * k);
      this.chute.position.x = game.x - k * 1.2;
      this.chute.position.y = 2.2 - k * 2;
      this.chute.rotation.z = -k * 1.1;
      if (k >= 1) this.chute.visible = false;
    }
  }

  flyAway(dt) {
    this.planeV = (this.planeV || 2) + dt * 5;
    this.planeVX = lerp(this.planeVX ?? 14, 14, 1 - Math.exp(-dt * 1.2)); // speeds up gradually
    this.plane.position.x += this.planeVX * dt;
    this.plane.position.y += this.planeV * dt;
    this.plane.rotation.z = Math.min(0.4, this.plane.rotation.z + dt * 0.4);
    if (this.plane.position.y > SKY_ALT + 40) this.plane.visible = false;
  }

  placeChute(game) {
    const k = easeOutBack(this.chuteOpen);
    this.chute.scale.set(Math.max(0.001, k), Math.max(0.001, k), Math.max(0.001, this.chuteOpen));
    this.chute.position.set(game.x, this.alt + 2.2, 0);
    this.chute.rotation.set(0, 0, Math.sin(this.t * 1.6) * 0.07 * this.chuteOpen);
    if (this.anchor != null) this.placeSky(this.anchor);
  }

  /** Back to normal running at once (restart and fast travel). */
  end() {
    this.state = 'idle';
    this.alt = 0;
    this.plane.visible = false;
    this.chute.visible = false;
    this.islands?.forEach((i) => (i.group.visible = false));
    this.clouds?.forEach((c) => (c.group.visible = false));
    this.hideCard();
    if (this.audio?.songName === 'flight') this.audio.playSong('main');
  }

  /** World x of something on the sky track, relative to the plane. */
  trackX(planeX, track) {
    return planeX + (track - this.s);
  }

  placeSky(planeX) {
    for (const isl of this.islands) isl.group.position.set(this.trackX(planeX, isl.track), SKY_ALT - 3.5, -13);
    const loop = 132;
    for (const c of this.clouds) {
      const d = ((((c.track - this.s) % loop) + loop) % loop) - 40;
      c.group.position.set(planeX + d, SKY_ALT + c.y, c.z);
    }
  }

  /** The skill island the plane is passing, if any (readable with E / A). */
  nearStation() {
    if (this.state !== 'fly') return null;
    for (const isl of this.islands) if (Math.abs(isl.track - this.s) < 7) return isl.station;
    return null;
  }

  // ------------------------------------------------------------ info card

  updateCard() {
    const isl = this.islands.find((i) => Math.abs(i.track - this.s) < 12);
    if (isl) {
      if (this.cardFor !== isl) {
        const item = services[isl.index] || {};
        this.showCard({ kicker: 'Skill', title: item.title, points: (item.points || []).slice(0, 3), read: true });
        this.cardFor = isl;
      }
    } else if (this.cardFor !== 'hint') {
      if (this.hintUntil > 0) return;
      this.hideCard();
      this.cardFor = 'hint';
    }
  }

  showCard({ kicker, title, points = [], read = false }) {
    const c = this.card;
    if (!c) return;
    c.querySelector('.sky-card-kicker').textContent = kicker;
    c.querySelector('.sky-card-title').textContent = title;
    const ul = c.querySelector('.sky-card-points');
    ul.replaceChildren(...points.map((p) => Object.assign(document.createElement('li'), { textContent: p })));
    ul.hidden = !points.length;
    c.querySelector('.sky-card-read').hidden = !read;
    c.hidden = false;
    c.classList.remove('is-in');
    void c.offsetWidth;
    c.classList.add('is-in');
  }

  hideCard() {
    this.cardFor = null;
    if (this.card) {
      this.card.classList.remove('is-in');
      this.card.hidden = true;
    }
  }
}

// Voxel monuments for the skill islands (local coordinates, island top at y = 0).
const MONUMENTS = {
  store(b) {
    b.box(-3, 0, -1.5, 6, 7, 3, '#95bf47');
    b.box(-3, 7, -1.5, 6, 0.5, 3, '#7aa33a');
    for (const hx of [-2.2, 1.2]) b.box(hx, 7, -0.5, 1, 2.5, 1, '#5e8e3e');
    b.box(-2.2, 9.5, -0.5, 4.4, 1, 1, '#5e8e3e');
    voxelText(b, 'S', -1.5, 1.5, 1.5, '#ffffff', { depth: 0.4 });
  },
  liquid(b) {
    for (let dx = -3; dx <= 3; dx++)
      for (let dy = 0; dy <= 8; dy++)
        for (let dz = -2; dz <= 2; dz++) {
          const r = dy < 4 ? 3 : 3 * (1 - (dy - 4) / 5);
          if (dx * dx + dz * dz * 1.6 + (dy < 4 ? (dy - 3) * (dy - 3) : 0) <= r * r)
            b.cell(dx - 0.5, dy, dz - 0.5, dy > 6 ? '#8fd3ff' : (dx + dy + dz) % 2 ? '#3fa9f5' : '#2f95e0');
        }
    b.box(-1.6, 2, 2, 0.7, 1.4, 0.3, '#ffffff', true);
  },
  bolt(b) {
    const bolt = [[1, 10], [2, 10], [0, 9], [1, 9], [0, 8], [1, 8], [-1, 7], [0, 7], [-1, 6], [0, 6], [1, 6], [2, 6], [0, 5], [1, 5], [0, 4], [1, 4], [-1, 3], [0, 3], [-1, 2], [-1, 1]];
    for (const [bx, by] of bolt) b.box(bx - 0.5, by - 1, -0.6, 1, 1, 1.2, '#ffd23f', true);
  },
};
