// API wrapper — visi pieprasījumi iet caur šo
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

/** i18n key lookup without Pinia (api loads before app mount; DART_I18N from messages.js) */
function dartTranslate(key) {
  try {
    const loc = (typeof localStorage !== 'undefined' && localStorage.getItem('dt_locale')) || 'lv';
    const parts = String(key).split('.');
    const walk = (lang) => {
      let cur = window.DART_I18N?.[lang];
      for (const p of parts) {
        cur = cur?.[p];
      }
      return typeof cur === 'string' ? cur : null;
    };
    return walk(loc) || walk('en') || key;
  } catch (_) {
    return key;
  }
}

let _session401Handled = false;
let _accountBanned403Handled = false;

// Global error interceptor (set config.skipErrorToast = true to handle manually)
api.interceptors.response.use(
  r => r,
  err => {
    const status = err.response?.status;
    const url = err.config?.url || '';
    const data = err.response?.data;

    if (status === 403 && data?.code === 'account_banned') {
      if (!_accountBanned403Handled) {
        _accountBanned403Handled = true;
        setTimeout(() => { _accountBanned403Handled = false; }, 1500);
        try {
          const auth = typeof useAuthStore === 'function' ? useAuthStore() : null;
          const title = dartTranslate('auth.accountBannedTitle');
          if (auth?.accountBanned) {
            auth.accountBanned(title, data.ban_reason ?? null);
          } else {
            const lines = [title, data.ban_reason].filter(Boolean);
            window._dartToast?.(lines.join('\n\n'), 'error');
            window.location.hash = '/login';
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
        const auth = typeof useAuthStore === 'function' ? useAuthStore() : null;
        if (auth?.user && !_session401Handled) {
          _session401Handled = true;
          auth.sessionInvalidated(dartTranslate('auth.sessionEnded'));
          setTimeout(() => { _session401Handled = false; }, 1500);
        }
      } catch (_) {}
      return Promise.reject(err);
    }

    if (!err.config?.skipErrorToast) {
      const raw = err.response?.data?.message ?? err.response?.data?.error;
      const safe = typeof dartSafeDisplayMessage === 'function' ? dartSafeDisplayMessage(raw) : String(raw ?? '');
      const msg = safe || 'Kļūda. Mēģini vēlreiz.';

      if (typeof window._dartToast === 'function') {
        window._dartToast(msg, 'error');
      }
    }

    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
const Auth = {
  me:       ()     => api.get('/auth/me'),
  login:    data   => api.post('/auth/login', data),
  register: data   => api.post('/auth/register', data),
  logout:   (config) => api.post('/auth/logout', {}, config || {}),
};

// ── Rooms ─────────────────────────────────────────────────────────────────────
const Rooms = {
  myActive: (config = {}) => api.get('/rooms/my-active', config),
  myActives: () => api.get('/rooms/my-actives'),
  create:   data         => api.post('/rooms', data),
  join:     data         => api.post('/rooms/join', data),
  show:     id           => api.get(`/rooms/${id}`),
  start:    (id, data)   => api.post(`/rooms/${id}/start`, data),
  leave:    (id, config = {}) => api.delete(`/rooms/${id}`, config),
};

const Friends = {
  search:   (q)          => api.get('/friends/search', { params: { q } }),
  list:     ()          => api.get('/friends'),
  incoming: ()          => api.get('/friends/requests/incoming'),
  outgoing: ()          => api.get('/friends/requests/outgoing'),
  sendRequest: (user_id) => api.post('/friends/requests', { user_id }),
  accept:   (id)         => api.post(`/friends/requests/${id}/accept`),
  reject:   (id)         => api.post(`/friends/requests/${id}/reject`),
  remove:   (userId)    => api.delete(`/friends/${userId}`),
};

const GuestPresets = {
  list:   ()            => api.get('/guest-presets'),
  create: (name)        => api.post('/guest-presets', { name }),
  delete: (id)          => api.delete(`/guest-presets/${id}`),
};

// ── Game (multiplayer) ────────────────────────────────────────────────────────
const Game = {
  state:   (matchId, config = {}) => api.get(`/games/${matchId}/state`, config),
  throw:   (matchId, d)  => api.post(`/games/${matchId}/throw`, d),
  undo:    (matchId, data = {}, config = {}) => api.post(`/games/${matchId}/undo`, data, config),
  history: matchId       => api.get(`/games/${matchId}/history`),
  protocol: matchId       => api.get(`/games/${matchId}/protocol`),
  abandon: (matchId, data = {}, config = {}) => api.post(`/games/${matchId}/abandon`, data, config),
  suspendLocal: (matchId, data = {}, config = {}) => api.post(`/games/${matchId}/suspend-local`, data, config),
  resume: (matchId, data = {}, config = {}) => api.post(`/games/${matchId}/resume`, data, config),
  discardSuspended: (matchId, data = {}, config = {}) => api.post(`/games/${matchId}/discard-suspended`, data, config),
  turnTimeoutGrantExtra: (matchId, data = {}, config = {}) => api.post(`/games/${matchId}/turn-timeout/grant-extra`, data, config),
  turnTimeoutEndNoStats: (matchId, data = {}, config = {}) => api.post(`/games/${matchId}/turn-timeout/end-no-stats`, data, config),
};

const Stats = {
  me:          ()         => api.get('/stats/me'),
  leaderboard: (gameType) => api.get('/stats/leaderboard', { params: { game_type: gameType } }),
  recentMatches: (params = {}) => api.get('/stats/recent-matches', { params }),
};

const PublicApi = {
  homeSummary: () => api.get('/public/home-summary'),
};

const AdminPanel = {
  overview: () => api.get('/admin/overview'),
  auditLog: (params) => api.get('/admin/audit-log', { params }),
  users: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  revokeSessions: (id) => api.post(`/admin/users/${id}/revoke-sessions`),
  inspectMatch: (id) => api.get(`/admin/inspect/matches/${id}`),
  inspectRoom: (id) => api.get(`/admin/inspect/rooms/${id}`),
  forceAbandonMatch: (id, data) => api.post(`/admin/inspect/matches/${id}/force-abandon`, data),
  forceCloseRoom: (id, data) => api.post(`/admin/inspect/rooms/${id}/force-close`, data),
};

// ── Training ──────────────────────────────────────────────────────────────────
const Training = {
  x01Start:    data => api.post('/training/x01/start', data),
  x01State:    ()   => api.get('/training/x01/state'),
  x01Throw:    data => api.post('/training/x01/throw', data),
  x01Undo:     ()   => api.post('/training/x01/undo'),
  x01Abandon:  ()   => api.post('/training/x01/abandon'),
  x01Finished: params => api.get('/training/x01/finished', { params }),
  x01Protocol: id => api.get(`/training/x01/games/${id}`),
};
