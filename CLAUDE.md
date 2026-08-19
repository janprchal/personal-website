# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Jan Prchal's personal portfolio site — rewritten from a single static HTML
page into a multi-page Astro site: homepage + two case-study pages
(BuildingMinds, EnviSoG). The rewrite implements a design that was produced
in Figma via a separate Claude Code workspace at
`/Users/hony/dev/ai-design-tool` (project folder `personal-portfolio/`
there). That repo's `personal-portfolio/moodboard/style.md` is the
authoritative design-decision log (colors, spacing, shadows, typography,
interactive-state treatments) — check it before inventing a value here.
The actual Figma file (page "Portfolio (redesign)") is the pixel source of
truth; pull exact values via the Figma MCP server rather than eyeballing
screenshots. All 3 pages are built and verified against Figma (see
Architecture) — remaining work is polish/QA (responsive breakpoints below
1440px haven't been checked yet) and content follow-ups noted inline below.

## Running / previewing

Standard Astro project — `npm run dev` (or `astro dev --background` /
`astro dev stop` / `astro dev status` / `astro dev logs` per `AGENTS.md`),
`npm run build`, `npm run preview`.

## Architecture

- `src/pages/index.astro` — the homepage: Hero → What-and-Where (Skills +
  Positions) → Testimonials → Featured Projects → Footer.
- `src/pages/projects/{buildingminds,envisog}.astro` — the two case-study
  pages, both on `CaseStudyLayout`. Each project has its own accent color
  (BuildingMinds `#FF3D00`, EnviSoG `#3538CD` — both confirmed in Figma,
  not the portfolio brand palette) threaded through as the `--cs-accent`
  CSS custom property, used by `RoleBlock`'s eyebrow marker, the case-study
  "My Role" point left-borders, the stat numbers, and the accent CTA
  button. BuildingMinds has an extra "Beyond this app" stats block (50+
  components / 3 apps / 5 teams) and a 2-card testimonial pull-quote
  section that EnviSoG doesn't — both confirmed against Figma, not an
  oversight.
- `src/layouts/CaseStudyLayout.astro` — shared case-study shell: sets
  `--cs-accent`, renders `CaseStudyHero`, a slot for page content, the
  "Back to home" / "Next project" cross-link nav, and `Footer`. Case
  studies use a *different*, simpler header than the homepage
  (`CaseStudyHero.astro`: JP logo + "CASE STUDY" label + project logo/title
  + role/date — no Skills/Projects/Experience/Contact nav, no "My resume"
  button) — don't reuse `Header.astro` here.
- `src/components/` — `Button.astro`, `Link.astro` (states verified against
  the Figma "Interactive States Reference" card), `Card.astro` (shared
  shadow-shell/clip-shell wrapper — see Gotchas), `Tag.astro`, `Avatar.astro`,
  `PositionCard.astro`, `TestimonialCard.astro`, `ProjectCard.astro`,
  `Header.astro`, `Footer.astro`, `Hero.astro`, `Section.astro` (generic
  eyebrow+heading+960px-column wrapper, used by the 3 homepage sections),
  `CaseStudyHero.astro`, `RoleBlock.astro` (case-study "PROJECT"/"MY
  ROLE"/"TECHNOLOGIES" sub-sections), `Gallery.astro` (vertical stack of
  case-study screenshots).
- `src/components/sections/` — homepage-only content: `WhatAndWhereSection`,
  `TestimonialsSection`, `FeaturedProjectsSection`. The 4th Figma section —
  a numbered project index (janprchal.cz Design System / Konference /
  EnviSoG / Homeandstem) — is deliberately NOT built: it's `visible: false`
  in the live Figma file (a 2026-08-11 decision, effectively superseded by
  the featured-cards Projects section built later), confirmed with the user
  before skipping it. If it ever gets re-enabled in Figma, build it as
  `ProjectsIndexSection`.
- `src/styles/tokens.css` — the single source of truth for design tokens
  (colors, spacing, radii, shadows, type scale), ported from
  `moodboard/style.md`'s already-consolidated values plus values pulled
  directly from Figma node properties. Bind components to these tokens
  rather than hardcoding values.
- `src/scripts/hero-animation.js` — the GSAP hero-entrance animation, ported
  from `legacy-site/js/app.js`'s `hiAnimation()`, wired into `Hero.astro`.
  See the file's own header comment for exactly what changed (underline is
  now a real rectangle animated via `scaleX`, not a `background-size`
  sweep; the rotating-title carousel was dropped since the new Hero has one
  static headline; GSAP is an npm dependency now, not a CDN `<script>` tag).
- `public/logo.svg` — the logo mark, copied as-is from
  `legacy-site/img/logo.svg` (deliberately NOT re-exported from Figma node
  `4:18` — that raw export carries the documented oversized 720x720
  safe-zone canvas around the visible glyph; the legacy copy is already
  correctly cropped). `public/logo-white.svg` is the same mark recolored
  for the dark Footer.
- `public/logos/` — company logos: `buildingminds.svg`, `enrian.svg`
  (exported from Figma), `envisog_no_text.svg` (user-supplied, verified
  against Figma's own EnviSoG vector fill colors). Used by `PositionCard`
  and `CaseStudyHero`'s `logo`/`projectLogo` props.
- `public/images/projects/` — the two featured ProjectCard screenshots
  (`buildingminds.png`, `envisog.png`), exported directly from each
  project card's `Picture` frame in Figma (its composed export, not the
  larger raw source image).
- `public/images/case-studies/{buildingminds,envisog}/browser-*.png` — the
  5 "Browser card" mockup screenshots per case study, exported from Figma
  nodes `180:6/15/24/33/42` (BM) and `223:20/26/32/38/44` (EnviSoG), wired
  into each case study's `Gallery`.
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

## Known placeholders / follow-ups

- `Header`'s "My resume" button and `Footer`'s "CV" link both point to
  `/resume.pdf`, which doesn't exist yet — needs the real file dropped into
  `public/`.
- Case-study "Visit buildingminds ↗" / "Visit envisog ↗" buttons link to
  `https://buildingminds.com` and `#` respectively — the EnviSoG one needs
  a real URL.
- Responsive behavior below the ~1440px design width hasn't been checked
  yet — everything so far has been verified at desktop width only.

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
- **`get_screenshot` can return a degenerate 1x1 image for a node that's
  actually `visible: false`** (or has a hidden ancestor) — not an error, no
  exception thrown, just a technically-valid but useless image. This is how
  the numbered-project-index section (see Architecture) was discovered to
  be hidden — screenshots of it and its children kept coming back 1x1
  (`node.screenshot()` too) while direct property reads worked fine and
  returned real content. If a screenshot comes back suspiciously tiny,
  check `visible` up the ancestor chain before assuming a tool glitch.
- **`loading="lazy"` on `<img>` can fail to trigger in Playwright's
  automated screenshots** even for images within the visible viewport —
  hit this on `ProjectCard`'s images (`img.complete` stayed `false`
  indefinitely; the file itself served fine via direct `curl`). Removed
  `loading="lazy"` there since the page only has 2 such images anyway. If
  it recurs elsewhere, verify via `img.complete`/`naturalWidth` in
  `browser_evaluate`, not just a screenshot looking blank.

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
