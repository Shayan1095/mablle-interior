import test from 'node:test';
import assert from 'node:assert/strict';
import { initialGuideState, parseBudget, respondToGuide } from '../src/guide-engine.js';
import { filterProducts, products, readFilters } from '../src/catalog.js';
import { services } from '../src/service-data.js';

test('PKR budgets accept local and abbreviated notation, rejecting negatives and ranges', () => {
  assert.equal(parseBudget('chairs under 100k'), 100000);
  assert.equal(parseBudget('under PKR 80,000'), 80000);
  assert.equal(parseBudget('1.5 lakh'), 150000);
  assert.equal(parseBudget('Any budget'), 'all');
  for (const input of ['under -50k', 'under - 50k', '0', 'between 50k and 100k', '50k–100k', '50k to 100k']) assert.equal(parseBudget(input), undefined);
});
test('a chair search and lower-budget follow-up respect the actual catalog', () => {
  const first = respondToGuide('chairs under 100k');
  assert.deepEqual(first.message.productIds, ['alba-chair', 'arc-chair']);
  const followup = respondToGuide('under 80k', first.state);
  assert.deepEqual(followup.message.productIds, ['alba-chair']);
  assert.equal(followup.message.action.filters.budget, '80000');
  assert.deepEqual(filterProducts(followup.message.action.filters).map(p => p.id), followup.message.productIds);
  assert.equal(readFilters('?budget=80000').budget, '80000');
});
test('guided categories and budget answers lead to matching results', () => {
  let result = respondToGuide('Find a piece');
  assert.equal(result.state.stage, 'category');
  result = respondToGuide('Tables', result.state);
  assert.equal(result.state.stage, 'budget');
  result = respondToGuide('Under 50k', result.state);
  assert.deepEqual(result.message.productIds, ['pebble-table']);
});
test('no-match responses do not recommend a more expensive sofa', () => {
  const result = respondToGuide('sofa under 50k');
  assert.deepEqual(result.message.productIds, []);
  assert.equal(result.message.action, null);
  assert.match(result.message.text, /isn't a matching piece/);
});
test('specific product specifications are taken from shared data', () => {
  const result = respondToGuide('What are the Sora dimensions?');
  assert.match(result.message.text, /190 W × 86 D × 78 H cm/);
  assert.deepEqual(result.message.productIds, [products[0].id]);
});
test('basic category price questions answer without forcing a budget flow', () => {
  const result = respondToGuide('How much is a lamp?');
  assert.deepEqual(result.message.productIds, ['form-lamp']);
  assert.equal(result.state.stage, 'results');
  assert.match(respondToGuide('Are your prices final?').message.text, /illustrative/);
});
test('service answers preserve the correct fee and inquiry interest', () => {
  const result = respondToGuide('What does room styling include?');
  assert.ok(result.message.text.includes(services[0].price));
  assert.ok(result.message.text.includes(services[0].scope));
  assert.equal(result.message.action.interest, 'Room styling');
});
test('live inventory and delivery are not fabricated', () => {
  assert.match(respondToGuide('Is Sora in stock?').message.text, /doesn't have live stock/);
  assert.match(respondToGuide('Can you deliver tomorrow?').message.text, /not confirmed/);
  assert.match(respondToGuide('Book an appointment').message.text, /doesn't send messages/);
});
test('reset clears prior category, query and budget', () => {
  const result = respondToGuide('Start over', respondToGuide('chairs under 80k').state);
  assert.deepEqual(result.state, initialGuideState);
  assert.match(respondToGuide('Tell me tomorrow\'s weather', result.state).message.text, /don't have an answer/);
});
