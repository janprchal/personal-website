/*
 * Hero entrance animation — ported from legacy-site/js/app.js's hiAnimation().
 *
 * What changed from the original:
 * - The original swept a CSS `background-size` on a `.background-gradient`
 *   text span (needed because the underline had to share a layer with the
 *   text). The new design's headline underline is its own element (a real
 *   Figma rectangle, "Underline bar", behind the headline text) — simpler
 *   to animate as `transform: scaleX()` from a fixed left origin, which is
 *   also GPU-accelerated (no layout-triggering width/background-size tween).
 * - The original's `skillsTimeline` looped a rotating-title carousel
 *   ("Frontend Developer" / "Designer" / "Webflow Developer"). This was
 *   initially dropped based on one homepage duplicate ("Homepage - FE dev")
 *   showing only "Frontend Developer" — but the OTHER duplicate
 *   ("Homepage - Design") independently shows "Designer" with a green
 *   underline (vs. yellow for "Frontend Developer") as its own live state.
 *   Each duplicate frame is a single static snapshot of one rotation state,
 *   not evidence the rotation was cut — confirmed with the user 2026-08-19.
 *   So the carousel IS ported, just for 2 confirmed roles instead of 3 (no
 *   "Webflow Developer" variant exists in the current design). The
 *   underline's width is never hardcoded — `left:0; right:0` inside a
 *   `display:inline-block` wrap means it auto-tracks whatever text is
 *   currently in the headline, same effect as the original's
 *   `underline.offsetWidth` remeasurement, without needing to do it by hand.
 * - splitTextJs.js (vendored in legacy-site/js/vendor/) was loaded on the
 *   old page but never actually invoked anywhere in app.js — dead weight,
 *   not ported.
 *
 * Usage: call `initHeroAnimation()` once on page load, from a component's
 * client-side script (e.g. Hero.astro). Expects these attribute hooks in
 * the DOM — Hero.astro is responsible for placing them, this module only
 * animates what it finds:
 *   [data-hero-logo]      — the logo mark
 *   [data-hero-badge]     — "Hello! I'm Jan Prchal" badge/chip group
 *   [data-hero-headline]  — the rotating role heading text
 *   [data-hero-underline] — the colored underline bar behind the headline
 *   [data-hero-subtext]   — the bio paragraph
 *   [data-hero-cta]       — button row (View projects / Get in touch)
 */

import gsap from 'gsap';

const ROLES = [
  { text: 'Frontend Developer', colorVar: '--color-accent-yellow' },
  { text: 'Designer', colorVar: '--color-accent-green' },
];

function resolveColor(colorVar) {
  return getComputedStyle(document.documentElement).getPropertyValue(colorVar).trim();
}

const ROLE_HOLD_MS = 2200;

function startRoleRotation(headline, underline) {
  let index = 0;

  function cycle() {
    const next = (index + 1) % ROLES.length;
    const tl = gsap.timeline();

    tl.to(headline, { opacity: 0, y: -20, duration: 0.5, ease: 'power1.in' })
      .to(underline, { scaleX: 0, duration: 0.3, ease: 'power1.in' }, '<')
      .call(() => {
        headline.textContent = ROLES[next].text;
        underline.style.background = resolveColor(ROLES[next].colorVar);
      })
      .set(headline, { y: 20 })
      .to(headline, { opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.7)' })
      .to(underline, { scaleX: 1, duration: 0.6, ease: 'power2.out' }, '<0.2');

    // Hold via setTimeout, not a trailing GSAP tween on an empty {} target.
    // The empty-object idiom (`.to({}, {duration: X})`) confirmed to never
    // fire its `onComplete` in this GSAP version — it silently stalled the
    // whole rotation forever right after the first entrance played. A plain
    // `setTimeout` sized off `tl.duration()` doesn't depend on the
    // timeline's own completion event at all, sidestepping that.
    setTimeout(() => {
      index = next;
      cycle();
    }, tl.duration() * 1000 + ROLE_HOLD_MS);
  }

  cycle();
}

export function initHeroAnimation(root = document) {
  const logo = root.querySelector('[data-hero-logo]');
  const badge = root.querySelector('[data-hero-badge]');
  const headline = root.querySelector('[data-hero-headline]');
  const underline = root.querySelector('[data-hero-underline]');
  const subtext = root.querySelector('[data-hero-subtext]');
  const cta = root.querySelector('[data-hero-cta]');

  const elements = [logo, badge, headline, underline, subtext, cta];
  if (elements.some((el) => !el)) {
    // eslint-disable-next-line no-console
    console.warn('[hero-animation] missing expected element(s), skipping animation', {
      logo: !!logo, badge: !!badge, headline: !!headline,
      underline: !!underline, subtext: !!subtext, cta: !!cta,
    });
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Underline sweeps in via scaleX, not width/background-size — GPU-accelerated,
  // no layout thrashing. Fixed left origin so it draws on left-to-right.
  gsap.set(underline, { transformOrigin: 'left center' });

  if (prefersReducedMotion) {
    // Matches the legacy site: no carousel at all for reduced motion, just
    // the first role shown statically.
    gsap.set([logo, badge, headline, subtext, cta], { opacity: 1, y: 0 });
    gsap.set(underline, { scaleX: 1 });
    return;
  }

  gsap.set([logo, badge, headline, subtext, cta], { opacity: 0 });
  gsap.set(headline, { y: 40 });
  gsap.set(underline, { scaleX: 0 });

  const tl = gsap.timeline();

  tl.to(logo, { opacity: 1, duration: 0.8, ease: 'power1.out' })
    .to(badge, { opacity: 1, duration: 0.6, ease: 'power1.out' }, '<0.1')
    .to(headline, { opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.7)' }, '<0.2')
    .to(underline, { scaleX: 1, duration: 0.8, ease: 'power2.out' }, '<0.3')
    .to(subtext, { opacity: 1, duration: 0.6, ease: 'power1.out' }, '<0.2')
    .to(cta, { opacity: 1, duration: 0.6, ease: 'power1.out' }, '<0.15');

  // See startRoleRotation's comment: setTimeout, not a trailing empty-{}
  // GSAP tween, for the hold before the carousel starts.
  setTimeout(() => startRoleRotation(headline, underline), tl.duration() * 1000 + ROLE_HOLD_MS);

  return tl;
}
