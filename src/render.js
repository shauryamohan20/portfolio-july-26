/**
 * Turns content.js into HTML strings. Runs at build time (see vite.config.js),
 * so the shipped index.html already contains every word of content.
 */

const MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => MAP[c]);

const isExternal = (u) => /^https?:\/\//.test(u || '');
const linkAttrs = (u) => (isExternal(u) ? ' target="_blank" rel="noopener"' : '');

const PLATFORM_CLASS = {
  WordPress: 'wordpress',
  Shopify: 'shopify',
  Webflow: 'webflow',
  'Custom build': 'custom',
  'Next.js': 'next',
};

const button = (c) =>
  c && c.url
    ? `<a class="btn${c.primary ? ' btn--primary' : ''}" href="${esc(c.url)}"${linkAttrs(c.url)}>${esc(c.label)}</a>`
    : '';

const eyebrow = (s) => (s.eyebrow ? `<p class="eyebrow">${esc(s.eyebrow)}</p>` : '');
const heading = (s, level = 2) => `<h${level} id="${esc(s.id)}-title">${esc(s.heading)}</h${level}>`;
const lead = (s) => (s.lead ? `<p class="lead">${esc(s.lead)}</p>` : '');
const paragraphs = (s) => (s.paragraphs || []).map((p) => `<p>${esc(p)}</p>`).join('');
const ctas = (s) => (s.ctas?.length ? `<p class="ctas">${s.ctas.map(button).join('')}</p>` : '');
const stats = (s) =>
  s.stats?.length
    ? `<ul class="stats">${s.stats
        .map((x) => `<li><strong>${esc(x.value)}</strong><span>${esc(x.label)}</span></li>`)
        .join('')}</ul>`
    : '';
const note = (s) => (s.note ? `<p class="note">${esc(s.note)}</p>` : '');

