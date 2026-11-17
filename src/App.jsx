import { imageProps } from './images';
import { Arrow } from './Brand';
import Header from './Header';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, ArrowDown, Search, Heart, Menu, X } from 'lucide-react';
import { gsap, useGSAP, useSmoothScroll, useBootReady } from './motion';
import Collection from './Collection';
import Services from './Services';
import Guide from './Guide';
import Projects from './Projects';
import Studio from './Studio';
import Contact, { Footer } from './Contact';
import { defaults, money, products, readFilters, variantPrice } from './catalog';
import { captureProductOrigin } from './product-transition';
const loadOverlay = () => import('./Overlay');
const Overlay = lazy(loadOverlay);

function Hero({ onConsult }) {
  const ref = useRef(null);
  const ready = useBootReady();
  useGSAP(() => {
    if (!ready) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
      timeline.from('.hero-image', { scale: 1.04, duration: 0.7, ease: 'power2.out' }, 0)
        .from('.hero-content .eyebrow', { y: 10, opacity: 0.2, duration: 0.35 }, 0)
        .from('.hero-line > span', { yPercent: 70, opacity: 0.25, duration: 0.55, stagger: 0.06 }, 0)
        .from('.hero-description', { y: 12, opacity: 0.3, duration: 0.35 }, 0.08);
    });
    return () => media.revert();
  }, { scope: ref, dependencies: [ready], revertOnUpdate: true });
  return <section className="hero" id="home" ref={ref} aria-labelledby="hero-heading">
    <img className="hero-image" {...imageProps('hero', 'hero')} alt="A sunlit living room layered with warm timber, natural textures and sculptural furniture" fetchPriority="high" />
    <div className="hero-shade" />
    <div className="hero-content"><p className="eyebrow hero-enter"><span className="tiny-line" /> THE ART OF FEELING AT HOME</p><h1 id="hero-heading"><span className="hero-line"><span>Spaces with soul.</span></span><span className="hero-line"><span>Pieces with <em>purpose.</em></span></span></h1><p className="hero-description hero-enter">Considered furniture. Thoughtful interiors.<br />A home that feels unmistakably yours.</p><div className="hero-buttons hero-enter"><a href="#collections" className="button button-light">Explore collections <Arrow /></a><button className="button button-outline" onClick={onConsult}>Book a consultation <Arrow /></button></div></div>
    <div className="hero-bottom hero-enter"><a href="#collections" className="scroll-cue"><span className="circle"><ArrowDown size={18} strokeWidth={1.3} /></span><span>SCROLL TO DISCOVER</span></a><a href="#projects" className="hero-note"><span className="hero-note-number">01 /</span><span>THE CONSIDERED HOME<small>Warmth, in every detail.</small></span><Arrow size={24} /></a></div>
    <div className="hero-side-label">MABLLE — A NEW PERSPECTIVE ON LIVING</div>
  </section>;
}

