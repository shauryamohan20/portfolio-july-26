# Shaurya Mohan — Portfolio

A personal portfolio built with **Next.js**, **TypeScript**, and **Tailwind CSS**.

## Features

- Responsive single-page layout: hero, projects, skills, testimonials, contact
- A detail page (case study) for every project at `/projects/<slug>`
- A password-protected admin panel at `/admin` for adding, editing, reordering and
  removing projects — including thumbnail uploads
- Static project pages, ready for Vercel

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Editing your content

Project content lives in `data/projects.json` and is edited through the admin panel
at [http://localhost:3000/admin](http://localhost:3000/admin). Everything else
(your name, skills, testimonials, footer links) is in `src/data/content.ts`.

`src/data/seed-projects.ts` only recreates `data/projects.json` if that file is
ever missing, e.g. in a fresh clone.

## The admin panel

### Locally

Runs at `/admin` whenever `npm run dev` is running. Saves write straight to
`data/projects.json` and `public/static/projects/`. Commit those changes to
publish them.

If `.env.local` sets `ADMIN_PASSWORD` and `SESSION_SECRET`, the local admin asks
for that password too. Delete the file to go back to no login locally.

### Online

The panel can run on the deployed site, behind a password. Because a deployed
filesystem is read-only, saving there **commits to this GitHub repo** instead,
and the site rebuilds automatically — roughly a minute before changes are live.

Set these environment variables in your host (e.g. Vercel → Project → Settings →
Environment Variables). See `.env.example`.

| Variable | Needed for | Notes |
| --- | --- | --- |
| `ADMIN_PASSWORD` | the panel to exist online | Long passphrase. Minimum 8 characters, but use far more. |
| `SESSION_SECRET` | signing the login cookie | 32+ characters: `openssl rand -base64 32` |
| `GITHUB_TOKEN` | saving online | Fine-grained token, this repo only, **Contents: Read and write** |
| `GITHUB_REPO` | saving online | `owner/name` |
| `GITHUB_BRANCH` | optional | Defaults to `main` |
| `ENABLE_ADMIN` | optional | Set to `false` to switch the panel off everywhere |

Without `ADMIN_PASSWORD` **and** `SESSION_SECRET`, `/admin` returns 404 in
production — so deploying this repo does not expose an editor by accident.

### How it is protected

- `src/proxy.ts` redirects logged-out visitors from `/admin/*` to the login page.
- Every Server Action independently calls `requireAdmin()`, because actions are
  reachable by direct POST and a proxy check alone is not an authorization
  boundary.
- The session is a signed, `httpOnly`, 12-hour JWT cookie (`jose`).
- Failed logins are rate limited per server instance (see
  `src/lib/login-throttle.ts` for the limits of that).

The whole thing rests on one password: choose a long one, and do not reuse it.

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new) — Next.js is auto-detected.
3. Add the environment variables above if you want the online admin.

## Build

```bash
npm run build
```
