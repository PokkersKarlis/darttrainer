import { onMounted, onUnmounted, nextTick, watch, ref } from 'vue';

/** Tukša vieta starp mērogojamo un apakšas nav pēc apmērīšanās. */
const AUTH_FIT_BOTTOM_GAP = 5;
const MARGIN = 0.99;
const EPS = 0.002;
/** Ja augstumā pietrūkst — mēģina šaurāku formu: 100% … 80% no kolonnas (līdz 20% šaurāk) */
const WIDTH_FIT_RATIOS = [1, 0.95, 0.9, 0.85, 0.8];

function authPageEl(v) {
  return v?.closest('.dt-auth-page') || null;
}

function authInnerEl(v) {
  return v?.closest('.dt-auth-page-inner') || null;
}

/**
 * Mobilā apakšējā nav — redzama (nevis display:none). “Ekrāna beigas” = tās augšējā mala.
 */
function getBottomNavEl() {
  if (typeof document === 'undefined') return null;
  return document.querySelector('.dt-shell-mobile-bnav');
}

function isElementLayoutVisible(el) {
  if (!el) return false;
  try {
    const st = window.getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden') return false;
    const r = el.getBoundingClientRect();
    return r.width >= 2 && r.height >= 2;
  } catch (_) {
    return false;
  }
}

function roundF(x) {
  return Math.round(x * 1000) / 1000;
}

/**
 * ah: no .dt-auth-page augšas līdz tam, kur sākas fiksētais footer (bnav augša), ne clientHeight.
 */
function getAvailableForFit(viewportEl) {
  const inner = authInnerEl(viewportEl);
  const page = authPageEl(viewportEl);
  const visW =
    typeof document !== 'undefined'
      ? document.documentElement?.clientWidth ?? window?.innerWidth ?? 0
      : 0;
  const vpW = viewportEl?.clientWidth ?? 1e6;
  const awRaw = Math.min(visW > 0 ? visW : 1e6, inner?.clientWidth ?? 1e6, vpW);

  let ah = 0;
  if (page && typeof page.getBoundingClientRect === 'function') {
    const pageRect = page.getBoundingClientRect();
    const bnav = getBottomNavEl();
    if (bnav && isElementLayoutVisible(bnav)) {
      const navTop = bnav.getBoundingClientRect().top;
      ah = navTop - pageRect.top;
    } else {
      const vv = typeof window !== 'undefined' ? window.visualViewport : null;
      const bottom =
        vv && vv.height > 0 ? vv.offsetTop + vv.height : window?.innerHeight ?? 0;
      ah = bottom - pageRect.top;
    }
  }
  if (ah < 1) {
    ah = page?.clientHeight ?? inner?.clientHeight ?? 0;
  }

  /* Atstarpe pirms bnav (bloka apakšai ~5px) */
  ah = Math.max(0, ah - AUTH_FIT_BOTTOM_GAP);

  if (awRaw < 1 || ah < 1) {
    return { aw: 0, ah: 0 };
  }
  return {
    aw: Math.max(1, awRaw * MARGIN),
    ah: Math.max(1, ah * MARGIN),
  };
}

/**
 * Mērogo visu zīmola + kartes + kājenes bloku starp header un footer.
 * Tikai Y ass (scale(1, f)). Platums: izvēlas 100%…80% no slot, kas dod vislielāko ah/rh (kājene atrodama).
 * Bez CSS transition. f = min(1, ah/rh). Surface jābūt horizontāli centrētam (.dt-auth-fit-vp).
 */
