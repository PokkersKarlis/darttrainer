import { onMounted, onUnmounted, nextTick, watch, ref } from 'vue';

/**
 * Vienmērīgs mērogs, lai auth saturs (zīmols + karte + kājene) ietilptu
 * viewportRef bez vertikālā/horizontālā scroll — viss bērns samazinās uz vienu koeficientu.
 */
export function useAuthContentFit(watchSources) {
  const viewportRef = ref(null);
  const surfaceRef = ref(null);
  const contentRef = ref(null);

  let ro;
  let raf = 0;

  function applyFitted() {
    const v = viewportRef.value;
    const s = surfaceRef.value;
    const c = contentRef.value;
    if (!v || !s || !c) return;

    c.removeAttribute('style');
    s.removeAttribute('style');
    s.classList.add('dt-auth-fit-surface--measure');

    requestAnimationFrame(() => {
      const rw = c.offsetWidth;
      const rh = c.scrollHeight;
      s.classList.remove('dt-auth-fit-surface--measure');
      if (rw < 1 || rh < 1) {
        s.style.maxWidth = '380px';
        s.style.width = '100%';
        return;
      }
      const aw = v.clientWidth;
      const ah = v.clientHeight;
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
  }

  function schedule() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      raf = 0;
      applyFitted();
    });
  }

  onMounted(() => {
    ro = new ResizeObserver(() => schedule());
    nextTick(() => {
      if (viewportRef.value) {
        ro.observe(viewportRef.value);
      }
      requestAnimationFrame(() => schedule());
      if (typeof document !== 'undefined' && document.fonts?.ready) {
        document.fonts.ready.then(() => schedule());
      }
    });
  });
  onUnmounted(() => {
    ro?.disconnect();
    cancelAnimationFrame(raf);
  });

  if (watchSources) {
    watch(
      watchSources,
      () => {
        nextTick(() => {
          requestAnimationFrame(() => schedule());
        });
      },
      { deep: true, flush: 'post' }
    );
  }

  return { viewportRef, surfaceRef, contentRef, schedule };
}
