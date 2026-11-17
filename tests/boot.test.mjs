import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../public/boot.js', import.meta.url), 'utf8');
// Offline lifecycle tests; this is not a browser or visual performance test.
function setup({ seen = false, reduced = false, storageBlocked = false } = {}) {
  let now = 0;
  let id = 0;
  const timers = new Map();
  const classes = () => { const values = new Set(); return { add: value => values.add(value), remove: value => values.delete(value), contains: value => values.has(value) }; };
  const loader = { removed: false, classList: classes(), remove() { this.removed = true; } };
  const root = { childElementCount: 0, inert: false };
  const fallback = { hidden: true };
  const body = { classList: classes() };
  const events = [];
  const store = new Map(seen ? [['mablle-intro-seen', '1']] : []);
  const window = { dispatchEvent: event => events.push(event.type) };
  vm.runInNewContext(source, {
    window, Event, matchMedia: () => ({ matches: reduced }),
    document: { body, getElementById: key => ({ 'mablle-preloader': loader, root, 'boot-fallback': fallback })[key] },
    sessionStorage: { getItem(key) { if (storageBlocked) throw new Error('Disabled'); return store.get(key); }, setItem(key, value) { if (storageBlocked) throw new Error('Disabled'); store.set(key, value); } },
    setTimeout(callback, delay) { const key = ++id; timers.set(key, { callback, time: now + delay }); return key; },
    clearTimeout: key => timers.delete(key),
  });
  const tick = amount => {
    const end = now + amount;
    while (true) {
      const next = [...timers.entries()].filter(([, value]) => value.time <= end).sort((a, b) => a[1].time - b[1].time)[0];
      if (!next) break;
      now = next[1].time; timers.delete(next[0]); next[1].callback();
    }
    now = end;
  };
  return { boot: window.mablleBoot, loader, root, fallback, body, events, store, tick };
}

test('cached hero dismisses immediately with only a short exit fade; hero signal follows removal', () => {
  const page = setup();
  page.root.childElementCount = 1;
  page.boot.ready({ complete: true });
  assert.ok(page.loader.classList.contains('is-leaving'));
  assert.equal(page.boot.complete, false);
  page.tick(180);
  assert.equal(page.loader.removed, true);
  assert.equal(page.root.inert, false);
  assert.deepEqual(page.events, ['mablle:ready']);
  assert.equal(page.store.get('mablle-intro-seen'), '1');
});

test('slow hero has a bounded wait and duplicate ready calls do not duplicate completion', () => {
  const page = setup();
  const image = new EventTarget(); image.complete = false;
  page.boot.ready(image); page.boot.ready(image);
  page.tick(699); assert.equal(page.loader.removed, false);
  page.tick(181); assert.equal(page.loader.removed, true);
  image.dispatchEvent(new Event('load'));
  page.tick(3000);
  assert.deepEqual(page.events, ['mablle:ready']);
});

test('hero load or failure releases the loader without waiting for the deadline', () => {
  for (const event of ['load', 'error']) {
    const page = setup(); const image = new EventTarget(); image.complete = false;
    page.boot.ready(image); image.dispatchEvent(new Event(event)); page.tick(180);
    assert.equal(page.boot.complete, true);
  }
});

test('repeat visit skips the loader without flashing the failure message', () => {
  const page = setup({ seen: true });
  assert.equal(page.loader.removed, true);
  assert.equal(page.fallback.hidden, true);
  page.boot.ready({ complete: true }); page.tick(3000);
  assert.equal(page.fallback.hidden, true);
  assert.deepEqual(page.events, ['mablle:ready']);
});

test('missing app bundle reveals a recovery link on first and repeat visits', () => {
  for (const seen of [false, true]) {
    const page = setup({ seen }); page.tick(2680);
    assert.equal(page.loader.removed, true);
    assert.equal(page.root.inert, false);
    assert.equal(page.fallback.hidden, false);
    page.boot.ready({ complete: true });
    assert.equal(page.fallback.hidden, true);
  }
});

test('reduced motion and unavailable storage remain functional', () => {
  const page = setup({ reduced: true, storageBlocked: true });
  page.boot.ready({ complete: true });
  assert.equal(page.loader.removed, true);
  assert.equal(page.root.inert, false);
  assert.equal(page.boot.complete, true);
});

test('late application initialization does not extend the absolute loader deadline', () => {
  const page = setup(); page.tick(2400);
  const image = new EventTarget(); image.complete = false;
  page.root.childElementCount = 1;
  page.boot.ready(image); page.tick(280);
  assert.equal(page.loader.removed, true);
  assert.equal(page.fallback.hidden, true);
});
