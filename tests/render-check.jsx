import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import assert from 'node:assert/strict';
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import App from '../src/App';
import Overlay from '../src/Overlay';
import InquiryForm from '../src/InquiryForm';
import { products } from '../src/catalog';
import { BudgetSelect } from '../src/Collection';
import { services } from '../src/service-data';
import { imageProps } from '../src/images';

// No browser, navigation or network: only React's server-side markup renderer.
globalThis.location = { search: '', href: 'https://example.invalid/' };
globalThis.localStorage = { getItem: () => null };
const markup = renderToStaticMarkup(<App />);
const ids = [...markup.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'DOM IDs should be unique');
assert.equal((markup.match(/<h1\b/g) || []).length, 1, 'There must be one primary heading');
for (const section of ['home', 'main', 'collections', 'design', 'guide', 'projects', 'studio', 'consultation']) assert.ok(ids.includes(section), `Missing section ${section}`);
for (const [, target] of markup.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(target), `Broken anchor #${target}`);
for (const [, image] of markup.matchAll(/<img[^>]*src="(\/images\/[^\"]+)"/g)) assert.ok(existsSync(path.join(process.cwd(), 'public', image)), `Missing image ${image}`);
assert.ok(markup.includes('Prices in PKR'));
for (const [, srcset] of markup.matchAll(/<img[^>]*srcSet="([^"]+)"/gi)) {
  for (const candidate of srcset.split(', ')) assert.ok(existsSync(path.join(process.cwd(), 'public', candidate.split(' ')[0])), `Missing responsive image ${candidate}`);
}
assert.equal(imageProps('hero', 'hero').sizes, '100vw');
assert.ok(markup.includes('fetchPriority="high"'));
assert.ok(!/<[^>]+data-reveal[^>]+style="[^"]*opacity:0/.test(markup), 'Section content must not start hidden');
assert.ok(markup.includes('Inquiries are not sent'));
assert.ok(markup.includes('type="email"') && markup.includes('required=""'));
console.log('PASS: homepage markup, unique IDs, section destinations, local images and demo disclosures');

const noop = () => {};
for (const type of ['product', 'saved', 'inquiry', 'project', 'info']) {
  const panel = { type, product: products[0], context: 'Room styling · From PKR 35,000', interest: 'Room styling', project: { image: 'room', alt: 'Concept living room', type: 'Living space', name: 'Test concept', description: 'A concept', palette: 'Warm neutral', intention: 'Restful' } };
  const html = renderToStaticMarkup(<Overlay panel={panel} onClose={noop} saved={['sora-sofa']} onSave={noop} onProduct={noop} onInquire={noop} onBrowse={noop} />);
  assert.ok(html.includes('id="overlay-title"'), `${type} dialog needs an accessible title`);
  assert.ok(html.includes('aria-label="Close dialog"'));
  if (type === 'inquiry') assert.ok(html.includes('<option selected="">Room styling</option>'), 'The service inquiry must not default to a product');
}
console.log('PASS: all five dialog types render with labels; service inquiry preserves intent');
const productInquiry = renderToStaticMarkup(<InquiryForm interest="A particular piece" context="Sora Sofa · Forest · PKR 245,000" />);
assert.ok(productInquiry.includes('<option selected="">A particular piece</option>'));
assert.ok(productInquiry.includes('Sora Sofa'));
console.log('PASS: product inquiry context and interest');
assert.ok(markup.includes('role="log"') && markup.includes('id="guide-question"'));
assert.ok(markup.includes('Chat isn&#x27;t saved') || markup.includes("Chat isn't saved"));
for (const service of services) {
  assert.ok(ids.includes(`service-tab-${service.id}`));
  assert.ok(ids.includes(`service-panel-${service.id}`));
}
const customBudget = renderToStaticMarkup(<BudgetSelect value="80000" onChange={noop} />);
assert.ok(customBudget.includes('<option value="80000" selected="">Up to PKR 80,000</option>'));
console.log('PASS: guide accessibility, service control targets and exact custom-budget selection');
writeFileSync('.qa/static-render.html', markup);

globalThis.location = { search: '?view=shop&q=lounge+chairs&budget=100000', href: 'https://example.invalid/?view=shop&q=lounge+chairs&budget=100000' };
const browse = renderToStaticMarkup(<App />);
const browseIds = [...browse.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(browseIds).size, browseIds.length);
assert.equal((browse.match(/<h1\b/g) || []).length, 1);
assert.ok(browse.includes('role="search"') && browse.includes('id="browse-query"'));
assert.ok(browse.includes('value="lounge chairs"') && browse.includes('1 piece'));
assert.ok(browse.includes('Arc Lounge Chair') && browse.includes('PKR 89,000'));
assert.ok(browse.includes('A few pieces to go with it.') && browse.includes('href="/#home"'));
assert.ok(!browse.includes('class="hero"'), 'Browse must be its own page, not a second hidden homepage');
for (const [, target] of browse.matchAll(/href="#([^"]+)"/g)) assert.ok(browseIds.includes(target), `Broken browse anchor #${target}`);
for (const [, image] of browse.matchAll(/<img[^>]*src="(\/images\/[^\"]+)"/g)) assert.ok(existsSync(path.join(process.cwd(), 'public', image)), `Missing browse image ${image}`);
writeFileSync('.qa/browse-render.html', browse);
globalThis.location.search = '?view=shop&q=unknown&budget=10000';
const emptyBrowse = renderToStaticMarkup(<App />);
assert.ok(emptyBrowse.includes('No pieces match this search') && emptyBrowse.includes('0 pieces'));
assert.ok(!emptyBrowse.includes('id="browse-edit-heading"'), 'No recommendations should exceed a restrictive budget');
console.log('PASS: dedicated browse page, restored query, prices, recommendations, empty results and navigation targets');
