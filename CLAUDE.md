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
- `src/components/` — `Button.astro`, `Link.astro` (states verified against
  the Figma "Interactive States Reference" card), `Card.astro` (shared
  shadow-shell/clip-shell wrapper — see Gotchas), `Tag.astro`, `Avatar.astro`,
  `PositionCard.astro`, `TestimonialCard.astro`, `ProjectCard.astro`,
  `Header.astro`, `Footer.astro`. Still needed: `Hero.astro` (wire up
  `src/scripts/hero-animation.js`), then homepage/case-study assembly.
  Footer's mail/GitHub/LinkedIn/CV icons are generic outline SVGs, not
  pixel-extracted from Figma.
- `src/pages/preview/primitives.astro` — a live sandbox for checking
  components against Figma before real pages exist. Delete once
  Header/Footer/homepage are built.
- `src/styles/tokens.css` (once created) — the single source of truth for
  design tokens (colors, spacing, radii, shadows), ported from
  `moodboard/style.md`'s already-consolidated values. Bind components to
  these tokens rather than hardcoding values.
- `src/scripts/hero-animation.js` — the GSAP hero-entrance animation, ported
  from `legacy-site/js/app.js`'s `hiAnimation()`. See the file's own header
  comment for exactly what changed (underline is now a real rectangle
  animated via `scaleX`, not a `background-size` sweep; the rotating-title
  carousel was dropped since the new Hero has one static headline; GSAP is
  an npm dependency now, not a CDN `<script>` tag). Not wired into a page
  yet — expects `Hero.astro` (not yet built) to place the
  `data-hero-*` attribute hooks documented in its header comment.
- `public/logo.svg` — the logo mark, copied as-is from
  `legacy-site/img/logo.svg` (deliberately NOT re-exported from Figma node
  `4:18` — that raw export carries the documented oversized 720x720
  safe-zone canvas around the visible glyph; the legacy copy is already
  correctly cropped).
- `public/logos/` — company logos: `buildingminds.svg`, `enrian.svg`
  (exported from Figma), `envisog_no_text.svg` (user-supplied, verified
  against Figma's own EnviSoG vector fill colors). Used by `PositionCard`
  and `ProjectCard`'s `logo`/`image` props.
- `public/images/projects/` — the two featured ProjectCard screenshots
  (`buildingminds.png`, `envisog.png`), exported directly from each
  project card's `Picture` frame in Figma (its composed export, not the
  larger raw source image).
- `public/images/case-studies/{buildingminds,envisog}/browser-*.png` — the
  5 "Browser card" mockup screenshots per case study, exported from Figma
  nodes `180:6/15/24/33/42` (BM) and `223:20/26/32/38/44` (EnviSoG). Not
  yet wired into a page — for the case-study build.
- `legacy-site/` — the previous plain HTML/CSS/JS site, kept for
  reference/extraction only, not served. `splitTextJs.js` (vendored there)
  was confirmed unused (loaded but never invoked) and was not ported. Do
  not delete `legacy-site/` until the rewrite fully replaces it.

## Conventions

- **Font usage**: `--font-heading` (Rubik) for headings — matches both the
  Figma design and the original `legacy-site` (which already used Rubik for
  its own `<h1>`), so no conflict there. `--font-mono` (JetBrains Mono) is
  reserved for genuinely mono-ish micro-content — labels, tags, small
  metadata, badge chips (e.g. the Hero's "Hello! / I'm Jan Prchal" badge) —
  never full body copy, even where the Figma file currently applies it more
  broadly. Known instance: the Hero bio paragraph ("Ten-plus years
  building...") is set to JetBrains Mono 16px in Figma — when building
  `Hero.astro`, use `--font-body` (Inter) for that paragraph instead per
  this rule, rather than copying the Figma value as-is. Worth flagging back
  upstream if the Figma file should be corrected too, to avoid future drift.
- No UI framework (React/Vue/etc.) — plain Astro components, matching the
  companion blog project's approach (see below).
- Plain CSS with custom properties for tokens — no preprocessor, following
  the previous site's convention and keeping the dependency footprint small.
- Git repo, initialized specifically for this rewrite (the previous static
  site was never version-controlled).

## Gotchas

- **Astro's scoped-CSS pruning drops rules for classes that only appear
  inside a conditional JSX-like expression** — `{condition && <span
  class="foo">}` — even though the class legitimately renders when the
  condition is true. Hit this for real building `Tag.astro`'s optional
  brand-color dot: the `.tag__dot` rule was silently stripped from the
  compiled stylesheet (confirmed via `document.styleSheets`, not just a
  visual miss), so the dot existed in the DOM with the right background
  color but `width: 0`. Fix: always render the element unconditionally and
  toggle it with an inline `style` (e.g. `display: none`) instead of
  conditionally omitting the tag — that keeps the class in the template's
  static analysis. Check any future conditionally-rendered element's
  computed styles (not just a screenshot) if a fill/color reads right but
  the box seems to collapse.
- **Verify Figma's "obvious" element is actually the visible one before
  building from it.** Hit this twice already: the Hero's headline text node
  and a Position card's initials-avatar both looked like real content in a
  property dump, but were `visible: false` — the actually-rendered content
  (a hidden alt headline; a company logo image) was a sibling node. A
  screenshot of the specific node (not just reading `characters`/fills)
  caught both. Don't assume the first text/fill match found by `findAll` is
  what's on screen.

## Related project: the blog

`/Users/hony/dev/astro-blog` (GitHub: `janprchal/blog`) is a separate,
already-live Astro project (content collections, MDX posts) with its own
brand identity (Nunito font, purple/blue palette) that does **not** match
this site's confirmed design (Rubik/Inter/JetBrains Mono,
`#fede3c`/`#4353FF`/`#3fd984`). It is not merged into this project yet.
When that merge happens, it likely means importing its `src/content/blog`
collection and blog routes into this project and re-theming them to this
site's tokens — not blindly copying its styles. Not in scope until
explicitly requested.
