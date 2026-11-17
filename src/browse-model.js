import { defaults, filterProducts, products } from './catalog.js';

export function browseURL(filters = defaults) {
  const params = new URLSearchParams({ view: 'shop' });
  for (const [key, value] of Object.entries(filters)) if (key in defaults && value !== defaults[key]) params.set(key, value);
  return `/?${params}`;
}

export const isBrowsePage = search => new URLSearchParams(search).get('view') === 'shop';

export function recommendations(filters, source = products) {
  const matches = filterProducts(filters, source);
  const candidates = filterProducts({ ...filters, q: '', sort: 'featured' }, source);
  const matchingIds = new Set(matches.map(product => product.id));
  const complementary = filters.q.trim() ? candidates.filter(product => !matchingIds.has(product.id)) : [];
  const order = ['arc-chair', 'pebble-table', 'form-lamp', 'alba-chair', 'sora-sofa', 'linea-dining'];
  const choices = (complementary.length ? complementary : candidates).slice().sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id)).slice(0, 3);
  return {
    products: choices,
    title: complementary.length ? (matches.length ? 'A few pieces to go with it.' : 'Other pieces to discover.') : 'The Mablle edit.',
    description: filters.q.trim()
      ? 'Selected from the wider collection. These suggestions respect your category, material and budget filters; they may differ from your search.'
      : 'A small, considered selection to help you find your direction. Each piece fits your selected filters.',
  };
}
