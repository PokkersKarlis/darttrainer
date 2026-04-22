import { onMounted, onUnmounted, nextTick, watch, ref } from 'vue';

/**
 * Elementa paredzētā laukuma izmērs + korekcija ar visualViewport (Samsung/Chrome, OSK, URL josla).
 * layout/element.clientHeight bieži ir pārāk liels; pieņemt min ar redzamās zonas apakšējo malu.
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

/**
 * Vienmērīgs mērogs, lai auth saturs (zīmols + karte + kājene) ietilptu
 * viewportRef bez vertikālā/horizontālā scroll — viss bērns samazinās uz vienu koeficientu.
 */
export function useAuthContentFit(watchSources) {
  const viewportRef = ref(null);
  const surfaceRef = ref(null);
  const contentRef = ref(null);

  let roVp;
  let roContent;
  let raf = 0;
  let onVv;
  let onWin;

  function applyFitted() {
    const v = viewportRef.value;
    const s = surfaceRef.value;
    const c = contentRef.value;
    if (!v || !s || !c) return;

    c.removeAttribute('style');
    s.removeAttribute('style');
    s.classList.add('dt-auth-fit-surface--measure');

    // Divi rAF: pēc v-if (klubs) u.c. pārrēķināt izkārtojumu, pirms mērījuma
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const rw = c.offsetWidth;
        const rh = c.scrollHeight;
        s.classList.remove('dt-auth-fit-surface--measure');
        if (rw < 1 || rh < 1) {
          s.style.maxWidth = '380px';
          s.style.width = '100%';
          return;
        }
        const { aw, ah } = getAvailableBox(v);
        if (aw < 1 || ah < 1) {
          s.style.maxWidth = '380px';
          s.style.width = '100%';
          return;
        }
        const f = Math.min(1, aw / rw, ah / rh);

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

  onMounted(() => {
    onVv = () => schedule();
    onWin = () => schedule();
    if (typeof window !== 'undefined' && window.visualViewport) {
      window.visualViewport.addEventListener('resize', onVv);
      window.visualViewport.addEventListener('scroll', onVv);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', onWin);
    }

    roVp = new ResizeObserver(() => schedule());
    roContent = new ResizeObserver(() => schedule());

    nextTick(() => {
      if (viewportRef.value) {
        roVp.observe(viewportRef.value);
      }
      if (contentRef.value) {
        roContent.observe(contentRef.value);
      }
      requestAnimationFrame(() => schedule());
      if (typeof document !== 'undefined' && document.fonts?.ready) {
        document.fonts.ready.then(() => schedule());
      }
    });
  });

  onUnmounted(() => {
    roVp?.disconnect();
    roContent?.disconnect();
    cancelAnimationFrame(raf);
    if (typeof window !== 'undefined' && window.visualViewport) {
      window.visualViewport.removeEventListener('resize', onVv);
      window.visualViewport.removeEventListener('scroll', onVv);
    }
    if (typeof window !== 'undefined' && onWin) {
      window.removeEventListener('resize', onWin);
    }
  });

  if (watchSources) {
    watch(
      watchSources,
      () => {
        nextTick(() => {
          requestAnimationFrame(() => requestAnimationFrame(() => schedule()));
        });
      },
      { deep: true, flush: 'post' }
    );
  }

  return { viewportRef, surfaceRef, contentRef, schedule };
}
