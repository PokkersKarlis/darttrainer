import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 15000,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

export const Auth = {
  me: () => api.get('/auth/me'),
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: (config) => api.post('/auth/logout', {}, config || {}),
  resendVerification: (config) => api.post('/auth/email/resend', {}, config || {}),
};

export const Rooms = {
  myActive: (config = {}) => api.get('/rooms/my-active', config),
  myActives: () => api.get('/rooms/my-actives'),
  create: (data) => api.post('/rooms', data),
  join: (data) => api.post('/rooms/join', data),
  show: (id) => api.get(`/rooms/${id}`),
  start: (id, data) => api.post(`/rooms/${id}/start`, data),
  leave: (id, config = {}) => api.delete(`/rooms/${id}`, config),
};

export const Friends = {
  search: (q) => api.get('/friends/search', { params: { q } }),
  list: () => api.get('/friends'),
  incoming: () => api.get('/friends/requests/incoming'),
  outgoing: () => api.get('/friends/requests/outgoing'),
  sendRequest: (user_id) => api.post('/friends/requests', { user_id }),
  accept: (id) => api.post(`/friends/requests/${id}/accept`),
  reject: (id) => api.post(`/friends/requests/${id}/reject`),
  remove: (userId) => api.delete(`/friends/${userId}`),
};

export const GuestPresets = {
  list: () => api.get('/guest-presets'),
  create: (name) => api.post('/guest-presets', { name }),
  delete: (id) => api.delete(`/guest-presets/${id}`),
};

export const Game = {
  state: (matchId, config = {}) => api.get(`/games/${matchId}/state`, config),
  throw: (matchId, d) => api.post(`/games/${matchId}/throw`, d),
  undo: (matchId, data = {}, config = {}) => api.post(`/games/${matchId}/undo`, data, config),
  history: (matchId) => api.get(`/games/${matchId}/history`),
  protocol: (matchId) => api.get(`/games/${matchId}/protocol`),
  abandon: (matchId, data = {}, config = {}) => api.post(`/games/${matchId}/abandon`, data, config),
  suspendLocal: (matchId, data = {}, config = {}) => api.post(`/games/${matchId}/suspend-local`, data, config),
  resume: (matchId, data = {}, config = {}) => api.post(`/games/${matchId}/resume`, data, config),
  discardSuspended: (matchId, data = {}, config = {}) => api.post(`/games/${matchId}/discard-suspended`, data, config),
  turnTimeoutGrantExtra: (matchId, data = {}, config = {}) =>
    api.post(`/games/${matchId}/turn-timeout/grant-extra`, data, config),
  turnTimeoutEndNoStats: (matchId, data = {}, config = {}) =>
    api.post(`/games/${matchId}/turn-timeout/end-no-stats`, data, config),
};

export const Stats = {
  me: () => api.get('/stats/me'),
  leaderboard: (gameType) => api.get('/stats/leaderboard', { params: { game_type: gameType } }),
  recentMatches: (params = {}) => api.get('/stats/recent-matches', { params }),
};

export const PublicApi = {
  homeSummary: () => api.get('/public/home-summary'),
};

export const AdminPanel = {
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

export const Training = {
  x01Start: (data) => api.post('/training/x01/start', data),
  x01State: () => api.get('/training/x01/state'),
  x01Throw: (data) => api.post('/training/x01/throw', data),
  x01Undo: () => api.post('/training/x01/undo'),
  x01Abandon: () => api.post('/training/x01/abandon'),
  x01Finished: (params) => api.get('/training/x01/finished', { params }),
  x01Protocol: (id) => api.get(`/training/x01/games/${id}`),
};
