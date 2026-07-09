/**
 * utils.js — small, generic helpers reused across pages: the
 * loading screen animation, scroll-reveal, animated counters,
 * and a debounce function (used later by search.js).
 */

const LOADING_MIN_DURATION = 700;

export function initLoadingScreen() {
  const screen = document.getElementById('loadingScreen');
  const bar = document.getElementById('loadingBarFill');
  if (!screen) return;

  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / LOADING_MIN_DURATION, 1);
    if (bar) bar.style.width = `${progress * 100}%`;
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      screen.classList.add('is-hidden');
      screen.setAttribute('aria-hidden', 'true');
    }
  };

  requestAnimationFrame(tick);
}

export function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((target) => observer.observe(target));
}

function animateCounter(element) {
  const target = Number(element.dataset.counter);
  const duration = Number(element.dataset.counterDuration || 1400);
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - (1 - progress) ** 3;
    element.textContent = Math.round(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

export function initCounters() {
  const targets = document.querySelectorAll('[data-counter]');
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  targets.forEach((target) => observer.observe(target));
}

export function debounce(fn, wait = 250) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, wait);
  };
}

export function initAccordion() {
  const accordions = document.querySelectorAll('.accordion-header');
  accordions.forEach(header => {
    header.addEventListener('click', () => {
      const isExpanded = header.getAttribute('aria-expanded') === 'true';
      
      // Close all others first
      accordions.forEach(otherHeader => {
        if (otherHeader !== header) {
          otherHeader.setAttribute('aria-expanded', 'false');
          otherHeader.nextElementSibling.style.maxHeight = '0';
          const icon = otherHeader.querySelector('i');
          if (icon) icon.style.transform = 'rotate(0deg)';
        }
      });
      
      // Toggle current
      header.setAttribute('aria-expanded', !isExpanded);
      const content = header.nextElementSibling;
      const icon = header.querySelector('i');
      
      if (!isExpanded) {
        content.style.maxHeight = content.scrollHeight + 'px';
        if (icon) icon.style.transform = 'rotate(180deg)';
      } else {
        content.style.maxHeight = '0';
        if (icon) icon.style.transform = 'rotate(0deg)';
      }
    });
  });
}
