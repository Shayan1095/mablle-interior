import test from 'node:test';
import assert from 'node:assert/strict';
import { imageBox, visibleRect } from '../src/product-transition.js';

test('image flight requires a meaningful visible origin', () => {
  const viewport = { width: 390, height: 800 };
  assert.equal(visibleRect({ left: 20, top: 100, right: 200, bottom: 300, width: 180, height: 200 }, viewport), true);
  assert.equal(visibleRect({ left: 20, top: -600, right: 200, bottom: -400, width: 180, height: 200 }, viewport), false);
  assert.equal(visibleRect({ left: 20, top: 790, right: 200, bottom: 990, width: 180, height: 200 }, viewport), false);
  assert.equal(visibleRect(null, viewport), false);
});
test('image geometry uses viewport coordinates rather than page offsets', () => {
  assert.deepEqual(imageBox({ left: 25, top: 90, width: 160, height: 220 }), { x: 25, y: 90, width: 160, height: 220 });
});
