import { useRef } from 'react';
import { ArrowUpRight, Plus } from 'lucide-react';
import { useReveal } from './motion';
import InquiryForm from './InquiryForm';

const faqs = [
  ['Where can I find product prices?', 'Every collection card shows a price in PKR. Open a piece to see its dimensions, materials and finish options. If a finish changes the price, the detail view updates it before you inquire. All prices in this concept preview are illustrative.'],
  ['Can I get help with just one room?', 'Yes. The demo includes room styling and interior design options, as well as a whole-home concept. Choose the scope that best matches your idea and use the inquiry form to describe your space.'],
  ['Are furniture and installation included in design fees?', 'The illustrative service fees cover design scope only. Furniture, delivery and installation are separate. A final proposal would specify the approved scope and all charges before you proceed.'],
  ['Can I order or book through this preview?', 'This is a front-end client demo. You can browse, save pieces and review a sample inquiry, but no order, payment, appointment or message is submitted. Live contact and booking details will be added after client approval.'],
];

export default function Contact() {
  const ref = useRef(null);
  useReveal(ref);
  return <><section id="consultation" className="contact section-pad" ref={ref} aria-labelledby="contact-heading"><div className="contact-grid"><div className="contact-intro" data-reveal><p className="eyebrow"><span className="section-index">05</span> YOUR NEXT CHAPTER</p><h2 id="contact-heading">Let's make<br />room for<br /><em>your ideas.</em></h2><p>A piece you've fallen for.<br />A room ready for something new.<br />A home you've been dreaming of.</p><span className="contact-caption">EVERY GOOD SPACE STARTS WITH A CONVERSATION.</span><ArrowUpRight className="contact-big-arrow" size={64} strokeWidth={.7} /></div><div className="contact-form-wrap" data-reveal><h3>Tell us what you have in mind.</h3><p>Start with a little about you. We'll take it from there.</p><InquiryForm compact /></div></div><div className="faq-grid" data-reveal><div><p className="eyebrow">A LITTLE CLARITY</p><h3>Good questions.<br />Thoughtful answers.</h3></div><div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<Plus size={19} strokeWidth={1.2} /></summary><p>{answer}</p></details>)}</div></div></section></>;
}

export function Footer({ onConsult, onInfo }) {
  return <footer className="footer"><div className="footer-top"><div><p className="eyebrow">A HOME, MORE YOU.</p><h2>Beautiful living<br />begins here.</h2><button className="text-link" onClick={onConsult}>Start a conversation <ArrowUpRight size={20} /></button></div><div className="footer-links"><div><p>EXPLORE</p><a href="#collections">The collection</a><a href="#design">Interior design</a><a href="#guide">Your Mablle Guide</a><a href="#projects">Our spaces</a></div><div><p>GET TO KNOW US</p><a href="#studio">The Mablle approach</a><a href="#consultation">Plan your space</a><button onClick={onInfo}>About this preview</button></div></div></div><a className="footer-wordmark" href="#home" aria-label="Mablle Interiors — back to top">mablle<span aria-hidden="true">✳</span></a><div className="footer-bottom"><span>© 2026 Mablle Interiors · Concept website</span><span>FURNITURE. INTERIORS. EVERYDAY BEAUTY.</span><span>Prices in PKR <span className="footer-dot" /></span></div><p className="footer-demo">Client preview — products, prices, service offers and project imagery are illustrative. Inquiries are not sent.</p></footer>;
}
