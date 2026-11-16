import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));

// Load content.js + render.js fresh on every request so edits show up without a restart.
async function loadContent() {
  const bust = `?t=${Date.now()}`;
  const content = await import(pathToFileURL(path.join(root, 'src/content.js')).href + bust);
  const render = await import(pathToFileURL(path.join(root, 'src/render.js')).href + bust);
  return { content, render };
}

/**
 * Renders everything in src/content.js into index.html at build time.
 * The page ships as real, crawlable HTML; the 3D world is only a layer behind it.
 */
function portfolioHtml() {
  return {
    name: 'portfolio-html',
    async transformIndexHtml(html) {
      const { content, render } = await loadContent();
      const { site, sections } = content;
      const projectsSite = {
        ...site,
        title: `Shopify Store Portfolio | ${site.name}, Shopify Developer`,
        description: `Live Shopify stores designed, built and customized by ${site.name}: bilingual storefronts, fashion and jewelry brands, beauty and service stores, with what was built for each.`,
        url: site.url.replace(/\/$/, '') + '/projects',
      };
      return html
        .replace('<!--head-->', render.renderHead(site, sections))
        .replace('<!--head-projects-->', render.renderHead(projectsSite, sections.filter((s) => s.kind === 'projects')))
        .replace('<!--projects-page-->', render.renderProjectsPage(sections))
        .replace('<!--nav-->', render.renderNav(sections))
        .replace('<!--content-->', render.renderSections(sections, site))
        .replace('<!--stage-->', render.renderStage(sections))
        .replace('<!--footer-->', render.renderFooter(site))
        .replace('<!--project-templates-->', render.renderProjectTemplate(sections));
    },
    // sitemap.xml and robots.txt, generated from site.url so they stay correct.
    async generateBundle() {
      const { content } = await loadContent();
      const base = content.site.url.replace(/\/$/, '');
      const today = new Date().toISOString().slice(0, 10);
      const urls = [`${base}/`, `${base}/projects/`];
      const entries = urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n');
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`,
      });
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n` });
    },
    handleHotUpdate({ file, server }) {
      if (/src[\\/](content|render)\.js$/.test(file)) {
        server.ws.send({ type: 'full-reload' });
        return [];
      }
    },
  };
}

export default defineConfig({
  plugins: [portfolioHtml()],
  server: { host: true },
  build: {
    target: 'es2020',
    rollupOptions: {
      input: {
        main: path.join(root, 'index.html'),
        projects: path.join(root, 'projects/index.html'),
      },
    },
    chunkSizeWarningLimit: 900,
  },
});
