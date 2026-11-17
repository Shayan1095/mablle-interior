import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import path from 'node:path';

// Artifact budgets, not a replacement for browser timing / Core Web Vitals.
const manifest = JSON.parse(readFileSync('src/image-manifest.json', 'utf8').replace(/^\uFEFF/, ''));
for (const [name, asset] of Object.entries(manifest)) {
  for (const variant of asset.variants) {
    const bytes = statSync(path.join('public', variant.src)).size;
    assert.equal(bytes, variant.bytes, `Stale image manifest: ${variant.src}`);
    assert.ok(bytes < asset.originalBytes, `${name} delivery image exceeds the original`);
  }
}
const hero = manifest.hero;
assert.ok(hero.variants.find(image => image.width === 1920).bytes < 400000, 'Desktop hero budget: 400 kB');
assert.ok(hero.variants.find(image => image.width === 1280).bytes < 210000, 'Medium hero budget: 210 kB');
const html = readFileSync('dist/index.html', 'utf8');
const initialJS = [...new Set([...html.matchAll(/(?:src|href)="(\/assets\/[^\"]+\.js)"/g)].map(match => match[1]))];
assert.ok(html.includes('src="/boot.js"'), 'First-paint loader bootstrap must be included');
initialJS.push('/boot.js');
assert.ok(initialJS.length, 'Build the site before checking its asset budget');
const jsBytes = initialJS.reduce((sum, file) => sum + gzipSync(readFileSync(path.join('dist', file))).length, 0);
assert.ok(jsBytes < 175000, `Initial compressed JS exceeds 175 kB: ${jsBytes}`);
assert.ok(!initialJS.some(file => /Overlay-/.test(file)), 'Dialogs should remain outside the initial download');
assert.ok(html.includes('imagesizes="100vw"') && html.includes('imagesrcset="'), 'Hero preload must match responsive image selection');
const cssPaths = [...html.matchAll(/href="(\/assets\/[^\"]+\.css)"/g)].map(match => match[1]);
for (const file of cssPaths) assert.ok(!/@import/.test(readFileSync(path.join('dist', file), 'utf8')), 'Avoid chained stylesheet/font requests');
console.log(`PASS: initial JavaScript ${(jsBytes / 1000).toFixed(1)} kB gzip; all responsive assets smaller than their originals; matching hero preload; no chained CSS imports.`);
console.log(`Hero: original ${(hero.originalBytes / 1000).toFixed(1)} kB → ${hero.variants.map(image => `${image.width}px ${(image.bytes / 1000).toFixed(1)} kB`).join(', ')}`);
