import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { defaults, filterProducts, products, readFilters, variantPrice } from '../src/catalog.js';

test('a shopper finds the lounge chair within a PKR 100,000 budget', () => {
  assert.deepEqual(filterProducts({ ...defaults, q: 'lounge', category: 'Seating', budget: '100000' }).map(p => p.id), ['arc-chair']);
});
test('combined filters return an honest empty result and reset restores the catalog', () => {
  assert.equal(filterProducts({ ...defaults, category: 'Lighting', material: 'Wood' }).length, 0);
  assert.equal(filterProducts(defaults).length, products.length);
});
test('sort order changes without mutating the editorial product order', () => {
  const original = products.map(p => p.id);
  const result = filterProducts({ ...defaults, sort: 'low' });
  assert.ok(result.every((p, index) => !index || result[index - 1].price <= p.price));
  assert.deepEqual(products.map(p => p.id), original);
});
test('shared filter URLs restore supported values and reject unsupported values', () => {
  assert.deepEqual(readFilters('?q=Arc&category=Seating&budget=100000&sort=low'), { ...defaults, q: 'Arc', category: 'Seating', budget: '100000', sort: 'low' });
  assert.deepEqual(readFilters('?budget=-1&category=Unknown&sort=broken&material=Plastic'), defaults);
});
test('the selected finish determines the inquiry price', () => {
  assert.equal(variantPrice(products[0], 0), 245000);
  assert.equal(variantPrice(products[0], 1), 255000);
});
test('all catalog items have unique IDs, images, dimensions and usable prices', () => {
  assert.equal(new Set(products.map(p => p.id)).size, products.length);
  for (const product of products) {
    assert.ok(existsSync(new URL(`../public/images/${product.image}.jpg`, import.meta.url)));
    assert.ok(product.price > 0 && product.dimensions.endsWith('cm') && product.finishes.length > 0);
  }
});
