
export function filterBySearch(cards, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return cards;

  return cards.filter((card) => card.dataset.name.toLowerCase().includes(normalized));
}