export default function App() {
  useEffect(() => {
    if (window.mablleBoot) window.mablleBoot.ready(document.querySelector('.hero-image'));
    else {
      document.getElementById('mablle-preloader')?.remove();
      const fallback = document.getElementById('boot-fallback');
      if (fallback) fallback.hidden = true;
    }
  }, []);
  const [panel, setPanel] = useState(() => { const product = products.find(p => p.id === new URLSearchParams(location.search).get('piece')); return product ? { type: 'product', product } : null; });
  const [filters, setFilters] = useState(() => readFilters(location.search));
  const [saved, setSaved] = useState(() => { try { const value = JSON.parse(localStorage.getItem('mablle-saved') || '[]'); return Array.isArray(value) ? value.filter(id => products.some(p => p.id === id)) : []; } catch { return []; } });
  const [announcement, setAnnouncement] = useState('');
  const jump = useSmoothScroll(Boolean(panel));
  useEffect(() => {
    // Warm the small dialog chunk on intent, before the click needs it.
    let warmed = false;
    const warm = () => { if (warmed) return; warmed = true; void loadOverlay().catch(() => { warmed = false; }); };
    const intent = event => { if (event.target.closest?.('button, [data-product-origin]')) warm(); };
    document.addEventListener('pointerover', intent, { once: false, passive: true });
    document.addEventListener('focusin', intent);
    return () => { document.removeEventListener('pointerover', intent); document.removeEventListener('focusin', intent); };
  }, []);
  useEffect(() => { try { localStorage.setItem('mablle-saved', JSON.stringify(saved)); } catch { /* Browsing remains available when storage is disabled. */ } }, [saved]);
  useEffect(() => { const url = new URL(location.href); Object.entries(filters).forEach(([key, value]) => { if (value !== defaults[key]) url.searchParams.set(key, value); else url.searchParams.delete(key); }); history.replaceState(history.state, '', url); }, [filters]);
  useEffect(() => { const restore = () => { setFilters(readFilters(location.search)); const product = products.find(p => p.id === new URLSearchParams(location.search).get('piece')); setPanel(product ? { type: 'product', product } : null); }; addEventListener('popstate', restore); return () => removeEventListener('popstate', restore); }, []);
  const clearPieceURL = () => { const url = new URL(location.href); url.searchParams.delete('piece'); history.replaceState(history.state, '', url); };
  const close = () => { clearPieceURL(); setPanel(null); };
  const consult = (context = '', interest = 'Interior design') => { clearPieceURL(); setPanel({ type: 'inquiry', context: typeof context === 'string' ? context : '', interest }); };
  const inquire = (product, finish = 0, context = '') => consult(product ? `${product.name} · ${product.finishes[finish].name} · ${money(variantPrice(product, finish))}` : context, product ? 'A particular piece' : 'Interior design');
  const showProduct = (product, event) => { const origin = captureProductOrigin(event?.currentTarget); const url = new URL(location.href); url.searchParams.set('piece', product.id); history.pushState({}, '', url); setPanel({ type: 'product', product, origin }); };
  const toggleSave = id => { const name = products.find(p => p.id === id)?.name; setAnnouncement(`${name} ${saved.includes(id) ? 'removed from' : 'added to'} your saved pieces.`); setSaved(previous => previous.includes(id) ? previous.filter(x => x !== id) : [...previous, id]); };
  const search = () => { jump('#collections'); document.querySelector('#product-search')?.focus({ preventScroll: true }); };
  const browse = () => { close(); requestAnimationFrame(() => jump('#collections')); };
  const browseFromGuide = values => { setFilters(values); setAnnouncement('The collection now shows the pieces matched by your guide.'); jump('#collections'); document.querySelector('#collection-heading')?.focus({ preventScroll: true }); };
  return <><a className="skip-link" href="#main">Skip to content</a><Header onSaved={() => setPanel({ type: 'saved' })} savedCount={saved.length} onSearch={search} onConsult={consult} /><main id="main"><Hero onConsult={consult} /><div className="brand-ribbon"><span>FURNITURE & OBJECTS</span><span className="ribbon-star">✳</span><span>INTERIORS WITH INTENTION</span><span className="ribbon-star">✳</span><span>MADE FOR EVERYDAY LIVING</span></div><Collection filters={filters} setFilters={setFilters} saved={saved} onSave={toggleSave} onProduct={showProduct} /><Services onConsult={consult} /><Guide onProduct={showProduct} onBrowse={browseFromGuide} onConsult={consult} /><Projects onProject={project => setPanel({ type: 'project', project })} onProduct={showProduct} onConsult={consult} /><Studio onConsult={consult} /><Contact /></main><Footer onConsult={consult} onInfo={() => setPanel({ type: 'info' })} /><p className="sr-only" aria-live="polite">{announcement}</p><Suspense fallback={panel ? <div className="loading-panel" role="status">Opening your inspiration…</div> : null}><AnimatePresence>{panel && <Overlay panel={panel} onClose={close} saved={saved} onSave={toggleSave} onProduct={showProduct} onInquire={inquire} onBrowse={browse} />}</AnimatePresence></Suspense></>;
}
