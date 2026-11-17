import { imageProps } from './images';
import { forwardRef, useRef, useState } from 'react';
import { AnimatePresence, motion, useIsPresent } from 'motion/react';
import { Search, SlidersHorizontal, Heart, X, ArrowUpRight } from 'lucide-react';
import { useReveal } from './motion';
import { defaults, filterProducts, money } from './catalog';

export function BudgetSelect({ value, onChange }) {
  return <select value={value} onChange={onChange} aria-label="Maximum product price">
    <option value="all">All prices</option>
    {!['all', '50000', '100000', '200000'].includes(value) && <option value={value}>Up to {money(Number(value))}</option>}
    <option value="50000">Up to PKR 50,000</option>
    <option value="100000">Up to PKR 100,000</option>
    <option value="200000">Up to PKR 200,000</option>
  </select>;
}

export const ProductCard = forwardRef(function ProductCard({ product, saved, onSave, onProduct, imageLayout = 'card' }, forwardedRef) {
  const present = useIsPresent();
  return <motion.article ref={forwardedRef} inert={!present} aria-hidden={!present} layout="position" className="product-card" data-product-origin initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, layout: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}>
    <div data-reveal className={`product-image product-image-${product.image}`}><button className="product-photo-button" onClick={event => onProduct(product, event)} aria-label={`View ${product.name}`}><img {...imageProps(product.image, imageLayout)} alt={product.alt} loading="lazy" /><span className="product-view">Explore piece <ArrowUpRight size={17} /></span></button><button className={`product-save ${saved ? 'is-saved' : ''}`} onClick={() => onSave(product.id)} aria-label={`${saved ? 'Unsave' : 'Save'} ${product.name}`} aria-pressed={saved}><motion.span className="heart-feedback" initial={false} animate={{ scale: saved ? [1, 1.2, 1] : 1 }} transition={{ duration: 0.28 }}><Heart size={18} strokeWidth={1.4} fill={saved ? 'currentColor' : 'none'} /></motion.span></button><span className="product-number">M / {product.id.split('-')[0].toUpperCase()}</span></div>
    <div className="product-info"><div><p className="product-category">{product.category} <span>·</span> {product.material}</p><h3><button onClick={event => onProduct(product, event)}>{product.name}</button></h3></div><p className="product-price">{money(product.price)}{product.finishes.length > 1 && <small>Starting price</small>}</p></div>
    <div className="product-card-bottom"><span className="mini-swatches" aria-label={`Available finishes: ${product.finishes.map(f => f.name).join(', ')}`}>{product.finishes.map(f => <span key={f.name} style={{ background: f.color }} />)}</span><button className="detail-link" onClick={event => onProduct(product, event)}>View details <ArrowUpRight size={13} /></button></div>
  </motion.article>;
});

export default function Collection({ filters, setFilters, saved, onSave, onProduct }) {
  const ref = useRef(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  useReveal(ref);
  const visible = filterProducts(filters);
  const update = patch => setFilters({ ...filters, ...patch });
  const hasFilter = Object.keys(defaults).some(key => filters[key] !== defaults[key]);
  return <section id="collections" className="collection section-light section-pad" ref={ref} aria-labelledby="collection-heading">
    <div className="section-heading" data-reveal><p className="eyebrow"><span className="section-index">01</span> THE MABLLE COLLECTION</p><div className="heading-row"><h2 id="collection-heading" tabIndex={-1}>Good design.<br /><span className="muted-ink">Great company.</span></h2><div className="heading-aside"><p>Pieces to live with, not just look at.<br />Discover thoughtful forms, tactile finishes<br className="desktop-break" /> and a little something unexpected.</p><span className="small-caption">CURATED FOR THE WAY YOU LIVE</span></div></div></div>
    <div className="collection-controls"><div className="category-tabs" role="group" aria-label="Product categories">{['All pieces', 'Seating', 'Tables', 'Lighting'].map((category, i) => <button key={category} className={filters.category === category ? 'active' : ''} aria-pressed={filters.category === category} onClick={() => update({ category })}>{category}{i === 0 && <sup>06</sup>}</button>)}</div><div className="catalog-tools"><label className="search-field"><Search size={17} strokeWidth={1.5} /><input id="product-search" type="search" value={filters.q} onChange={e => update({ q: e.target.value })} placeholder="Find your next favorite" aria-label="Search products" /></label><button className={`filter-toggle ${filtersOpen ? 'active' : ''}`} aria-expanded={filtersOpen} aria-controls="catalog-filters" onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={16} strokeWidth={1.5} /> Filters{(filters.budget !== 'all' || filters.material !== 'All materials') && <span className="filter-dot" />}</button></div></div>
    <AnimatePresence initial={false}>{filtersOpen && <motion.div className="filter-panel" id="catalog-filters" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}><div><label>Budget<BudgetSelect value={filters.budget} onChange={e => update({ budget: e.target.value })} /></label><label>Material<select value={filters.material} onChange={e => update({ material: e.target.value })}>{['All materials', 'Upholstery', 'Wood', 'Metal', 'Glass'].map(x => <option key={x}>{x}</option>)}</select></label><button className="text-button" onClick={() => setFilters(defaults)}>Clear filters <X size={14} /></button><button className="text-button filter-done" onClick={() => setFiltersOpen(false)}>Show {visible.length} pieces <ArrowUpRight size={16} /></button></div></motion.div>}</AnimatePresence>
    <div className="results-row"><p aria-live="polite">{visible.length} considered {visible.length === 1 ? 'piece' : 'pieces'}{hasFilter && <button onClick={() => setFilters(defaults)}>Reset <X size={12} /></button>}</p><label>Sort by <select value={filters.sort} onChange={e => update({ sort: e.target.value })} aria-label="Sort products"><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label></div>
    <div className="product-grid"><AnimatePresence mode="popLayout" initial={false}>{visible.map(product => <ProductCard key={product.id} product={product} saved={saved.includes(product.id)} onSave={onSave} onProduct={onProduct} />)}</AnimatePresence></div>
    {visible.length === 0 && <div className="empty-state"><Search size={28} strokeWidth={1} /><h3>A little too specific?</h3><p>Try another name or broaden your filters.<br />Your next favorite might be one click away.</p><button className="button button-dark" onClick={() => setFilters(defaults)}>Explore all pieces <ArrowUpRight size={17} /></button></div>}
    <div className="collection-footnote"><span>Considered shapes. Honest materials. Everyday beauty.</span><small>Concept collection · Illustrative products & PKR prices</small></div>
  </section>;
}
