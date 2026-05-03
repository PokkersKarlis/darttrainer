import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../store/index.js';
import { Auth } from '../api/client.js';

/**
 * Centralizēts composable, kas apstrādā:
 * - visibilitychange (ekrāns aizmieg / atbloķējas)
 * - online/offline (tīkla zudums un atjaunošana)
 *
 * Nodrošina:
 * 1) Sesijas pārbaudi pēc "pamošanās" (novērš silent 401 kaskādi).
 * 2) Notifikāciju par tīkla stāvokli (offline → online).
 * 3) Centralizētu "resume" eventu, ko citi store/composable var klausīt.
 *
 * Lietošana: izsaukt vienu reizi App.vue onSetup() — globāli visai SPA.
 */

/** @type {Set<() => void>} Callback'i, kas tiek izsaukti pēc veiksmīgas pamošanās. */
const _resumeCallbacks = new Set();

/** @type {Set<() => void>} Callback'i, kas tiek izsaukti, kad lapa kļūst neredzama (pauze). */
const _pauseCallbacks = new Set();

/**
 * Reģistrē callback, kas tiks izsaukts pēc katras veiksmīgas pamošanās
 * (visibility atgriežas + sesija OK vai tīkls atjaunojas).
 *
 * @param {() => void} fn
 * @returns {() => void} unsubscribe funkcija
 */
export function onAppResume(fn) {
  _resumeCallbacks.add(fn);
  return () => _resumeCallbacks.delete(fn);
}

/**
 * Reģistrē callback, kas tiks izsaukts, kad lapa kļūst neredzama
 * (ekrāns aizmieg, cilvēks pārslēdz tabu utt.).
 * Izmantojams polling apturēšanai.
 *
 * @param {() => void} fn
 * @returns {() => void} unsubscribe funkcija
 */
export function onAppPause(fn) {
  _pauseCallbacks.add(fn);
  return () => _pauseCallbacks.delete(fn);
}

/** Vai šobrīd ir pazaudēts tīkls. */
export const isOffline = ref(!navigator.onLine);

/** Vai notiek sesijas pārbaude pēc pamošanās. */
export const isResuming = ref(false);

/**
 * Pamošanās laika slieksnis (ms).
 * Ja lapa bija paslēpta < MIN_HIDDEN_MS, neverificēm sesiju (tikai atsākam polling).
 * Ja ≥ MIN_HIDDEN_MS, pārbaudām sesiju ar /auth/me pirms atsākšanas.
 */
const MIN_HIDDEN_FOR_AUTH_CHECK_MS = 30_000; // 30s

/** Pēdējais brīdis, kad lapa kļuva neredzama. */
let hiddenAt = 0;

/**
 * Galvenais composable — jāizsauc App.vue <script setup>.
 */
export function useAppResume() {
  const auth = useAuthStore();

  // ─── Visibility change ────────────────────────────────────────────────
  function onVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      hiddenAt = Date.now();
      _firePauseCallbacks();
      return;
    }

    // visible atkal
    const elapsed = hiddenAt ? Date.now() - hiddenAt : 0;
    hiddenAt = 0;

    // Pārlūks atgriezās: atsākam procesu.
    resumeAfterWake(elapsed);
  }

  async function resumeAfterWake(elapsedMs) {
    // Ja nav tīkla — pagaidām (online handler pabeigs).
    if (!navigator.onLine) return;

    const needsAuthCheck = elapsedMs >= MIN_HIDDEN_FOR_AUTH_CHECK_MS;

    if (needsAuthCheck && auth.user) {
      isResuming.value = true;
      try {
        const { data } = await Auth.me();
        if (!data.user) {
          // Sesija beigusies, kamēr bija aizmigusi.
          auth.sessionInvalidated();
          return;
        }
        // Atjaunojam user datus (varēja mainīties, piem. email verified).
        auth.user = data.user;
      } catch (_) {
        // Tīkla kļūda pārbaudē — neizmetam ārā, atsāksim polling un cerēsim.
      } finally {
        isResuming.value = false;
      }
    }

    // Izsaucam visus resume listeners (game polling, friends, lobby utt.)
    _fireResumeCallbacks();
  }

  // ─── Online / Offline ─────────────────────────────────────────────────
  function onOffline() {
    isOffline.value = true;
  }

  function onOnline() {
    isOffline.value = false;
    // Tīkls atgriezās — traktējam kā pamošanos ar garu pauzi.
    resumeAfterWake(MIN_HIDDEN_FOR_AUTH_CHECK_MS);
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────
  onMounted(() => {
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
  });

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  });

  return { isOffline, isResuming };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _fireResumeCallbacks() {
  for (const fn of _resumeCallbacks) {
    try {
      fn();
    } catch (_) {}
  }
}

function _firePauseCallbacks() {
  for (const fn of _pauseCallbacks) {
    try {
      fn();
    } catch (_) {}
  }
}
