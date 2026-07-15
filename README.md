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
