import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Check, ArrowUpRight } from 'lucide-react';

export default function InquiryForm({ context, onDone, compact = false, interest = 'Interior design' }) {
  const [complete, setComplete] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const success = useRef(null);
  useEffect(() => { if (complete) success.current?.focus(); }, [complete]);
  if (complete) return <motion.div className="form-success" ref={success} tabIndex={-1} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><span className="success-check"><Check size={28} strokeWidth={1.3} /></span><p className="eyebrow">YOUR DEMO INQUIRY IS READY</p><h3>Beautiful things<br />start with a conversation.</h3><p>Thank you{name.trim() ? `, ${name.trim().split(' ')[0]}` : ''}. This is a front-end preview, so your inquiry has <strong>not been sent</strong> and no appointment has been booked.</p><button type="button" className="button button-dark" onClick={() => { setComplete(false); onDone?.(); }}>Back to exploring <ArrowUpRight size={18} /></button></motion.div>;
  return <form className={`inquiry-form ${compact ? 'compact' : ''}`} onSubmit={event => { event.preventDefault(); const data = new FormData(event.currentTarget); if (!String(data.get('name')).trim()) { setError('Please enter your name.'); return; } setError(''); setComplete(true); }}>
    {context && <div className="inquiry-context"><small>YOUR INQUIRY</small><p>{context}</p></div>}
    <div className="form-row"><label>Your name <span>*</span><input name="name" autoComplete="name" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required maxLength={100} /></label><label>Email address <span>*</span><input type="email" name="email" autoComplete="email" placeholder="you@example.com" required maxLength={150} /></label></div>
    <div className="form-row"><label>I'm interested in<select name="interest" defaultValue={interest}><option>Interior design</option><option>Room styling</option><option>A particular piece</option><option>A whole-home project</option></select></label><label>Approximate budget <small>(optional)</small><select name="budget" defaultValue=""><option value="">Let's discuss</option><option>Under PKR 100,000</option><option>PKR 100,000–300,000</option><option>PKR 300,000–1,000,000</option><option>Over PKR 1,000,000</option></select></label></div>
    <label>Tell us a little about your space <small>(optional)</small><textarea name="message" rows={3} maxLength={2000} placeholder="Your room, your ideas, what you'd love to change…" /></label>
    {error && <p role="alert" className="form-error">{error}</p>}
    <div className="form-footer"><p>Concept preview only.<br />Your details are not sent or stored.</p><button type="submit" className="button button-dark">Review my inquiry <ArrowUpRight size={18} /></button></div>
  </form>;
}
