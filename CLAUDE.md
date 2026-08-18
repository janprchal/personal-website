# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A static personal portfolio/landing page for Jan Prchal (Frontend Developer / Designer / Webflow Developer). Plain HTML/CSS/JS with no build tooling, package manager, or framework — `index.html` is opened directly or served as-is.

## Running / previewing

There is no build step, dev server config, or test suite. To preview, open `index.html` directly in a browser or serve the directory with any static file server, e.g.:

```
python3 -m http.server 8000
```

`test.html` is a scratch/dashboard mockup unrelated to the main site — not linked from `index.html`.

## Architecture

- `index.html` — the single page. Structure: a full-viewport `.intro` header (logo, animated "Hi, I'm Jan Prchal" heading, a rotating role title, a contact button) followed by a commented-out `#projects` section (kept as inline HTML comments, not deleted — treat as work-in-progress content rather than dead code to remove).
- `css/main.css` — imports Google Fonts (Rubik, Roboto Slab) and all files under `css/components/`, then defines root CSS variables (colors, fonts) and the core layout/responsive rules for the intro header. Breakpoints: 425px, 768px, 960px (animation "turns on" here), 1080px, 1680px, 1920px.
- `css/components/*.css` — one file per UI concern: `typography.css` (headings), `utils.css` (small utility classes like `.tac`, `.mobile-and-more`), `button.css` (`.button` styles incl. hover offset effect), `more.css` (the animated scroll-down arrows), `projects.css` (styles for the currently-commented-out projects grid).
- `js/app.js` — all page behavior, built on GSAP timelines (loaded from CDN in `index.html`). Key pieces:
  - `hiTimeline` / `skillsTimeline`: GSAP timelines driving the intro entrance animation and the looping rotation of role titles (`.sliding-text` items cycling through "Frontend Developer" / "Designer" / "Webflow Developer").
  - `main`: a composed timeline built from timeline *labels* (`showHeaderStart/End`, `hiStart/End`, `skillsStart/End`) via `tweenFromTo`, so the same sub-animations are reused for the initial intro and the looping skills carousel.
  - `underlineHeight` is recalculated on resize (`matchMedia` breakpoint at 959/960px) because the animated underline behind headings behaves differently when text wraps to two lines vs. one.
  - Resize handling calls `main.restart()` (debounced) rather than tearing down and rebuilding the timeline.
- `js/vendor/splitTextJs.js` — a small third-party MIT-licensed utility (SplitTextJS) vendored directly rather than installed via a package manager. Treat as external code; avoid editing unless fixing a vendored bug.
- `img/` — static assets referenced directly by path from HTML/CSS.

## Conventions

- No JS module system or bundler — scripts are loaded via plain `<script>` tags in document order (GSAP CDN → vendor → app.js), and everything in `app.js` runs in the global scope.
- No CSS preprocessor — plain CSS with `@import` for composition and CSS custom properties (`--var-name`) for theming values defined in `:root` in `main.css`.
- This repo is not a git repository (no `.git`); there is no established commit/PR workflow to follow here.
