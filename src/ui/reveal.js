// Normal view: parts of each section rise in as they enter (skipped under reduced motion).
export function setupReveals() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }),
    { rootMargin: '0px 0px -8% 0px' }
  );
  document.querySelectorAll('.zone .panel > *:not(.work-list):not(.cards), .page-head > *, .work, .card--service').forEach((el) => {
    const siblings = [...el.parentElement.children];
    el.style.setProperty('--d', `${Math.min(siblings.indexOf(el), 5) * 80}ms`);
    el.classList.add('reveal');
    io.observe(el);
  });
}
