/**
 * The in-game reading dialog. Stations in the world point at real HTML that
 * already exists on the page (rendered from content.js), so the text, links and
 * headings are the same ones search engines and the normal view use.
 */
export function createReader({ onClose }) {
  const dialog = document.getElementById('reader');
  const body = dialog.querySelector('.reader-body');

  const cloneClean = (el) => {
    const c = el.cloneNode(true);
    c.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
    c.removeAttribute?.('id');
    return c;
  };

  function contentFor(target) {
    const frag = document.createDocumentFragment();
    if (target.type === 'section') {
      const panel = document.querySelector(`#${CSS.escape(target.id)} > .panel`);
      if (panel) [...panel.children].forEach((ch) => frag.append(cloneClean(ch)));
    } else if (target.type === 'service') {
      const card = document.querySelectorAll('#services .card--service')[target.index];
      const p = document.createElement('p');
      p.className = 'eyebrow';
      p.textContent = 'Service';
      frag.append(p);
      if (card) [...card.children].forEach((ch) => frag.append(cloneClean(ch)));
      frag.append(actions([{ label: 'Start a project', href: '#contact', primary: true }]));
    } else if (target.type === 'project') {
      const row = document.getElementById('project-rows')?.content.querySelectorAll('.work')[target.index];
      const p = document.createElement('p');
      p.className = 'eyebrow';
      p.textContent = 'Project';
      frag.append(p);
      if (row) {
        const list = document.createElement('ul');
        list.className = 'work-list';
        list.setAttribute('role', 'list');
        list.append(cloneClean(row));
        frag.append(list);
        const caseLink = row.querySelector('.work-title a');
        frag.append(actions([
          caseLink && { label: 'Visit the store', href: caseLink.getAttribute('href'), primary: true, external: true },
          { label: 'All stores', href: '/projects/' },
        ]));
      }
    }
    return frag;
  }

  function actions(items) {
    const p = document.createElement('p');
    p.className = 'ctas';
    items.filter(Boolean).forEach((it) => {
      const a = document.createElement('a');
      a.className = 'btn' + (it.primary ? ' btn--primary' : '');
      a.href = it.href;
      a.textContent = it.label;
      if (it.external) { a.target = '_blank'; a.rel = 'noopener'; }
      p.append(a);
    });
    return p;
  }

  dialog.addEventListener('close', () => onClose?.());
  // Click on the backdrop closes it.
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

  return {
    open(target) {
      body.replaceChildren(contentFor(target));
      const h = body.querySelector('h1, h2, h3');
      if (h) h.id = 'reader-title';
      if (!dialog.open) dialog.showModal();
      body.scrollTop = 0;
      dialog.querySelector('.reader-close').focus();
    },
    close() { if (dialog.open) dialog.close(); },
    get isOpen() { return dialog.open; },
  };
}
