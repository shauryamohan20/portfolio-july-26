/**
 * Chiptune music + sound effects, generated live with the Web Audio API.
 * No audio files. Edit SONG to change the tune.
 *
 * Notes: 'C5', 'F#4' etc. '-' holds the previous note, '.' is a rest.
 * 64 steps = 4 bars of 16th notes. One chord per bar.
 */
export const SONG = {
  bpm: 132,
  volume: 0.3,
  lead: `E5 - G5 - C6 - G5 - E5 - D5 - C5 - D5 -
         E5 - - - A4 - C5 - E5 - D5 - C5 - A4 -
         F5 - A5 - C6 - A5 - G5 - F5 - E5 - C5 -
         D5 - G5 - B5 - D6 - B5 - - - G5 - . .`,
  bass: ['C3', 'A2', 'F2', 'G2'],
  chords: [['C4', 'E4', 'G4'], ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4'], ['G3', 'B3', 'D4']],
  // Per-zone flavour (keys = section ids). duty = pulse width of the lead.
  zones: {
    intro: { transpose: 0, duty: 0.5 },
    about: { transpose: -3, duty: 0.25 },
    services: { transpose: 2, duty: 0.125 },
    projects: { transpose: -5, duty: 0.25 },
    beinindia: { transpose: -1, duty: 0.5, drone: true },
    contact: { transpose: 5, duty: 0.125 },
  },
};

/**
 * "Never Dies": an original tribute anthem for Technoblade, played when every coin
 * is collected. Starts solemn in A minor and climbs to a triumphant C major.
 * 8 bars of 16th notes, one chord per bar.
 */
export const TRIBUTE = {
  bpm: 92,
  volume: 0.34,
  style: 'anthem',
  duty: 0.5,
  lead: `A4 - - - C5 - E5 - A5 - - - G5 - E5 -
         F5 - - - E5 - D5 - C5 - - - A4 - C5 -
         E5 - - - G5 - C6 - - - B5 - A5 - G5 -
         D5 - - - G5 - - - B5 - - - D6 - - -
         E6 - - - D6 - C6 - A5 - - - C6 - E6 -
         F6 - - - E6 - D6 - C6 - - - A5 - F5 -
         G5 - - - B5 - D6 - G6 - - - F6 - D6 -
         E6 - - - - - - - C6 - - - - - - -`,
  bass: ['A2', 'F2', 'C3', 'G2', 'A2', 'F2', 'G2', 'C3'],
  chords: [
    ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4'], ['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'],
    ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4'], ['G3', 'B3', 'D4'], ['C4', 'E4', 'G4'],
  ],
};

/**
 * "Afterburner": an original 80s flight anthem for the plane ride through the Skills
 * zone. Driving eighth-note synth bass, wide power-chord pads, gated snare and a
 * soaring two-voice lead. E minor, 8 bars.
 */
export const FLIGHT = {
  bpm: 116,
  volume: 0.32,
  style: 'flight',
  lead: `E5 - - - - - B4 - E5 - F#5 - G5 - - -
         G5 - - - E5 - - - C5 - - - E5 - G5 -
         B5 - - - - - A5 - G5 - - - D5 - - -
         F#5 - - - - - - - A5 - - - - - - -
         B5 - - - - - G5 - E5 - G5 - B5 - - -
         C6 - - - B5 - - - G5 - - - E5 - G5 -
         A5 - - - - - F#5 - D5 - F#5 - A5 - D6 -
         D#6 - - - - - - - B5 - - - F#5 - - -`,
  bass: ['E2', 'C2', 'G2', 'D2', 'E2', 'C2', 'D2', 'B1'],
  chords: [
    ['E3', 'B3', 'E4', 'G4'], ['C3', 'G3', 'C4', 'E4'], ['G3', 'D4', 'G4', 'B4'], ['D3', 'A3', 'D4', 'F#4'],
    ['E3', 'B3', 'E4', 'G4'], ['C3', 'G3', 'C4', 'E4'], ['D3', 'A3', 'D4', 'F#4'], ['B2', 'F#3', 'B3', 'D#4'],
  ],
};

const SONGS = { main: SONG, tribute: TRIBUTE, flight: FLIGHT };

const NOTE_IDX = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function midi(n) {
  const m = /^([A-G])(#?)(\d)$/.exec(n);
  return m ? (Number(m[3]) + 1) * 12 + NOTE_IDX[m[1]] + (m[2] ? 1 : 0) : null;
}
/** Swallows a rejected promise (old Safari returns no promise at all). */
const quiet = (p) => p?.catch?.(() => {});

/** Connects audio nodes in a chain (no chained .connect(), which old Safari lacks). */
function link(...nodes) {
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].connect(nodes[i + 1]);
}

/**
 * A short silent WAV. Playing it from a tap moves iPhones to the "playback" audio
 * category, so the music plays even with the ring/silent switch on silent.
 */
function silentWav() {
  const rate = 8000, n = 800, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
  const str = (o, t) => [...t].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  str(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); str(8, 'WAVE'); str(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  str(36, 'data'); v.setUint32(40, n * 2, true);
  return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
}

const freq = (m) => 440 * Math.pow(2, (m - 69) / 12);

export class Chiptune {
  constructor() {
    this.muted = true;
    this.ctx = null;
    this.zone = 'intro';
    this.songName = 'main';
    this.leads = Object.fromEntries(Object.entries(SONGS).map(([k, v]) => [k, v.lead.trim().split(/\s+/)]));
    if (typeof document !== 'undefined') {
      this.watchVisibility();
      this.watchGestures();
    }
  }

  /**
   * Safari only lets audio start (or restart after the tab was hidden) inside a tap or
   * key press. So on every gesture, if music should be playing but the context is
   * suspended or "interrupted", resume it right there.
   */
  watchGestures() {
    const wake = () => {
      if (this.muted || !this.ctx || document.hidden) return;
      this.unlock();
      if (this.ctx.state !== 'running') quiet(this.ctx.resume());
    };
    ['pointerdown', 'touchend', 'keydown', 'click'].forEach((ev) => window.addEventListener(ev, wake, { capture: true, passive: true }));
  }

  /** iPhone: route Web Audio as media playback, not as a ringer sound. Call inside a gesture. */
  unlock() {
    try {
      if (navigator.audioSession) navigator.audioSession.type = 'playback'; // Safari 16.4+
    } catch { /* not supported */ }
    if (this.unlocked) return;
    this.unlocked = true;
    try {
      const el = (this.silence = new Audio(silentWav()));
      el.loop = true;
      el.setAttribute('playsinline', '');
      el.volume = 0.01;
      el.play()?.catch(() => (this.unlocked = false));
    } catch { this.unlocked = false; }
  }

  ensure() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    let ctx;
    try {
      ctx = this.ctx = new AC({ latencyHint: 'interactive' });
    } catch {
      ctx = this.ctx = new AC(); // older Safari takes no options
    }
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(ctx.destination);
    this.music = ctx.createGain();
    this.music.gain.value = this.song.volume;
    this.music.connect(this.master);
    this.fx = ctx.createGain();
    this.fx.gain.value = 0.35;
    this.fx.connect(this.master);
    this.waves = {};
    const len = ctx.sampleRate;
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.cfg = SONG.zones[this.zone] || { transpose: 0, duty: 0.5 };
  }

  /** NES-style pulse wave with a given duty cycle. */
  pulse(duty) {
    if (!this.waves[duty]) {
      const n = 32, real = new Float32Array(n), imag = new Float32Array(n);
      for (let k = 1; k < n; k++) real[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty);
      this.waves[duty] = this.ctx.createPeriodicWave(real, imag);
    }
    return this.waves[duty];
  }

  /** Pause music while the page is hidden (tab switched, app minimized, phone locked). */
  watchVisibility() {
    const onHide = () => {
      if (this.muted || !this.ctx || this.bgPaused) return;
      this.bgPaused = true;
      this.stop();
      this.master.gain.setValueAtTime(0, this.ctx.currentTime);
      this.silence?.pause();
      this.unlocked = false;
      quiet(this.ctx.suspend());
    };
    const onShow = () => {
      if (!this.bgPaused) return;
      this.bgPaused = false;
      if (this.muted) return;
      // Safari may refuse this outside a tap; watchGestures resumes it on the next one.
      quiet(this.ctx.resume());
      this.master.gain.setTargetAtTime(1, this.ctx.currentTime, 0.1);
      this.start();
    };
    document.addEventListener('visibilitychange', () => (document.hidden ? onHide() : onShow()));
    window.addEventListener('pagehide', onHide);
    window.addEventListener('pageshow', () => !document.hidden && onShow());
  }

  setMuted(m) {
    this.bgPaused = false;
    this.muted = m;
    if (!m) {
      this.ensure(); // must run inside a click/keypress handler
      if (!this.ctx) return;
      this.unlock();
      quiet(this.ctx.resume());
      this.master.gain.setTargetAtTime(1, this.ctx.currentTime, 0.05);
      this.start();
    } else if (this.ctx) {
      this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
      this.stop();
      this.silence?.pause();
      this.unlocked = false;
      setTimeout(() => this.muted && quiet(this.ctx.suspend()), 300);
    }
  }

  setZone(id) {
    this.zone = id;
  }

  get song() {
    return SONGS[this.songName] || SONG;
  }

  /** Switch songs ('main' or 'tribute'), starting the new one from its first beat. */
  playSong(name) {
    if (!SONGS[name] || name === this.songName) return;
    this.songName = name;
    this.step = 0;
    if (!this.ctx) return;
    this.music.gain.setTargetAtTime(this.song.volume, this.ctx.currentTime, 0.05);
    if (this.timer) this.next = this.ctx.currentTime + 0.08;
  }

  start() {
    if (this.timer) return;
    this.step = 0;
    this.next = this.ctx.currentTime + 0.06;
    this.timer = setInterval(() => this.schedule(), 25);
  }

  stop() {
    clearInterval(this.timer);
    this.timer = null;
  }

  schedule() {
    const song = this.song;
    const steps = this.leads[this.songName].length;
    const spb = 60 / song.bpm / 4;
    if (this.ctx.state !== 'running') return;
    if (this.next < this.ctx.currentTime) this.next = this.ctx.currentTime + 0.03;
    while (this.next < this.ctx.currentTime + 0.12) {
      if (song.style === 'anthem') this.playAnthemStep(this.step, this.next, spb);
      else if (song.style === 'flight') this.playFlightStep(this.step, this.next, spb);
      else this.playStep(this.step, this.next, spb);
      this.next += spb;
      this.step = (this.step + 1) % steps;
    }
  }

  playStep(step, t, spb) {
    const s = step % 16, bar = step >> 4;
    if (s === 0) this.cfg = SONG.zones[this.zone] || { transpose: 0, duty: 0.5 }; // switch on bar lines
    const tr = this.cfg.transpose || 0;

    // Lead
    const lead = this.leads.main;
    const tok = lead[step];
    const m = midi(tok);
    if (m !== null) {
      let hold = 1;
      while (lead[(step + hold) % lead.length] === '-' && hold < 16) hold++;
      this.tone(m + tr, t, hold * spb * 0.95, this.pulse(this.cfg.duty || 0.5), 0.1);
    }
    // Bass (triangle, octave bounce)
    const root = midi(SONG.bass[bar]) + tr;
    if (s % 2 === 0) this.tone(s % 4 === 0 ? root : root + 12, t, spb * 1.7, 'triangle', 0.22);
    // Arpeggio
    const ch = SONG.chords[bar];
    this.tone(midi(ch[s % 3]) + tr + 12, t, spb * 0.8, this.pulse(0.125), 0.025);
    // Drums
    if (s === 0 || s === 8 || s === 10) this.kick(t);
    if (s === 4 || s === 12) this.hit(t, 1200, 0.14, 0.32);
    if (s % 2 === 1) this.hit(t, 7000, 0.035, 0.12);
    // Tanpura-style drone for the India zone
    if (this.cfg.drone && s === 0) {
      this.tone(midi('C2') + tr, t, spb * 16, 'sawtooth', 0.05, 500);
      this.tone(midi('G2') + tr, t, spb * 16, 'sawtooth', 0.035, 500);
    }
  }

  /** The tribute: doubled lead, a sustained pad, quarter-note bass and a marching kit. */
  playAnthemStep(step, t, spb) {
    const song = TRIBUTE, lead = this.leads.tribute;
    const s = step % 16, bar = step >> 4;
    const m = midi(lead[step]);
    if (m !== null) {
      let hold = 1;
      while (lead[(step + hold) % lead.length] === '-' && hold < 16) hold++;
      const dur = hold * spb * 0.97;
      this.tone(m, t, dur, this.pulse(song.duty), 0.11); // lead
      this.tone(m - 12, t, dur, this.pulse(0.25), 0.05); // octave below, for weight
      if (bar >= 4) this.tone(m + 7 - 12, t, dur, this.pulse(0.125), 0.025); // a fifth, second half only
    }
    const ch = song.chords[bar];
    if (s === 0) ch.forEach((n) => this.tone(midi(n), t, spb * 16, 'sawtooth', 0.03, 1100)); // pad
    const root = midi(song.bass[bar]);
    if (s % 4 === 0) this.tone(s === 8 ? root + 12 : root, t, spb * 3.6, 'triangle', 0.24); // bass
    if (s % 2 === 1) this.tone(midi(ch[(s >> 1) % 3]) + 12, t, spb * 0.8, this.pulse(0.125), 0.02); // shimmer
    // Marching kit: kick on 1 and 3, snare on 2 and 4, a roll into each half, a crash on the downbeats.
    if (s === 0 || s === 8) this.kick(t);
    if (s === 4 || s === 12) this.hit(t, 1500, 0.16, 0.3);
    if ((bar === 3 || bar === 7) && s >= 12) this.hit(t, 1800, 0.08, 0.18 + (s - 12) * 0.04);
    if ((bar === 0 || bar === 4) && s === 0) this.hit(t, 3500, 0.9, 0.22);
  }

  /** The flight anthem: synth-rock bass, big pads, a gated snare and a doubled lead. */
  playFlightStep(step, t, spb) {
    const song = FLIGHT, lead = this.leads.flight;
    const s = step % 16, bar = step >> 4;
    const m = midi(lead[step]);
    if (m !== null) {
      let hold = 1;
      while (lead[(step + hold) % lead.length] === '-' && hold < 16) hold++;
      const dur = hold * spb * 0.97;
      this.tone(m, t, dur, 'sawtooth', 0.06, 2600); // brassy saw lead
      this.tone(m, t, dur, this.pulse(0.5), 0.06); // square double
      this.tone(m - 12, t, dur, this.pulse(0.25), 0.035); // octave below
    }
    const ch = song.chords[bar];
    if (s === 0) ch.forEach((n) => this.tone(midi(n), t, spb * 16, 'sawtooth', 0.026, 1500)); // pad
    if (s === 8) ch.forEach((n) => this.tone(midi(n) + 12, t, spb * 8, this.pulse(0.125), 0.012)); // pad sparkle
    const root = midi(song.bass[bar]);
    if (s % 2 === 0) this.tone(s === 14 ? root + 12 : root, t, spb * 1.6, 'sawtooth', 0.11, 520); // driving eighths
    if (s % 4 === 0) this.tone(root, t, spb * 3.5, 'triangle', 0.16); // sub
    // Drums: kick on 1 and the "and" of 2, big gated snare on 2 and 4, hats on the eighths.
    if (s === 0 || s === 6 || s === 8) this.kick(t);
    if (s === 4 || s === 12) { this.hit(t, 900, 0.26, 0.34); this.hit(t, 3000, 0.12, 0.14); }
    if (s % 2 === 0) this.hit(t, 8000, 0.03, 0.08);
    // Tom fill into each half, a crash on the downbeats.
    if ((bar === 3 || bar === 7) && s >= 12) this.tom(t, [180, 150, 120, 95][s - 12]);
    if ((bar === 0 || bar === 4) && s === 0) this.hit(t, 3500, 1.1, 0.2);
  }

  tom(t, f) {
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.frequency.setValueAtTime(f, t);
    o.frequency.exponentialRampToValueAtTime(f * 0.55, t + 0.2);
    g.gain.setValueAtTime(0.4, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    link(o, g, this.music);
    o.start(t);
    o.stop(t + 0.24);
  }

  tone(m, t, dur, wave, vol, lowpass) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    if (typeof wave === 'string') o.type = wave;
    else o.setPeriodicWave(wave);
    o.frequency.value = freq(m);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.setValueAtTime(vol, t + Math.max(0.01, dur - 0.04));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = o;
    if (lowpass) {
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = lowpass;
      o.connect(f);
      node = f;
    }
    link(node, g, this.music);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  kick(t) {
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.frequency.setValueAtTime(160, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    link(o, g, this.music);
    o.start(t);
    o.stop(t + 0.15);
  }

  hit(t, hp, dur, vol) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const f = this.ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = hp;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    link(src, f, g, this.music);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.01);
  }

  sfx(name) {
    if (this.muted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const play = (f0, f1, start, dur) => {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.setPeriodicWave(this.pulse(0.25));
      o.frequency.setValueAtTime(f0, t + start);
      if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + start + dur);
      g.gain.setValueAtTime(0.25, t + start);
      g.gain.exponentialRampToValueAtTime(0.001, t + start + dur);
      link(o, g, this.fx);
      o.start(t + start);
      o.stop(t + start + dur + 0.02);
    };
    if (name === 'coin') {
      play(988, 0, 0, 0.07);
      play(1319, 0, 0.07, 0.25);
    } else if (name === 'fanfare') {
      [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, k) => play(f, 0, k * 0.11, k === 6 ? 0.6 : 0.12));
    } else if (name === 'jump') {
      play(300, 720, 0, 0.16);
    } else if (name === 'boost') {
      play(200, 1400, 0, 0.32);
      play(400, 2200, 0.08, 0.3);
    }
  }
}
