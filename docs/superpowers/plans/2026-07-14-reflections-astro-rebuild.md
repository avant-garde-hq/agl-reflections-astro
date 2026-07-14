# Reflections Productions Astro Rebuild — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `avant-garde-hq/agl-reflections-website` (a 21-page static HTML
marketing site for a South Florida mobile-stage/concert-production company) as
an Astro v6 static site in a new repo `avant-garde-hq/agl-reflections-astro`,
with zero content loss, a reusable "house style" layout layer, an elevated but
faithful visual design, and a deploy to Cloudflare Pages.

**Architecture:** A shared Layout/Header/Footer scaffold (generic, reusable
across future client sites) wraps a library of section-level Astro components
(Hero, FleetCard, WorkItem, ServiceBlock, SpecTable, etc.) that this client's
21 pages compose. Content is ported from the cloned source repo at
`/Users/mlopez/Projects/avant-garde/agl-reflections-website` — that checkout
is the source of truth for every word of copy, every image path, and every
spec number; it is **read-only reference**, never modified, never pushed to.

**Tech Stack:** Astro v6 (static output, `.html`-suffixed routes), `sharp`
(bundled with Astro, powers `<Image>`), `@astrojs/sitemap`, GSAP (loaded only
on the homepage hero), vanilla JS (no framework — the source site has none and
doesn't need one), Wrangler (Cloudflare Pages CLI, already authenticated).

## Global Constraints

- **Never modify or push to `avant-garde-hq/agl-reflections-website`.** Every
  task in this plan operates only inside
  `/Users/mlopez/Projects/avant-garde/agl-reflections-astro`. The source
  checkout is read-only reference material.
- **Preserve every page's content.** All copy, image references, video
  references, and the `.glb` 3D model must appear in the new site. Cutting
  content to "simplify" is not in scope anywhere in this plan.
- **URLs stay `.html`-suffixed** and match the current `sitemap.xml` exactly
  (e.g. `/stages/apex-5040.html`, not `/stages/apex-5040/`).
- **Canonical domain:** `https://reflectionsproductions.com` (used in
  `astro.config.mjs` `site`, and in every page's canonical tag / OG tags /
  sitemap, even though DNS is not cut over yet — this matches the current
  live site's own canonical tags).
- **Fonts:** self-hosted Archivo + Archivo Black `.woff2` only. No Google
  Fonts CDN link (the current site loads the same family twice; this rebuild
  drops the redundant load).
- **Quote form stays a non-functional, fully-styled placeholder** (per client
  decision) — no Netlify-specific attributes, a clear TODO comment + README
  section instead.
- **Remove the 11 dead `https://apex.miami/*.pdf` links.** Do not replace them
  with anything — just remove the `<a>` wrapping them (or the whole line if
  the link is the only content of that row).
- **View transitions are plain CSS cross-document transitions** (`@view-transition { navigation: auto; }` in global CSS) — **do not** add Astro's
  `<ClientRouter />` / SPA page router anywhere in this project. That router
  requires every page script to re-init on an `astro:page-load` event, and
  retrofitting that correctly across 21 pages is exactly the kind of risk
  this plan avoids; plain multi-page navigation plus CSS view-transitions
  gets the "premium page change" feel with none of that risk.
- **Testing/verification adaptation for this project type:** this is a
  content/marketing site, not application logic, so tasks below verify
  correctness via `npm run build` succeeding, `grep`-able content-presence
  checks against the ported HTML output, and manual dev-server / browser
  checks — not `pytest`/`vitest` unit tests. Every task still ends with a
  concrete, runnable verification step; "TDD" here means "write the check
  before you consider the task done," not "write a unit test file."
- **Design tokens (locked in during the frontend-design pass — do not
  re-derive or change these while implementing):**
  - Colors: `--ink:#0C1414` (background), `--deck:#101B1A` / `--deck-2:#0E1817`
    (panel surfaces), `--rig-teal:#135E54` (structural teal), `--glow-teal:#3FA796`
    (primary accent — "work-light glow"), `--paper:#F4EFE6` (text — warm
    off-white), `--gel-coral:#FF6B4A` (secondary accent — "stage-gel coral").
  - Type: Archivo Black (display, uppercase, tight leading) / Archivo
    (body, variable weight 400–700) / a system monospace stack
    (`ui-monospace, 'SF Mono', 'Roboto Mono', monospace`) reserved
    specifically for **numeric technical specs** (deck dimensions, trailer
    weight, GPM, trim height) in tables and spec callouts — this is the one
    new type role added during elevation, justified by the subject (stage
    engineering spec sheets), and it costs zero extra font bytes since it's a
    system stack.
  - Signature element: the mirrored-reflection headline effect (a masked,
    flipped duplicate of the headline sitting beneath it, like a wet stage
    deck catching light) is this brand's one signature move. It gets a single
    orchestrated GSAP entrance (headline settles, then the reflection ripples
    in) **only on the homepage hero** — every other page-hero keeps the
    effect as static CSS, no animation. Do not add motion to the reflection
    effect anywhere else; repeating the "big moment" everywhere would cheapen
    it.
  - Numbering rule: keep numeric markers where the content is a genuine
    sequence (the 3-step "How It Works" band, the About page's year timeline)
    and drop them where it isn't (the homepage's 3 "path cards" are parallel
    options, not steps — port these without the `01/02/03` markers the source
    site used).
  - Photo treatment: every real event photo gets a shared, subtle color-grade
    (`filter: saturate(1.05) contrast(1.04)` plus a faint teal-shadow gradient
    overlay, applied via the `GradedImage` component built in Task 5) so
    photos shot across many different real events read as one consistent
    world instead of a stock-photo grab-bag.
  - Motion restraint: scroll-reveal applies to section kickers/headings and
    hero content only — not to every individual card, stat, or list item like
    the source site does. Keep reveals fast (≈220ms, 8px translate) rather
    than the source's slower 700–800ms/26px. The one "big" orchestrated
    moment is the homepage hero load; everything else is quiet.

---

## File Structure

```
agl-reflections-astro/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   ├── assets/
│   │   ├── fonts/*.woff2
│   │   ├── video/*.mp4 *.webm *.jpg
│   │   ├── apex-5040-massing.glb
│   │   └── js/model-viewer.min.js
│   └── (images live in src/assets instead — see below)
├── src/
│   ├── assets/img/**                 (source images, run through <Image>)
│   ├── config/site.ts                (nav links, phone, socials, brand copy — the "house style" data layer)
│   ├── data/
│   │   ├── stages.ts                 (8 stage records: specs, images, hrefs)
│   │   └── work.ts                   (4 case-study records)
│   ├── styles/
│   │   ├── tokens.css                (CSS custom properties — Global Constraints palette/type)
│   │   ├── base.css                  (reset, base type, .wrap, motion/view-transition rules)
│   │   └── motion.css                (reveal + reduced-motion rules)
│   ├── layouts/
│   │   └── Layout.astro              (head/SEO/JSON-LD/canonical — generic, reusable)
│   ├── components/
│   │   ├── house/                    (generic, reusable across future clients)
│   │   │   ├── Header.astro
│   │   │   └── Footer.astro
│   │   ├── ui/                       (shared primitives, this-client-skinned)
│   │   │   ├── GradedImage.astro
│   │   │   ├── Kicker.astro
│   │   │   ├── BarMeter.astro
│   │   │   ├── Button.astro
│   │   │   └── reveal.js
│   │   ├── Hero.astro
│   │   ├── PageHero.astro
│   │   ├── MirrorText.astro
│   │   ├── StatBar.astro
│   │   ├── TrustBand.astro
│   │   ├── DateCheckForm.astro
│   │   ├── PathCards.astro
│   │   ├── FleetCard.astro
│   │   ├── CompareTable.astro
│   │   ├── ServiceBlock.astro
│   │   ├── WorkItem.astro
│   │   ├── Gallery.astro
│   │   ├── TestimonialGrid.astro
│   │   ├── StepsRow.astro
│   │   ├── InstagramGrid.astro
│   │   ├── QuoteCta.astro
│   │   ├── QuoteForm.astro
│   │   ├── SpecTable.astro
│   │   ├── StageSide.astro
│   │   ├── Timeline.astro
│   │   ├── HireBand.astro
│   │   └── MarkStrip.astro
│   └── pages/
│       ├── index.astro
│       ├── about.html.astro (or about.astro — see Task 15 note on Astro's `.html` route naming)
│       ├── quote.astro
│       ├── rates.astro
│       ├── 404.astro
│       ├── production/index.astro
│       ├── stages/{index,apex-2016,apex-2420,apex-2424,apex-3224,apex-4232,apex-4240,apex-5040,apex-5040-specs,apex-5040-3d,vip-deck-3724}.astro
│       └── work/{index,big-orange-nye,floydfest,hialeah-4th-of-july,mobile-stage-conference-2023}.astro
├── docs/superpowers/specs/2026-07-14-reflections-astro-rebuild-design.md   (already written)
└── README.md
```

---

### Task 1: Scaffold the Astro project, config, and static assets

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`
- Create: `public/favicon.svg`, `public/robots.txt`, `public/assets/fonts/*`,
  `public/assets/video/*`, `public/assets/apex-5040-massing.glb`,
  `public/assets/js/model-viewer.min.js`
- Create: `src/assets/img/**` (copied from source, for `<Image>` processing)

**Interfaces:**
- Produces: a runnable Astro project (`npm run dev`, `npm run build`) that
  every later task builds on. `astro.config.mjs` exports `site:
  'https://reflectionsproductions.com'` and `build: { format: 'file' }`.

- [ ] **Step 1: Scaffold Astro**

```bash
cd /Users/mlopez/Projects/avant-garde/agl-reflections-astro
npm create astro@latest . -- --template minimal --install --no-git --typescript strict --yes
```

(`--no-git` because this directory is already a git repo with the spec doc
committed in it — do not let the scaffolder re-init git.)

- [ ] **Step 2: Install extra dependencies**

```bash
npm install @astrojs/sitemap gsap
```

- [ ] **Step 3: Configure `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://reflectionsproductions.com',
  build: { format: 'file' },
  integrations: [
    sitemap({
      filter: (page) =>
        !page.endsWith('/404.html') && !page.includes('apex-5040-3d'),
    }),
  ],
});
```

- [ ] **Step 4: Copy static assets from the source checkout**

```bash
SRC=/Users/mlopez/Projects/avant-garde/agl-reflections-website
mkdir -p public/assets/fonts public/assets/video public/assets/js src/assets/img
cp "$SRC"/assets/fonts/*.woff2 public/assets/fonts/
cp "$SRC"/assets/video/* public/assets/video/
cp "$SRC"/assets/apex-5040-massing.glb public/assets/
cp "$SRC"/assets/js/model-viewer.min.js public/assets/js/
cp "$SRC"/favicon.svg public/favicon.svg
cp "$SRC"/robots.txt public/robots.txt
cp -R "$SRC"/assets/img/* src/assets/img/
cp -R "$SRC"/assets/logo src/assets/
```

- [ ] **Step 5: Verify the counts match the source**

```bash
diff <(cd "$SRC" && find assets/img -type f | sort) \
     <(cd src && find assets/img -type f | sort)
```

Expected: no output (identical file lists). If it differs, re-run Step 4's
copy for whichever subdirectory is missing.

- [ ] **Step 6: Verify the project builds**

```bash
npm run build
```

Expected: `astro build` completes with the single scaffolded page building
successfully (0 errors). This proves the toolchain and config are sound
before any real content is added.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Scaffold Astro project, config, and copy static assets from source site"
```

---

### Task 2: Design tokens, base styles, and motion CSS

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/styles/base.css`
- Create: `src/styles/motion.css`

**Interfaces:**
- Produces: CSS custom properties (`--ink`, `--deck`, `--deck-2`, `--rig-teal`,
  `--glow-teal`, `--paper`, `--gel-coral`, `--max`, `--nav-h`) and utility
  classes (`.wrap`, `.rv`, `.skip-link`) that every component in later tasks
  references by these exact names.

- [ ] **Step 1: Write `src/styles/tokens.css`**

```css
:root {
  --ink: #0C1414;
  --deck: #101B1A;
  --deck-2: #0E1817;
  --rig-teal: #135E54;
  --glow-teal: #3FA796;
  --paper: #F4EFE6;
  --gel-coral: #FF6B4A;
  --hairline: rgba(63, 167, 150, .16);
  --paper-dim: rgba(244, 239, 230, .62);
  --paper-faint: rgba(244, 239, 230, .55);
  --max: 1280px;
  --nav-h: 76px;
  --font-display: 'Archivo Black', Arial, sans-serif;
  --font-body: 'Archivo', system-ui, sans-serif;
  --font-mono: ui-monospace, 'SF Mono', 'Roboto Mono', monospace;
}
```

- [ ] **Step 2: Write `src/styles/base.css`**

```css
@font-face {
  font-family: 'Archivo';
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url('/assets/fonts/archivo-var-latin.woff2') format('woff2');
}
@font-face {
  font-family: 'Archivo Black';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/assets/fonts/archivo-black-latin.woff2') format('woff2');
}

* { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; scroll-padding-top: calc(var(--nav-h) + 12px); }
body {
  background: var(--ink);
  color: var(--paper);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}
img { display: block; max-width: 100%; }
a { color: inherit; text-decoration: none; }
::selection { background: var(--gel-coral); color: var(--ink); }
h1, h2, h3, .display {
  font-family: var(--font-display);
  font-weight: 400;
  text-transform: uppercase;
  line-height: .92;
}
.wrap { max-width: var(--max); margin: 0 auto; padding: 0 clamp(20px, 4vw, 56px); }
.skip-link {
  position: absolute; left: -9999px; top: 0; z-index: 200;
  background: var(--gel-coral); color: var(--ink); padding: 12px 20px;
  font-weight: 700; letter-spacing: .1em; text-transform: uppercase; font-size: 13px;
}
.skip-link:focus { left: 0; }

@view-transition { navigation: auto; }
```

- [ ] **Step 3: Write `src/styles/motion.css`**

```css
/* Elevation decision: reveal only fires on section-level kickers/headings
   and hero content (opted-in per element via .rv), not on every card/stat.
   Faster and subtler than the source site's 700ms/26px version. */
html.js .rv {
  opacity: 0;
  transform: translateY(8px);
  transition: opacity .22s ease, transform .24s cubic-bezier(.2,.7,.2,1);
}
html.js .rv.on { opacity: 1; transform: none; }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation: none !important; transition: none !important; }
  .rv { opacity: 1; transform: none; }
}
```

- [ ] **Step 4: Verify with a throwaway page**

Temporarily add `import '../styles/tokens.css'; import '../styles/base.css'; import '../styles/motion.css';` to the scaffolded `src/pages/index.astro`, run
`npm run dev`, open the page, and confirm in devtools that `body` computes
`background-color: rgb(12, 20, 20)` (i.e. `--ink` applied). Then remove the
throwaway import — Task 3's `Layout.astro` is the real place these get
imported.

- [ ] **Step 5: Commit**

```bash
git add src/styles
git commit -m "Add design tokens, base styles, and motion CSS"
```

---

### Task 3: `Layout.astro` — SEO/meta/JSON-LD shell

**Files:**
- Create: `src/layouts/Layout.astro`
- Create: `src/config/site.ts`

**Interfaces:**
- Consumes: `src/styles/tokens.css`, `base.css`, `motion.css` from Task 2.
- Produces: `Layout.astro` accepting props
  `{ title: string; description: string; path: string; ogImage?: string; noindex?: boolean }`
  and rendering a `<slot />` for page body content. Every page component in
  Tasks 14–21 wraps its content in `<Layout {...props}>...</Layout>`.
  `site.ts` exports `SITE = { name, phone, phoneHref, email, address, socials: [{label, href}], nav: [{label, href}] }` — every later component that
  needs nav links, phone, or socials imports this object rather than
  hard-coding values, which is what makes Header/Footer reusable.

- [ ] **Step 1: Write `src/config/site.ts`**

```ts
export const SITE = {
  name: 'Reflections Productions',
  shortName: 'Reflections',
  tagline: 'Productions',
  phone: '786-504-2369',
  phoneHref: 'tel:+17865042369',
  email: 'operations@reflectionsproductions.com',
  address: '23750 SW 132 Avenue, Princeton, FL 33032',
  foundingYear: 1975,
  nav: [
    { label: 'Stage Fleet', href: '/stages/index.html' },
    { label: 'Production', href: '/production/index.html' },
    { label: 'Rates', href: '/rates.html' },
    { label: 'Our Work', href: '/work/index.html' },
    { label: 'About', href: '/about.html' },
  ],
  cta: { label: 'Request a Quote', href: '/quote.html' },
  socials: [
    { label: 'Instagram', href: 'https://www.instagram.com/reflectionsproductions/' },
    { label: 'Facebook', href: 'https://www.facebook.com/ReflectionsProductions/' },
    { label: 'Youtube', href: 'https://www.youtube.com/@reflectionsproductions8660' },
    { label: 'X', href: 'https://x.com/Reflectionsprod' },
  ],
};
```

- [ ] **Step 2: Write `src/layouts/Layout.astro`**

```astro
---
import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/motion.css';
import { SITE } from '../config/site';

