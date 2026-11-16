# Shaurya — Shopify developer portfolio (voxel run game)

A side-scrolling voxel run. Your character runs left to right through six zones: Start, About (the GreyTeck studio), Services (three Shopify service monuments), Stores (one billboard per Shopify store, showing the real screenshot), My app (EZ Master Discount), and Contact. Stop under a glowing marker and press E to read that part of the portfolio.

The same content is also a plain, fast HTML page (the **normal view**), so search engines, screen readers and anyone who would rather not play get everything. `/projects/` lists every Shopify store with what was built for it.

Built with Vite, Three.js and GSAP. All 3D is generated in code; there are no model files. It renders at your screen's full resolution (up to 2x on retina, 1.5x on phones) with antialiasing and soft shadows.

## Run it on your computer (Windows CMD)

You need Node.js 18 or newer (check with `node -v`). Open **Command Prompt** (press Win, type `cmd`, Enter), then:

```bat
cd /d "C:\Users\mohan\Desktop\Shaurya indi portfolio"
npm install
npm run dev
```

`npm install` is only needed the first time (or after changing `package.json`). Then open **http://localhost:5173** in your browser. Leave the CMD window open while you use the site; press **Ctrl+C** in it to stop the server.

- Force a view: http://localhost:5173/?view=game or http://localhost:5173/?view=plain
- On your phone (same Wi-Fi): open the "Network" address Vite prints, for example `http://192.168.1.20:5173`

Test the production build:

```bat
npm run build
npm run preview
```

then open http://localhost:4173.

## Deploy to Vercel (Windows CMD)

```bat
npm install -g vercel
vercel login
vercel
vercel --prod
```

Or push the folder to GitHub and import it on vercel.com (**Add New > Project**). Vercel reads `vercel.json` (Vite, `npm run build`, output `dist`). After the first deploy, put your real domain in `site.url` in `src/content.js` and deploy again.

## Controls (game view)

- **Run:** ← → or A / D, or scroll the mouse wheel / trackpad
- **Jump:** Space, ↑ or W (some coin trails need a jump)
- **Read:** E or Enter under a glowing marker
- **Fast travel:** the section bar at the bottom
- **Music:** M, or the Music button (off until you choose "Start with sound")
- **Phones:** hold ◀ ▶ or drag across the screen to run, tap to jump, A to read

A loading screen with a progress bar runs on every visit while the world is built and the store screenshots load, then ends on a start screen.

## File tree

```
index.html              Home page shell (content is injected at build time)
projects/index.html     /projects/ page shell (every store)
vite.config.js          Renders content.js into the HTML, multi-page build
vercel.json             Vercel build + cache headers
public/
  projects/*.webp       Store screenshots, 900px (normal view, phones)
  projects/hd/*.webp    The same screenshots at 2880px (retina, desktop billboards)
  favicon.svg
src/
  content.js            ALL text, stores, services and character colours. Edit this.
  render.js             Turns content.js into HTML (build time)
  main.js               Loading screen, view switching, music, reading dialog
  style.css             Game UI + normal view + stores page
  ui/                   HUD, reading dialog, entrance motion, section scrolling
  audio/chiptune.js     Web Audio chiptune + coin/jump sounds (SONG is editable)
  game/
    game.js             Renderer, running, camera, stations, coins
    world.js            The road, terrain, mountains, coins, zone builder
    themes.js           Per-zone colours and prop lists
    props.js            Landmarks and stations (studio, monuments, billboards, cart...)
    character.js        Voxel character and its run/idle/jump animation
```

## What to customize

- **Content:** `src/content.js` — text, stats, services, contact links (empty url = hidden).
- **Stores:** each item has `title`, `category`, `summary`, `did` (what you built), `metric`, `url` (case study), `live` (the store) and `image` + `alt`. Put a 900px screenshot in `public/projects/` and a large one with the same name in `public/projects/hd/`. Every store gets a billboard in the game; `featured: true` picks the 3–4 shown on the normal home page.
- **Character colours:** `site.character` in `content.js`.
- **Zone looks:** `src/game/themes.js` (sky, fog, ground, mountains, night level, props).
- **New zone:** add a section to `content.js`. It is added at the end of the run with a sign that opens it. For a custom landmark, write a builder in `props.js` that calls `ctx.station(...)` and list it in that zone's `props`.
- **Music:** `SONG` in `src/audio/chiptune.js`.
