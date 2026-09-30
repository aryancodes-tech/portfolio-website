---
name: portfolio-website
description: Work on the aryancodes.tech React portfolio — SEO/LCP build pipeline, design tokens, self-hosted fonts, image optimization, and Lighthouse-friendly patterns. Use when editing this repo, adding portfolio content, or optimizing performance/SEO.
---

# Portfolio Website Agent Skill

## When to use

- Editing sections, projects, experience, SEO, or deploy config in this repo
- Adding or updating portfolio content without breaking Lighthouse scores
- Onboarding to the codebase architecture

## Project map

```
Portfolio-Website/
├── index.html          # SEO/LCP injection targets (markers only — sync via script)
├── public/             # Static assets (favicons, hero WebP, project images/logos)
├── scripts/
│   ├── sync-seo.mjs    # Injects meta + JSON-LD + LCP shell from seo.js
│   ├── lcp-shell.mjs   # Critical CSS + static hero HTML
│   ├── optimize-images.mjs
│   └── generate-og.mjs
├── src/
│   ├── main.jsx        # Mount + hide static LCP shell (app-mounted)
│   ├── App.jsx         # Routes: /, /resume, /dsa, 404
│   ├── pages/Home.jsx  # Lazy below-fold sections
│   ├── components/     # UI sections
│   ├── constants/
│   │   ├── seo.js      # SEO single source of truth
│   │   ├── urls.js     # Routes + external URLs
│   │   ├── assets.js   # Public image paths
│   │   └── data/       # Section content arrays
│   ├── hooks/
│   ├── motion/         # Framer Motion presets
│   └── styles/fonts.css
└── vercel.json
```

## Do-not-break list

1. **Colors** — only `hsl(var(--*))` tokens from `index.css` (dark default + `.light` via missing `.dark`)
2. **Copy** — visible marketing text unchanged unless user requests
3. **Layout** — `SiteFrame` lined rail; Home order: cover/hero, about, contact, work, stack, project cards, folded education, folded achievements, footer
4. **LCP** — hero WebP, preloads, static shell in `index.html` (via sync script)

## Workflows

### Update SEO / meta / structured data

1. Edit `src/constants/seo.js` (title, description, keywords, `CONTACT_EMAIL`, `SAME_AS`, `buildStructuredDataGraph`).
2. Run `npm run sync:seo` or `npm run build`.
3. Verify `index.html` markers were updated; do not edit injected blocks manually.

### Update hero LCP text (static shell only)

- Plain summary for static shell: `HERO_SUMMARY_PLAIN` in `seo.js`
- Visible React hero copy is in `HeroSection.jsx` (may differ stylistically) — change only when user asks

### Add a project card

1. Add logo to `public/project_logos/` and preview to `public/project_images/`.
2. Append entry to `src/constants/data/projects.js` (same shape as existing items).
3. `Projects.jsx` maps data automatically — no layout changes needed.

### Update work experience / education

1. Edit `src/constants/data/experience.js` or `education.js`.
2. Keep JSX structure in description bullets identical in pattern.
3. Company logos: use constants from `assets.js` for WebP/PNG paths.

### Optimize images

```bash
npm run optimize:images   # requires cwebp on PATH
```

Updates hero WebP variants used by LCP preloads.

### Regenerate Open Graph image

```bash
npm run generate:og
```

### Change résumé link

- In-app route: `RESUME_PATH` in `urls.js` → `${SITE_URL}${RESUME_PATH}` in Hero/ResumeButton
- Drive PDF: `RESUME_DRIVE_URL` in `urls.js` → `/resume` redirect in `App.jsx`

### Change contact email or social links

- `CONTACT_EMAIL`, `SAME_AS`, `SOCIAL_PROFILES` in `seo.js`
- `ContactMe.jsx` reads these constants

## Fonts maintenance

- Font files: `src/assets/fonts/`
- `@font-face` declarations: `src/styles/fonts.css` (canonical)
- Tailwind: `font-display` (Syne), body Gilroy, `font-mono` (IBM Plex Mono) in `tailwind.config.mjs`
- **Never** add Google Fonts CDN links

## Lighthouse checklist (before merging)

- [ ] LCP image: WebP, `fetchpriority="high"`, dimensions set
- [ ] Fonts: `font-display: swap` in `fonts.css`
- [ ] Below-fold: `loading="lazy"` on images
- [ ] No new large dependencies; check `vite.config.js` manualChunks
- [ ] `npm run build` passes (includes `sync-seo`)
- [ ] Hash nav links still present for crawlability
- [ ] External links use `rel="noopener noreferrer"`

## Code quality rules

- Prefer constants in `src/constants/` over inline magic strings
- Reuse `src/motion/variants.js` for Framer Motion
- JSDoc on exported constants and hooks
- Empty strings: check `.length`
- Do not import unused UI libraries (Radix/shadcn not in use)

## Local commands

```bash
npm install
npm run dev       # http://localhost:5173
npm run build
npm run preview
npm run lint
```

## Deployment

- Vercel; `vercel.json` sets long-cache on static assets and SPA rewrite to `index.html`
- `www` → apex redirect configured

## Ignored local docs

`SEO_README.md` and `SEO_SUBMISSION_CHECKLIST.md` are gitignored — safe for local SEO submission notes.