interface Props {
  title: string;
  description: string;
  path: string; // e.g. "/about.html" or "/"
  ogImage?: string;
  noindex?: boolean;
}
const {
  title,
  description,
  path,
  ogImage = 'https://reflectionsproductions.com/assets/img/hero-home.webp',
  noindex = false,
} = Astro.props;
const canonical = new URL(path, Astro.site).toString();
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonical} />
  {noindex && <meta name="robots" content="noindex" />}
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content={SITE.name} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonical} />
  <meta property="og:image" content={ogImage} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="theme-color" content="#0C1414" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  {path === '/' && (
    <script type="application/ld+json" set:html={JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': 'https://reflectionsproductions.com/#business',
      name: 'Reflections Productions Inc.',
      alternateName: 'Mobile Stages Miami',
      slogan: "South Florida's Creative Source",
      description: 'Mobile stage rentals (APEX hydraulic stages), concert audio, lighting, LED video walls, backline and event crew for concerts, festivals and city events across South Florida. Est. 1975.',
      url: 'https://reflectionsproductions.com/',
      telephone: '+1-786-504-2369',
      email: SITE.email,
      foundingDate: '1975',
      image: ogImage,
      logo: 'https://reflectionsproductions.com/assets/logo/mark.svg',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '23750 SW 132 Avenue',
        addressLocality: 'Princeton',
        addressRegion: 'FL',
        postalCode: '33032',
        addressCountry: 'US',
      },
      areaServed: ['Miami', 'South Florida', 'Florida', 'United States'],
      sameAs: SITE.socials.map((s) => s.href),
    })} />
  )}
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <slot />
</body>
</html>
```

- [ ] **Step 3: Verify it renders**

Add a temporary test usage in `src/pages/index.astro`:
```astro
---
import Layout from '../layouts/Layout.astro';
---
<Layout title="Test" description="Test page" path="/">
  <main id="main"><h1>Hello</h1></main>
