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

const NOTE_IDX = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function midi(n) {
  const m = /^([A-G])(#?)(\d)$/.exec(n);
  return m ? (Number(m[3]) + 1) * 12 + NOTE_IDX[m[1]] + (m[2] ? 1 : 0) : null;
}
const freq = (m) => 440 * Math.pow(2, (m - 69) / 12);

export class Chiptune {
  constructor() {
    this.muted = true;
    this.ctx = null;
    this.zone = 'intro';
    this.lead = SONG.lead.trim().split(/\s+/);
  }

  ensure() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = (this.ctx = new AC());
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(ctx.destination);
    this.music = ctx.createGain();
    this.music.gain.value = SONG.volume;
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

  setMuted(m) {
    this.muted = m;
    if (!m) {
      this.ensure(); // must run inside a click/keypress handler
      if (!this.ctx) return;
      this.ctx.resume();
      this.master.gain.setTargetAtTime(1, this.ctx.currentTime, 0.05);
      this.start();
    } else if (this.ctx) {
      this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
      this.stop();
      setTimeout(() => this.muted && this.ctx.suspend(), 300);
    }
  }

  setZone(id) {
    this.zone = id;
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
    const spb = 60 / SONG.bpm / 4;
    while (this.next < this.ctx.currentTime + 0.12) {
      this.playStep(this.step, this.next, spb);
      this.next += spb;
      this.step = (this.step + 1) % 64;
    }
  }

  playStep(step, t, spb) {
    const s = step % 16, bar = step >> 4;
    if (s === 0) this.cfg = SONG.zones[this.zone] || { transpose: 0, duty: 0.5 }; // switch on bar lines
    const tr = this.cfg.transpose || 0;

    // Lead
    const tok = this.lead[step];
    const m = midi(tok);
    if (m !== null) {
      let hold = 1;
      while (this.lead[(step + hold) % 64] === '-' && hold < 16) hold++;
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
    node.connect(g).connect(this.music);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  kick(t) {
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.frequency.setValueAtTime(160, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    o.connect(g).connect(this.music);
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
    src.connect(f).connect(g).connect(this.music);
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
      o.connect(g).connect(this.fx);
      o.start(t + start);
      o.stop(t + start + dur + 0.02);
    };
    if (name === 'coin') {
      play(988, 0, 0, 0.07);
      play(1319, 0, 0.07, 0.25);
    } else if (name === 'jump') {
      play(300, 720, 0, 0.16);
    }
  }
}
