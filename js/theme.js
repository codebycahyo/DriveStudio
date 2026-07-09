/**
 * theme.js — dark/light theme toggle, persisted via storage.js.
 * The actual attribute is applied as early as possible by a small
 * inline script in each page's <head> (before CSS paints) to avoid
 * a flash of the wrong theme; this module just wires up the toggle
 * button and keeps its icon in sync.
 */

import { getItem, setItem } from './storage.js';

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const icon = document.getElementById('themeIcon');
  if (icon) icon.className = theme === 'light' ? 'bi bi-sun' : 'bi bi-moon-stars';
}

export function initTheme() {
  const toggle = document.getElementById('themeToggle');

  applyTheme(getItem('theme', 'dark'));

  toggle?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(next);
    setItem('theme', next);
  });
}