</Layout>
```
Run `npm run build`, then `grep -c 'rel="canonical"' dist/index.html` →
expected `1`. `grep 'application/ld+json' dist/index.html` → expected match.

- [ ] **Step 4: Commit**

```bash
git add src/layouts src/config
git commit -m "Add Layout.astro shell and site config data layer"
```

---

### Task 4: `Header.astro` and `Footer.astro` (house-style, reusable)

**Files:**
- Create: `src/components/house/Header.astro`
- Create: `src/components/house/Footer.astro`

**Interfaces:**
- Consumes: `SITE` from `src/config/site.ts` (Task 3).
- Produces: `<Header currentPath={string} />` and `<Footer />`, imported by
  every page in Tasks 14–21. `currentPath` is used only to set `class="active"`
  on the matching nav link — everything else is driven by `SITE`, which is
  what makes this pair reusable for a future client (swap `site.ts`, keep
  these files untouched).

- [ ] **Step 1: Write `src/components/house/Header.astro`**

```astro
---
import { SITE } from '../../config/site';
interface Props { currentPath: string }
const { currentPath } = Astro.props;
---
<nav class="site-nav" id="nav" aria-label="Main">
  <div class="nav-in">
    <a class="brand" href="/" aria-label={`${SITE.name} home`}>
      <svg viewBox="30 28 180 180" role="img" aria-hidden="true">
        <defs><clipPath id="brandclip"><circle cx="120" cy="118" r="84" /></clipPath></defs>
        <g clip-path="url(#brandclip)">
          <rect x="36" y="34" width="168" height="96" fill="var(--gel-coral)" />
          <rect x="36" y="138" width="168" height="11" fill="var(--glow-teal)" />
          <rect x="36" y="157" width="168" height="9" fill="var(--glow-teal)" opacity="0.68" />
          <rect x="36" y="174" width="168" height="8" fill="var(--glow-teal)" opacity="0.44" />
          <rect x="36" y="190" width="168" height="6" fill="var(--glow-teal)" opacity="0.24" />
        </g>
      </svg>
      <span class="bt"><b>{SITE.shortName}</b><span>{SITE.tagline}</span></span>
    </a>
    <div class="nav-links">
      {SITE.nav.map((item) => (
        <a href={item.href} class={currentPath === item.href ? 'active' : ''}
           aria-current={currentPath === item.href ? 'page' : undefined}>{item.label}</a>
      ))}
    </div>
    <span class="nav-social" aria-label="Social media">
      {SITE.socials.map((s) => (
        <a class="f-social-a" href={s.href} target="_blank" rel="noopener" aria-label={s.label}>{s.label[0]}</a>
      ))}
    </span>
    <a class="nav-call" href={SITE.phoneHref} aria-label={`Call ${SITE.name}: ${SITE.phone}`}>☎</a>
    <a class="btn btn-coral" href={SITE.cta.href}>{SITE.cta.label}</a>
    <button class="nav-burger" aria-expanded="false" aria-controls="mobile-menu" aria-label="Menu"><i></i><i></i><i></i></button>
  </div>
</nav>
<div class="mobile-menu" id="mobile-menu">
  <a href="/">Home</a>
  {SITE.nav.map((item) => <a href={item.href}>{item.label}</a>)}
  <a href={SITE.cta.href} class="btn btn-coral">{SITE.cta.label}</a>
</div>
```

Note: the source site inlines a hand-drawn wordmark SVG and real Instagram/
Facebook/Youtube/X glyphs. Port the exact `<path>` markup from
`agl-reflections-website/index.html` lines 154–172 (wordmark) and lines
178–179 (social glyphs) verbatim into this component in place of the
simplified placeholders above — the placeholders above exist only to keep
this plan readable; the actual implementation step must copy the real SVG
paths so the icons are pixel-identical to the source, not a regression.

- [ ] **Step 2: Write `src/components/house/Footer.astro`**

```astro
---
import { SITE } from '../../config/site';
const stageLinks = [
  { label: 'APEX 5040', href: '/stages/apex-5040.html' },
  { label: 'APEX 4240', href: '/stages/apex-4240.html' },
  { label: 'APEX 3224', href: '/stages/apex-3224.html' },
  { label: 'APEX 2424', href: '/stages/apex-2424.html' },
  { label: 'APEX 2420', href: '/stages/apex-2420.html' },
  { label: 'APEX 2016', href: '/stages/apex-2016.html' },
  { label: 'VIP Deck 3724', href: '/stages/vip-deck-3724.html' },
  { label: 'APEX 4232 · 2026', href: '/stages/apex-4232.html' },
];
---
<footer>
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-brand">
        <span class="bt"><b>{SITE.shortName}</b><span>{SITE.tagline}</span></span>
        <p>The stage behind South Florida's biggest nights — mobile stages, concert audio, lighting, video and crew since {SITE.foundingYear}.</p>
      </div>
      <div class="foot-col">
        <h4>Site</h4>
        <ul>
          {SITE.nav.map((item) => <li><a href={item.href}>{item.label}</a></li>)}
          <li><a href={SITE.cta.href}>{SITE.cta.label}</a></li>
        </ul>
      </div>
      <div class="foot-col">
        <h4>The Fleet</h4>
        <ul>{stageLinks.map((s) => <li><a href={s.href}>{s.label}</a></li>)}</ul>
      </div>
      <div class="foot-col">
        <h4>Contact</h4>
        <ul>
          <li><a href={SITE.phoneHref}>{SITE.phone}</a></li>
          <li><a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
          <li><span>{SITE.address}</span></li>
        </ul>
      </div>
      <div class="foot-col">
        <h4>Follow</h4>
        <ul>{SITE.socials.map((s) => <li><a href={s.href} rel="noopener">{s.label}</a></li>)}</ul>
      </div>
    </div>
    <div class="foot-bottom">
      <span>&copy; 2026 {SITE.name} Inc.</span>
      <span class="tag">Fifty Years On Stage · Est. {SITE.foundingYear}</span>
    </div>
  </div>
</footer>
```

- [ ] **Step 3: Verify no duplicate attributes remain**

```bash
grep -c 'target="_blank" rel="noopener" target="_blank"' src/components/house/Header.astro
```
Expected: `0` (this greps for the exact copy-paste bug from the source site —
confirms it wasn't carried over).

- [ ] **Step 4: Commit**

```bash
git add src/components/house
git commit -m "Add reusable Header and Footer house-style components"
```

---

### Task 5: Shared UI primitives — `GradedImage`, `Kicker`, `BarMeter`, `Button`, reveal script

**Files:**
- Create: `src/components/ui/GradedImage.astro`
- Create: `src/components/ui/Kicker.astro`
- Create: `src/components/ui/BarMeter.astro`
- Create: `src/components/ui/Button.astro`
- Create: `src/components/ui/reveal.js`

**Interfaces:**
- Produces: `<GradedImage src={ImageMetadata} alt={string} sizes?={string} class?={string} />`
  wrapping Astro's `<Image>` with the shared photo-grade filter.
  `<Kicker text={string} />` renders the small eyebrow label + `<BarMeter>`.
  `<BarMeter variant?="teal"|"coral"|"dark" />` renders the 3–4 bar accent
  motif. `<Button href={string} variant="coral"|"ghost">slot</Button>`.
  `reveal.js` exports nothing (it's a plain inline script) but is the single
  place scroll-reveal + nav-scroll-state + mobile-menu logic lives, imported
  once by `Layout.astro` in Task 3 via `<script src="/scripts/reveal.js">` —
  copy it into `public/scripts/reveal.js` (Astro doesn't process plain
  `<script src>` referencing `src/`, so this file's final home is
  `public/scripts/reveal.js`, written directly there instead of under
  `src/components/`).

- [ ] **Step 1: Write `src/components/ui/GradedImage.astro`**

```astro
---
import { Image } from 'astro:assets';
interface Props {
  src: ImportMetadata extends never ? any : any; // ImageMetadata from an `import()` of a file in src/assets/img
  alt: string;
  sizes?: string;
  class?: string;
  loading?: 'lazy' | 'eager';
}
const { src, alt, sizes = '(max-width: 900px) 100vw, 50vw', class: cls = '', loading = 'lazy' } = Astro.props;
---
<Image src={src} alt={alt} sizes={sizes} loading={loading} class={`graded-img ${cls}`} />
<style>
  .graded-img { filter: saturate(1.05) contrast(1.04); }
