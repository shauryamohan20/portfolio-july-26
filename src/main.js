import './style.css';
import { Chiptune } from './audio/chiptune.js';
import { createHud } from './ui/hud.js';
import { createReader } from './ui/reader.js';
import { setupReveals } from './ui/reveal.js';

const root = document.documentElement;
const audio = new Chiptune();
let game = null;
let booting = null;
let resolveStart = null;

const store = {
  get: (k, s = localStorage) => { try { return s.getItem(k); } catch { return null; } },
  set: (k, v, s = localStorage) => { try { s.setItem(k, v); } catch { /* private mode */ } },
};

const hud = createHud({ audio, onAction });
const reader = createReader({ onClose: () => game && (game.paused = false) });

// e is the event, or the zone index for 'travel'.
function onAction(action, e) {
  switch (action) {
    case 'plain':
      setMode('plain', { focus: true });
      break;
    case 'toggle-view':
      setMode(root.classList.contains('game') ? 'plain' : 'game');
      break;
    case 'mute':
      audio.setMuted(!audio.muted);
      hud.syncMute();
      break;
    case 'jump':
      game?.jump();
      break;
    case 'interact':
      game?.interact();
      break;
    case 'travel':
      reader.close();
      game?.travel(e);
      break;
    case 'close-reader':
      reader.close();
      break;
    case 'start-sound':
    case 'start-muted':
      e?.preventDefault();
      if (action === 'start-sound') audio.setMuted(false); // runs inside the click, so browsers allow audio
      hud.syncMute();
      resolveStart?.();
      break;
  }
}

function setMode(mode, { focus = false } = {}) {
  store.set('view', mode);
  if (mode === 'plain') {
    root.classList.remove('game', 'booting');
    root.classList.add('plain');
    game?.pause();
    reader.close();
    if (!audio.muted) audio.setMuted(true);
    hud.syncMute();
    if (focus) document.getElementById('main').focus({ preventScroll: true });
  } else {
    root.classList.remove('plain');
    root.classList.add('game');
    if (game) game.resume();
    else boot();
  }
  hud.syncView();
}

async function boot() {
  if (booting) return booting;
  const bootEl = document.getElementById('boot');
  const bar = bootEl.querySelector('.boot-bar');
  const fill = bar.querySelector('span');
  const status = bootEl.querySelector('.boot-msg');
  const pct = bootEl.querySelector('.boot-pct');
  const actions = bootEl.querySelector('.boot-actions');
  root.classList.add('booting');

  const progress = (p, msg) => {
    const v = Math.round(p * 100);
    fill.style.width = v + '%';
    bar.setAttribute('aria-valuenow', String(v));
    pct.textContent = v + '%';
    if (msg) status.textContent = msg;
  };

  booting = (async () => {
    try {
      progress(0.03, 'Loading engine...');
      const { Game } = await import('./game/game.js');
      game = new Game({
        canvas: document.getElementById('world'),
        audio,
        hud,
        onRead: (station) => {
          game.paused = true;
          reader.open(station.target);
        },
      });
      await game.load(progress);
    } catch (err) {
      console.error(err);
      status.textContent = '3D could not start. Opening normal view...';
      await new Promise((r) => setTimeout(r, 1000));
      game = null;
      booting = null;
      setMode('plain');
      return;
    }
    if (!root.classList.contains('game')) {
      game.pause(); // user skipped to normal view while loading
      return;
    }
    // The loading screen always ends on a start screen (also unlocks audio on click).
    actions.hidden = false;
    actions.querySelector('[data-action="start-sound"]').focus();
    await new Promise((r) => (resolveStart = r));
    resolveStart = null;
    bootEl.classList.add('boot--out');
    setTimeout(() => {
      root.classList.remove('booting');
      bootEl.classList.remove('boot--out');
      document.activeElement?.blur();
      showHelp();
    }, 450);
  })();
  return booting;
}

function showHelp() {
  const help = document.getElementById('help');
  if (!help) return;
  help.hidden = false;
  setTimeout(() => help.classList.add('help--out'), 7000);
  setTimeout(() => (help.hidden = true), 7600);
}

setupReveals();

if (root.classList.contains('game')) boot();
