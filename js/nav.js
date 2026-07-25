

import { refreshFavoritesBadge } from './favorites.js';

function initStickyScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => navbar.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function initDrawer() {
  const drawer = document.getElementById('navbarDrawer');
  const toggle = document.getElementById('navbarToggle');
  const toggleIcon = document.getElementById('navbarToggleIcon');
  if (!drawer || !toggle) return;

  const setDrawerOpen = (isOpen) => {
    drawer.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    if (toggleIcon) toggleIcon.className = isOpen ? 'bi bi-x-lg' : 'bi bi-list';
  };

  toggle.addEventListener('click', () => setDrawerOpen(!drawer.classList.contains('is-open')));
  drawer.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setDrawerOpen(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setDrawerOpen(false);
  });
}

export function initNavbar() {
  initStickyScroll();
  initDrawer();
  refreshFavoritesBadge();
}