</style>
```

- [ ] **Step 2: Write `src/components/ui/Kicker.astro`**

```astro
---
import BarMeter from './BarMeter.astro';
interface Props { text: string; variant?: 'teal' | 'coral' | 'dark' }
const { text, variant = 'teal' } = Astro.props;
---
<p class="kicker"><BarMeter variant={variant} />{text}</p>
```

- [ ] **Step 3: Write `src/components/ui/BarMeter.astro`**

```astro
---
interface Props { variant?: 'teal' | 'coral' | 'dark' }
const { variant = 'teal' } = Astro.props;
const cls = variant === 'teal' ? 'wl' : `wl ${variant}`;
---
<span class={cls} aria-hidden="true"><i></i><i></i><i></i><i></i></span>
<style>
  .wl { display: flex; flex-direction: column; gap: 4px; }
  .wl i { display: block; background: var(--glow-teal); height: 5px; width: 64px; }
  .wl i:nth-child(2) { opacity: .62; height: 4px; }
  .wl i:nth-child(3) { opacity: .38; height: 3px; }
  .wl i:nth-child(4) { opacity: .18; height: 2px; }
  .wl.coral i { background: var(--gel-coral); }
  .wl.dark i { background: var(--rig-teal); }
</style>
```

- [ ] **Step 4: Write `src/components/ui/Button.astro`**

```astro
---
interface Props { href: string; variant?: 'coral' | 'ghost'; class?: string }
const { href, variant = 'coral', class: cls = '' } = Astro.props;
---
<a class={`btn btn-${variant} ${cls}`} href={href}><slot /></a>
<style is:global>
  .btn {
    display: inline-block; font-family: var(--font-body); font-weight: 700;
    font-size: 13px; letter-spacing: .12em; text-transform: uppercase;
    padding: 15px 28px; transition: transform .25s, background .25s, color .25s, box-shadow .25s;
    cursor: pointer; border: none; text-align: center;
  }
  .btn-coral { background: var(--gel-coral); color: var(--ink); }
  .btn-coral:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(255,107,74,.28); }
  .btn-ghost { border: 1px solid rgba(244,239,230,.32); color: var(--paper); padding: 14px 27px; }
  .btn-ghost:hover { border-color: var(--glow-teal); color: var(--glow-teal); }
</style>
```

- [ ] **Step 5: Write `public/scripts/reveal.js`**

Port the source's `assets/js/main.js` (nav scroll state, mobile menu,
hero-video reduced-motion handling, `IntersectionObserver` reveal, the 2.5s
failsafe) essentially as-is — this logic is sound and cheap. The only
change: since `.rv` is now applied more sparingly per the Global Constraints
motion-restraint decision, no code change is needed here, only fewer `.rv`
class usages in later component/page markup.

```bash
cp /Users/mlopez/Projects/avant-garde/agl-reflections-website/assets/js/main.js \
   /Users/mlopez/Projects/avant-garde/agl-reflections-astro/public/scripts/reveal.js
```

Then add `<script src="/scripts/reveal.js"></script>` right before `</body>`
in `src/layouts/Layout.astro` (Task 3's file).

- [ ] **Step 6: Verify**

```bash
npm run build && grep -q 'IntersectionObserver' dist/index.html && echo "reveal script referenced"
```
Also manually open the dev server and confirm no console errors from
`reveal.js` (it guards every `querySelector` call, so it's safe to include on
pages without a `.hero-bg video` or `.nav-burger`).

- [ ] **Step 7: Commit**

```bash
git add src/components/ui public/scripts src/layouts/Layout.astro
git commit -m "Add shared UI primitives (GradedImage, Kicker, BarMeter, Button) and reveal script"
```

---

### Task 6: `Hero.astro`, `PageHero.astro`, `MirrorText.astro` (the signature element)

**Files:**
- Create: `src/components/MirrorText.astro`
- Create: `src/components/Hero.astro`
- Create: `src/components/PageHero.astro`

**Interfaces:**
- Produces: `<MirrorText lines={string[]} animated?={boolean} />` (the
  mirrored-reflection headline — `animated` defaults to `false`; only the
  homepage passes `animated`). `<Hero videoSrc posterSrc eyebrow subtitle ctaPrimary ctaSecondary />` for the homepage only. `<PageHero title breadcrumb lede imageSrc tall?={boolean} short?={boolean} />` for every interior page.

- [ ] **Step 1: Write `src/components/MirrorText.astro`**

```astro
---
interface Props { lines: string[]; animated?: boolean; coralWord?: string }
const { lines, animated = false } = Astro.props;
const text = lines.join(' ');
---
<span class:list={['mirror', { animated }]}>
  <span class="face">{lines.map((l, i) => <>{l}{i < lines.length - 1 && <br />}</>)}</span>
  <span class="waterrule" aria-hidden="true"></span>
  <span class="refl" aria-hidden="true">{lines[lines.length - 1]}</span>
