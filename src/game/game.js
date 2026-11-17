import * as THREE from 'three';
import { gsap } from 'gsap';
import { site } from '../content.js';
import { getTheme } from './themes.js';
import { createWorld, ZONE, TOTAL_COINS } from './world.js';
import { Character } from './character.js';
import { pendingTextures, setRenderer } from './props.js';
import { clamp, lerp, smoothstep } from './utils.js';

const COARSE = window.matchMedia('(pointer: coarse)').matches;
// Full-resolution rendering: native pixels, capped so phones stay smooth.
const MAX_DPR = COARSE ? 1.5 : 2;
const RUN_SPEED = COARSE ? 12 : 10; // voxels per second (a little faster on phones)
const READ_RANGE = 2.4; // how close (along the road) you must be to read a station
const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));

const KEYS = { ArrowRight: 'right', KeyD: 'right', ArrowLeft: 'left', KeyA: 'left' };
const JUMP_KEYS = new Set(['Space', 'ArrowUp', 'KeyW']);

/**
 * The horizontal run: move with ← → / A D, the mouse wheel, a touch drag or the
 * on-screen buttons. Jump with Space / ↑ / W. Read a station with E / Enter.
 */
export class Game {
  constructor({ canvas, audio, hud, onRead, onFinish, onAllCoins }) {
    this.canvas = canvas;
    this.audio = audio;
    this.hud = hud;
    this.onRead = onRead;
    this.onFinish = onFinish;
    this.onAllCoins = onAllCoins;
    this.golden = false;
    this.confetti = null;
    this.finished = false;
    this.sections = [...document.querySelectorAll('main > section.zone')];
    this.themes = this.sections.map((s) => getTheme(s.id));
    this.zones = [];
    this.running = false;
    this.paused = false; // true while a reading dialog is open
    this.held = new Set();
    this.drag = 0; // -1..1 from a touch drag or the on-screen buttons
    this.wheelDir = 0;
    this.wheelUntil = 0;
    this.vx = 0;
    this.facing = 1;
    this.clock = new THREE.Clock();
    this.time = 0;
    this.coinCount = 0;
    this.zoneIndex = -1;
    this.near = null;
    this.tick = this.tick.bind(this);
  }

