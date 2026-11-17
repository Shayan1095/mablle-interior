import { imageProps } from './images';
import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, Plus } from 'lucide-react';
import { useReveal } from './motion';
import { services } from './service-data';

export default function Services({ onConsult }) {
  const ref = useRef(null);
  const tabs = useRef([]);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  useReveal(ref);

  function moveSelection(event, index) {
    if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? services.length - 1 : (index + (['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1) + services.length) % services.length;
    setActive(next);
    tabs.current[next]?.focus();
  }

  return <section className="services section-pad" id="design" ref={ref} aria-labelledby="services-heading">
    <div className="section-heading" data-reveal>
      <p className="eyebrow"><span className="section-index">02</span> A MORE PERSONAL PERSPECTIVE</p>
      <div className="heading-row"><h2 id="services-heading">Your space.<br /><span className="muted-light">Our shared vision.</span></h2><div className="heading-aside"><p>A home should tell your story.<br />Let's find the textures, tones and thoughtful<br className="desktop-break" /> details that make it feel like you.</p></div></div>
    </div>
    <div className="services-grid">
      <div className="service-visual" data-reveal>
        {services.map((service, i) => <motion.img key={service.id} {...imageProps(service.image, 'editorial')} alt={active === i ? service.alt : ''} aria-hidden={active !== i} loading="lazy" initial={false} animate={{ opacity: active === i ? 1 : 0, scale: reduced || active === i ? 1 : 1.035 }} transition={{ duration: reduced ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }} style={{ zIndex: active === i ? 1 : 0 }} />)}
        <div className="service-image-shade" /><div className="service-image-caption"><span>THE BEAUTY OF BELONGING</span><p>Less ordinary.<br />More <em>you.</em></p></div><small className="reference-label">REFERENCE INTERIOR</small>
      </div>
      <div className="service-content" data-reveal>
        <p className="service-intro">Good interiors begin with listening.<br />Choose where your story starts.</p>
        <div className="service-selector" role="tablist" aria-label="Design services" aria-orientation="vertical">
          {services.map((service, i) => <button key={service.id} ref={node => { tabs.current[i] = node; }} className={`service-tab ${active === i ? 'active' : ''}`} id={`service-tab-${service.id}`} role="tab" aria-selected={active === i} aria-controls={`service-panel-${service.id}`} tabIndex={active === i ? 0 : -1} onClick={() => setActive(i)} onKeyDown={event => moveSelection(event, i)}><span className="service-index">0{i + 1}</span><span>{service.name}</span><Plus size={20} strokeWidth={1.1} /></button>)}
        </div>
        <div className="service-panel-stack">
          {services.map((service, i) => <motion.div key={service.id} className="service-panel" role="tabpanel" id={`service-panel-${service.id}`} aria-labelledby={`service-tab-${service.id}`} aria-hidden={active !== i} inert={active !== i} tabIndex={active === i ? 0 : -1} initial={false} animate={active === i ? 'visible' : 'hidden'} variants={{ visible: { opacity: 1, transition: { duration: 0.18, staggerChildren: reduced ? 0 : 0.02 } }, hidden: { opacity: 0, transition: { duration: reduced ? 0 : 0.12 } } }}>
            <motion.h3 variants={{ visible: { y: 0, opacity: 1, transition: { duration: reduced ? 0 : 0.18 } }, hidden: { y: reduced ? 0 : 4, opacity: 0 } }}>{service.intro}</motion.h3>
            <motion.p variants={{ visible: { y: 0, opacity: 1, transition: { duration: reduced ? 0 : 0.18 } }, hidden: { y: reduced ? 0 : 4, opacity: 0 } }}>{service.body}</motion.p>
            <motion.span className="service-scope" variants={{ visible: { opacity: 1, transition: { duration: reduced ? 0 : 0.18 } }, hidden: { opacity: 0 } }}>{service.scope}</motion.span>
            <motion.div className="service-price-row" variants={{ visible: { opacity: 1, transition: { duration: reduced ? 0 : 0.18 } }, hidden: { opacity: 0 } }}><span>{service.price}<small>Illustrative service fee</small></span><button onClick={() => onConsult(`${service.name} · ${service.price}`, service.interest)} aria-label={`Discuss ${service.name}`}>Let's explore <ArrowUpRight size={17} /></button></motion.div>
          </motion.div>)}
        </div>
        <p className="service-disclaimer">Furniture and installation are separate. Final scope and fees are confirmed after a consultation.</p>
      </div>
    </div>
    <div className="process-strip" data-reveal>{[['01', 'A conversation', 'Your space. Your ideas. Your everyday.'], ['02', 'A clear direction', 'A thoughtful plan, shaped around you.'], ['03', 'The details, together', 'Pieces and finishes that feel at home.']].map(([number, title, description]) => <div key={number}><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div></div>)}</div>
  </section>;
}
