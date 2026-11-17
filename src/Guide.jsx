import { imageProps } from './images';
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, ArrowUp, RotateCcw, MessageCircle } from 'lucide-react';
import { useReveal } from './motion';
import { initialGuideState, respondToGuide, welcomeMessage } from './guide-engine';
import { money, products } from './catalog';

export default function Guide({ onProduct, onBrowse, onConsult }) {
  const section = useRef(null);
  const transcript = useRef(null);
  const input = useRef(null);
  const nextId = useRef(1);
  const [context, setContext] = useState({ ...initialGuideState });
  const [messages, setMessages] = useState([{ id: 0, role: 'assistant', ...welcomeMessage }]);
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState('');
  const reduced = useReducedMotion();
  useReveal(section);

  useEffect(() => {
    const el = transcript.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduced ? 'instant' : 'smooth' });
  }, [messages, reduced]);

  function send(text) {
    const question = text.trim().slice(0, 300);
    if (!question) return;
    const result = respondToGuide(question, context);
    const userId = nextId.current++;
    const answerId = nextId.current++;
    setMessages(previous => [...previous, { id: userId, role: 'user', text: question }, { id: answerId, role: 'assistant', ...result.message }]);
    setContext(result.state);
    setDraft('');
    setStatus('');
    requestAnimationFrame(() => input.current?.focus({ preventScroll: true }));
  }

  function reset() {
    setContext({ ...initialGuideState });
    setMessages([{ id: nextId.current++, role: 'assistant', ...welcomeMessage }]);
    setDraft('');
    setStatus('Conversation reset. Choose a new starting point.');
    requestAnimationFrame(() => input.current?.focus({ preventScroll: true }));
  }

  function takeAction(action) {
    if (action.type === 'collection') onBrowse(action.filters);
    if (action.type === 'inquiry') onConsult(action.context, action.interest);
  }

  return <section id="guide" className="guide section-pad" ref={section} aria-labelledby="guide-heading">
    <div className="guide-intro" data-reveal>
      <p className="eyebrow"><MessageCircle size={15} strokeWidth={1.4} /> THE MABLLE GUIDE</p>
      <h2 id="guide-heading">A little guidance.<br /><span>A clearer direction.</span></h2>
      <p>Something caught your eye?<br />Or not quite sure where to begin?<br />Let's find what feels right for you.</p>
      <ol className="guide-capabilities"><li><span>01</span> Find a piece within your budget</li><li><span>02</span> Explore materials and dimensions</li><li><span>03</span> Choose a direction for your space</li></ol>
      <div className="guide-example"><p>A GOOD PLACE TO START</p><button onClick={() => send('Chairs under 100k')}>“Chairs under 100k” <ArrowUpRight size={17} /></button><button onClick={() => send('What does room styling include?')}>“What does room styling include?” <ArrowUpRight size={17} /></button></div>
      <p className="guide-boundary">A guided demo using the sample catalog.<br />No live agent, booking or message submission.</p>
    </div>
    <div className="guide-window" data-reveal>
      <div className="guide-window-header"><span className="guide-avatar" aria-hidden="true">m.</span><div><h3>Your Mablle Guide</h3><p>Thoughtful help, one question at a time.</p></div><button className="icon-button" onClick={reset} aria-label="Start a new guide conversation" title="Start over"><RotateCcw size={17} strokeWidth={1.5} /></button></div>
      <div ref={transcript} className="guide-transcript" role="log" aria-label="Conversation with the Mablle Guide" aria-live="polite" aria-relevant="additions" data-lenis-prevent tabIndex={0}>
        <div className="guide-conversation-label">YOUR SPACE. YOUR PACE.</div>
        {messages.map((message, index) => <motion.div key={message.id} className={`guide-message guide-message-${message.role}`} initial={message.id === 0 ? false : { opacity: 0, y: reduced ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.22 }}>
          <span className="sr-only">{message.role === 'user' ? 'You' : 'Mablle Guide'}: </span><p>{message.text}</p>
          {message.productIds?.length > 0 && <div className="guide-products">{message.productIds.map(id => { const product = products.find(piece => piece.id === id); return product && <button key={id} data-product-origin onClick={event => onProduct(product, event)} aria-label={`Explore ${product.name}, ${money(product.price)}`}><img {...imageProps(product.image, 'thumb')} alt={product.alt} loading="lazy" /><span>{product.name}<small>{money(product.price)}{product.finishes.length > 1 ? ' · from' : ''}</small></span><ArrowUpRight size={16} /></button>; })}</div>}
          {message.action && <button className="guide-action" onClick={() => takeAction(message.action)}>{message.action.label}<ArrowUpRight size={16} /></button>}
          {index === messages.length - 1 && message.suggestions && <div className="guide-suggestions" role="group" aria-label="Suggested replies">{message.suggestions.map(suggestion => <button key={suggestion} onClick={() => suggestion === 'Start over' ? reset() : send(suggestion)}>{suggestion}</button>)}</div>}
        </motion.div>)}
      </div>
      <form className="guide-compose" onSubmit={event => { event.preventDefault(); send(draft); }}>
        <label className="sr-only" htmlFor="guide-question">Ask the Mablle Guide</label>
        <textarea id="guide-question" ref={input} rows={1} value={draft} maxLength={300} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(draft); } }} placeholder="Ask about a piece, a price, a possibility…" />
        <button type="submit" aria-label="Send message to the guide" disabled={!draft.trim()}><ArrowUp size={20} strokeWidth={1.5} /></button>
      </form>
      <p className="guide-window-note">Guided demo · Sample prices in PKR · Chat isn't saved</p>
      <span className="sr-only" role="status">{status}</span>
    </div>
  </section>;
}
