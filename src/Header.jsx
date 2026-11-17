import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Search, Heart, Menu, X } from 'lucide-react';
import { Arrow, Logo } from './Brand';

const navigation = [['Collections', 'collections'], ['Interior design', 'design'], ['Your guide', 'guide'], ['Our spaces', 'projects'], ['The studio', 'studio']];
const lightSections = new Set(['collections', 'guide', 'projects', 'consultation']);

export default function Header({ onSaved, onSearch, savedCount = 0, onConsult, browsing = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('home');
  const [menu, setMenu] = useState(false);
  const menuButton = useRef(null);
  const reduced = useReducedMotion();
  const destination = id => id === 'collections' ? '/?view=shop' : `${browsing ? '/' : ''}#${id}`;
  const current = browsing ? 'collections' : active;

  useEffect(() => {
    const sections = [...document.querySelectorAll('main > section[id], footer')];
    let frame = 0;
    let positions = [];
    let needsMeasure = true;
    const update = () => {
      frame = 0;
      const scrollY = window.scrollY;
      if (needsMeasure) {
        positions = sections.map(section => ({ id: section.id || 'footer', top: section.getBoundingClientRect().top + scrollY }));
        needsMeasure = false;
      }
      setScrolled(scrollY > 40);
      let current = 'home';
      for (const section of positions) if (section.top <= scrollY + 130) current = section.id;
      setActive(current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const invalidate = () => { needsMeasure = true; schedule(); };
    const observer = new ResizeObserver(invalidate);
    sections.forEach(section => observer.observe(section));
    document.querySelector('main') && observer.observe(document.querySelector('main'));
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', invalidate);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', invalidate); };
  }, []);

  useEffect(() => {
    const desktop = matchMedia('(min-width: 761px)');
    const closeOnDesktop = () => { if (desktop.matches) setMenu(false); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!menu) return;
    const close = event => { if (event.key === 'Escape') { setMenu(false); menuButton.current?.focus(); } };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [menu]);

  const itemMotion = { hidden: { opacity: 0, x: reduced ? 0 : -8 }, visible: { opacity: 1, x: 0, transition: { duration: reduced ? 0 : 0.22 } } };
  return <>
    <header className={`site-header ${browsing || scrolled || menu ? 'solid' : ''} ${(browsing || scrolled && lightSections.has(active)) && !menu ? 'on-light' : ''}`}>
      <Logo href={browsing ? '/#home' : '#home'} />
      <nav className="desktop-nav" aria-label="Main navigation">
        {navigation.map(([label, id]) => <a key={id} href={destination(id)} aria-current={current === id ? 'location' : undefined}>{label}{current === id && <motion.span className="nav-underline" layoutId="desktop-navigation-active" transition={{ duration: reduced ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }} />}</a>)}
      </nav>
      <div className="header-actions">
        <button className="icon-button" aria-label="Search collection" onClick={() => { setMenu(false); onSearch(); }}><Search size={19} strokeWidth={1.5} /></button>
        <button className="icon-button saved-nav" aria-label={`Saved pieces (${savedCount})`} onClick={onSaved}><Heart size={19} strokeWidth={1.5} />{savedCount > 0 && <span>{savedCount}</span>}</button>
        <button className="header-consult" onClick={onConsult}>Let's talk <Arrow /></button>
        <button ref={menuButton} className="icon-button mobile-menu-toggle" aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} aria-controls="mobile-navigation" onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button>
      </div>
    </header>
    <AnimatePresence>{menu && <motion.nav id="mobile-navigation" className="mobile-navigation" aria-label="Mobile navigation" initial="hidden" animate="visible" exit="hidden" variants={{ hidden: { opacity: 0, transition: { duration: reduced ? 0 : 0.15 } }, visible: { opacity: 1, transition: { duration: reduced ? 0 : 0.15, staggerChildren: reduced ? 0 : 0.045 } } }}>
      {navigation.map(([label, id], i) => <motion.a variants={itemMotion} key={id} href={destination(id)} aria-current={current === id ? 'location' : undefined} onClick={() => setMenu(false)}><small>0{i + 1}</small>{label}<Arrow size={26} /></motion.a>)}
      <motion.button variants={itemMotion} onClick={() => { setMenu(false); onConsult(); }}>Book a consultation <Arrow /></motion.button>
    </motion.nav>}</AnimatePresence>
  </>;
}
