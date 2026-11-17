export const products = [
  { id: 'sora-sofa', name: 'Sora Sofa', category: 'Seating', material: 'Upholstery', subtitle: 'Soft lines. A little everyday indulgence.', image: 'sofa', alt: 'Forest green upholstered two-seat sofa with slender timber legs', price: 245000, dimensions: '190 W × 86 D × 78 H cm', description: 'A generous, softly structured seat with a warm timber base. Sora brings a quiet richness to a reading corner or an intimate living room.', finishes: [{ name: 'Forest', color: '#3b5249', extra: 0 }, { name: 'Oat', color: '#c7bca6', extra: 10000 }], label: 'THE SOFT COLLECTION' },
  { id: 'arc-chair', name: 'Arc Lounge Chair', category: 'Seating', material: 'Upholstery', subtitle: 'A softer place to slow down.', image: 'lounge', alt: 'Grey upholstered accent chair with curved back and warm timber legs', price: 89000, dimensions: '68 W × 72 D × 84 H cm', description: 'A gently curved silhouette, textured upholstery and an easy, generous seat. Designed as a quiet companion to the sofa, or a small statement of its own.', finishes: [{ name: 'Pebble', color: '#9b9891', extra: 0 }, { name: 'Linen', color: '#d5cdbb', extra: 5000 }], label: 'AN EVERYDAY FAVORITE' },
  { id: 'alba-chair', name: 'Alba Accent Chair', category: 'Seating', material: 'Upholstery', subtitle: 'Classic character, quietly reimagined.', image: 'chair', alt: 'Cream tufted accent chair with pale turned wooden legs', price: 76000, dimensions: '76 W × 70 D × 80 H cm', description: 'A sculpted, buttoned back and a light timber frame give this occasional chair its considered character. A restful piece for a bedroom or a sunlit corner.', finishes: [{ name: 'Ivory', color: '#e0d8c7', extra: 0 }], label: 'QUIET CHARACTER' },
  { id: 'pebble-table', name: 'Pebble Side Table', category: 'Tables', material: 'Wood', subtitle: 'The little things, beautifully placed.', image: 'table', alt: 'Round white side table with tapered wooden legs beside a bed', price: 38500, dimensions: '48 W × 48 D × 52 H cm', description: 'A simple circular top and tapered legs bring a light touch to bedside essentials. An understated companion for your favorite chair, book and morning coffee.', finishes: [{ name: 'Chalk & oak', color: '#e3ded3', extra: 0 }], label: 'SMALL, CONSIDERED DETAILS' },
  { id: 'form-lamp', name: 'Form Task Lamp', category: 'Lighting', material: 'Metal', subtitle: 'A pool of light. A moment of calm.', image: 'lamp', alt: 'Minimal dark metal adjustable task lamp against a pale wall', price: 26500, dimensions: '28 W × 36 D × 55 H cm', description: 'A purposeful adjustable shade with a clean, familiar silhouette. Bring focused light to a writing desk, a reading nook or a bedside table.', finishes: [{ name: 'Graphite', color: '#4a5050', extra: 0 }], label: 'LIGHT, THOUGHTFULLY PLACED' },
  { id: 'linea-dining', name: 'Linea Dining Setting', category: 'Tables', material: 'Glass', subtitle: 'Gather around something beautiful.', image: 'dining', alt: 'Light glass dining table paired with green upholstered chairs in an airy room', price: 185000, dimensions: '160 W × 90 D × 75 H cm', description: 'A light, reflective table paired with upholstered seating. An inviting setting for long lunches, shared stories and the small rituals that make a home.', finishes: [{ name: 'Glass & forest', color: '#436352', extra: 0 }], label: 'ROOM FOR CONNECTION' },
];
export const money = value => `PKR ${new Intl.NumberFormat('en-PK').format(value)}`;
export const defaults = { q: '', category: 'All pieces', material: 'All materials', budget: 'all', sort: 'featured' };
export function readFilters(search = '') {
  const params = new URLSearchParams(search);
  const values = Object.fromEntries(Object.keys(defaults).map(key => [key, params.get(key) || defaults[key]]));
  if (!['All pieces', 'Seating', 'Tables', 'Lighting'].includes(values.category)) values.category = defaults.category;
  if (!['All materials', 'Upholstery', 'Wood', 'Metal', 'Glass'].includes(values.material)) values.material = defaults.material;
  if (values.budget !== 'all' && (!/^\d+$/.test(values.budget) || Number(values.budget) <= 0 || Number(values.budget) > 100000000)) values.budget = 'all';
  if (!['featured', 'low', 'high'].includes(values.sort)) values.sort = 'featured';
  return values;
}
export function filterProducts(filters, source = products) {
  const query = filters.q.trim().toLowerCase();
  const result = source.filter(p => (!query || `${p.name} ${p.category} ${p.material}`.toLowerCase().includes(query)) && (filters.category === 'All pieces' || p.category === filters.category) && (filters.material === 'All materials' || p.material === filters.material) && (filters.budget === 'all' || p.price <= Number(filters.budget)));
  if (filters.sort === 'low') result.sort((a, b) => a.price - b.price);
  if (filters.sort === 'high') result.sort((a, b) => b.price - a.price);
  return result;
}
export function variantPrice(product, finishIndex = 0) { return product.price + (product.finishes[finishIndex]?.extra || 0); }
