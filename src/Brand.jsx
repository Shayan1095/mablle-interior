import { ArrowUpRight } from 'lucide-react';

export function Arrow({ size = 18, ...props }) { return <ArrowUpRight size={size} strokeWidth={1.4} aria-hidden="true" {...props} />; }
export function Logo({ href = '#home' }) { return <a className="logo" href={href} aria-label="Mablle Interiors home"><svg viewBox="0 0 34 36" aria-hidden="true"><path d="M2 32V4h6l9 15L26 4h6v28h-6V15L17 30 8 15v17Z" fill="currentColor" /></svg><span>mablle<span className="logo-sub">I N T E R I O R S</span></span></a>; }
