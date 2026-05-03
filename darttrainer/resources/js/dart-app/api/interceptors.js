import { dartTranslate } from '../i18n/messages.js';
import { dartSafeDisplayMessage } from '../utils/safeDisplay.js';
import { api } from './client.js';

let _session401Handled = false;
let _accountBanned403Handled = false;

/**
 * Jāizsauc pēc createPinia() un pirms pirmā API pieprasījuma.
 * @param {() => import('pinia').Store | null} getAuthStore
 */
export function installApiInterceptors(getAuthStore) {
  api.interceptors.response.use(
    (r) => r,
    (err) => {
      const status = err.response?.status;
      const url = err.config?.url || '';
      const data = err.response?.data;

      if (status === 403 && data?.code === 'email_unverified') {
        return Promise.reject(err);
      }

      if (status === 403 && data?.code === 'account_banned') {
        if (!_accountBanned403Handled) {
          _accountBanned403Handled = true;
          setTimeout(() => {
            _accountBanned403Handled = false;
          }, 1500);
          try {
            const auth = getAuthStore?.() ?? null;
            const title = dartTranslate('auth.accountBannedTitle');
            if (auth?.accountBanned) {
              auth.accountBanned(title, data.ban_reason ?? null);
            } else {
              const lines = [title, data.ban_reason].filter(Boolean);
              window._dartToast?.(lines.join('\n\n'), 'error');
              window.location.assign('/login');
            }
          } catch (_) {}
        }
        return Promise.reject(err);
      }

      if (status === 419) {
        if (!err.config?.skipErrorToast && typeof window._dartToast === 'function') {
          window._dartToast(dartTranslate('auth.csrfExpired'), 'error');
        }
        return Promise.reject(err);
      }

      if (status === 401) {
        if (url.includes('/auth/me') || url.includes('/auth/logout')) {
          return Promise.reject(err);
        }
        try {
          const auth = getAuthStore?.() ?? null;
          if (auth?.user && !_session401Handled) {
            _session401Handled = true;
            auth.sessionInvalidated(dartTranslate('auth.sessionEnded'));
            setTimeout(() => {
              _session401Handled = false;
            }, 1500);
          }
        } catch (_) {}
        return Promise.reject(err);
      }

      if (!err.config?.skipErrorToast) {
        const raw = err.response?.data?.message ?? err.response?.data?.error;
        const safe =
          typeof dartSafeDisplayMessage === 'function' ? dartSafeDisplayMessage(raw) : String(raw ?? '');
        const fallbackMsg = 'Kļūda. Mēģini vēlreiz.';
        const msg = safe || fallbackMsg;
        if (typeof window._dartToast === 'function') {
          window._dartToast(msg, 'error');
        }
        // Iepriekš šeit bija window.location.assign('/') — tas varēja izraisīt bezgalīgu
        // pārlādēšanu, ja saknes lapa pati trigero kļūdu. Tagad tikai logojam konsole.
        if (!safe && import.meta.env.DEV) {
          console.warn('[DartTrainer] Negaidīta API kļūda bez drošas ziņas:', err);
        }
      }

      return Promise.reject(err);
    },
  );
}
