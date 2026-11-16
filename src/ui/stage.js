/**
 * Normal view, desktop: the fixed stage beside the reading column shows the
 * storefront that matches the section in view, or the store row you hover.
 */
export function setupStage() {
  const stage = document.querySelector('.stage');
  if (!stage) return;
  const frames = [...stage.querySelectorAll('.stage-frame')];
  let map = {};
  try { map = JSON.parse(stage.dataset.map || '{}'); } catch { /* keep defaults */ }
  let sectionFrame = 0;
  const show = (i) => frames.forEach((f, k) => f.classList.toggle('is-on', k === i));

  const sections = [...document.querySelectorAll('main > section.zone')];
  if (sections.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const i = map[e.target.id];
        if (i == null) return;
        sectionFrame = i;
        show(i);
      }),
      { rootMargin: '-45% 0px -45% 0px' }
    );
    sections.forEach((s) => io.observe(s));
  }

  // Hover or focus a store row: put that store on the stage.
  document.querySelectorAll('.work[data-index]').forEach((row) => {
    const i = Number(row.dataset.index);
    row.addEventListener('mouseenter', () => show(i));
    row.addEventListener('focusin', () => show(i));
    row.addEventListener('mouseleave', () => show(sectionFrame));
    row.addEventListener('focusout', () => show(sectionFrame));
  });
}