const initials = (t) =>
  t
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const KINDS = {
  hero: (s) =>
    `${eyebrow(s)}${heading(s, 1)}${lead(s)}${ctas(s)}` +
    (s.image
      ? `<figure class="hero-shot"><img src="${esc(s.image)}" srcset="${esc(s.image)} 900w, ${esc(hd(s.image))} 2880w" sizes="(max-width: 820px) 100vw, 50vw" alt="${esc(s.alt || '')}" width="900" height="563" fetchpriority="high">${
          s.caption ? `<figcaption>${esc(s.caption)}</figcaption>` : ''
        }</figure>`
      : '') +
    (s.hint
      ? `<p class="scroll-hint game-only" aria-hidden="true"><span class="hint-v">${esc(s.hint)} <b>v</b></span><span class="hint-h">Swipe to run <b>&gt;</b></span></p>`
      : ''),

  about: (s) => `${eyebrow(s)}${heading(s)}${paragraphs(s)}${stats(s)}${note(s)}`,

  services: (s) =>
    `${eyebrow(s)}${heading(s)}${lead(s)}<ul class="cards services">${(s.items || [])
      .map(
        (it) => `<li class="card card--service">
  <span class="icon icon--${esc(it.icon)}" aria-hidden="true"></span>
  <h3>${esc(it.title)}</h3>
  <p>${esc(it.text)}</p>
  ${it.points?.length ? `<ul class="points">${it.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
</li>`
      )
      .join('')}</ul>`,

  projects: (s) => {
    const all = s.items || [];
    let shown = all.filter((p) => p.featured);
    if (!shown.length) shown = all.slice(0, 4);
    shown = shown.slice(0, 4).map((p) => ({ ...p, _i: all.indexOf(p) }));
    const more = s.more
      ? `<p class="ctas"><a class="btn btn--primary" href="${esc(s.more.url)}">${esc(s.more.label)}</a></p>`
      : '';
    return `${eyebrow(s)}${heading(s)}${lead(s)}${projectCards(shown)}${more}`;
  },

  feature: (s) =>
    `${eyebrow(s)}${heading(s)}${lead(s)}` +
    (s.image ? `<figure class="feature-shot"><img src="${esc(s.image)}" srcset="${esc(s.image)} 900w, ${esc(hd(s.image))} 2880w" sizes="(max-width: 820px) 100vw, 40vw" alt="${esc(s.alt || '')}" width="900" height="563" loading="lazy" decoding="async"></figure>` : '') +
    `${paragraphs(s)}${stats(s)}${ctas(s)}`,

  contact: (s) => `${eyebrow(s)}${heading(s)}${paragraphs(s)}${ctas(s)}`,

  faq: (s) =>
    `${eyebrow(s)}${heading(s)}${lead(s)}<div class="faq">${(s.items || [])
      .map((f) => `<div class="faq-item"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`)
      .join('')}</div>`,

  text: (s) => `${eyebrow(s)}${heading(s)}${lead(s)}${paragraphs(s)}${ctas(s)}`,
};

/** High-res copy of a screenshot: /projects/x.webp -> /projects/hd/x.webp */
export const hd = (src) => {
  const s = String(src);
  return s.startsWith('/projects/') && !s.startsWith('/projects/hd/') ? '/projects/hd/' + s.slice('/projects/'.length) : s;
};

/** ['a', 'b', 'c'] -> 'a, b and c' */
const listText = (xs) => (xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1]).replace(/^./, (c) => c.toUpperCase());

function projectCards(items, level = 3, eagerCount = 0) {
  return `<ol class="work-list projects" role="list">${items
    .map((p, i) => {
      const plat = PLATFORM_CLASS[p.platform] || 'custom';
      const shot = p.image
        ? `<img class="work-shot" src="${esc(p.image)}" srcset="${esc(p.image)} 900w, ${esc(hd(p.image))} 2880w" sizes="(max-width: 820px) 40vw, 240px" alt="${esc(p.alt || `Home page of the ${p.title} website`)}" width="900" height="563"${i < eagerCount ? '' : ' loading="lazy"'} decoding="async">`
        : `<span class="work-shot work-shot--empty" aria-hidden="true">${esc(initials(p.title))}</span>`;
      const title = p.url ? `<a href="${esc(p.url)}"${linkAttrs(p.url)}>${esc(p.title)}</a>` : esc(p.title);
      return `<li class="work plat--${plat}" data-platform="${esc(p.platform)}" data-index="${p._i ?? i}">
  ${shot}
  <div class="work-main">
    <h${level} class="work-title">${title}</h${level}>
    <p class="work-kind"><span class="work-plat-inline">${esc(p.platform)}, </span>${esc(p.category)}${p.live ? `. <a class="work-live" href="${esc(p.live)}"${linkAttrs(p.live)}>Live site<span class="sr-only"> for ${esc(p.title)}</span></a>` : ""}</p>
    ${p.summary ? `<p class="work-summary">${esc(p.summary)}</p>` : ''}
    ${p.did?.length ? `<p class="work-did">What I did: ${esc(listText(p.did))}.</p>` : ''}
  </div>
  <p class="work-plat" aria-hidden="true">${esc(p.platform)}</p>
  <p class="work-score">${p.metric ? `<span>${esc(p.metric.label)}</span> <strong>${esc(p.metric.value)}</strong>` : ''}</p>
</li>`;
    })
    .join('')}</ol>`;
}

/** Every project row, inert, for the in-game billboards to read from. */
export function renderProjectTemplate(sections) {
  const s = sections.find((x) => x.kind === "projects");
  return s ? `<template id="project-rows">${projectCards(s.items || [], 3)}</template>` : "";
}

/** Full project list for /projects/ (all items, with a platform filter). */
export function renderProjectsPage(sections) {
  const s = sections.find((x) => x.kind === 'projects');
  if (!s) return '<p>No projects yet.</p>';
  const items = s.items || [];
  const platforms = [...new Set(items.map((p) => p.platform))];
  const filters = platforms.length < 2 ? '' : `<div class="filters" role="group" aria-label="Filter by platform">
<button type="button" class="chip" data-filter="all" aria-pressed="true">All</button>
${platforms
  .map((pl) => `<button type="button" class="chip" data-filter="${esc(pl)}" aria-pressed="false">${esc(pl)}</button>`)
  .join('\n')}
</div>`;
  return `<header class="page-head">
<h1>${esc(s.pageTitle || 'All ' + (s.heading || 'projects').toLowerCase())}</h1>
<p class="lead">${esc(s.lead || '')}</p>
${filters}
</header>
${projectCards(items, 2, 3)}
${s.agency ? `<p class="ctas">${button(s.agency)}</p>` : ''}`;
}

export function renderSections(sections) {
  return sections
    .map((s) => {
      const body = (KINDS[s.kind] || KINDS.text)(s);
      return `<section id="${esc(s.id)}" class="zone zone--${esc(s.kind)}" aria-labelledby="${esc(s.id)}-title">
<div class="panel">${body}</div>
</section>`;
    })
    .join('\n');
}

export function renderNav(sections) {
  return `<nav class="zone-nav" aria-label="Sections">
<button type="button" class="nav-step game-only" data-step="-1" aria-label="Previous section">&lt;</button>
<ol>${sections
    .map(
      (s, i) =>
        `<li><a href="#${esc(s.id)}" data-nav="${i}"><span class="nav-dot" aria-hidden="true"></span><span class="nav-label">${esc(
          s.nav || s.heading
        )}</span></a></li>`
    )
    .join('')}</ol>
