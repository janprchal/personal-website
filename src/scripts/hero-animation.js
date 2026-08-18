/*
 * Hero entrance animation — ported from legacy-site/js/app.js's hiAnimation().
 *
 * What changed from the original:
 * - The original swept a CSS `background-size` on a `.background-gradient`
 *   text span (needed because the underline had to share a layer with the
 *   text). The new design's headline underline is its own element (a real
 *   Figma rectangle, "Underline bar", 647x24 #FEDE3C behind "Frontend
 *   Developer") — simpler to animate as `transform: scaleX()` from a fixed
 *   left origin, which is also GPU-accelerated (no layout-triggering
 *   width/background-size tween).
 * - The original's `skillsTimeline` looped a rotating-title carousel
 *   ("Frontend Developer" / "Designer" / "Webflow Developer"). The new Hero
 *   has one static headline ("Frontend Developer") — confirmed via Figma
 *   screenshot that the alternate "Frontend developer &" text node is
 *   `visible: false`, a leftover, not a second rotation state — so the
 *   carousel timeline and its resize-driven underline-height recalculation
 *   are dropped entirely, not ported.
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
 *   [data-hero-headline]  — the "Frontend Developer" heading text
 *   [data-hero-underline] — the yellow underline bar behind the headline
 *   [data-hero-subtext]   — the bio paragraph
 *   [data-hero-cta]       — button row (View projects / Get in touch / My resume)
 */

import gsap from 'gsap';

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

  return tl;
}
