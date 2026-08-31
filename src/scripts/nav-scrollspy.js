// Homepage nav scrollspy — sets aria-current="location" on whichever
// .header__nav link's section is scrolled to just under the fixed header.
// rootMargin's top offset is derived from the header's real height (not
// hardcoded), rebuilt only when Header.astro's own breakpoint is crossed.

const MOBILE_QUERY = '(max-width: 640px)';
const BREATHING_ROOM_PX = 24;

function resolveTargets(root) {
  const links = [...root.querySelectorAll('.header__nav a[href^="#"]')];
  return links
    .map((link) => ({ link, section: document.getElementById(link.getAttribute('href').slice(1)) }))
    .filter((target) => target.section);
}

function setActive(targets, activeId) {
  for (const { link, section } of targets) {
    if (section.id === activeId) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  }
}

export function initNavScrollspy(root = document) {
  if (!('IntersectionObserver' in window)) return;

  const targets = resolveTargets(root);
  if (targets.length === 0) return;

  const mobileQuery = window.matchMedia(MOBILE_QUERY);
  let observer;

  function connect() {
    if (observer) observer.disconnect();

    const header = root.querySelector('.header');
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    const headerOffset = 16; // .header's fixed `top` value
    const clearance = Math.round(headerHeight) + headerOffset + BREATHING_ROOM_PX;

    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;
        // Prefer whichever visible section is nearest the header.
        const nearest = visible.reduce((closest, entry) =>
          entry.boundingClientRect.top < closest.boundingClientRect.top ? entry : closest
        );
        setActive(targets, nearest.target.id);
      },
      { rootMargin: `-${clearance}px 0px -55% 0px`, threshold: 0 }
    );

    targets.forEach(({ section }) => observer.observe(section));
  }

  connect();
  mobileQuery.addEventListener('change', connect);
}
