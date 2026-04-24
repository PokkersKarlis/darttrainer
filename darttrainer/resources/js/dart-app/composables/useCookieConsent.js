import * as Vue from 'vue';
import { api } from '../api/client.js';

const CONSENT_VERSION = 1;
const STORAGE_KEY = 'dt_cookie_consent_v1';
const ID_COOKIE = 'dt_consent_id';

function getCookie(name) {
  const n = name + '=';
  const parts = String(document.cookie || '').split(';');
  for (const p of parts) {
    const s = p.trim();
    if (s.startsWith(n)) return decodeURIComponent(s.slice(n.length));
  }
  return '';
}

function setCookie(name, value, days = 365) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(String(value))}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
}

function ensureConsentId() {
  let id = getCookie(ID_COOKIE);
  if (id) return id;
  id = (globalThis.crypto?.randomUUID?.() || String(Date.now()) + '-' + Math.random().toString(16).slice(2));
  setCookie(ID_COOKIE, id, 365);
  return id;
}

function safeParse(json) {
  try {
    const v = JSON.parse(String(json || ''));
    return v && typeof v === 'object' ? v : null;
  } catch (_) {
    return null;
  }
}

const state = Vue.reactive({
  hydrated: false,
  open: false,
  // null = not decided yet
  consent: null, // { version, decided_at, necessary:true, functional, analytics, marketing }
});

function defaultConsent() {
  return {
    version: CONSENT_VERSION,
    decided_at: new Date().toISOString(),
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  };
}

function loadFromStorage() {
  const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
  const v = safeParse(raw);
  if (!v || v.version !== CONSENT_VERSION) return null;
  return {
    version: CONSENT_VERSION,
    decided_at: String(v.decided_at || ''),
    necessary: true,
    functional: !!v.functional,
    analytics: !!v.analytics,
    marketing: !!v.marketing,
  };
}

function persist(consent) {
  globalThis.localStorage?.setItem(
    STORAGE_KEY,
    JSON.stringify({
      version: CONSENT_VERSION,
      decided_at: consent.decided_at,
      functional: !!consent.functional,
      analytics: !!consent.analytics,
      marketing: !!consent.marketing,
    }),
  );
}

async function logConsent(consent) {
  try {
    const consentId = ensureConsentId();
    // Ensure CSRF cookie exists for this anonymous POST (API has CSRF middleware).
    try {
      await api.get('/csrf-cookie');
    } catch (_) {}
    await api.post('/consent', {
      consent_id: consentId,
      version: CONSENT_VERSION,
      functional: !!consent.functional,
      analytics: !!consent.analytics,
      marketing: !!consent.marketing,
    });
  } catch (_) {
    // ignore: logging is best-effort
  }
}

function setConsent(next) {
  state.consent = { ...next, necessary: true, version: CONSENT_VERSION };
  persist(state.consent);
  logConsent(state.consent);
}

export function useCookieConsent() {
  if (!state.hydrated) {
    state.consent = loadFromStorage();
    state.hydrated = true;
    if (!state.consent) {
      // show banner until decision
      state.open = true;
    }
  }

  const decided = Vue.computed(() => !!state.consent);
  const canFunctional = Vue.computed(() => !!state.consent?.functional);
  const canAnalytics = Vue.computed(() => !!state.consent?.analytics);
  const canMarketing = Vue.computed(() => !!state.consent?.marketing);

  function acceptAll() {
    setConsent({
      ...defaultConsent(),
      functional: true,
      analytics: true,
      marketing: true,
    });
    state.open = false;
  }

  function rejectAll() {
    setConsent({
      ...defaultConsent(),
      functional: false,
      analytics: false,
      marketing: false,
    });
    state.open = false;
  }

  function savePreferences(p) {
    setConsent({
      ...defaultConsent(),
      functional: !!p.functional,
      analytics: !!p.analytics,
      marketing: !!p.marketing,
    });
    state.open = false;
  }

  function openSettings() {
    state.open = true;
  }

  function close() {
    // cannot close if not decided yet (EU requirement)
    if (!state.consent) return;
    state.open = false;
  }

  return {
    state,
    decided,
    canFunctional,
    canAnalytics,
    canMarketing,
    acceptAll,
    rejectAll,
    savePreferences,
    openSettings,
    close,
  };
}

