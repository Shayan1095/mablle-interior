// Tiny, dependency-free first-visit loader. Runs before the application bundle.
(() => {
  const loader = document.getElementById('mablle-preloader');
  const root = document.getElementById('root');
  const fallback = document.getElementById('boot-fallback');
  const sessionKey = 'mablle-intro-seen';
  let seen = false;
  try { seen = sessionStorage.getItem(sessionKey) === '1'; } catch { /* Storage is optional. */ }
  let leaving = false;
  let appReady = false;
  let failSafe;
  let imageDeadline;
  let clearImageListeners = () => {};
  const boot = { complete: false, ready };
  window.mablleBoot = boot;

  function reveal() {
    if (leaving || boot.complete) return;
    leaving = true;
    if (appReady) clearTimeout(failSafe);
    clearTimeout(imageDeadline);
    clearImageListeners();
    const remove = () => {
      loader?.remove();
      root.inert = false;
      document.body.classList.remove('is-booting');
      boot.complete = true;
      window.dispatchEvent(new Event('mablle:ready'));
    };
    if (seen || matchMedia('(prefers-reduced-motion: reduce)').matches) remove();
    else {
      loader?.classList.add('is-leaving');
      setTimeout(remove, 180);
    }
  }

  function ready(image) {
    appReady = true;
    fallback.hidden = true;
    try { sessionStorage.setItem(sessionKey, '1'); } catch { /* No persistent dependency. */ }
    if (boot.complete || leaving) { clearTimeout(failSafe); return; }
    clearImageListeners();
    clearTimeout(imageDeadline);
    if (!image || image.complete) { reveal(); return; }
    // Never wait for fonts, other sections, or a minimum display duration.
    image.addEventListener('load', reveal, { once: true });
    image.addEventListener('error', reveal, { once: true });
    clearImageListeners = () => { image.removeEventListener('load', reveal); image.removeEventListener('error', reveal); };
    imageDeadline = setTimeout(reveal, 700);
  }

  failSafe = setTimeout(() => {
    if (!appReady && !root.childElementCount) fallback.hidden = false;
    reveal();
  }, 2500);
  if (seen) reveal();
  else {
    root.inert = true;
    document.body.classList.add('is-booting');
  }
})();
