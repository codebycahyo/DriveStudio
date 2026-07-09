/**
 * search.js — text search over a list of car card elements.
 * Pure function: takes the current card list and a query, returns
 * the subset whose data-name matches. No DOM wiring here.
 */

export function filterBySearch(cards, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return cards;

  return cards.filter((card) => card.dataset.name.toLowerCase().includes(normalized));
}