export function useAuthContentFit(watchSources) {
  const viewportRef = ref(null);
  const surfaceRef = ref(null);
  const contentRef = ref(null);

  let roPage;
  let roBnav;
  let raf = 0;
  let debounceTimer;
  let vvTimer;
  let lastF;
  let lastRw;
  let lastRh;
  let lastRoW;
  let lastRoH;

  function reobservePage() {
    const v = viewportRef.value;
    const page = authPageEl(v);
    if (page && roPage) {
      roPage.observe(page);
    }
  }

  function applyFitted() {
    const v = viewportRef.value;
    const s = surfaceRef.value;
    const c = contentRef.value;
    if (!v || !s || !c) return;

    const page = authPageEl(v);
    const inner = authInnerEl(v);
    if (roPage && page) {
      roPage.unobserve(page);
    }

    if (!inner && !page) {
      reobservePage();
      return;
    }

    c.style.removeProperty('transform');
    c.style.removeProperty('will-change');
    c.classList.remove('dt-auth-fit-content--scroll');

    const visW =
      typeof document !== 'undefined'
        ? document.documentElement?.clientWidth ?? window?.innerWidth ?? 1e6
        : 1e6;
    const fromInner = inner?.clientWidth ?? 1e6;
    const fromVp = v?.clientWidth ?? 1e6;
    const slotW = Math.max(1, Math.floor(Math.min(fromInner, fromVp, visW)));

    const { aw, ah } = getAvailableForFit(v);
    if (aw < 1 || ah < 1) {
      c.removeAttribute('style');
      s.removeAttribute('style');
      s.style.maxWidth = '100%';
      s.style.width = '100%';
      lastF = null;
      reobservePage();
      return;
    }

    let bestRw = slotW;
    let bestRh = 1;
    let bestFmetric = -1;
    const seenW = new Set();
    for (const ratio of WIDTH_FIT_RATIOS) {
      const wTry = Math.max(1, Math.floor(ratio * slotW));
      if (seenW.has(wTry)) continue;
      seenW.add(wTry);
      c.style.width = `${wTry}px`;
      c.style.minWidth = '0';
      void c.offsetWidth;
      const rhTry = Math.max(1, c.scrollHeight);
      const fMet = Math.min(1, ah / rhTry);
      if (fMet > bestFmetric + 1e-6 || (Math.abs(fMet - bestFmetric) <= 1e-6 && wTry > bestRw)) {
        bestFmetric = fMet;
        bestRw = wTry;
        bestRh = rhTry;
      }
    }

    const rw = bestRw;
    const rh = bestRh;
    if (rw < 1 || rh < 1) {
      c.removeAttribute('style');
      s.removeAttribute('style');
      s.style.maxWidth = '100%';
      s.style.width = '100%';
      lastF = null;
      reobservePage();
      return;
    }

    const f = roundF(Math.min(1, ah / rh));

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

    s.style.transition = 'none';
    s.style.position = 'relative';
    s.style.overflow = 'hidden';
    s.style.maxWidth = '100%';
    s.style.width = `${Math.round(rw * 1000) / 1000}px`;
    s.style.height = `${Math.round(rh * f * 1000) / 1000}px`;
    s.style.boxSizing = 'border-box';

    c.style.transition = 'none';
    c.style.position = 'absolute';
    c.style.left = '0';
    c.style.top = '0';
    c.style.width = `${rw}px`;
    c.style.transform = `scale(1, ${f})`;
    c.style.transformOrigin = 'top left';
    c.style.boxSizing = 'border-box';

    reobservePage();
  }

  function schedule() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      raf = 0;
      applyFitted();
    });
  }

  function scheduleDebounced(ms = 64) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = 0;
      schedule();
    }, ms);
  }

  function onVisualViewport() {
    lastF = null;
    scheduleDebounced(32);
  }

  onMounted(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('dt-visual-viewport', onVisualViewport, { passive: true });
    }

    roPage = new ResizeObserver((entries) => {
      const e = entries[0];
      if (!e) return;
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
      clearTimeout(vvTimer);
      vvTimer = setTimeout(() => {
        vvTimer = 0;
        schedule();
      }, 48);
    });

    nextTick(() => {
      const v = viewportRef.value;
      const p = v ? authPageEl(v) : null;
      if (p) {
        roPage.observe(p);
      }
      const attachBnavRo = () => {
        const bn = getBottomNavEl();
        if (!bn) return;
        roBnav?.disconnect();
        roBnav = new ResizeObserver(() => {
          lastF = null;
          clearTimeout(vvTimer);
          vvTimer = setTimeout(() => {
            vvTimer = 0;
            schedule();
          }, 40);
        });
        roBnav.observe(bn);
      };
      attachBnavRo();
      [0, 100, 300].forEach((ms) => setTimeout(attachBnavRo, ms));
      schedule();
    });
  });

  onUnmounted(() => {
    roPage?.disconnect();
    roBnav?.disconnect();
    cancelAnimationFrame(raf);
    clearTimeout(debounceTimer);
    clearTimeout(vvTimer);
    if (typeof window !== 'undefined') {
      window.removeEventListener('dt-visual-viewport', onVisualViewport);
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
          const c0 = contentRef.value;
          if (c0) {
            c0.style.removeProperty('transform');
            c0.style.removeProperty('will-change');
            c0.classList.remove('dt-auth-fit-content--scroll');
          }
          scheduleDebounced(56);
        });
      },
      { deep: true, flush: 'post' },
    );
  }

  return { viewportRef, surfaceRef, contentRef, schedule };
}
