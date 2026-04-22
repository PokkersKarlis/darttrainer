import { onMounted, onUnmounted, nextTick, watch, ref } from 'vue';

const MAX_W = 380;
const MARGIN = 0.99;

function authPageEl(v) {
  return v?.closest('.dt-auth-page') || null;
}

function authInnerEl(v) {
  return v?.closest('.dt-auth-page-inner') || null;
}

/**
 * Platumu aw neņemam no .dt-auth-page (tā bieži = pilnam viewport) — rw “uzpūšas” pēc pārrēķina.
 * aw: min(inner, .dt-auth-fit-vp, document); ah: .dt-auth-page (augstumā nestāv f·rh).
 */
function getAvailableForFit(v) {
  const inner = authInnerEl(v);
  const page = authPageEl(v);
  const visW =
    typeof document !== 'undefined'
      ? document.documentElement?.clientWidth ?? window?.innerWidth ?? 0
      : 0;
  const vpW = v?.clientWidth ?? 1e6;
  const awRaw = Math.min(
    visW > 0 ? visW : 1e6,
    inner?.clientWidth ?? 1e6,
    vpW,
  );
  const ah = page?.clientHeight ?? inner?.clientHeight ?? 0;
  if (awRaw < 1 || ah < 1) {
    return { aw: 0, ah: 0 };
  }
  return {
    aw: Math.max(1, awRaw * MARGIN),
    ah: Math.max(1, ah * MARGIN),
  };
}

const EPS = 0.0012;

/**
 * Nenoslēdzam scale mērījumam. offsetWidth/scrollHeight pirms transform (lielākajai daļai pārlūku).
 */
function roundF(x) {
  return Math.round(x * 1000) / 1000;
}

