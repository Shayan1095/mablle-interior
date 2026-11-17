import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { imageBox, visibleRect } from './product-transition';

export function useProductFlight(dialog, panel, onClose) {
  const reduced = useReducedMotion();
  const [flight, setFlight] = useState(null);
  const closing = useRef(false);
  const id = panel.product?.id;

  // The parent's preceding layout effect has already opened the native dialog.
  useLayoutEffect(() => {
    const wasClosing = closing.current;
    closing.current = false;
    setFlight(null);
    if (wasClosing && reduced) { onClose(); return; }
    const origin = panel.origin;
    if (reduced || panel.type !== 'product' || !origin?.node?.isConnected) return;
    const target = dialog.current?.querySelector('[data-detail-photo]');
    if (!target) return;
    const targetRect = target.getBoundingClientRect();
    const viewport = { width: innerWidth, height: innerHeight };
    if (!visibleRect(targetRect, viewport)) return;
    const originalVisibility = origin.node.style.visibility;
    origin.node.style.visibility = 'hidden';
    setFlight({ phase: 'enter', from: origin.rect, to: imageBox(targetRect), src: origin.src });
    return () => { origin.node.style.visibility = originalVisibility; };
  }, [id, panel.type, reduced, dialog]);

  useEffect(() => {
    if (!flight) return;
    const el = dialog.current;
    const settle = () => { if (closing.current) onClose(); else setFlight(null); };
    window.addEventListener('resize', settle);
    el?.addEventListener('scroll', settle, { passive: true });
    return () => { window.removeEventListener('resize', settle); el?.removeEventListener('scroll', settle); };
  }, [flight, dialog, onClose]);

  function requestClose() {
    if (closing.current) return;
    const target = dialog.current?.querySelector('[data-detail-photo]');
    const origin = panel.origin?.node;
    if (reduced || panel.type !== 'product' || !origin?.isConnected || !target || target.classList.contains('zoomed')) {
      onClose();
      return;
    }
    const viewport = { width: innerWidth, height: innerHeight };
    const destination = (panel.origin.frame || origin).getBoundingClientRect();
    const current = (dialog.current.querySelector('[data-product-flight]') || target).getBoundingClientRect();
    if (!visibleRect(destination, viewport) || !visibleRect(current, viewport)) {
      onClose();
      return;
    }
    closing.current = true;
    setFlight({ phase: 'exit', from: imageBox(current), to: imageBox(destination), src: panel.origin.src });
  }

  function finishFlight(phase) {
    if (phase === 'exit') onClose();
    else setFlight(current => current?.phase === 'enter' ? null : current);
  }

  return { flight, requestClose, finishFlight };
}
