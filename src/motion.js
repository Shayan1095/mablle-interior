import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';

gsap.registerPlugin(useGSAP);

export function useBootReady() {
  const [ready, setReady] = useState(() => typeof window === 'undefined' || !window.mablleBoot || window.mablleBoot.complete);
  useEffect(() => {
    const finish = () => setReady(true);
    window.addEventListener('mablle:ready', finish);
    if (!window.mablleBoot || window.mablleBoot.complete) finish();
    return () => window.removeEventListener('mablle:ready', finish);
  }, []);
  return ready;
}

export function useSmoothScroll(locked) {
  const instance = useRef(null);
  const lockState = useRef(locked);
  lockState.current = locked;
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: no-preference) and (pointer: fine)');
    let cleanup = () => {};
    const setup = () => {
      cleanup();
      cleanup = () => {};
      if (!media.matches) return;
      const lenis = new Lenis({ duration: 0.45, autoRaf: true, smoothWheel: true, anchors: { offset: -90 }, prevent: node => node.hasAttribute('data-lenis-prevent') });
      instance.current = lenis;
      if (lockState.current) lenis.stop();
      cleanup = () => { lenis.destroy(); instance.current = null; };
    };
    setup();
    media.addEventListener('change', setup);
    return () => { cleanup(); media.removeEventListener('change', setup); };
  }, []);
  useEffect(() => { if (locked) instance.current?.stop(); else instance.current?.start(); }, [locked]);
  return useCallback(target => {
    if (instance.current) instance.current.scrollTo(target, { offset: -84, force: true });
    else document.querySelector(target)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }, []);
}

export function useReveal(ref) {
  useEntranceObserver(ref, '[data-reveal]', el => [
    el.animate([{ opacity: 0.2, transform: 'translateY(26px)' }, { opacity: 1, transform: 'none' }], { duration: 480, easing: 'cubic-bezier(.22,1,.36,1)' }),
  ]);
}

export { gsap, useGSAP };

export function useEditorialReveal(ref) {
  useEntranceObserver(ref, '[data-editorial]', article => {
    const image = article.querySelector('[data-editorial-image] img');
    if (!image) return [];
    // Transform only: avoid repainting a large photograph's clip-path each frame.
    const animations = [image.animate([{ transform: 'scale(1.07)' }, { transform: 'scale(1)' }], { duration: 650, easing: 'cubic-bezier(.22,1,.36,1)' })];
    const caption = article.querySelector('.project-caption');
    if (caption) animations.push(caption.animate([{ opacity: 0.25, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.22,1,.36,1)' }));
    return animations;
  });
}

function useEntranceObserver(ref, selector, animate) {
  const ready = useBootReady();
  const animationFactory = useRef(animate);
  animationFactory.current = animate;
  useEffect(() => {
    if (!ready) return;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const animations = new Set();
    const seen = new WeakSet();
    let observer;
    const stop = () => { observer?.disconnect(); animations.forEach(animation => animation.cancel()); animations.clear(); };
    const setup = () => {
      stop();
      if (media.matches || !('IntersectionObserver' in window) || !Element.prototype.animate) return;
      observer = new IntersectionObserver(entries => {
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting || seen.has(target)) return;
          seen.add(target);
          observer.unobserve(target);
          // Content is visible by default, even before the observer runs.
          for (const animation of animationFactory.current(target)) {
            animations.add(animation);
            animation.onfinish = () => { animation.cancel(); animations.delete(animation); };
          }
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
      ref.current?.querySelectorAll(selector).forEach(el => { if (!seen.has(el)) observer.observe(el); });
    };
    setup();
    media.addEventListener('change', setup);
    return () => { stop(); media.removeEventListener('change', setup); };
  }, [ref, selector, ready]);
}
