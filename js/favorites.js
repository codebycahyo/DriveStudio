/**
 * favorites.js — shared favorite-car list, backed by storage.js.
 * Single source of truth so the navbar badge, Explore grid, and
 * Car Details page never drift out of sync.
 */

import { getItem, setItem } from './storage.js';

const KEY = 'favorites';

export function getFavorites() {
  return getItem(KEY, []);
}

export function isFavorite(carId) {
  return getFavorites().includes(carId);
}

export function toggleFavorite(carId) {
  const favorites = getFavorites();
  const index = favorites.indexOf(carId);

  if (index === -1) {
    favorites.push(carId);
  } else {
    favorites.splice(index, 1);
  }

  setItem(KEY, favorites);
  return index === -1;
}

export function favoritesCount() {
  return getFavorites().length;
}

export function refreshFavoritesBadge() {
  const badge = document.getElementById('favoritesCount');
  if (!badge) return;

  const count = favoritesCount();
  badge.textContent = String(count);
  badge.hidden = count === 0;
}

/**
 * Wires every .favorite-btn[data-car-id] on the page: reflects the
 * current favorite state and toggles it (plus the navbar badge) on click.
 * Pass onToggle for pages that need to react — e.g. re-filtering a
 * favorites-only list once a card is removed from favorites.
 */
export function initFavoriteButtons(root = document, onToggle) {
  root.querySelectorAll('.favorite-btn[data-car-id]').forEach((button) => {
    const carId = button.dataset.carId;
    const icon = button.querySelector('i');

    const setState = (active) => {
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
      if (icon) icon.className = active ? 'bi bi-heart-fill' : 'bi bi-heart';
    };

    setState(isFavorite(carId));

    button.addEventListener('click', () => {
      const active = toggleFavorite(carId);
      setState(active);
      refreshFavoritesBadge();
      onToggle?.(carId, active);
    });
  });
}
