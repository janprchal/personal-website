
const animationMinWidth = window.matchMedia("(min-width: 960px)");
const twoLinesWidth = window.matchMedia("(max-width: 959px)")

const hiTimeline = gsap.timeline({});
const skillsTimeline = gsap.timeline({ repeat: -1 });

/**
 * Height of the underline
 */
let underlineHeight = null;

function setUnderlineHeight() {
  if(twoLinesWidth.matches) {
    underlineHeight = 12;
    return;
  }
  underlineHeight = 36;
}

/**
 * Helper function
 */
function debounce(func, timeout = 100) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args);}, timeout);
  };
}

const handleWindowResize = debounce(e => {
  console.log('restarting');
  setUnderlineHeight();
  main.restart();
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let main;

if (prefersReducedMotion) {
  // Skip the entrance/looping GSAP timelines entirely and show the final state:
  // .hi and .sliding-text-wrapper are opacity:0 by default in CSS until GSAP reveals them.
  const skippedTitles = gsap.utils.toArray('.sliding-text').slice(1);
  gsap.set('.intro, .hi, .sliding-text-wrapper, .header-contact', { autoAlpha: 1 });
  gsap.set(skippedTitles, { display: 'none' });
} else {
  setUnderlineHeight();
  hiAnimation();

  main = gsap.timeline()
    .add(hiTimeline.tweenFromTo('showHeaderStart', 'showHeaderEnd'))
    .add(hiTimeline.tweenFromTo('hiStart', 'hiEnd'))
    .add(hiTimeline.tweenFromTo('skillsStart', 'skillsEnd', { repeat: -1 }));

  window.addEventListener("resize", handleWindowResize);
}


function hiAnimation() {
  const hiHeadings = gsap.utils.toArray('[data-animation="wellcome"]');
  const logo = document.querySelector('.logo');
  const intro = document.querySelector('.intro');
  const contact = document.querySelector('.header-contact');

  hiTimeline.addLabel('showHeaderStart');
  hiTimeline.from(intro, {
    opacity: 0,
    duration: 1,
    
  })
  hiTimeline.from(logo, {
    opacity: 0,
    duration: 1,
    ease: "power1.out",
  })
  hiTimeline.addLabel('showHeaderEnd');

  hiTimeline.addLabel('hiStart');
  hiHeadings.forEach(heading => {
    const underline = heading.querySelector('.background-gradient');
    const underlineWidth = underline.offsetWidth;

    hiTimeline.set(heading, {y: 100, opacity: 0});
    hiTimeline.set(underline, {
      backgroundSize: `0 ${underlineHeight}px`,
    });
    
    hiTimeline.to(heading, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "back.out(1.7)",
    }, '<').to(underline, {
      backgroundSize: `${underlineWidth + 8}px ${underlineHeight}px`,
      duration: 0.8,
    }, '<0.3')
  })  
  hiTimeline.addLabel('hiEnd');
  hiTimeline.from(contact, {
    opacity: 0,
    duration: 0.6
  });

  const titlesWrapper = document.querySelector('.sliding-text-wrapper');
  titlesWrapper.style.opacity = 1;

  const titles = gsap.utils.toArray('.sliding-text');

  hiTimeline.addLabel('skillsStart');
  titles.forEach(title => {
    const underline = title.querySelector('.background-gradient');

    /**
     * When on smaller screens, text might be in two lines
     * then we have to use 100% instead of offsetWidth 
     * (it measures just 1 line)
     * 
     * When on larger screens we want to add to the width
     * 8px for effect
    */
    let underlineWidth;
    if (twoLinesWidth.matches) {
      underlineWidth = '100%'
    } else {
      underlineWidth = `${underline.offsetWidth + 8}px`
    }

    /**
     * Pre-setting background-size height value to prevent
     * this size form animation, should animate just width 
     */
    hiTimeline.set(underline, {
      backgroundSize: `0 ${underlineHeight}px`,
    });
    
    hiTimeline.from(title, {
      opacity: 0,
      y: 100,
      duration: 0.8,
    })
    .to(underline, {
      backgroundSize: `${underlineWidth} ${underlineHeight}px`,
      duration: 0.8,
    }, "<0.3")
    .to(title, {
      opacity: 0,
      y: 100,
      duration: 0.8,
    }, "+=2")
  });
  hiTimeline.addLabel('skillsEnd');
  hiTimeline.addLabel('showContact');

}