<button type="button" class="nav-step game-only" data-step="1" aria-label="Next section">&gt;</button>
</nav>`;
}

export function renderHead(site, sections = []) {
  const url = site.url.replace(/\/$/, '');
  const home = new URL('/', url + '/').href;
  const og = new URL(site.ogImage, url + '/').href;
  const abs = (p) => new URL(p, home).href;
  const sameAs = site.links.filter((l) => l.url).map((l) => l.url);
  const person = {
    '@type': 'Person',
    '@id': home + '#person',
    name: site.name,
    jobTitle: site.role,
    url: home,
    image: og,
    description: site.description,
    ...(site.email ? { email: `mailto:${site.email}` } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    knowsAbout: ['Shopify', 'Shopify development', 'Liquid', 'Shopify theme development', 'Online Store 2.0', 'Shopify Functions', 'Shopify speed optimization', 'Ecommerce'],
  };
  const graph = [
    person,
    { '@type': 'WebSite', '@id': home + '#website', url: home, name: site.name, inLanguage: 'en', publisher: { '@id': home + '#person' } },
  ];
  const services = sections.find((s) => s.kind === 'services');
  if (services) {
    graph.push({
      '@type': 'ProfessionalService',
      '@id': home + '#service',
      name: `${site.name}, Shopify Developer`,
      url: home,
      image: og,
      description: site.description,
      provider: { '@id': home + '#person' },
      areaServed: 'Worldwide',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: services.heading,
        itemListElement: services.items.map((it) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: it.title, description: it.text } })),
      },
    });
  }
  const projects = sections.find((s) => s.kind === 'projects');
  if (projects?.items?.length) {
    graph.push({
      '@type': 'ItemList',
      name: projects.heading,
      itemListElement: projects.items.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: { '@type': 'CreativeWork', name: p.title, description: p.summary || p.category, url: p.url, ...(p.image ? { image: abs(p.image) } : {}), creator: { '@id': home + '#person' } },
      })),
    });
  }
  const faq = sections.find((s) => s.kind === 'faq');
  if (faq?.items?.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faq.items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
  }
  const ld = { '@context': 'https://schema.org', '@graph': graph };
  return `<title>${esc(site.title)}</title>
<meta name="description" content="${esc(site.description)}" />
<meta name="author" content="${esc(site.name)}" />
<meta name="robots" content="index, follow, max-image-preview:large" />
<meta name="theme-color" content="${esc(site.themeColor)}" />
<link rel="canonical" href="${esc(url)}/" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="${esc(site.name)}" />
<meta property="og:title" content="${esc(site.title)}" />
<meta property="og:description" content="${esc(site.description)}" />
<meta property="og:url" content="${esc(url)}/" />
<meta property="og:image" content="${esc(og)}" />
<meta property="og:image:alt" content="${esc(site.ogImageAlt || site.name)}" />
<meta property="og:locale" content="${esc(site.locale)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(site.title)}" />
<meta name="twitter:description" content="${esc(site.description)}" />
<meta name="twitter:image" content="${esc(og)}" />
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`;
}

/**
 * The fixed "stage" of the normal view (desktop): one browser-framed frame per
 * store plus the app, and a map of which frame each section shows.
 */
export function renderStage(sections) {
  const stores = sections.find((s) => s.kind === 'projects')?.items || [];
  const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };
  const frames = stores.map((p) => ({ img: p.image, title: p.title, url: p.url, tag: p.category }));
  const map = {};
  sections.forEach((s) => {
    if (s.kind === 'feature' && s.image) {
      map[s.id] = frames.length;
      frames.push({ img: s.image, title: s.heading, url: s.ctas?.[0]?.url || '', tag: s.lead || '' });
    }
  });
  let k = 0;
  sections.forEach((s) => {
    if (map[s.id] != null || !stores.length) return;
    map[s.id] = s.kind === 'projects' ? 0 : k++ % stores.length;
  });
  const html = frames
    .map((f, i) => `<div class="stage-frame${i === 0 ? ' is-on' : ''}" data-frame="${i}">
  <div class="stage-bar" aria-hidden="true"><i></i><i></i><i></i><span class="stage-url">${esc(host(f.url))}</span></div>
  <img src="${esc(hd(f.img))}" alt="" width="2880" height="1800" decoding="async"${i === 0 ? ' fetchpriority="high"' : ' loading="lazy"'}>
  <div class="stage-cap" aria-hidden="true"><strong>${esc(f.title)}</strong><span>${esc(f.tag)}</span></div>
</div>`)
    .join('');
  return `<aside class="stage plain-only" aria-label="Store previews" data-map='${esc(JSON.stringify(map))}'>${html}</aside>`;
}

export function renderFooter(site) {
  const links = site.links
    .filter((l) => l.url)
    .map((l) => `<a href="${esc(l.url)}"${linkAttrs(l.url)}>${esc(l.label)}</a>`)
    .join('');
  return `<footer class="site-footer">
<p>&copy; ${new Date().getFullYear()} ${esc(site.name)}. Built with voxels and Three.js.</p>
<p class="footer-links">${links}</p>
</footer>`;
}
