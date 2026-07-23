# Shaurya Mohan — Portfolio

A personal portfolio built with **Next.js**, **TypeScript**, and **Tailwind CSS**, inspired by the clean, minimalist design of [braydentw.io](https://github.com/braydentw/braydentw.io).

## Features

- Light / dark theme toggle (respects system preference, remembers your choice)
- Responsive, single-page layout: hero, projects, services & toolbelt, about, testimonials, contact
- No external images — project thumbnails use CSS gradients, so nothing breaks
- Fully static, ready for Vercel

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Editing your content

All copy lives in one file — `src/data/content.ts`:

- `profile` — name, role, tagline, intro, email, phone
- `socials` — GitHub, LinkedIn, Upwork, Instagram links
- `projects` — add a `href` to any project to make its card link to the live site
- `services`, `skills`, `testimonials`

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Vercel auto-detects Next.js — just click **Deploy**. No configuration needed.

## Build

```bash
npm run build
```
