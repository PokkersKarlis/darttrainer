/**
 * Redzamā pārlūka lapa (ne device screen / ne vienmēr 100dvh).
 * https://developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API
 */
const VAR_VH = '--dt-visual-vh';
const VAR_VW = '--dt-visual-vw';

let raf = 0;

function readVisualSize() {
  if (typeof window === 'undefined') {
    return { w: 0, h: 0 };
  }
  const vv = window.visualViewport;
  const w = Math.max(0, Math.round((vv && vv.width) || window.innerWidth));
  const h = Math.max(0, Math.round((vv && vv.height) || window.innerHeight));
  return { w, h };
}

function applyVisualSize() {
  if (typeof document === 'undefined') return;
  const { w, h } = readVisualSize();
  const root = document.documentElement;
  if (h > 0) root.style.setProperty(VAR_VH, `${h}px`);
  if (w > 0) root.style.setProperty(VAR_VW, `${w}px`);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('dt-visual-viewport'));
  }
}

function onFrame() {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => {
    raf = 0;
    applyVisualSize();
  });
}

/**
 * Izsauc pirms mount, lai pirmā krasēšana izmanto faktisko visualViewport;
 * reģistrē resize/scroll (iOS) / orientation / bfcache.
 */
export function initVisualViewportSize() {
  if (typeof window === 'undefined') {
    return;
  }
  applyVisualSize();

  const vv = window.visualViewport;
  if (vv) {
    vv.addEventListener('resize', onFrame, { passive: true });
    vv.addEventListener('scroll', onFrame, { passive: true });
  }
  window.addEventListener('resize', onFrame, { passive: true });
  window.addEventListener('orientationchange', () => {
    setTimeout(applyVisualSize, 50);
  });
  window.addEventListener('pageshow', applyVisualSize, { passive: true });
}
