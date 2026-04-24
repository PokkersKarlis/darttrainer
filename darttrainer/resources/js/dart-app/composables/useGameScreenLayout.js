import { ref, onMounted, onUnmounted } from 'vue';

/** Platuma/augstuma attiecība ≈1 — uzskatām par kvadrātu (īpaši planšetēm). */
const SQUARE_RATIO_MIN = 0.92;
const SQUARE_RATIO_MAX = 1.08;

function readCssViewportSize() {
  if (typeof window === 'undefined') {
    return { w: 1, h: 1 };
  }
  const vv = window.visualViewport;
  const w = vv ? Math.max(1, Math.round(vv.width)) : Math.max(1, window.innerWidth);
  const h = vv ? Math.max(1, Math.round(vv.height)) : Math.max(1, window.innerHeight);
  return { w, h };
}

function classifyAspect(w, h) {
  const r = w / h;
  // “Square” dizainu izmantojam tikai tiešām kvadrātiskos izmēros.
  // Uz planšetēm / desktop logiem (piem., 800–939px platumā) `visualViewport` dažreiz
  // dod gandrīz 1:1 attiecību, kas izraisa nevēlamu pārslēgšanos uz square.
  // Šādos gadījumos gribam saglabāt Landscape dizainu.
  if (r >= SQUARE_RATIO_MIN && r <= SQUARE_RATIO_MAX) {
    if (w >= 800) {
      return { kind: 'landscape', label: 'Landscape' };
    }
    return { kind: 'square', label: 'Square' };
  }
  if (r > SQUARE_RATIO_MAX) {
    return { kind: 'landscape', label: 'Landscape' };
  }
  return { kind: 'portrait', label: 'Portrait' };
}

/**
 * Spēles skatam: faktiskais CSS viewport (visualViewport, ja ir) + klasifikācija.
 * Atjauninās uz resize, orientationchange un visualViewport.resize.
 */
export function useGameScreenLayout() {
  const layoutKind = ref('portrait');
  const layoutLabel = ref('Portrait');
  const layoutWidth = ref(0);
  const layoutHeight = ref(0);
  const layoutAspect = ref('1.000');

  function sync() {
    const { w, h } = readCssViewportSize();
    const { kind, label } = classifyAspect(w, h);
    layoutWidth.value = w;
    layoutHeight.value = h;
    layoutAspect.value = (w / h).toFixed(3);
    layoutKind.value = kind;
    layoutLabel.value = label;
  }

  function onOrientationChange() {
    requestAnimationFrame(() => sync());
  }

  onMounted(() => {
    sync();
    window.addEventListener('resize', sync, { passive: true });
    window.addEventListener('orientationchange', onOrientationChange);
    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('resize', sync, { passive: true });
    }
  });

  onUnmounted(() => {
    window.removeEventListener('resize', sync);
    window.removeEventListener('orientationchange', onOrientationChange);
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    if (vv) {
      vv.removeEventListener('resize', sync);
    }
  });

  return {
    layoutKind,
    layoutLabel,
    layoutWidth,
    layoutHeight,
    layoutAspect,
    syncGameScreenLayout: sync,
  };
}