  async load(progress) {
    progress(0.05, 'Loading fonts...');
    await Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 1500))]);

    progress(0.12, 'Starting renderer...');
    await nextFrame();
    this.setupRenderer();

    progress(0.18, 'Spawning player...');
    this.world = createWorld(this.themes);
    this.character = new Character(site.character);
    this.scene.add(this.character.root);
    this.x = this.world.spawnX;
    this.setupSky();
    this.setupCoins();

    // Build every zone now, behind the loading screen, so the run never stutters.
    for (let i = 0; i < this.world.N; i++) {
      progress(0.2 + (0.45 * i) / this.world.N, `Building ${this.themes[i].label.toLowerCase()}...`);
      await nextFrame();
      this.ensureZone(i);
    }

    // Wait for the store screenshots on the billboards.
    let loaded = 0;
    const total = pendingTextures.length;
    progress(0.66, 'Hanging billboards...');
    await Promise.all(pendingTextures.map((p) => p.then(() => progress(0.66 + (0.2 * ++loaded) / Math.max(1, total)))));

    progress(0.9, 'Compiling shaders...');
    this.setupInput();
    this.character.root.position.set(this.x, 0, 0);
    this.updateCamera(0, true);
    await nextFrame();
    this.renderer.compile(this.scene, this.camera);
    this.renderer.render(this.scene, this.camera);
    this.resume();
    progress(1, 'Ready!');
  }

  // ---------------------------------------------------------------- setup

  setupRenderer() {
    const r = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: 'high-performance' });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer = r;
    setRenderer(r);
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0xa9dbff, 42, 120);
    this.scene.background = new THREE.Color();
    this.camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.5, 300);
    this.hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    this.sun = new THREE.DirectionalLight(0xffffff, 1.6);
    this.sun.castShadow = true;
    const size = COARSE ? 1024 : 2048;
    this.sun.shadow.mapSize.set(size, size);
    Object.assign(this.sun.shadow.camera, { left: -24, right: 24, top: 16, bottom: -16, near: 1, far: 80 });
    this.sun.shadow.bias = -0.0008;
    this.sun.shadow.normalBias = 0.03;
    this.scene.add(this.hemi, this.sun, this.sun.target);
    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
    this.resize();
  }

  setupSky() {
    // Smooth gradient sky dome.
    this.skyUniforms = { top: { value: new THREE.Color() }, bottom: { value: new THREE.Color() } };
    this.skyDome = new THREE.Mesh(
      new THREE.SphereGeometry(260, 32, 16),
      new THREE.ShaderMaterial({
        uniforms: this.skyUniforms,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        vertexShader: `varying float vH; void main(){ vH = normalize(position).y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 top; uniform vec3 bottom; varying float vH;
          void main(){ float t = smoothstep(-0.05, 0.5, vH);
          gl_FragColor = vec4(mix(bottom, top, t), 1.0);
          #include <colorspace_fragment>
          }`,
      })
    );
    this.skyDome.renderOrder = -1;
    this.scene.add(this.skyDome);

    const n = 500, pos = new Float32Array(n * 3);
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2, e = 0.12 + Math.random() * 0.8;
      pos[k * 3] = Math.cos(a) * Math.cos(e) * 230;
      pos[k * 3 + 1] = Math.sin(e) * 230;
      pos[k * 3 + 2] = -Math.abs(Math.sin(a) * Math.cos(e) * 230);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.stars = new THREE.Points(g, new THREE.PointsMaterial({ size: 2, sizeAttenuation: false, color: 0xffffff, transparent: true, opacity: 0, fog: false, depthWrite: false }));
    this.scene.add(this.stars);

    this.sunMesh = new THREE.Mesh(new THREE.CircleGeometry(9, 48), new THREE.MeshBasicMaterial({ fog: false }));
    this.scene.add(this.sunMesh);

    const C = (c) => new THREE.Color(c);
    this.tc = this.themes.map((t) => ({ sky: C(t.sky), fog: C(t.fog), hemiSky: C(t.hemiSky), hemiGround: C(t.hemiGround), light: C(t.light), sun: C(t.sun) }));
  }

  setupCoins() {
    this.coinGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.16, 20);
    this.coinGeo.rotateX(Math.PI / 2);
    this.coinMat = new THREE.MeshStandardMaterial({ color: 0xffd23f, emissive: 0x6a4a00, metalness: 0.6, roughness: 0.35 });
    this._m = new THREE.Matrix4();
    this._q = new THREE.Quaternion();
    this._e = new THREE.Euler();
    this._v = new THREE.Vector3();
    this._s = new THREE.Vector3();
  }

  setupInput() {
    const typing = (t) => /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable;
    const active = () => this.running && !this.paused && !document.documentElement.classList.contains('booting');
    window.addEventListener('keydown', (e) => {
      if (!active() || e.ctrlKey || e.metaKey || e.altKey || typing(e.target)) return;
      const onControl = e.target.closest?.('button, a');
      if (KEYS[e.code]) {
        this.held.add(KEYS[e.code]);
        e.preventDefault();
      } else if (JUMP_KEYS.has(e.code) && !(e.code === 'Space' && onControl)) {
        e.preventDefault();
        this.jump();
      } else if ((e.code === 'KeyE' || (e.code === 'Enter' && !onControl)) && this.near) {
        e.preventDefault();
        this.interact();
      }
    });
    window.addEventListener('keyup', (e) => KEYS[e.code] && this.held.delete(KEYS[e.code]));
    window.addEventListener('blur', () => { this.held.clear(); this.drag = 0; });

    // Mouse wheel / trackpad: scrolling runs the character.
    window.addEventListener('wheel', (e) => {
      if (!active() || e.target.closest?.('.reader')) return;
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(d) < 1) return;
      e.preventDefault();
      this.wheelDir = Math.sign(d);
      this.wheelUntil = this.time + 0.22;
    }, { passive: false });

    // Touch: drag anywhere on the world left/right to run, tap to jump.
    let start = null;
    this.canvas.addEventListener('pointerdown', (e) => {
      if (!active()) return;
      start = { x: e.clientX, t: this.time, id: e.pointerId, moved: false };
    });
    window.addEventListener('pointermove', (e) => {
      if (!start || e.pointerId !== start.id) return;
      const dx = e.clientX - start.x;
      if (Math.abs(dx) > 12) start.moved = true;
      this.drag = clamp(dx / 70, -1, 1);
    });
    const end = (e) => {
      if (!start || e.pointerId !== start.id) return;
      if (!start.moved && this.time - start.t < 0.3) this.jump();
      start = null;
      this.drag = 0;
    };
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);

    // On-screen buttons. Each finger is tracked on its own, so you can hold ▶ and
    // press ▲ or A at the same time (multi-touch).
    const holds = new Map(); // pointerId -> direction
    const syncHold = () => { this.holdDir = [...holds.values()].reduce((a, b) => a + b, 0); };
    document.querySelectorAll('[data-hold]').forEach((btn) => {
      const dir = btn.dataset.hold === 'right' ? 1 : -1;
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        try { btn.setPointerCapture(e.pointerId); } catch { /* ok without capture */ }
        holds.set(e.pointerId, dir);
        btn.classList.add('is-down');
        syncHold();
      });
      const off = (e) => {
        if (!holds.has(e.pointerId)) return;
        holds.delete(e.pointerId);
        if (![...holds.values()].includes(dir)) btn.classList.remove('is-down');
        syncHold();
      };
      btn.addEventListener('pointerup', off);
      btn.addEventListener('pointercancel', off);
      btn.addEventListener('lostpointercapture', off);
    });
    const tapButton = (selector, fn) => {
      const btn = document.querySelector(selector);
      if (!btn) return;
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault(); // fire on touch-down, not on click (clicks get dropped during multi-touch)
        if (!active()) return;
        btn.classList.add('is-down');
        fn();
      });
      // Cancel the phone's follow-up "click": it would land on whatever just opened
      // (the reader's backdrop) and close it again straight away.
      btn.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });
      btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); });
      const up = () => btn.classList.remove('is-down');
      btn.addEventListener('pointerup', up);
      btn.addEventListener('pointercancel', up);
    };
    tapButton('.touch-jump', () => this.jump());
    tapButton('.touch-a', () => this.interact());
    window.addEventListener('blur', () => { holds.clear(); syncHold(); });
  }

  ensureZone(i) {
    if (i < 0 || i >= this.world.N || this.zones[i]) return;
    const z = this.world.buildZone(i);
    z.coinMesh = new THREE.InstancedMesh(this.coinGeo, this.coinMat, Math.max(1, z.coins.length));
    z.coinMesh.count = z.coins.length;
    z.coinMesh.frustumCulled = false;
    z.coinMesh.castShadow = true;
    z.group.traverse((o) => {
      if (o.isInstancedMesh) { o.receiveShadow = true; o.castShadow = !COARSE; }
      if (o.isMesh && o.parent?.type === 'Group' && !o.isInstancedMesh) o.receiveShadow = false;
    });
    this.scene.add(z.group, z.coinMesh);
    this.zones[i] = z;
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  // ---------------------------------------------------------------- control

  pause() {
    this.running = false;
    this.held.clear();
    cancelAnimationFrame(this.raf);
  }

  resume() {
    if (this.running) return;
    this.running = true;
    this.clock.getDelta();
    this.raf = requestAnimationFrame(this.tick);
  }

  jump() {
    if (!this.character || this.paused) return;
    if (this.character.jumpY <= 0.001) this.audio?.sfx('jump');
    this.character.jump();
  }

  /** E / Enter / A button: read the nearby station, or jump if there is none. */
  interact() {
    if (this.paused) return;
    if (this.near) {
      this.held.clear();
      this.drag = 0;
      this.vx = 0;
      this.audio?.sfx('coin');
      this.onRead?.(this.near);
    } else this.jump();
  }

  /** All coins collected: golden runner, a confetti burst, a fanfare and the secret panel. */
  celebrate() {
    if (!this.golden) {
      this.golden = true;
      this.character.makeGolden();
    }
    this.audio?.sfx('fanfare');
    this.burstConfetti();
    setTimeout(() => this.onAllCoins?.(), 1400);
  }

  burstConfetti() {
    const n = 180;
    if (!this.confetti) {
      const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.22, 0.22, 0.06), new THREE.MeshBasicMaterial(), n);
      mesh.frustumCulled = false;
      const palette = ['#ffd23f', '#ff5c8a', '#3fd0ff', '#95bf47', '#ffffff', '#b98cff'].map((c) => new THREE.Color(c));
      for (let k = 0; k < n; k++) mesh.setColorAt(k, palette[k % palette.length]);
      this.scene.add(mesh);
      this.confetti = { mesh, parts: [] };
    }
    this.confetti.parts = Array.from({ length: n }, () => ({
      p: new THREE.Vector3(this.x, 2.5, 0),
      v: new THREE.Vector3((Math.random() - 0.5) * 10, 7 + Math.random() * 9, (Math.random() - 0.5) * 6),
      r: Math.random() * 6, s: (Math.random() - 0.5) * 12,
    }));
    this.confetti.life = 4.5;
    this.confetti.mesh.visible = true;
  }

  updateConfetti(dt) {
    const c = this.confetti;
    if (!c || !c.mesh.visible) return;
    c.life -= dt;
    const { _m: m, _q: q, _e: e, _s: s } = this;
    c.parts.forEach((pt, k) => {
      pt.v.y -= 14 * dt;
      pt.v.multiplyScalar(1 - dt * 0.6);
      pt.p.addScaledVector(pt.v, dt);
      pt.r += pt.s * dt;
      e.set(pt.r, pt.r * 0.7, 0);
      q.setFromEuler(e);
      s.setScalar(Math.max(0.0001, Math.min(1, c.life)));
      m.compose(pt.p, q, s);
      c.mesh.setMatrixAt(k, m);
    });
    c.mesh.instanceMatrix.needsUpdate = true;
    if (c.life <= 0) c.mesh.visible = false;
  }

  /** Start over: back to the beginning with every coin back in place. */
  restart() {
    this.zones.forEach((z) => z.coins.forEach((c) => { c.collected = false; c.anim = 0; }));
    this.coinCount = 0;
    this.hud?.setCoins(0, TOTAL_COINS);
    // stays "finished" until the teleport below moves us away from the finish line
    const flash = document.querySelector('.warp');
    gsap.timeline()
      .to(flash, { opacity: 1, duration: 0.18, ease: 'power1.in' })
      .add(() => { this.x = this.world.spawnX; this.vx = 0; this.facing = 1; this.snapLook = true; this.time = 0; this.updateCamera(0, true); })
      .to(flash, { opacity: 0, duration: 0.35, ease: 'power1.out' });
  }

  /** Fast travel to a zone's first station. */
  travel(i) {
    const z = this.zones[i];
    if (!z) return;
    const x = z.stations[0] ? z.stations[0].x : (z.x0 + z.x1) / 2;
    const flash = document.querySelector('.warp');
    gsap.timeline()
      .to(flash, { opacity: 1, duration: 0.18, ease: 'power1.in' })
      .add(() => { this.x = x - 0.5; this.vx = 0; this.snapLook = true; this.updateCamera(0, true); })
      .to(flash, { opacity: 0, duration: 0.35, ease: 'power1.out' });
  }

  // ---------------------------------------------------------------- frame

  tick() {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.tick);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.time += dt;
    const { N, minX, maxX } = this.world;

    // ---- Running ----
    let dir = 0;
    if (!this.paused) {
      dir = (this.held.has('right') ? 1 : 0) - (this.held.has('left') ? 1 : 0) + this.drag + (this.holdDir || 0);
      if (!dir && this.time < this.wheelUntil) dir = this.wheelDir;
      dir = clamp(dir, -1, 1);
    }
    this.vx = lerp(this.vx, dir * RUN_SPEED, 1 - Math.exp(-dt * (dir ? 9 : 12)));
    this.x = clamp(this.x + this.vx * dt, minX + 6, maxX - 6);
    // Reaching the end of the road finishes the run (once, until you head back).
    if (!this.finished && !this.paused && this.x >= maxX - 8) {
      this.finished = true;
      this.held.clear();
      this.drag = 0;
      this.vx = 0;
      this.onFinish?.(this.coinCount);
    } else if (this.finished && this.x < maxX - 20) this.finished = false;
    if (Math.abs(this.vx) > 0.3) this.facing = Math.sign(this.vx);
    const running = Math.abs(this.vx) > 0.6;
    this.character.root.position.set(this.x, 0, 0);

    // ---- Zone, stations, coins ----
    const cur = this.world.zoneAt(this.x);
    if (cur !== this.zoneIndex) {
      this.zoneIndex = cur;
      this.hud?.setZone(cur);
    }
    let near = null, nearD = READ_RANGE;
    this.zones.forEach((z, k) => {
      const vis = Math.abs(k - (this.x / ZONE - 0.5)) < 1.8;
      z.group.visible = z.coinMesh.visible = vis;
      if (!vis) return;
      this.updateCoins(z, dt);
      for (const s of z.stations) {
        s.marker.position.y = s.marker.userData.baseY + Math.sin(this.time * 3 + s.x) * 0.2;
        // The marker you can read grows and spins faster.
        const active = s === this.near;
        s.marker.rotation.y = this.time * (active ? 5 : 2);
        s.marker.scale.setScalar(lerp(s.marker.scale.x, active ? 2 : 1, 1 - Math.exp(-dt * 10)));
        const d = Math.abs(s.x - this.x);
        if (d < nearD) { nearD = d; near = s; }
      }
    });
    if (near !== this.near) {
      this.near = near;
      this.hud?.setPrompt(near);
    }

    // ---- Look: blend the two nearest zones ----
    const zf = this.x / ZONE - 0.5;
    const i0 = clamp(Math.floor(zf), 0, N - 1), i1 = clamp(i0 + 1, 0, N - 1);
    // The blend runs across the whole stretch between two zone centres (no narrow window),
    // and every value then eases toward its target over time, so nothing can jump.
    const w = smoothstep(0, 1, zf - Math.floor(zf));
    const a = this.tc[i0], b = this.tc[i1], ta = this.themes[i0], tb = this.themes[i1];
    const L = (this.lookNow ??= {
      sky: new THREE.Color(), fog: new THREE.Color(), hemiSky: new THREE.Color(), hemiGround: new THREE.Color(),
      light: new THREE.Color(), sun: new THREE.Color(), nums: null,
    });
    const T = this._lookTarget ??= { sky: new THREE.Color(), fog: new THREE.Color(), hemiSky: new THREE.Color(), hemiGround: new THREE.Color(), light: new THREE.Color(), sun: new THREE.Color() };
    for (const key in T) T[key].copy(a[key]).lerp(b[key], w);
    const nums = {
      fogNear: lerp(ta.fogNear, tb.fogNear, w), fogFar: lerp(ta.fogFar, tb.fogFar, w),
      hemiI: lerp(ta.hemiI, tb.hemiI, w), lightI: lerp(ta.lightI, tb.lightI, w),
      night: lerp(ta.night, tb.night, w), sunY: lerp(ta.sunY, tb.sunY, w),
    };
    const k = L.nums && !this.snapLook ? 1 - Math.exp(-dt * 1.6) : 1;
    this.snapLook = false;
    for (const key in T) L[key].lerp(T[key], k);
    L.nums ??= { ...nums };
    for (const key in nums) L.nums[key] = lerp(L.nums[key], nums[key], k);
    this.scene.background.copy(L.sky);
    this.scene.fog.color.copy(L.fog);
    this.scene.fog.near = L.nums.fogNear;
    this.scene.fog.far = L.nums.fogFar;
    this.hemi.color.copy(L.hemiSky);
    this.hemi.groundColor.copy(L.hemiGround);
    this.hemi.intensity = L.nums.hemiI;
    this.sun.color.copy(L.light);
    this.sun.intensity = L.nums.lightI;
    this.sunMesh.material.color.copy(L.sun);
    this.skyUniforms.top.value.copy(L.sky);
    this.skyUniforms.bottom.value.copy(L.fog);
    this.stars.material.opacity = L.nums.night;

    this.updateCamera(dt);
    const camYaw = Math.atan2(this.camera.position.x - this.x, this.camera.position.z);
    this.character.update(dt, { running, speed: Math.abs(this.vx), moveYaw: this.facing * Math.PI / 2, camYaw });

    this.skyDome.position.copy(this.camera.position);
    this.stars.position.copy(this.camera.position);
    this.sunMesh.position.set(this.camera.position.x + 45, L.nums.sunY + 6, -170);
    this.sunMesh.lookAt(this.camera.position);
    this.sun.position.set(this.x - 10, 22, 14);
    this.sun.target.position.set(this.x, 0, -4);

    // Float the "press E" bubble above the player's head.
    if (this.near) {
      this.promptEl ??= document.getElementById('prompt');
      const v = this._v.set(this.x, 4.4 + this.character.jumpY, 0).project(this.camera);
      const px = ((v.x + 1) / 2) * window.innerWidth, py = ((1 - v.y) / 2) * window.innerHeight;
      const half = (this.promptEl.offsetWidth || 0) / 2 + 12;
      this.promptEl.style.transform = `translate(${clamp(px, half, window.innerWidth - half)}px, ${Math.max(70, py)}px) translate(-50%, -100%)`;
    }

    this.updateConfetti(dt);
    this.renderer.render(this.scene, this.camera);
  }

  updateCamera(dt, snap = false) {
    const portrait = this.camera.aspect < 1;
    const fov = portrait ? 58 : 40;
    if (this.camera.fov !== fov) { this.camera.fov = fov; this.camera.updateProjectionMatrix(); }
    // Look a little ahead of where the runner is heading.
    this.lead = lerp(this.lead ?? 3, this.facing * (portrait ? 1 : 4), snap ? 1 : 1 - Math.exp(-dt * 2));
    const dist = portrait ? clamp(12 / this.camera.aspect, 18, 27) : 19;
    const target = new THREE.Vector3(this.x + this.lead, portrait ? 8 : 6.5, dist);
    const look = new THREE.Vector3(this.x + this.lead, portrait ? 1.2 : 2.6, -2);
    if (snap || !this.camLook) {
      this.camera.position.copy(target);
      this.camLook = look.clone();
    } else {
      const f = 1 - Math.exp(-dt * 6);
      this.camera.position.lerp(target, f);
      this.camLook.lerp(look, f);
    }
    this.camera.lookAt(this.camLook);
  }

  updateCoins(z, dt) {
    const { _m: m, _q: q, _e: e, _v: v, _s: s } = this;
    const cy = 1.6 + this.character.jumpY; // the runner's middle
    z.coins.forEach((c, k) => {
      if (this.time > 1.2 && !c.collected && Math.abs(c.x - this.x) < 0.8 && Math.abs(c.y - cy) < 1.5) {
        c.collected = true;
        this.coinCount++;
        this.hud?.setCoins(this.coinCount, TOTAL_COINS);
        if (this.coinCount === TOTAL_COINS) this.celebrate();
        this.audio?.sfx('coin');
      }
      let scale = 1, y = c.y + Math.sin(this.time * 3 + k) * 0.1;
      if (c.collected) {
        c.anim = Math.min(1, c.anim + dt * 2.5);
        y += c.anim * 2.2;
        scale = 1 - c.anim;
      }
      e.set(0, this.time * 3 + k * 0.4, 0);
      q.setFromEuler(e);
      v.set(c.x, y, c.z);
      s.setScalar(Math.max(0.0001, scale));
      m.compose(v, q, s);
      z.coinMesh.setMatrixAt(k, m);
    });
    z.coinMesh.instanceMatrix.needsUpdate = true;
  }
}
