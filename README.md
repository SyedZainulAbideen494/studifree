# Studifree

A browser-based learning workspace: AI-assisted explanations, spaced-repetition
flashcards, generated quizzes, a study planner and progress tracking.

## Local development

```bash
npm install
npm run dev
```

## Build and verify

```bash
npx tsc -b
npx vitest run
npm run build
npm run preview -- --port 4173
```

## Search and social metadata

Canonical, Open Graph, Twitter and structured-data URLs resolve from
`window.location.origin` at runtime, so no domain is hard-coded. The static
`sitemap.xml`, `robots.txt` and social-image URLs are written at build time.

For fully absolute URLs in the built files, set the public site origin when
building:

```bash
VITE_SITE_URL=https://your-domain.example npm run build
```

Without it the build emits relative URLs, which still work at runtime but are
not ideal for social crawlers that do not execute JavaScript.

## Hosting

The app is a single-page application. Configure the host to rewrite unknown
paths to `/index.html` so routes such as `/home`, `/about` and `/help` work
on direct navigation and refresh. The root path `/` is the public landing page;
the application home is `/home`. Public marketing pages are indexable; the
application screens are marked `noindex`.

## Public routes in the sitemap

`/`, `/about`, `/help`

Settings, AI setup, onboarding and all in-app study screens are intentionally
excluded from the sitemap and search indexing.
