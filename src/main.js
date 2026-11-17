import './style.css';
import { inject } from '@vercel/analytics';
import { Chiptune } from './audio/chiptune.js';
import { createHud } from './ui/hud.js';
import { createReader } from './ui/reader.js';
import { setupReveals } from './ui/reveal.js';
import { setupStage } from './ui/stage.js';
import { site } from './content.js';

// Vercel Web Analytics: counts visitors and page views once deployed on Vercel.
inject();

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

// End-of-run panel: contact me, or run again.
const finish = document.getElementById('finish');
const finishEmail = document.getElementById('finish-email');
finishEmail.href = `mailto:${site.email}?subject=Shopify%20project`;
finish.addEventListener('close', () => game && (game.paused = false));
let finishOpenedAt = 0;
finish.addEventListener('click', (e) => {
  if (e.target === finish && performance.now() - finishOpenedAt > 500) finish.close();
});
// Easter egg panel, shown once all coins are collected.
const secret = document.getElementById('secret');
const secretEmail = document.getElementById('secret-email');
secretEmail.href = `mailto:${site.email}?subject=I%20found%20all%20100%20coins`;
let secretOpenedAt = 0;
// The tribute song plays from the 100-coin moment until this panel closes.
let tributeOverride = false; // true when music was off and the visitor pressed "Play the tribute"
secret.addEventListener('close', () => {
  if (game) game.paused = false;
  audio.playSong('main');
  if (tributeOverride) {
    tributeOverride = false;
    audio.setMuted(true); // they had music off: back to silence
  }
  hud.syncMute();
});
secret.addEventListener('click', (e) => {
  if (e.target === secret && performance.now() - secretOpenedAt > 500) secret.close();
});
// The 100-coin moment: a Technoblade tribute banner over the confetti, then the secret panel.
function celebrateAllCoins() {
  const banner = document.getElementById('tb-banner');
  root.classList.add('celebrating');
  if (!audio.muted) setTimeout(() => audio.playSong('tribute'), 800); // after the coin fanfare
  banner.hidden = false;
  banner.classList.remove('tb-banner--out');
  void banner.offsetWidth;
  banner.classList.add('tb-banner--in');
  setTimeout(() => game?.burstConfetti(), 900);
  setTimeout(() => banner.classList.add('tb-banner--out'), 2600);
  setTimeout(() => {
    banner.hidden = true;
    banner.classList.remove('tb-banner--in', 'tb-banner--out');
    root.classList.remove('celebrating');
    showSecret();
  }, 3100);
}

function showSecret() {
  if (!game || reader.isOpen || finish.open) return;
  game.paused = true;
  secret.querySelector('.secret-music').hidden = !audio.muted;
  secretOpenedAt = performance.now();
  secret.showModal();
  secretEmail.focus();
}

function showFinish(coins) {
  if (secret.open) return;
  game.paused = true;
  document.getElementById('finish-coins').textContent = `${coins}/100`;
  audio.sfx('coin');
  finishOpenedAt = performance.now();
  finish.showModal();
  finishEmail.focus();
}

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
    case 'play-tribute':
      tributeOverride = audio.muted;
      audio.playSong('tribute');
      audio.setMuted(false); // inside the click, so the browser allows audio
      hud.syncMute();
      secret.querySelector('.secret-music').hidden = true;
      break;
    case 'close-secret':
      secret.close();
      break;
    case 'close-finish':
      finish.close();
      break;
    case 'run-again':
      finish.close();
      game?.restart();
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
    if (finish.open) finish.close();
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
        onFinish: showFinish,
        onAllCoins: celebrateAllCoins,
        onRead: (station) => {
          game.paused = true;
          reader.open(station.target);
        },
      });
      await game.load(progress);
      if (import.meta.env.DEV) Object.assign(window, { __game: game, __audio: audio }); // debugging only; removed from production builds
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
setupStage();

if (root.classList.contains('game')) boot();
