/**
 * HUD: section nav (fast travel in the 3D view, scroll links in the normal view),
 * zone label, coin counter, "press E" prompt, music and view buttons, M for music.
 */
import { currentSection, goToSection } from './position.js';

export function createHud({ audio, onAction }) {
  const root = document.documentElement;
  const sections = [...document.querySelectorAll('main > section.zone')];
  const links = [...document.querySelectorAll('[data-nav]')];
  const zoneNum = document.getElementById('hud-zone-num');
  const zoneName = document.getElementById('hud-zone-name');
  const coinEl = document.getElementById('coin-count');
  const muteBtn = document.getElementById('mute-btn');
  const viewBtn = document.getElementById('view-btn');
  const prompt = document.getElementById('prompt');
  const promptText = prompt?.querySelector('.prompt-text');
  let active = -1;

  const isGame = () => root.classList.contains('game');
  const isBooting = () => root.classList.contains('booting');

  function markActive(i) {
    if (i === active) return;
    active = i;
    links.forEach((a, j) => (j === i ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
    if (zoneNum) zoneNum.textContent = `${i + 1}/${sections.length}`;
    if (zoneName) zoneName.textContent = links[i]?.textContent.trim() || '';
    audio.setZone(sections[i].id);
  }

  // Normal view: highlight the section in view.
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking || isGame()) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; markActive(currentSection(sections)); });
  }, { passive: true });

  function go(step) {
    if (isGame()) onAction('travel', Math.max(0, Math.min(sections.length - 1, active + step)));
    else goToSection(sections[Math.max(0, Math.min(sections.length - 1, currentSection(sections) + step))]);
  }

  document.addEventListener('click', (e) => {
    // In the 3D view, links to a section fast-travel to that zone.
    const hash = e.target.closest('a[href^="#"]');
    if (hash && isGame() && !hash.dataset.action) {
      const i = sections.findIndex((s) => '#' + s.id === hash.getAttribute('href'));
      if (i >= 0) {
        e.preventDefault();
        onAction('travel', i);
        return;
      }
    }
    const el = e.target.closest('[data-action],[data-step]');
    if (!el) return;
    if (el.dataset.step) go(Number(el.dataset.step));
    else onAction(el.dataset.action, e);
  });

  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || isBooting() || !isGame()) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if (e.code === 'KeyM') onAction('mute', e);
  });

  const hud = {
    setZone: markActive,
    setPrompt(station) {
      if (!prompt) return;
      prompt.hidden = !station;
      if (station) promptText.textContent = station.label;
    },
    setCoins(n, total) {
      if (!coinEl) return;
      coinEl.textContent = total ? `${n}/${total}` : String(n).padStart(2, '0');
      coinEl.parentElement.classList.remove('bump');
      void coinEl.offsetWidth;
      coinEl.parentElement.classList.add('bump');
    },
    syncMute() {
      muteBtn.textContent = audio.muted ? 'Music off' : 'Music on';
      muteBtn.setAttribute('aria-pressed', String(!audio.muted));
    },
    syncView() {
      viewBtn.textContent = isGame() ? 'Normal view' : '8-bit view';
      viewBtn.setAttribute('aria-label', isGame() ? 'Switch to normal view' : 'Switch to 8-bit game view');
    },
  };
  hud.syncMute();
  hud.syncView();
  markActive(isGame() ? 0 : currentSection(sections));
  return hud;
}
