import test from 'node:test';
import assert from 'node:assert/strict';
import { defaults, filterProducts, readFilters } from '../src/catalog.js';
import { browseURL, isBrowsePage, recommendations } from '../src/browse-model.js';

test('browse links restore search, category, exact budget and ordering', () => {
  const filters = { ...defaults, q: 'lounge chairs', category: 'Seating', budget: '80000', sort: 'low' };
  const url = new URL(browseURL(filters), 'https://example.invalid');
  assert.ok(isBrowsePage(url.search));
  assert.deepEqual(readFilters(url.search), filters);
  assert.equal(url.searchParams.get('piece'), null);
  url.searchParams.set('piece', 'arc-chair');
  assert.ok(isBrowsePage(url.search), 'Product links retain the browse page');
  assert.deepEqual(readFilters(url.search), filters);
  assert.equal(isBrowsePage('?piece=arc-chair'), false);
});

test('search understands plural furniture, multiple words, colors and common synonyms', () => {
  const ids = q => filterProducts({ ...defaults, q }).map(product => product.id);
  assert.deepEqual(ids('lounge chairs'), ['arc-chair']);
  assert.deepEqual(ids('green couch'), ['sora-sofa']);
  assert.deepEqual(ids('wooden table'), ['pebble-table']);
  assert.deepEqual(ids('FOREST'), ['sora-sofa', 'linea-dining']);
  assert.deepEqual(ids('lighting'), ['form-lamp']);
  assert.deepEqual(ids('nonexistent blue cupboard'), []);
  assert.deepEqual(ids('???'), []);
  assert.deepEqual(ids('کرسی'), []);
});

test('recommendations expand the text search but preserve all hard filters', () => {
  const filters = { ...defaults, q: 'chairs', budget: '50000' };
  assert.equal(filterProducts(filters).length, 0);
  const edit = recommendations(filters);
  assert.equal(edit.title, 'Other pieces to discover.');
  assert.deepEqual(edit.products.map(product => product.id), ['pebble-table', 'form-lamp']);
  assert.ok(edit.products.every(product => product.price <= 50000));
  assert.deepEqual(recommendations({ ...filters, category: 'Lighting', material: 'Metal' }).products.map(product => product.id), ['form-lamp']);
});

test('complementary suggestions exclude current matches when alternatives exist', () => {
  const edit = recommendations({ ...defaults, q: 'sofa' });
  assert.equal(edit.title, 'A few pieces to go with it.');
  assert.equal(edit.products.some(product => product.id === 'sora-sofa'), false);
  assert.equal(new Set(edit.products.map(product => product.id)).size, edit.products.length);
});

test('impossible filters never generate misleading recommendations', () => {
  assert.deepEqual(recommendations({ ...defaults, budget: '10000' }).products, []);
  assert.deepEqual(recommendations({ ...defaults, category: 'Lighting', material: 'Wood' }).products, []);
  assert.equal(recommendations(defaults).products.length, 3);
});
