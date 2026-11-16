// Entry for /projects/ — a light page: no Three.js, just the full list and a platform filter.
import './style.css';
import { inject } from '@vercel/analytics';
import { setupReveals } from './ui/reveal.js';
import { setupStage } from './ui/stage.js';

inject(); // Vercel Web Analytics
setupReveals();
setupStage();

const chips = [...document.querySelectorAll('[data-filter]')];
const cards = [...document.querySelectorAll('.work')];

chips.forEach((chip) =>
  chip.addEventListener('click', () => {
    const f = chip.dataset.filter;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    cards.forEach((card) => {
      card.hidden = f !== 'all' && card.dataset.platform !== f;
    });
  })
);
