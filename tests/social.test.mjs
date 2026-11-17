import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { defaultSiteOrigin, siteOrigin, socialPreviewPlugin } from '../scripts/social-origin.mjs';

test('sharing uses the production domain and supports a future custom domain', () => {
  assert.equal(siteOrigin(), defaultSiteOrigin);
  assert.equal(siteOrigin({ VERCEL_PROJECT_PRODUCTION_URL: 'mablle.example', VERCEL_URL: 'private-preview.example' }), 'https://mablle.example');
  assert.equal(siteOrigin({ SITE_URL: 'https://custom.example/path?q=ignored', VERCEL_PROJECT_PRODUCTION_URL: 'mablle.example' }), 'https://custom.example');
  assert.throws(() => siteOrigin({ SITE_URL: 'http://insecure.example' }));
  assert.throws(() => siteOrigin({ SITE_URL: 'https://name:secret@example.com' }));
});

test('Open Graph image and text exist in static HTML and use the same public origin', () => {
  const template = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const html = socialPreviewPlugin({ SITE_URL: 'https://custom.example' }).transformIndexHtml(template);
  assert.ok(!html.includes(defaultSiteOrigin));
  for (const key of ['og:title', 'og:description', 'og:type', 'og:url', 'og:image', 'og:image:alt', 'twitter:card', 'twitter:image']) {
    const tags = [...html.matchAll(new RegExp(`<meta (?:property|name)="${key}" content="([^"]+)"`, 'g'))];
    assert.equal(tags.length, 1, `${key} should be present exactly once`);
  }
  const image = new URL(html.match(/property="og:image" content="([^"]+)"/)[1]);
  assert.equal(image.origin, 'https://custom.example');
  assert.ok(existsSync(new URL(`../public${image.pathname}`, import.meta.url)));
  assert.ok(html.includes('name="twitter:card" content="summary_large_image"'));
  assert.ok(html.indexOf('property="og:image"') < html.indexOf('</head>'));
});
