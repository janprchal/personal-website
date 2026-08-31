/*
 * Hero entrance animation, ported from legacy-site/js/app.js. Call
 * initHeroAnimation() once from Hero.astro; it animates whatever
 * [data-hero-*] attribute hooks it finds (logo/badge/headline/underline/
 * subtext/cta) — see Hero.astro's markup for those.
 *
 * Rotating carousel is 2 roles ("Frontend Developer"/"Designer"), not the
 * legacy site's 3 — no "Webflow Developer" variant in the current design.
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

    // setTimeout, not a trailing `.to({}, {duration})` tween — that idiom's
    // onComplete never fires in this GSAP version, stalling the rotation.
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

  setTimeout(() => startRoleRotation(headline, underline), tl.duration() * 1000 + ROLE_HOLD_MS);

  return tl;
}
