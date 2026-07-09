/**
 * storage.js — single localStorage access point for the whole app.
 * Every key is namespaced under "ds:" so Drive Studio never collides
 * with other data a browser profile might hold.
 */

const NAMESPACE = 'ds';

function namespacedKey(key) {
  return `${NAMESPACE}:${key}`;
}

export function getItem(key, fallback = null) {
  try {
    const raw = localStorage.getItem(namespacedKey(key));
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(namespacedKey(key), JSON.stringify(value));
  } catch {
    /* localStorage unavailable (private mode / quota) — fail silently */
  }
}

export function removeItem(key) {
  localStorage.removeItem(namespacedKey(key));
}
