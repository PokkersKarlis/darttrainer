import { defineStore } from 'pinia';
import { Game } from '../api/client.js';
import { DART_I18N } from '../i18n/messages.js';
import { useAuthStore } from './auth.js';

export const useGameStore = defineStore('game', {
  state: () => ({
    matchId: null,
    roomCode: null,
    state: null,
    polling: null,
    lastUpdated: null,
    lastEtag: null,
    error: null,
  }),

  getters: {
    isMyTurn: (s) => {
      const auth = useAuthStore();
      if (!s.state || !auth.user || s.state.status !== 'active') return false;
      if (s.state.play_mode === 'local' && Number(s.state.host_user_id) === Number(auth.user.id)) {
        return true;
      }
      return s.state.current_player?.user_id === auth.user.id;
    },
    currentPlayer: (s) => s.state?.current_player ?? null,
    players: (s) => s.state?.players ?? [],
    gameType: (s) => s.state?.game_type ?? null,
    gameConfig: (s) => s.state?.game_config ?? {},
    isFinished: (s) => ['finished', 'abandoned'].includes(s.state?.status),
    isSuspended: (s) => s.state?.status === 'suspended',
    isMatchActive: (s) => s.state?.status === 'active',
    undoAvailable: (s) => !!s.state?.undo_available,
  },

  actions: {
    async loadState(matchId) {
      this.matchId = matchId;
      this.lastEtag = null;
      await this.fetchState();
    },

    async fetchState() {
      if (!this.matchId) return;
      try {
        const response = await Game.state(this.matchId, {
          headers: this.lastEtag ? { 'If-None-Match': this.lastEtag } : {},
          validateStatus: (status) => status === 200 || status === 304,
        });

        if (response.status === 304) return;

        const { data } = response;
        const etag = response.headers?.etag;
        if (data.updated_at !== this.lastUpdated) {
          this.state = data;
          this.lastUpdated = data.updated_at;
          this.roomCode = data.room_code;
        }
        if (etag) this.lastEtag = etag;
      } catch (e) {
        if (e.response?.status === 404 && this.state) {
          this.stopPolling();
          this.reset();
          window._dartToast?.(
            (() => {
              try {
                const loc = localStorage.getItem('dt_locale') || 'lv';
                return DART_I18N?.[loc]?.game?.matchGoneToast || DART_I18N?.en?.game?.matchGoneToast || 'Spēle vairs nav pieejama.';
              } catch (_) {
                return 'Spēle vairs nav pieejama.';
              }
            })(),
            'info',
          );
          if (typeof window !== 'undefined' && window.location.pathname.includes('/game/')) {
            window.location.assign('/');
          }
          return;
        }
        this.error = 'Nevar ielādēt spēles stāvokli.';
      }
    },

    startPolling(intervalMs = 1100) {
      this.stopPolling();
      this.polling = setInterval(() => {
        if (!this.isFinished) this.fetchState();
        else this.stopPolling();
      }, intervalMs);
    },

    stopPolling() {
      if (this.polling) {
        clearInterval(this.polling);
        this.polling = null;
      }
    },

    async submitThrow(darts) {
      const { data } = await Game.throw(this.matchId, { darts });
      this.state = data;
      this.lastUpdated = data.updated_at;
      this.lastEtag = null;
      return data;
    },

    async undo() {
      try {
        const { data } = await Game.undo(this.matchId, {}, { skipErrorToast: true });
        this.state = data;
        this.lastUpdated = data.updated_at;
        this.lastEtag = null;
        return true;
      } catch {
        return false;
      }
    },

    async abandonMatch() {
      const { data } = await Game.abandon(this.matchId, {}, { skipErrorToast: true });
      this.lastEtag = null;
      this.reset();
      return data;
    },

    async suspendLocalMatch() {
      const { data } = await Game.suspendLocal(this.matchId, {}, { skipErrorToast: true });
      this.lastEtag = null;
      await this.fetchState();
      return data;
    },

    async resumeMatch() {
      const { data } = await Game.resume(this.matchId, {}, { skipErrorToast: true });
      this.state = data;
      this.lastUpdated = data.updated_at;
      this.lastEtag = null;
      return data;
    },

    async discardSuspendedMatch() {
      await Game.discardSuspended(this.matchId, {}, { skipErrorToast: true });
      this.reset();
    },

    async turnTimeoutGrantExtra() {
      const { data } = await Game.turnTimeoutGrantExtra(this.matchId, {}, { skipErrorToast: true });
      this.state = data;
      this.lastUpdated = data.updated_at;
      this.lastEtag = null;
      return data;
    },

    async turnTimeoutEndNoStats() {
      const { data } = await Game.turnTimeoutEndNoStats(this.matchId, {}, { skipErrorToast: true });
      this.state = data;
      this.lastUpdated = data.updated_at;
      this.lastEtag = null;
      return data;
    },

    reset() {
      this.stopPolling();
      this.matchId = null;
      this.state = null;
      this.lastUpdated = null;
      this.lastEtag = null;
      this.roomCode = null;
      this.error = null;
    },
  },
});
