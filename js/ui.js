/**
 * ui.js — small, generic UI behaviors reused wherever the matching
 * markup appears: tabs (Car Details) and the image slider (gallery).
 * Both operate purely on DOM structure/classes, no page-specific logic.
 */

export function initTabs(root = document) {
  root.querySelectorAll('[data-tabs]').forEach((group) => {
    const buttons = group.querySelectorAll('[role="tab"]');

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const targetId = button.getAttribute('aria-controls');

        buttons.forEach((btn) => {
          btn.classList.toggle('is-active', btn === button);
          btn.setAttribute('aria-selected', String(btn === button));
        });

        group.querySelectorAll('.tab-panel').forEach((panel) => {
          const isTarget = panel.id === targetId;
          panel.classList.toggle('is-active', isTarget);
          panel.hidden = !isTarget;
        });
      });
    });
  });
}

export function initSliders(root = document) {
  root.querySelectorAll('.slider').forEach((slider) => {
    const track = slider.querySelector('.slider-track');
    const slides = slider.querySelectorAll('.slider-slide');
    const dots = slider.querySelectorAll('.slider-dot');
    const prevBtn = slider.querySelector('[data-slider-prev]');
    const nextBtn = slider.querySelector('[data-slider-next]');
    if (!track || !slides.length) return;

    let index = 0;

    const render = () => {
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    };

    const goTo = (nextIndex) => {
      index = (nextIndex + slides.length) % slides.length;
      render();
    };

    prevBtn?.addEventListener('click', () => goTo(index - 1));
    nextBtn?.addEventListener('click', () => goTo(index + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

    render();
  });
}
