export function visibleRect(rect, viewport) {
  if (!rect || rect.width < 8 || rect.height < 8) return false;
  const visibleWidth = Math.max(0, Math.min(rect.right, viewport.width) - Math.max(rect.left, 0));
  const visibleHeight = Math.max(0, Math.min(rect.bottom, viewport.height) - Math.max(rect.top, 0));
  return (visibleWidth * visibleHeight) / (rect.width * rect.height) > 0.35;
}

export function imageBox(rect) {
  return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
}

export function captureProductOrigin(trigger) {
  const image = trigger?.closest('[data-product-origin]')?.querySelector('img');
  if (!image || !image.complete || !image.naturalWidth) return null;
  const frame = image.closest('.product-photo-button, .saved-image') || image;
  const rect = frame.getBoundingClientRect();
  if (!visibleRect(rect, { width: innerWidth, height: innerHeight })) return null;
  return { node: image, frame, rect: imageBox(rect), src: image.currentSrc || image.src };
}
