# Reflections Productions — Astro Rebuild Design

## Goal

Rebuild the existing static HTML site for Reflections Productions (a mobile-stage
and concert-production company in South Florida) as an Astro site, with zero
content loss, a visibly upgraded/premium feel, and a component structure that
becomes the reusable template ("house style") for future Avant Garde client
sites. Deploy to Cloudflare Pages.

Source of truth for current content: `avant-garde-hq/agl-reflections-website`
(cloned locally for reference during the port — never modified or pushed to).

## Scope

All ~21 pages from the source site, content and images/video/3D unchanged:
`index`, `about`, `production/index`, `quote`, `rates`, `404`, `stages/index` +
10 stage-detail/spec/3D pages, `work/index` + 4 case-study pages.

## Architecture

- **Astro v6, static output** (`output: 'static'`), `.html`-suffixed URLs
  preserved exactly as they are on the live site (`/about.html`, not
  `/about/`) — matches the existing canonical tags and `sitemap.xml`, so no
  URL migration happens as a side effect of this rebuild.
- **Reusable layout layer** (the house-style template for future clients):
  - `Layout.astro` — head/meta/SEO/JSON-LD, takes props for title,
    description, canonical URL, OG image.
  - `Header.astro` / `Footer.astro` — structurally generic: nav links, phone,
    social links, logo are all passed in as data/props, not hard-coded to this
    client.
  - This client's specific art direction — the mirrored-reflection headline
    effect, the accent "bar" motif, the color palette (teal/coral/sand),
    Archivo type — lives in this project's CSS theme layer and page
    components, not baked into the generic Layout/Header/Footer. A future
    client swaps the theme layer and brand marks, keeps the structural shell.
- **Section-level components**, data-driven rather than copy-pasted per page:
  `Hero`, `PageHero`, `StatBar`, `FleetCard`, `CompareTable`, `SpecTable`,
  `ServiceBlock`, `WorkItem`, `TestimonialGrid`, `QuoteForm`, etc.
- **Images**: all raster images through Astro's `<Image>`/`<Picture>`,
  replacing the current hand-rolled `-480`/`-800` responsive variants.
- **Video / 3D model**: copied as static assets in `public/`, referenced
  directly (not run through `<Image>`); the `<model-viewer>` web component
  script is loaded the same way it is today (module script tag), on the pages
  that use it.
- **Fonts**: self-hosted Archivo/Archivo Black `.woff2` only. The current site
  loads the *same* family twice (self-hosted `@font-face` + a redundant
  Google Fonts CDN link) — this rebuild drops the redundant CDN link.

## Design approach

The existing brand system is already distinctive and premium, not a generic
template — so this is a **single-pass, componentized build**, not a two-pass
port-then-redesign:

1. Establish the design system and build the shared/section components first,
   with the frontend-design skill invoked at this stage (before any page
   gets styled) to sharpen typography, spacing, imagery treatment, and motion
   — while respecting the existing palette, type, and reflection motif as the
   brand foundation, not something to discard.
2. Port all 21 pages by composing content into those already-finished
   components. Because every page uses the same finished component set, there
   is no risk of some pages reading "upgraded" and others reading "ported
   as-is" — visual consistency is structural, not a follow-up QA pass.
3. Full visual sweep across all pages/breakpoints once ported, before
   deploying.

## Motion

- Keep the existing scroll-reveal system (`IntersectionObserver`-based,
  already respects `prefers-reduced-motion`) largely as-is — cheap and it
  works.
- **View transitions**: implemented as plain CSS cross-document view
  transitions (`@view-transition { navigation: auto }` and a few named
  `view-transition-name` assignments on shared elements like the nav/logo) —
  *not* Astro's `<ClientRouter />`/SPA-style page router. The router's
  script-persistence model doesn't re-run page scripts on navigation without
  explicit re-init hooks, which would silently break the reveal animations,
  nav scroll-state, and video controls. Cross-document CSS view transitions
  give the same "premium page change" feel with graceful no-op fallback in
  unsupporting browsers, and zero JS lifecycle risk.
- **GSAP**: used sparingly for a couple of higher-impact flourishes (hero
  entrance, a subtle parallax) rather than replacing the whole animation
  system. Loaded per-page as a normal script, no SPA-router interaction to
  manage.

## Cleanup performed during port

- Remove the 11 dead `apex.miami/*.pdf` spec-sheet download links (external,
  unreachable domain) across 8 stage pages.
- De-duplicate the copy-pasted `target="_blank" rel="noopener"` attributes on
  every social icon link (fixed structurally, since these links now live in
  one shared component instead of being repeated per page).
- Drop the redundant Google Fonts CDN `<link>` tags.
- **Not found despite a full case-insensitive search of the source repo**: a
  "PRODUCITON" typo and a `/potfolio/` broken link mentioned in the original
  brief. All internal links resolve to real files; no such typo exists in any
  page title, heading, or nav label. Flagging this rather than fabricating a
  fix — if the client has a specific page/URL in mind, it can be corrected
  quickly once identified.

## Quote form

Client decision: keep the form as a fully styled, non-functional placeholder
(same behavior as the current live site — it's wired for Netlify Forms today
but was never finished, so it doesn't actually submit anywhere). This port:

- Removes the dead Netlify-specific attributes (`data-netlify`,
  `netlify-honeypot`) since Cloudflare Pages has no equivalent built-in
  service and leaving them in would be misleading.
- Leaves a clear code comment + a README section describing how to wire a
  real backend later (e.g. Formspree, or a Cloudflare Pages Function once an
  email-sending API key is available).

## Repo / deploy safety

- New GitHub repo `avant-garde-hq/agl-reflections-astro`, created via `gh`.
- The Astro project is scaffolded in a **fresh directory with no git remote**
  until the new repo exists — at no point does this working tree have the
  original `agl-reflections-website` repo configured as a remote, so there is
  no path by which a routine `git push` could touch the live site's repo.
- Deploy via `wrangler pages deploy` to the already-authorized personal
  Cloudflare account. `wrangler login` is never run.
- `robots.txt` (already references `sitemap.xml`) is carried over as-is into
  `public/`.
- Sitemap generated via `@astrojs/sitemap`, with an explicit filter excluding
  `stages/apex-5040-3d.html` (marked `noindex` in the source — a standalone
  concept-demo page, not final production content) and `404.html`.

## Done criteria

- `npm run build` completes clean.
- All ~21 pages present, responsive, with content/images/video/3D intact.
- Visibly upgraded design, consistent across all pages (not just a subset).
- Deployed to Cloudflare Pages; live preview URL reported.
- README covers local dev and deploy steps, plus the quote-form TODO.
