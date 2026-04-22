import { onMounted, onUnmounted, nextTick, watch, ref } from 'vue';

/**
 * Elementa paredzētā laukuma izmērs + korekcija ar visualViewport (Chrome/Samsung, OSK).
 */
function getAvailableBox(el) {
  if (!el) {
    return { aw: 0, ah: 0 };
  }
  const rect = el.getBoundingClientRect();
  let aw = el.clientWidth;
  let ah = el.clientHeight;
  if (aw < 1 || ah < 1) {
    return { aw, ah };
  }
  const vv = typeof window !== 'undefined' ? window.visualViewport : null;
  if (vv) {
    const toBottomVv = vv.offsetTop + vv.height;
    const visibleH = Math.max(0, toBottomVv - rect.top);
    ah = Math.min(ah, visibleH, vv.height);
    aw = Math.min(aw, vv.width);
  }
  const k = 0.99;
  return { aw: Math.max(1, aw * k), ah: Math.max(1, ah * k) };
}

const EPS = 0.0005;

/**
 * Vienmērīgs mērogs, lai auth saturs (zīmols + karte + kājene) ietilptu
 * viewport slota augstumā. Saturs ResizeObserver tika izņemts, jo transform/surface
 * izmērījumi izsauca bezgalīgu atgriezenisku ciklu (raustīšanās).
 */
export function useAuthContentFit(watchSources) {
  const viewportRef = ref(null);
  const surfaceRef = ref(null);
  const contentRef = ref(null);

  let roVp;
  let raf = 0;
  let onVv;
  let onWin;
  let debounceTimer;
  let lastF;
  let lastRw;
  let lastRh;
  let lastRoW;
  let lastRoH;

  function reobserveViewport() {
    const v = viewportRef.value;
    if (v && roVp) {
      roVp.observe(v);
    }
  }

  function applyFitted() {
    const v = viewportRef.value;
    const s = surfaceRef.value;
    const c = contentRef.value;
    if (!v || !s || !c) return;

    if (roVp) {
      roVp.unobserve(v);
    }

    s.classList.add('dt-auth-fit-surface--measure');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const rw = c.offsetWidth;
        const rh = c.scrollHeight;
        s.classList.remove('dt-auth-fit-surface--measure');
        if (rw < 1 || rh < 1) {
          c.removeAttribute('style');
          s.removeAttribute('style');
          s.style.maxWidth = '380px';
          s.style.width = '100%';
          lastF = null;
          reobserveViewport();
          return;
        }
        const { aw, ah } = getAvailableBox(v);
        if (aw < 1 || ah < 1) {
          c.removeAttribute('style');
          s.removeAttribute('style');
          s.style.maxWidth = '380px';
          s.style.width = '100%';
          lastF = null;
          reobserveViewport();
          return;
        }
        const f = Math.min(1, aw / rw, ah / rh);

        if (
          lastF != null &&
          lastRw != null &&
          lastRh != null &&
          Math.abs(f - lastF) < EPS &&
          Math.abs(rw - lastRw) < 0.5 &&
          Math.abs(rh - lastRh) < 0.5
        ) {
          reobserveViewport();
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
        c.style.willChange = 'transform';
        c.style.boxSizing = 'border-box';

        reobserveViewport();
      });
    });
  }

  function schedule() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      raf = 0;
      applyFitted();
    });
  }

  /** Pārāk biežas izmaiņas (address bar) izlīdzina, lai neraustātos */
  function scheduleDebounced(ms = 80) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = 0;
      schedule();
    }, ms);
  }

  onMounted(() => {
    onVv = () => {
      lastF = null;
      scheduleDebounced(80);
    };
    onWin = () => {
      lastF = null;
      scheduleDebounced(100);
    };
    if (typeof window !== 'undefined' && window.visualViewport) {
      window.visualViewport.addEventListener('resize', onVv, { passive: true });
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', onWin, { passive: true });
    }

    roVp = new ResizeObserver((entries) => {
      const e = entries[0];
      if (!e) {
        return;
      }
      const { width, height } = e.contentRect;
      if (
        lastRoW != null &&
        lastRoH != null &&
        Math.abs(width - lastRoW) < 0.1 &&
        Math.abs(height - lastRoH) < 0.1
      ) {
        return;
      }
      lastRoW = width;
      lastRoH = height;
      lastF = null;
      schedule();
    });

    nextTick(() => {
      if (viewportRef.value) {
        roVp.observe(viewportRef.value);
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
    roVp?.disconnect();
    cancelAnimationFrame(raf);
    clearTimeout(debounceTimer);
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
        nextTick(() => {
          requestAnimationFrame(() => requestAnimationFrame(() => schedule()));
        });
      },
      { deep: true, flush: 'post' }
    );
  }

  return { viewportRef, surfaceRef, contentRef, schedule };
}