</span>
<style>
  .mirror { position: relative; display: block; }
  .mirror .face { display: block; }
  .mirror .waterrule {
    display: block; height: 1px; margin: .14em 0 .1em;
    background: linear-gradient(to right, rgba(63,167,150,.75), rgba(63,167,150,.12) 62%, transparent);
  }
  .mirror .refl {
    display: block; transform: scaleY(-1); color: var(--glow-teal); opacity: .6;
    pointer-events: none; user-select: none;
    -webkit-mask-image: repeating-linear-gradient(to bottom, #000 0 .050em, transparent .050em .094em),
      linear-gradient(to bottom, transparent 4%, rgba(0,0,0,.9) 96%);
    -webkit-mask-composite: source-in;
    mask-image: repeating-linear-gradient(to bottom, #000 0 .050em, transparent .050em .094em),
      linear-gradient(to bottom, transparent 4%, rgba(0,0,0,.9) 96%);
    mask-composite: intersect;
  }
  .mirror.animated .face { animation: settleIn .6s cubic-bezier(.2,.7,.2,1) both; }
  .mirror.animated .refl { animation: rippleIn .7s .35s cubic-bezier(.2,.7,.2,1) both; }
  @keyframes settleIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
  @keyframes rippleIn { from { opacity: 0; transform: scaleY(-1) translateY(-8px); } to { opacity: .6; transform: scaleY(-1); } }
  @media (prefers-reduced-motion: reduce) {
    .mirror.animated .face, .mirror.animated .refl { animation: none; opacity: 1; }
  }
</style>
```

- [ ] **Step 2: Write `src/components/Hero.astro`**

Compose `MirrorText` (with `animated`), the eyebrow `Kicker`, subtitle, and
two `Button`s, over the existing hero video (`hero-home.webp` poster +
`hialeah-drone-15s.mp4`). Port the exact video markup/attributes from
`agl-reflections-website/index.html` lines 189–212 — `autoplay muted loop
playsinline preload="auto"`, poster, and the reduced-motion handling already
lives in `reveal.js` (Task 5). Keep the `.hero`, `.hero-bg`, `.hero-in`
CSS classes and rules from `main.css` lines 148–174, moved into this
component's `<style>` block using the new CSS variable names
(`--glow-teal` instead of `--teal`, etc. — see Task 2's tokens).

- [ ] **Step 3: Write `src/components/PageHero.astro`**

Port `.page-hero` CSS from `main.css` lines 176–206 into this component,
parameterized by `tall`/`short` boolean props (source's `.page-hero.tall` /
`.page-hero.short` modifiers). Composes `MirrorText` (not animated),
breadcrumb nav, `Kicker` eyebrow, and lede paragraph.

- [ ] **Step 4: Verify**

Build a throwaway usage of both components in the scaffolded `index.astro`,
`npm run build`, confirm `dist/index.html` contains `class="mirror animated"`
for the Hero usage and no animation classes leak onto a `PageHero` usage.
Manually check in the browser that `prefers-reduced-motion: reduce` (via
Chrome DevTools rendering emulation) removes the settle/ripple animation.

- [ ] **Step 5: Commit**

```bash
git add src/components/MirrorText.astro src/components/Hero.astro src/components/PageHero.astro
git commit -m "Add Hero, PageHero, and the MirrorText signature component"
```

---

### Task 7: Homepage-only sections — `StatBar`, `TrustBand`, `DateCheckForm`, `PathCards`

**Files:**
- Create: `src/components/StatBar.astro`
- Create: `src/components/TrustBand.astro`
- Create: `src/components/DateCheckForm.astro`
- Create: `src/components/PathCards.astro`

**Interfaces:**
- Produces: `<StatBar stats={{value, label}[]} />`, `<TrustBand lead names={string} />`,
  `<DateCheckForm />` (static `<form action="/quote.html" method="GET">`,
  ported verbatim from source — this one already "submits" by redirecting to
  the quote page with querystring params, which `quote.astro`'s prefill
  script, ported in Task 12, reads), `<PathCards cards={{title, body, href}[]}/>`.

- [ ] **Step 1: Write `StatBar.astro`, `TrustBand.astro`, `DateCheckForm.astro`**

Port structure/CSS from `main.css` `.stats`/`.trustband`/`.datefeature`/
`.date-check` rules (lines 208–218 for stats, and the homepage-only
`<style>` block in `index.html` lines 110–126 for `.datefeature`) and the
markup from `index.html` lines 214–249, with the CSS variable renames from
Task 2. `DateCheckForm`'s `<select name="attendance">` options and the GET
action stay byte-identical to the source (`action="quote.html"` becomes
`action="/quote.html"`).

- [ ] **Step 2: Write `PathCards.astro`**

Port the 3-card grid from `index.html` lines 260–279, **removing the
`01`/`02`/`03` numbered markers** (`<span class="pc-no">`) per the Global
Constraints numbering rule — these are parallel options, not a sequence.
Replace the removed marker with nothing extra (the card's heading is
sufficient on its own); do not substitute icons unless a later design review
asks for them.

```astro
---
interface Card { title: string; body: string; href: string; cta: string }
interface Props { cards: Card[] }
const { cards } = Astro.props;
---
<div class="path-grid">
  {cards.map((c) => (
    <a class="path-card" href={c.href}>
      <h3>{c.title}</h3>
      <p>{c.body}</p>
      <span class="pc-go">{c.cta} →</span>
    </a>
  ))}
</div>
<style>
  .path-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 8px; }
  .path-card {
    display: block; border: 1px solid rgba(63,167,150,.28); padding: 30px 28px 26px;
    text-decoration: none; color: inherit; position: relative; transition: .2s;
    background: rgba(19,94,84,.08);
  }
  .path-card:hover { border-color: var(--glow-teal); transform: translateY(-3px); }
  .path-card h3 { font-family: var(--font-display); font-size: 21px; margin: 0 0 10px; color: var(--paper); }
  .path-card p { font-size: 14.5px; line-height: 1.65; color: rgba(244,239,230,.72); margin: 0 0 18px; }
  .path-card .pc-go { color: var(--glow-teal); font-weight: 600; font-size: 13.5px; letter-spacing: .06em; }
  @media (max-width: 900px) { .path-grid { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 3: Verify**

`npm run build`, then `grep -c 'pc-no' dist/index.html` → expected `0`
(confirms the numbering was actually dropped, not just visually hidden).

- [ ] **Step 4: Commit**

```bash
git add src/components/StatBar.astro src/components/TrustBand.astro src/components/DateCheckForm.astro src/components/PathCards.astro
git commit -m "Add homepage-only sections: StatBar, TrustBand, DateCheckForm, PathCards"
```

---

### Task 8: `FleetCard.astro` and `CompareTable.astro` (with mono spec figures)

**Files:**
- Create: `src/components/FleetCard.astro`
- Create: `src/components/CompareTable.astro`
- Create: `src/data/stages.ts`

**Interfaces:**
- Produces: `src/data/stages.ts` exports `STAGES: Stage[]` where
  ```ts
  interface Stage {
    slug: string;            // e.g. "apex-5040"
    model: string;           // "5040"
    series: string;          // "APEX · Classic & GEN3"
    deck: string;            // "50′ × 40′ DECK"
    image: string;           // import path under src/assets/img
    imageAlt: string;
    specs: string[];         // bullet list, feature card only
    chip?: string;           // "Flagship" / "Legacy & GEN3" / "2026 Season"
    featured?: boolean;      // grid-column:span 7
    coFeatured?: boolean;    // grid-column:span 5
    soon?: boolean;          // dashed "coming soon" treatment
    trimHeight?: string;     // for CompareTable, e.g. "13′3″"
    trailerWeight?: string;  // e.g. "55,165 lb"
  }
  ```
  Both `FleetCard` and `CompareTable` (Task 8) and the stage detail pages
  (Task 19) import from this one file — this is the single source of truth
  for stage data, replacing 8 nearly-identical hand-written HTML files.

- [ ] **Step 1: Write `src/data/stages.ts`**

Populate all 8 stages by reading the corresponding source file for each
(`agl-reflections-website/stages/apex-*.html` and `vip-deck-3724.html`) for
exact copy/specs. The 5040, 4240, 3224, 4232 records' `deck`/`specs`/`chip`
fields are already visible in `agl-reflections-website/index.html` lines
294–356 (fleet grid) — use those verbatim for those four. For the remaining
four (2016, 2420, 2424, vip-deck-3724), read
`agl-reflections-website/stages/<slug>.html`'s hero/spec-table content
directly (each is ~250 lines) and transcribe the deck size, trim height, and
trailer weight into the record.

- [ ] **Step 2: Write `src/components/FleetCard.astro`**

Port `.card`/`.ph`/`.card-body`/`.card-top`/`.series`/`.model`/`.deck`/
`.specs`/`.card-foot`/`.spec-link` CSS from `main.css` lines 236–280,
renamed to the new tokens. The numeric `deck`/`trimHeight`/`trailerWeight`
values render inside `<span class="mono-spec">` using `var(--font-mono)` —
this is the new elevation detail (Global Constraints: numeric specs get the
monospace treatment).

```astro
---
import { Image } from 'astro:assets';
import type { Stage } from '../data/stages';
interface Props { stage: Stage }
const { stage } = Astro.props;
const gridClass = stage.featured ? 'card feature' : stage.coFeatured ? 'card co-feature' : stage.soon ? 'card soon' : 'card';
---
<article class={gridClass}>
  <div class="ph">
    <Image src={stage.image} alt={stage.imageAlt} loading="lazy" />
    {stage.chip && <span class="chip">{stage.chip}</span>}
  </div>
  <div class="card-body">
    <div class="card-top">
      <div><span class="series">{stage.series}</span><span class="model">{stage.model}</span></div>
      <span class="deck mono-spec">{stage.deck}</span>
    </div>
    <ul class="specs">{stage.specs.map((s) => <li>{s}</li>)}</ul>
    <div class="card-foot"><span class="spec-link">View the {stage.model}</span></div>
  </div>
  <a class="card-cover" href={`/stages/${stage.slug}.html`} aria-label={`APEX ${stage.model} details`}></a>
</article>
<style>
  .mono-spec { font-family: var(--font-mono); }
  /* remaining .card* rules ported from main.css lines 236-280 */
</style>
```

- [ ] **Step 3: Write `src/components/CompareTable.astro`**

Port the `table.compare` markup/CSS from `stages/index.html` and `main.css`
lines 289–301, iterating `STAGES` instead of hand-written `<tr>`s, with
`trimHeight`/`trailerWeight` cells using `.mono-spec`.

- [ ] **Step 4: Verify**

`npm run build`, `grep -c 'class="card' dist/index.html` should be `4` (the
homepage shows 4 of the 8 fleet cards, matching the source), and
`grep -c 'apex-' dist/stages/index.html` should show all 8 stage links
present.

- [ ] **Step 5: Commit**

```bash
git add src/data/stages.ts src/components/FleetCard.astro src/components/CompareTable.astro
git commit -m "Add stage data model, FleetCard, and CompareTable with mono spec treatment"
```

---

### Task 9: `ServiceBlock.astro` (production services)

**Files:**
- Create: `src/components/ServiceBlock.astro`

**Interfaces:**
- Produces: `<ServiceBlock id title tagline body image imageAlt chip flip?={boolean} gear?={{term, def}[]} />`,
  used both by the homepage's compact services teaser grid (a simpler
  variant, ported separately in Task 14 directly from `index.html` lines
  385–422 since that teaser layout — `.svc-layout`/`.svc-grid`/`.svc` — is
  visually distinct from the full detail blocks) and by
  `production/index.astro` (Task 16) for the six full service sections with
  `#audio`/`#lighting`/`#video`/`#crowd-control`/`#backline`/`#crew` anchors.

- [ ] **Step 1: Write the component**

Port `.svc-block`/`.svc-media`/`.svc-copy`/`.gear` CSS from `main.css` lines
338–361 and the markup pattern from `production/index.html`'s six repeating
service sections, parameterized. The `flip` prop toggles the
`.svc-block.flip` modifier (alternating media/copy sides, exactly like the
source).

```astro
---
import { Image } from 'astro:assets';
interface GearItem { term: string; def: string }
interface Props {
  id: string; title: string; tagline: string; body: string;
  image: any; imageAlt: string; chip?: string; flip?: boolean; gear?: GearItem[];
}
const { id, title, tagline, body, image, imageAlt, chip, flip = false, gear = [] } = Astro.props;
---
<div id={id} class:list={['svc-block', { flip }]}>
  <div class="svc-media">
    <Image src={image} alt={imageAlt} loading="lazy" />
    {chip && <span class="chip">{chip}</span>}
  </div>
  <div class="svc-copy">
    <h2 set:html={title} />
    <p set:html={body} />
    {gear.length > 0 && (
      <dl class="gear">
        {gear.map((g) => <><dt>{g.term}</dt><dd>{g.def}</dd></>)}
      </dl>
    )}
  </div>
</div>
```

- [ ] **Step 2: Verify**

`npm run build`, `grep -c 'id="audio"' dist/production/index.html` → `1`;
confirm all six anchor ids (`audio`, `lighting`, `video`, `crowd-control`,
`backline`, `crew`) are present once each.

- [ ] **Step 3: Commit**

```bash
git add src/components/ServiceBlock.astro
git commit -m "Add ServiceBlock component for production services detail sections"
```

---

### Task 10: `WorkItem.astro` and `Gallery.astro`

**Files:**
- Create: `src/components/WorkItem.astro`
- Create: `src/components/Gallery.astro`
- Create: `src/data/work.ts`

**Interfaces:**
- Produces: `src/data/work.ts` exports `WORK: WorkCase[]` where
  ```ts
  interface WorkCase {
    slug: string; title: string; subtitle: string; eventMeta: string;
    heroImage: string; heroImageAlt: string; body: string;
    deployList: string[]; gallery: { image: string; alt: string; caption?: string; wide?: boolean }[];
  }
  ```
  populated from the 4 case-study source files
  (`work/big-orange-nye.html`, `work/floydfest.html`,
  `work/hialeah-4th-of-july.html`, `work/mobile-stage-conference-2023.html`).
  `<WorkItem case={WorkCase} flip?={boolean} teaser?={boolean} />` (teaser
  mode = the compact homepage version seen in `index.html` lines 424–454;
  full mode = the case-study page body). `<Gallery items={{image,alt,caption,wide}[]} />`
  ports `.gallery`/`.g-item` from `main.css` lines 392–399.

- [ ] **Step 1: Write `src/data/work.ts`**

Read each of the 4 source files fully and transcribe title, subtitle,
event-meta line, body copy, `.deploy-list` items, and every gallery image
(`work-cs/*.jpg`) with its caption into the matching record.

- [ ] **Step 2: Write `WorkItem.astro`**

Port `.work-item`/`.work-ph`/`.work-txt`/`.deploy` CSS from `main.css` lines
364–390, teaser mode rendering the compact two-column version, full mode
adding the deploy list and prose body.

- [ ] **Step 3: Write `Gallery.astro`**

```astro
---
interface Item { image: any; alt: string; caption?: string; wide?: boolean }
interface Props { items: Item[] }
const { items } = Astro.props;
---
import { Image } from 'astro:assets';
<div class="gallery">
  {items.map((it) => (
    <div class:list={['g-item', { wide: it.wide }]} data-cap={it.caption}>
      <Image src={it.image} alt={it.alt} loading="lazy" />
    </div>
  ))}
</div>
```

- [ ] **Step 4: Verify**

`npm run build`, confirm `dist/work/big-orange-nye.html`,
`dist/work/floydfest.html`, `dist/work/hialeah-4th-of-july.html`,
`dist/work/mobile-stage-conference-2023.html` will exist once Task 20 wires
the pages — for now, verify via a throwaway single-case render that the
gallery image count matches
`grep -c 'work-cs' agl-reflections-website/work/<slug>.html` for at least one
case study.

- [ ] **Step 5: Commit**

```bash
git add src/data/work.ts src/components/WorkItem.astro src/components/Gallery.astro
git commit -m "Add work case-study data model, WorkItem, and Gallery components"
```

---

### Task 11: `TestimonialGrid`, `StepsRow`, `InstagramGrid`, `QuoteCta`

**Files:**
- Create: `src/components/TestimonialGrid.astro`
- Create: `src/components/StepsRow.astro`
- Create: `src/components/InstagramGrid.astro`
- Create: `src/components/QuoteCta.astro`

**Interfaces:**
- Produces: `<TestimonialGrid items={{quote, attribution}[]} />` (port the 3
  sample testimonials from `index.html` lines 468–476 verbatim, including
  the `<!-- SAMPLE COPY for pitch purposes -->` HTML comment above them —
  this is placeholder content the client themselves flagged as
  to-be-replaced, so it must stay clearly marked, not silently presented as
  real). `<StepsRow steps={{number, title, body}[]} />` **keeps** numbered
  markers (genuine sequence — Global Constraints numbering rule).
  `<InstagramGrid tiles={{image,alt,href}[]} reelHref reelLabel handle followHref />`.
  `<QuoteCta compact?={boolean} />` (the closing CTA band every page ends
  with, before the footer).

- [ ] **Step 1–4: Write each component**

Port directly from `index.html`:
- `TestimonialGrid`: lines 457–480 (`.testi-grid`/`.testi` CSS from
  `main.css` lines 87–92, the `<style>` block embedded in `index.html`).
- `StepsRow`: lines 482–496 (`.steps-row`/`.step` CSS, embedded `<style>`
  block in `index.html`).
- `InstagramGrid`: lines 535–564 (`.ig-grid`/`.ig-tile`/`.ig-reel`/`.ig-cta`
  CSS, embedded `<style>` block).
- `QuoteCta`: lines 567–583 (`.quote`/`.quote.compact` CSS from `main.css`
  lines 467–482), parameterized so interior pages can pass `compact`.

Each keeps the exact copy from the source — these are one-off homepage
sections (except `QuoteCta`, reused by every interior page), so there's no
data file, just props passed inline where each is used (Task 14).

- [ ] **Step 5: Verify**

`npm run build`, `grep -q 'SAMPLE COPY' dist/index.html` → confirms the
placeholder-testimonial disclosure comment survived the port (it should
appear in the rendered HTML source since it's an HTML comment, not stripped).

- [ ] **Step 6: Commit**

```bash
git add src/components/TestimonialGrid.astro src/components/StepsRow.astro src/components/InstagramGrid.astro src/components/QuoteCta.astro
git commit -m "Add TestimonialGrid, StepsRow, InstagramGrid, and QuoteCta components"
```

---

### Task 12: `QuoteForm.astro` (placeholder, cleaned)

**Files:**
- Create: `src/components/QuoteForm.astro`

**Interfaces:**
- Produces: `<QuoteForm />`, used only by `quote.astro` (Task 18).

- [ ] **Step 1: Write the component**

Port the full form from `agl-reflections-website/quote.html` lines 100–181
(all fields: name, organization, email, phone, event type, date, location,
attendance, stage model, services checkboxes, message) **removing**
`data-netlify="true"`, `netlify-honeypot="bot-field"`, the hidden
`form-name` input, and the honeypot `<label>` block — these are
Netlify-specific and would be misleading on Cloudflare Pages. Replace the
removed deploy-note HTML comment (lines 96–99) with:

```astro
<!--
  TODO(deploy): this form is static markup with no backend wired up yet —
  submissions currently go nowhere. Wire it to a real backend before launch,
  e.g.:
    - Formspree: create a free endpoint at formspree.io, set this form's
      action to it (https://formspree.io/f/XXXXXXX), done — no code needed.
    - Cloudflare Pages Function: add a function under `functions/quote.ts`
      that receives the POST and sends email via an API (Resend, Postmark,
      etc.) once an API key is available.
  See README.md "Quote form" section for the same note.
-->
```

Keep `method="POST" action=""` as-is (matches the source's current
non-functional state — the form is fully built and styled, just not wired).

- [ ] **Step 2: Verify**

```bash
npm run build
grep -c 'data-netlify' dist/quote.html   # expect 0
grep -c 'TODO(deploy)' dist/quote.html   # expect 1
grep -c '<select id="q-stage"' dist/quote.html  # expect 1
```

- [ ] **Step 3: Commit**

```bash
git add src/components/QuoteForm.astro
git commit -m "Add QuoteForm component as a cleaned, non-functional placeholder"
```

---

### Task 13: `SpecTable.astro` and `StageSide.astro`

**Files:**
- Create: `src/components/SpecTable.astro`
- Create: `src/components/StageSide.astro`

**Interfaces:**
- Produces: `<SpecTable caption rows={{label, value}[]} />` (numeric
  `value`s render with `.mono-spec`) used by every stage detail page and by
  `apex-5040-specs.html`. `<StageSide model pdfRemoved?={boolean}
  jumpLinks={{label, href}[]} />` — the sticky side column with jump links
  and the phone/email contact block; port `.stage-side`/`.side-links`/
  `.side-contact` CSS from `main.css` lines 312–325. This component is also
  where the dead PDF download links get dropped: **do not port** any
  `<a href="https://apex.miami/...">` markup from the source's side-links or
  spec-panel button rows.

- [ ] **Step 1: Write both components**

Port markup/CSS from any stage detail page (e.g.
`agl-reflections-website/stages/apex-5040.html` lines 130–145 for the
side-links/PDF-button row, and its `table.spec` section) as the template,
generalized with props. Confirm while porting that the "Download spec sheet"
buttons pointing at `apex.miami/*.pdf` are the ones being dropped — the
"View Full Specs" and "View in 3D" internal links (also present on the 5040
page only) stay.

- [ ] **Step 2: Verify**

```bash
grep -rc 'apex.miami' src/components/  # expect 0 across all component files
```

- [ ] **Step 3: Commit**

```bash
git add src/components/SpecTable.astro src/components/StageSide.astro
git commit -m "Add SpecTable and StageSide components (dead PDF links dropped)"
```

---

### Task 14: Assemble `index.astro` (homepage)

**Files:**
- Create: `src/pages/index.astro`

**Interfaces:**
- Consumes: `Layout`, `Header`, `Footer`, `Hero`, `StatBar`, `TrustBand`,
  `DateCheckForm`, `PathCards`, `FleetCard` (×4, `STAGES` sliced), a
  compact homepage services teaser (written inline here, per Task 9's note),
  `WorkItem` (teaser mode, ×2), `TestimonialGrid`, `StepsRow`, an inline
  about-teaser block, an inline rates-teaser block, `InstagramGrid`,
  `QuoteCta`, `Footer`.

- [ ] **Step 1: Compose the page**

Read `agl-reflections-website/index.html` in full alongside this task and
transcribe every section into the corresponding component, in the exact
order it appears in the source (hero → stats → trust band → date-check →
path cards → fleet grid (4 cards: 5040 featured, 4240 co-featured, 3224,
4232 soon) → video reel → services teaser → work (2 teasers: Hialeah,
Big Orange) → testimonials → how-it-works → about teaser → rates teaser →
Instagram grid → quote CTA → footer). Use real copy from the source file for
every heading/paragraph — nothing in this task is placeholder text.

- [ ] **Step 2: Verify content parity**

```bash
npm run build
# Every internal link from the source homepage must still resolve somewhere in the new build:
for href in stages/index.html production/index.html rates.html work/index.html about.html quote.html stages/apex-5040.html stages/apex-4240.html stages/apex-3224.html stages/apex-4232.html; do
  test -f "dist/$href" && echo "OK $href" || echo "MISSING $href"
done
```
Expected: `OK` for every line (pages not yet built in earlier tasks will show
`MISSING` until Tasks 15–21 land — re-run this check after Task 21 as part
of Task 23's full sweep). For now, confirm structurally that `dist/index.html`
itself contains: `grep -c 'hero-video\|hero-bg' dist/index.html` → ≥1,
`grep -c 'class="card' dist/index.html` → `4`, `grep -c 'work-item' dist/index.html` → `2`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "Assemble homepage from ported components and content"
```

---

### Task 15: Assemble `about.astro` (+ `Timeline`, `HireBand`, `MarkStrip`)

**Files:**
- Create: `src/components/Timeline.astro`
- Create: `src/components/HireBand.astro`
- Create: `src/components/MarkStrip.astro`
- Create: `src/pages/about.astro`

Note on the `.html` suffix: Astro's file-based routing maps
`src/pages/about.astro` → output `about.html` automatically when
`build.format: 'file'` is set (Task 1). No special `about.html.astro`
filename is needed — remove that alternate name from the File Structure
diagram's parenthetical once this task confirms it. The same applies to
every other page in this plan.

**Interfaces:**
- `Timeline` (keeps year markers — genuine sequence), `HireBand`, `MarkStrip`
  ported from `main.css` `.tl-grid`/`.hire-grid`/`.mark-strip` rules (lines
  580–603) and `about.html`'s timeline/yard/crew sections.

- [ ] **Step 1: Write `Timeline.astro`, `HireBand.astro`, `MarkStrip.astro`**

Read `agl-reflections-website/about.html` in full, transcribe the timeline
entries (each with year, title, body, optional image), the hiring section
copy + role list, and the brand-marks strip into these three components.

- [ ] **Step 2: Assemble `about.astro`**

Compose `Layout`, `Header`, `PageHero`, the sand-band intro, `Timeline`,
`HireBand`, `MarkStrip`, `QuoteCta`, `Footer` — in source order.

- [ ] **Step 3: Verify**

```bash
npm run build
grep -c 'tl-grid\|class="tl "' dist/about.html   # expect ≥1
grep -c '1975' dist/about.html                   # expect ≥1 (founding year mentioned)
```

- [ ] **Step 4: Commit**

```bash
git add src/components/Timeline.astro src/components/HireBand.astro src/components/MarkStrip.astro src/pages/about.astro
git commit -m "Assemble about page with Timeline, HireBand, and MarkStrip"
```

---

### Task 16: Assemble `production/index.astro`

**Files:**
- Create: `src/pages/production/index.astro`

- [ ] **Step 1: Compose the page**

Read `agl-reflections-website/production/index.html` in full. Compose
`Layout`, `Header`, `PageHero`, an `.anchor-row` jump-nav (ported from
`main.css` lines 339–341), six `ServiceBlock`s (audio, lighting, video,
crowd-control, backline, crew — alternating `flip`), the rates section
(`id="rates"`), `QuoteCta`, `Footer`.

- [ ] **Step 2: Verify**

```bash
npm run build
for anchor in audio lighting video crowd-control backline crew; do
  grep -c "id=\"$anchor\"" dist/production/index.html
done
```
Expected: `1` for each of the six anchors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/production/index.astro
git commit -m "Assemble production services page"
```

---

### Task 17: Assemble `rates.astro`

**Files:**
- Create: `src/pages/rates.astro`

- [ ] **Step 1: Compose the page**

Read `agl-reflections-website/rates.html` in full and transcribe the rate
sections (`labor`, `power`, `dj`, `movies`, `stages`) using `.rates-grid`/
`.spec-panel` markup (`main.css` lines 605–609), with all dollar figures
rendered via `.mono-spec` (Global Constraints — these are numeric specs,
same treatment as stage dimensions).

- [ ] **Step 2: Verify**

```bash
npm run build
diff <(grep -oE '\$[0-9][0-9,]*' /Users/mlopez/Projects/avant-garde/agl-reflections-website/rates.html | sort -u) \
     <(grep -oE '\$[0-9][0-9,]*' dist/rates.html | sort -u)
```
Expected: no output (every dollar figure from the source appears in the new
page — this is the concrete parity check for a page that's mostly numbers).

- [ ] **Step 3: Commit**

```bash
git add src/pages/rates.astro
git commit -m "Assemble rates page with mono-spec pricing figures"
```

---

### Task 18: Assemble `quote.astro`

**Files:**
- Create: `src/pages/quote.astro`

- [ ] **Step 1: Compose the page**

Compose `Layout`, `Header`, `PageHero` (short variant), a `.form-wrap` with
`QuoteForm` (Task 12) plus the `quote-side` contact aside (phone/email/
address/`.season-note`), `Footer`. Port the URL-param prefill `<script>`
from `agl-reflections-website/quote.html` lines 272–283 verbatim (it reads
`?date=`/`?location=`/`?attendance=` set by the homepage's `DateCheckForm`
GET submit) into a `public/scripts/quote-prefill.js`, referenced via
`<script src="/scripts/quote-prefill.js">`.

- [ ] **Step 2: Verify the homepage → quote handoff still works**

```bash
npm run build
grep -q 'action="/quote.html"' dist/index.html && echo "homepage form targets quote page"
grep -q 'prefillFromParams\|URLSearchParams' dist/quote.html && echo "quote page reads params"
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/quote.astro public/scripts/quote-prefill.js
git commit -m "Assemble quote page with prefill script and cleaned form"
```

---

### Task 19: Assemble the stage fleet pages (index + 8 details + specs + 3D)

**Files:**
- Create: `src/pages/stages/index.astro`
- Create: `src/pages/stages/apex-2016.astro`
- Create: `src/pages/stages/apex-2420.astro`
- Create: `src/pages/stages/apex-2424.astro`
- Create: `src/pages/stages/apex-3224.astro`
- Create: `src/pages/stages/apex-4232.astro`
- Create: `src/pages/stages/apex-4240.astro`
- Create: `src/pages/stages/apex-5040.astro`
- Create: `src/pages/stages/apex-5040-specs.astro`
- Create: `src/pages/stages/apex-5040-3d.astro`
- Create: `src/pages/stages/vip-deck-3724.astro`

**Interfaces:**
- Every detail page composes `Layout`, `Header`, `PageHero`, a
  `.stage-cols` two-column layout (main content + `StageSide`), `SpecTable`,
  a "use cases" list, a "pairing" callout (cross-sell to production
  services), `QuoteCta`, `Footer` — reading its copy from `STAGES` (Task 8)
  plus the fuller prose that only exists in each source detail page (the
  `STAGES` record has structured specs; the page itself carries the
  paragraph copy, which is unique per stage and read directly from
  `agl-reflections-website/stages/<slug>.html`).

- [ ] **Step 1: Assemble `stages/index.astro`**

Compose `Layout`, `Header`, `PageHero`, `CompareTable` (Task 8, all 8 rows),
`QuoteCta`, `Footer`.

- [ ] **Step 2: Assemble the 8 detail pages**

For each of `apex-2016`, `apex-2420`, `apex-2424`, `apex-3224`, `apex-4232`,
`apex-4240`, `apex-5040`, `vip-deck-3724`: read the matching source file in
full, transcribe its unique prose + images into the shared layout described
above. The `apex-5040` page is the only one with "View Full Specs" and
"View in 3D" links (to the two pages below) — port those two links, drop
the "Download spec sheet (GEN3/Classic)" PDF links per Task 13.

- [ ] **Step 3: Assemble `apex-5040-specs.astro`**

Read `agl-reflections-website/stages/apex-5040-specs.html` in full
(specs-5040 image set: `basic-front`, `basic-loads`, `beast-loads`,
`extended-loads`, `modes`, `sidewalls`, `stairs`, `trailer`). Port every
image + its spec table; drop the two PDF download buttons.

- [ ] **Step 4: Assemble `apex-5040-3d.astro`**

Port `agl-reflections-website/stages/apex-5040-3d.html` largely as its own
minimal standalone page (it intentionally doesn't share the main site
chrome — no nav/footer — per the source). Load `model-viewer` via
`<script type="module" src="/assets/js/model-viewer.min.js"></script>` and
reference `/assets/apex-5040-massing.glb`. Keep the `noindex` meta (handled
automatically since `Layout`'s `noindex` prop is `true` for this page, and
the sitemap filter from Task 1 already excludes it).

- [ ] **Step 5: Verify**

```bash
npm run build
for slug in apex-2016 apex-2420 apex-2424 apex-3224 apex-4232 apex-4240 apex-5040 apex-5040-specs apex-5040-3d vip-deck-3724; do
  test -f "dist/stages/$slug.html" && echo "OK $slug" || echo "MISSING $slug"
done
grep -rc 'apex.miami' dist/stages/  # expect 0 total across all files
grep -q 'model-viewer' dist/stages/apex-5040-3d.html && echo "3D page has model-viewer"
grep -q 'noindex' dist/stages/apex-5040-3d.html && echo "3D page marked noindex"
```

- [ ] **Step 6: Commit**

```bash
git add src/pages/stages
git commit -m "Assemble stage fleet index, 8 detail pages, specs page, and 3D viewer page"
```

---

### Task 20: Assemble the work/case-study pages

**Files:**
- Create: `src/pages/work/index.astro`
- Create: `src/pages/work/big-orange-nye.astro`
- Create: `src/pages/work/floydfest.astro`
- Create: `src/pages/work/hialeah-4th-of-july.astro`
- Create: `src/pages/work/mobile-stage-conference-2023.astro`

- [ ] **Step 1: Assemble `work/index.astro`**

Compose `Layout`, `Header`, `PageHero`, a grid/list of all 4 `WORK` entries
(teaser mode), `QuoteCta`, `Footer`. Read `agl-reflections-website/work/index.html`
in full for its intro copy and any content beyond the case links.

- [ ] **Step 2: Assemble each of the 4 case-study pages**

Compose `Layout`, `Header`, `PageHero`, the full-mode `WorkItem` body,
`Gallery` (Task 10), `QuoteCta`, `Footer`, reading from `WORK` (Task 10) plus
the source file directly for anything not already captured in the data
model.

- [ ] **Step 3: Verify**

```bash
npm run build
for slug in index big-orange-nye floydfest hialeah-4th-of-july mobile-stage-conference-2023; do
  test -f "dist/work/$slug.html" && echo "OK $slug" || echo "MISSING $slug"
done
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/work
git commit -m "Assemble work index and 4 case-study pages"
```

---

### Task 21: Assemble `404.astro`

**Files:**
- Create: `src/pages/404.astro`

- [ ] **Step 1: Compose the page**

Read `agl-reflections-website/404.html` in full, port its `.err` section
(oversized mirrored "404", sub-copy, `.err-links` back to home/stages/quote)
using `MirrorText` + `Button`s. No `Header`/`QuoteCta` — match the source's
minimal chrome for this page if that's what it uses (verify against the
source file).

- [ ] **Step 2: Verify**

```bash
npm run build
test -f dist/404.html && echo "404 page built"
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/404.astro
git commit -m "Assemble 404 page"
```

---

### Task 22: Cleanup & SEO pass

**Files:**
- Modify: any file still containing a stray reference caught by this task's
  checks
- Verify: `public/robots.txt`, `astro.config.mjs` sitemap filter

- [ ] **Step 1: Repo-wide dead-link sweep**

```bash
grep -rn 'apex.miami' src/ public/ || echo "clean: no apex.miami references"
```
Expected: "clean" message. If anything matches, remove it.

- [ ] **Step 2: Confirm no double font-loading**

```bash
npm run build
grep -c 'fonts.googleapis.com' dist/index.html   # expect 0
grep -c 'archivo-var-latin.woff2\|archivo-black-latin.woff2' dist/index.html  # expect ≥1 (via the CSS @font-face, may not literally appear in HTML — check the built CSS asset instead)
grep -rl 'archivo-var-latin' dist/_astro/*.css   # expect at least one match
```

- [ ] **Step 3: Confirm canonical URLs and sitemap**

```bash
grep -o 'canonical" href="[^"]*"' dist/about.html
```
Expected: `canonical" href="https://reflectionsproductions.com/about.html"`.

```bash
cat dist/sitemap-index.xml dist/sitemap-0.xml 2>/dev/null | grep -c 'apex-5040-3d\|404.html'
```
Expected: `0` (both excluded per Task 1's sitemap filter).

- [ ] **Step 4: Confirm robots.txt made it into the build output**

```bash
test -f dist/robots.txt && grep 'Sitemap:' dist/robots.txt
```

- [ ] **Step 5: One more full-repo search for the two originally-reported issues**

```bash
grep -rni 'produciton\|potfolio' src/ public/ dist/ || echo "confirmed: neither string exists in the new site either"
```
This documents, in the git history, that the search was repeated against the
finished site and not just the source checkout.

- [ ] **Step 6: Commit** (only if Steps 1–5 required any fixes; otherwise skip)

```bash
git add -A
git commit -m "Cleanup pass: verify no dead links, duplicate fonts, or the reported typo/broken-link strings"
```

---

### Task 23: Full-site QA sweep

**Files:** none created — verification-only task.

- [ ] **Step 1: Full build**

```bash
npm run build
```
Expected: 0 errors, and the page count matches: `find dist -name '*.html' | wc -l` → `22` (21 content pages + one of `stages/index.html`/`work/index.html` already counted — recount against the exact list in this plan's File Structure section and reconcile any mismatch before proceeding).

- [ ] **Step 2: Every internal link resolves**

```bash
npm run preview &
sleep 2
for f in $(find dist -name '*.html'); do
  route="/${f#dist/}"
  grep -oE 'href="/[^"#]*"' "$f" | sed 's/href="//;s/"$//' | sort -u | while read -r href; do
    [ -f "dist${href}" ] || echo "BROKEN in $route -> $href"
  done
done
kill %1
```
Expected: no `BROKEN` lines.

- [ ] **Step 3: Responsive + accessibility spot check**

Open the dev server in a browser at 375px, 768px, and 1440px widths for:
`/`, `/stages/apex-5040.html`, `/production/index.html`, `/quote.html`,
`/work/floydfest.html`. Confirm: nav collapses to the burger menu below
1080px, no horizontal scroll at any width, focus rings are visible when
tabbing through nav links and the quote form, and toggling
`prefers-reduced-motion: reduce` in DevTools removes the hero
settle/ripple animation and all `.rv` transitions.

- [ ] **Step 4: Content parity spot check against the source**

```bash
SRC=/Users/mlopez/Projects/avant-garde/agl-reflections-website
for f in index about production/index rates quote 404; do
  echo "=== $f ==="
  diff <(grep -oE '>[^<]{15,}<' "$SRC/$f.html" | sort -u) \
       <(grep -oE '>[^<]{15,}<' "dist/$f.html" | sort -u) | head -20
done
```
This is a rough text-content diff (long text runs only, ignoring markup) —
expect small diffs from copy-editing during componentization (e.g. dropped
numbering markers), but no wholesale missing paragraphs. Investigate any
large diff block.

- [ ] **Step 5: Commit** (only if fixes were needed)

```bash
git add -A
git commit -m "Fix issues found in full-site QA sweep"
```

---

### Task 24: Create the GitHub repo, write the README, and deploy to Cloudflare Pages

**Files:**
- Create: `README.md`
- Create (if not already present from `npm create astro`): `.gitignore`
  (must include `node_modules/`, `dist/`, `.astro/`)

**Interfaces:** none — this is the deploy/handoff task.

- [ ] **Step 1: Create the new GitHub repo (do not touch the old one)**

```bash
gh repo create avant-garde-hq/agl-reflections-astro --public --source=. --remote=origin
```

- [ ] **Step 2: Write `README.md`**

```markdown
# Reflections Productions — Astro site

Astro rebuild of the Reflections Productions marketing site (mobile stage
rentals + concert production, South Florida). Static output, deployed to
Cloudflare Pages.

## Run locally

    npm install
    npm run dev

## Build

    npm run build

Output goes to `dist/`.

## Deploy

    npm run build
    npx wrangler pages deploy dist --project-name=agl-reflections-astro

(Wrangler must already be authenticated — `wrangler whoami` to check. Do not
run `wrangler login` on a shared machine without confirming which account
should be used.)

## Quote form

The form on `/quote.html` is fully built and styled but has no backend wired
up yet — submissions currently go nowhere. Wire it to a real backend before
launch:
- **Formspree** (no code): create a free endpoint at formspree.io and point
  the form's `action` at it.
- **Cloudflare Pages Function**: add `functions/quote.ts` to receive the POST
  and send email via an API (Resend, Postmark, etc.) once an API key exists.

## Content source

Ported from `avant-garde-hq/agl-reflections-website` (the previous static
HTML site). That repo is not touched by this project and should be archived
once this site is live.
```

- [ ] **Step 3: Commit the README**

```bash
git add README.md .gitignore
git commit -m "Add README covering local dev, build, deploy, and the quote-form TODO"
```

- [ ] **Step 4: Push to the new repo**

```bash
git push -u origin main
```

- [ ] **Step 5: Deploy to Cloudflare Pages**

```bash
npm run build
npx wrangler pages deploy dist --project-name=agl-reflections-astro
```

- [ ] **Step 6: Verify the live preview URL**

Open the `*.pages.dev` URL Wrangler prints, confirm the homepage renders
with the hero video, then spot-check `/stages/apex-5040.html` (fleet
detail), `/stages/apex-5040-3d.html` (model-viewer loads and rotates), and
`/quote.html` (form renders, all fields present). Report the live preview
URL back to the user.

---

## Self-Review Notes

**Spec coverage:** every section of
`docs/superpowers/specs/2026-07-14-reflections-astro-rebuild-design.md` maps
to a task above — architecture (Tasks 1–13), design approach/single-pass
build (Tasks 2, 5, 6 establish tokens/signature before any page is
assembled in Tasks 14–21), motion (Tasks 2, 6), cleanup items (Tasks 12, 13,
22), quote form (Task 12), repo/deploy safety (Tasks 1, 24), done criteria
(Task 23 + Task 24 Step 6).

**Type consistency:** `Stage` (Task 8) and `WorkCase` (Task 10) interfaces
are defined once and referenced by name in every later task that touches
stage or work data (Tasks 14, 19, 20) rather than redefined — if an
implementing agent needs a field not listed in these interfaces, that's a
signal to add it to the interface in Task 8/10, not to invent an
untyped prop.

**Content-porting adaptation:** Tasks 14–21 deliberately don't inline all
source copy verbatim (that would duplicate ~3,700 lines of existing HTML
into this plan document); instead they point at exact source files and give
concrete, runnable verification commands (grep counts, diffs, link-existence
checks) so "done" is checkable without the plan itself containing a full
copy of the site.
