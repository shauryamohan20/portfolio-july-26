/** Which section is in the middle of the window (normal view), and scrolling to one. */
export function currentSection(sections) {
  const mid = window.scrollY + window.innerHeight / 2;
  let index = 0;
  sections.forEach((s, i) => { if (s.getBoundingClientRect().top + window.scrollY <= mid) index = i; });
  return index;
}

export function goToSection(el) {
  const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
}
