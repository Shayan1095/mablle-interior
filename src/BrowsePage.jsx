import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Search, X, ArrowUpRight, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { ProductCard, BudgetSelect } from './Collection';
import { defaults, filterProducts, money, products } from './catalog';
import { recommendations } from './browse-model';
import { imageProps } from './images';
import './browse.css';

const categories = ['All pieces', 'Seating', 'Tables', 'Lighting'];
const suggestions = ['Lounge chairs', 'Side table', 'Lighting', 'Forest'];

export default function BrowsePage({ filters, setFilters, saved, onSave, onProduct, onConsult, focusSearch = false }) {
  const input = useRef(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const results = filterProducts(filters);
  const edit = recommendations(filters);
  const update = patch => setFilters({ ...filters, ...patch });
  const active = Object.entries(filters).filter(([key, value]) => key !== 'sort' && value !== defaults[key]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (focusSearch) input.current?.focus({ preventScroll: true });
  }, []);
  const describeFilter = (key, value) => key === 'q' ? `“${value}”` : key === 'budget' ? `Up to ${money(Number(value))}` : value;
  const showResults = () => {
    const heading = document.getElementById('browse-results-heading');
    heading?.focus({ preventScroll: true });
    heading?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };

  return <div className="browse-page" id="browse">
    <section className="browse-intro" aria-labelledby="browse-heading">
      <div className="browse-intro-copy"><a href="/#home" className="browse-back"><ArrowLeft size={14} /> Back to the studio</a><p className="eyebrow">THE MABLLE COLLECTION</p><h1 id="browse-heading">Find a piece.<br /><span>Make it yours.</span></h1><p>Thoughtful furniture for the way you live.<br />Explore the details, find your finish, make room for something good.</p></div>
      <div className="browse-vignette"><img {...imageProps('room', 'editorial')} alt="A warm, softly layered living room" loading="lazy" /><span>GOOD COMPANY. GREAT DESIGN.</span></div>
    </section>

    <section className="browse-search-area" aria-label="Find furniture">
      <form role="search" className="browse-search" onSubmit={event => { event.preventDefault(); showResults(); }}>
        <Search size={24} strokeWidth={1.4} aria-hidden="true" /><label className="sr-only" htmlFor="browse-query">Search furniture, materials or finishes</label>
        <input ref={input} id="browse-query" type="search" value={filters.q} onChange={event => update({ q: event.target.value })} placeholder="Try “lounge chairs” or “wood”" maxLength={100} autoComplete="off" aria-describedby="browse-search-hint" />
        {filters.q && <button type="button" className="icon-button" aria-label="Clear search" onClick={() => { update({ q: '' }); input.current?.focus(); }}><X size={18} /></button>}
        <button className="browse-submit" type="submit">Search <ArrowUpRight size={18} /></button>
      </form>
      <div className="browse-suggestions"><span id="browse-search-hint">A PLACE TO START</span>{suggestions.map(query => <button key={query} onClick={() => { setFilters({ ...defaults, q: query }); input.current?.focus({ preventScroll: true }); }}>{query}<ArrowUpRight size={12} /></button>)}</div>
    </section>

    <div className="browse-toolbar"><p><strong>{products.length}</strong> pieces. Plenty of possibility.</p><button className="browse-filter-toggle" onClick={() => setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen} aria-controls="browse-filters"><SlidersHorizontal size={17} /> {filtersOpen ? 'Hide filters' : 'Filter pieces'}{active.length > 0 && <span>{active.length}</span>}</button><label>Sort by <select aria-label="Sort browse results" value={filters.sort} onChange={event => update({ sort: event.target.value })}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label></div>

    <div className="browse-layout">
      <aside id="browse-filters" className={`browse-filters ${filtersOpen ? 'is-open' : ''}`} aria-label="Filter collection" data-lenis-prevent>
        <fieldset><legend>Category</legend>{categories.map(category => <button type="button" key={category} className={filters.category === category ? 'selected' : ''} aria-pressed={filters.category === category} onClick={() => update({ category })}><span>{category}</span><small>{category === 'All pieces' ? products.length : products.filter(product => product.category === category).length}</small></button>)}</fieldset>
        <label className="browse-select-label">Maximum price<BudgetSelect value={filters.budget} onChange={event => update({ budget: event.target.value })} /></label>
        <label className="browse-select-label">Material<select value={filters.material} onChange={event => update({ material: event.target.value })}>{['All materials', 'Upholstery', 'Wood', 'Metal', 'Glass'].map(material => <option key={material}>{material}</option>)}</select></label>
        {active.length > 0 && <button className="browse-reset" onClick={() => setFilters(defaults)}>Clear all filters <X size={14} /></button>}
        <button className="browse-apply-filters" onClick={() => { setFiltersOpen(false); requestAnimationFrame(showResults); }}>Show {results.length} {results.length === 1 ? 'piece' : 'pieces'} <ArrowUpRight size={17} /></button>
        <div className="browse-help"><p>Finding your direction?</p><span>Explore ideas with the Mablle Guide, or plan a space with us.</span><a href="/#guide">Meet your guide <ArrowUpRight size={15} /></a><button onClick={() => onConsult('Help finding the right furniture', 'Interior design')}>Talk about your space <ArrowUpRight size={15} /></button></div>
      </aside>

      <section className="browse-results" aria-labelledby="browse-results-heading">
        <div className="browse-results-top"><h2 id="browse-results-heading" tabIndex={-1}>{filters.q ? `Results for “${filters.q}”` : filters.category === 'All pieces' ? 'All considered pieces' : filters.category}</h2><span role="status" aria-live="polite">{results.length} {results.length === 1 ? 'piece' : 'pieces'}</span></div>
        {active.length > 0 && <div className="browse-active-filters" aria-label="Active filters">{active.map(([key, value]) => <button key={key} onClick={() => update({ [key]: defaults[key] })} aria-label={`Remove ${describeFilter(key, value)} filter`}>{describeFilter(key, value)}<X size={12} /></button>)}</div>}
        {results.length > 0 ? <div className="product-grid browse-product-grid"><AnimatePresence mode="popLayout" initial={false}>{results.map(product => <ProductCard key={product.id} product={product} saved={saved.includes(product.id)} onSave={onSave} onProduct={onProduct} imageLayout="browse" />)}</AnimatePresence></div> : <div className="browse-empty"><Search size={32} strokeWidth={1} /><h3>A different direction, perhaps?</h3><p>No pieces match this search and these filters. Try a simpler phrase or adjust your budget.</p><button className="button button-dark" onClick={() => setFilters(defaults)}>Explore all pieces <ArrowUpRight size={18} /></button></div>}
        <p className="browse-price-note">Prices in PKR · Starting prices shown where finishes vary.<br />Concept collection: products, specifications and prices are illustrative.</p>
      </section>
    </div>

    {edit.products.length > 0 && <section className="browse-recommendations" aria-labelledby="browse-edit-heading"><div className="browse-edit-heading"><div><p className="eyebrow">A LITTLE INSPIRATION</p><h2 id="browse-edit-heading">{edit.title}</h2></div><p>{edit.description}</p></div><div className="browse-edit-grid">{edit.products.map(product => <button data-product-origin key={product.id} onClick={event => onProduct(product, event)} className="browse-edit-card"><img {...imageProps(product.image, 'thumb')} alt={product.alt} loading="lazy" /><span><small>{product.category}</small><strong>{product.name}</strong><span>{money(product.price)}{product.finishes.length > 1 ? ' · from' : ''}</span></span><ArrowUpRight size={19} /></button>)}</div></section>}
    <footer className="browse-footer"><a href="/#home">mablle <span>INTERIORS</span></a><p>Furniture. Interiors. Everyday beauty.</p><span>Client preview · Inquiries are not sent.</span></footer>
  </div>;
}
