# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Jan Prchal's personal portfolio site — being rewritten from a single static
HTML page into a multi-page Astro site (homepage + two case-study pages:
BuildingMinds, EnviSoG). The rewrite implements a design that was produced
in Figma via a separate Claude Code workspace at
`/Users/hony/dev/ai-design-tool` (project folder `personal-portfolio/`
there). That repo's `personal-portfolio/moodboard/style.md` is the
authoritative design-decision log (colors, spacing, shadows, typography,
interactive-state treatments) — check it before inventing a value here.
The actual Figma file (page "Portfolio (redesign)") is the pixel source of
truth; pull exact values via the Figma MCP server rather than eyeballing
screenshots.

## Running / previewing

Standard Astro project — `npm run dev` (or `astro dev --background` /
`astro dev stop` / `astro dev status` / `astro dev logs` per `AGENTS.md`),
`npm run build`, `npm run preview`.

## Architecture

- `src/pages/` — one file per route: `index.astro` (homepage), plus case
  study routes for BuildingMinds and EnviSoG once built.
- `src/layouts/` — shared page shells (`BaseLayout.astro`,
  `CaseStudyLayout.astro` once built).
- `src/components/` — reusable pieces: buttons/links (with hover/focus/
  active states — see the Figma "Interactive States Reference" card),
  Position/Testimonial/Project cards, Header/Nav, Footer.
- `src/styles/tokens.css` (once created) — the single source of truth for
  design tokens (colors, spacing, radii, shadows), ported from
  `moodboard/style.md`'s already-consolidated values. Bind components to
  these tokens rather than hardcoding values.
- `legacy-site/` — the previous plain HTML/CSS/JS site, kept for
  reference/extraction only, not served. In particular:
  - `legacy-site/img/logo.svg` — the logo mark, reused as-is in the new site.
  - `legacy-site/js/app.js` — the GSAP hero-entrance animation
    (`hiAnimation()`, timeline-label composition via `tweenFromTo`) and the
    `.background-gradient` underline-sweep technique. Port the *mechanic*
    into the new site (as an npm-installed GSAP dependency, not a CDN
    `<script>` tag), retargeting colors/sizes to the new design tokens —
    don't copy the file verbatim, the visual design has since changed
    (new accent usage, new 2px colored underline for links, etc.).
  - `legacy-site/js/vendor/splitTextJs.js` — only needed if a hero heading
    still requires char/word-level splitting; check against the new design
    first.
  - Do not delete `legacy-site/` until the rewrite fully replaces it.

## Conventions

- No UI framework (React/Vue/etc.) — plain Astro components, matching the
  companion blog project's approach (see below).
- Plain CSS with custom properties for tokens — no preprocessor, following
  the previous site's convention and keeping the dependency footprint small.
- Git repo, initialized specifically for this rewrite (the previous static
  site was never version-controlled).

## Related project: the blog

`/Users/hony/dev/astro-blog` (GitHub: `janprchal/blog`) is a separate,
already-live Astro project (content collections, MDX posts) with its own
brand identity (Nunito font, purple/blue palette) that does **not** match
this site's confirmed design (Rubik/Roboto Slab,
`#fede3c`/`#4353FF`/`#3fd984`). It is not merged into this project yet.
When that merge happens, it likely means importing its `src/content/blog`
collection and blog routes into this project and re-theming them to this
site's tokens — not blindly copying its styles. Not in scope until
explicitly requested.
