/**
 * filter.js — brand/category filtering and sorting over a list of
 * car card elements. Pure functions: no DOM wiring here.
 */

export function filterByBrandAndCategory(cards, { brand, category }) {
  return cards.filter(
    (card) =>
      (!brand || card.dataset.brand === brand) &&
      (!category || card.dataset.category === category)
  );
}

const SORTERS = {
  'price-asc': (a, b) => Number(a.dataset.price) - Number(b.dataset.price),
  'price-desc': (a, b) => Number(b.dataset.price) - Number(a.dataset.price),
  'power-desc': (a, b) => Number(b.dataset.power) - Number(a.dataset.power),
  'name-asc': (a, b) => a.dataset.name.localeCompare(b.dataset.name),
};

export function sortCards(cards, sortValue) {
  const sorter = SORTERS[sortValue];
  return sorter ? [...cards].sort(sorter) : cards;
}