export function useAuthContentFit(watchSources) {
  const viewportRef = ref(null);
  const surfaceRef = ref(null);
  const contentRef = ref(null);

  let roSlot;
  let raf = 0;
  let onVv;
  let onWin;
  let debounceTimer;
  let lastF;
  let lastRw;
  let lastRh;
  let lastRoW;
  let lastRoH;
  let contentWatchTimer;
  let roSlotTimer;

  function reobservePage() {
    const v = viewportRef.value;
    const page = authPageEl(v);
    if (page && roSlot) {
      roSlot.observe(page);
    }
  }

  function applyFitted() {
    const v = viewportRef.value;
    const s = surfaceRef.value;
    const c = contentRef.value;
    if (!v || !s || !c) return;

    const page = authPageEl(v);
    const inner = authInnerEl(v);
    if (roSlot && page) {
      roSlot.unobserve(page);
    }

    requestAnimationFrame(() => {
      if (!inner && !page) {
        reobservePage();
        return;
      }
      c.style.removeProperty('transform');
      c.style.removeProperty('will-change');
      const visW =
        typeof document !== 'undefined'
          ? document.documentElement?.clientWidth ?? window?.innerWidth ?? 1e6
          : 1e6;
      const fromInner = inner?.clientWidth ?? 1e6;
      const fromVp = v?.clientWidth ?? 1e6;
      const slotW = Math.max(
        1,
        Math.floor(Math.min(fromInner, fromVp, visW)),
      );
      const rw = Math.max(1, Math.min(MAX_W, slotW));
      c.style.width = `${rw}px`;
      c.style.minWidth = '0';
      void c.offsetWidth;
      const rh = Math.max(1, c.scrollHeight);
      if (rw < 1 || rh < 1) {
        c.removeAttribute('style');
        s.removeAttribute('style');
        s.style.maxWidth = '380px';
        s.style.width = '100%';
        lastF = null;
        reobservePage();
        return;
      }
      const { aw, ah } = getAvailableForFit(v);
      if (aw < 1 || ah < 1) {
        c.removeAttribute('style');
        s.removeAttribute('style');
        s.style.maxWidth = '380px';
        s.style.width = '100%';
        lastF = null;
        reobservePage();
        return;
      }
      const f = roundF(Math.min(1, aw / rw, ah / rh));

      if (
        lastF != null &&
        lastRw != null &&
        lastRh != null &&
        Math.abs(f - lastF) < EPS &&
        Math.abs(rw - lastRw) < 0.5 &&
        Math.abs(rh - lastRh) < 0.5
      ) {
        reobservePage();
        return;
      }

      lastF = f;
      lastRw = rw;
      lastRh = rh;

      s.style.position = 'relative';
      s.style.overflow = 'hidden';
      s.style.maxWidth = '380px';
      s.style.width = `${Math.round(rw * f * 1000) / 1000}px`;
      s.style.height = `${Math.round(rh * f * 1000) / 1000}px`;
      s.style.marginLeft = 'auto';
      s.style.marginRight = 'auto';
      s.style.boxSizing = 'border-box';

      c.style.position = 'absolute';
      c.style.left = '0';
      c.style.top = '0';
      c.style.width = `${rw}px`;
      c.style.transform = `scale(${f})`;
      c.style.transformOrigin = 'top left';
      c.style.boxSizing = 'border-box';

      reobservePage();
    });
  }

  function schedule() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      raf = 0;
      applyFitted();
    });
  }

  function scheduleDebounced(ms = 100) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = 0;
      schedule();
    }, ms);
  }

  onMounted(() => {
    onVv = () => {
      lastF = null;
      scheduleDebounced(100);
    };
    onWin = () => {
      lastF = null;
      scheduleDebounced(120);
    };
    if (typeof window !== 'undefined' && window.visualViewport) {
      window.visualViewport.addEventListener('resize', onVv, { passive: true });
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', onWin, { passive: true });
    }

    roSlot = new ResizeObserver((entries) => {
      const e = entries[0];
      if (!e) {
        return;
      }
      const { width, height } = e.contentRect;
      if (
        lastRoW != null &&
        lastRoH != null &&
        Math.abs(width - lastRoW) < 0.5 &&
        Math.abs(height - lastRoH) < 0.5
      ) {
        return;
      }
      lastRoW = width;
      lastRoH = height;
      lastF = null;
      clearTimeout(roSlotTimer);
      roSlotTimer = setTimeout(() => {
        roSlotTimer = 0;
        schedule();
      }, 32);
    });

    nextTick(() => {
      const v = viewportRef.value;
      const page = v ? authPageEl(v) : null;
      if (page) {
        roSlot.observe(page);
      }
      requestAnimationFrame(() => schedule());
      if (typeof document !== 'undefined' && document.fonts?.ready) {
        document.fonts.ready.then(() => {
          lastF = null;
          schedule();
        });
      }
    });
  });

  onUnmounted(() => {
    roSlot?.disconnect();
    cancelAnimationFrame(raf);
    clearTimeout(debounceTimer);
    clearTimeout(contentWatchTimer);
    clearTimeout(roSlotTimer);
    if (typeof window !== 'undefined' && window.visualViewport) {
      window.visualViewport.removeEventListener('resize', onVv);
    }
    if (typeof window !== 'undefined' && onWin) {
      window.removeEventListener('resize', onWin);
    }
  });

  if (watchSources) {
    watch(
      watchSources,
      () => {
        lastF = null;
        lastRoW = null;
        lastRoH = null;
        nextTick(() => {
          clearTimeout(contentWatchTimer);
          contentWatchTimer = setTimeout(() => {
            contentWatchTimer = 0;
            requestAnimationFrame(() => {
              const c0 = contentRef.value;
              if (c0) {
                c0.style.removeProperty('transform');
                c0.style.removeProperty('will-change');
              }
              schedule();
            });
          }, 48);
        });
      },
      { deep: true, flush: 'post' }
    );
  }

  return { viewportRef, surfaceRef, contentRef, schedule };
}
