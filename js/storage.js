
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
  try {
    localStorage.removeItem(namespacedKey(key));
  } catch {
    /* ignore */
  }
}
