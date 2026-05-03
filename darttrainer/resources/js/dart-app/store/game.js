import { defineStore } from 'pinia';
import { Game } from '../api/client.js';
import { DART_I18N } from '../i18n/messages.js';
import { useAuthStore } from './auth.js';
import { onAppResume, onAppPause } from '../composables/useAppResume.js';

/** Vai onAppResume jau reģistrēts (store ir singleton, reģistrē vienu reizi). */
let _resumeRegistered = false;

/** Secīgu neveiksmju skaits polling pieprasījumos (exponential backoff). */
let _consecutiveFailures = 0;
/** Max backoff — neveiksmīgi pieprasījumi nepalēninās polling vairāk par šo. */
const MAX_BACKOFF_POLLS = 5;

export const useGameStore = defineStore('game', {
  state: () => ({
    matchId: null,
    roomCode: null,
    state: null,
    polling: null,
    /** Intervāls (ms), ko lietoja startPolling — vajadzīgs atsākšanai. */
    pollingInterval: 1100,
    /** Vai polling bija aktīvs pirms pauzes (visibilitychange). */
    wasPolling: false,
    lastUpdated: null,
    lastEtag: null,
    error: null,
    matchGoneHandled: false,
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
      this.matchGoneHandled = false;
      await this.fetchState();
    },

    async fetchState() {
      if (!this.matchId) return;
      try {
        const response = await Game.state(this.matchId, {
          headers: this.lastEtag ? { 'If-None-Match': this.lastEtag } : {},
          validateStatus: (status) => status === 200 || status === 304 || status === 404,
          skipErrorToast: true,
        });

        if (response.status === 304) {
          _consecutiveFailures = 0;
          return;
        }
        if (response.status === 404) {
          if (this.matchGoneHandled) return;
          this.matchGoneHandled = true;
          this.stopPolling();
          this.reset();
          if (typeof window !== 'undefined' && window.location.pathname.includes('/game/')) {
            window.location.assign('/404');
          }
          return;
        }

        const { data } = response;
        const etag = response.headers?.etag;
        if (data.updated_at !== this.lastUpdated) {
          this.state = data;
          this.lastUpdated = data.updated_at;
          this.roomCode = data.room_code;
        }
        if (etag) this.lastEtag = etag;
        // Veiksmīgs pieprasījums — atiestatām backoff.
        _consecutiveFailures = 0;
        this.error = null;
      } catch (e) {
        _consecutiveFailures = Math.min(_consecutiveFailures + 1, MAX_BACKOFF_POLLS);
        // Rādām kļūdu tikai pēc vairākām neveiksmēm (netraucē ar vienreizēju timeout).
        if (_consecutiveFailures >= 3) {
          this.error = 'Nevar ielādēt spēles stāvokli.';
        }
      }
    },


    startPolling(intervalMs = 1100) {
      this.stopPolling();
      this.pollingInterval = intervalMs;
      this.wasPolling = true;
      _consecutiveFailures = 0;
      this._schedulePoll();

      // Reģistrējam pause/resume callback vienu reizi (store singleton).
      if (!_resumeRegistered) {
        _resumeRegistered = true;
        onAppPause(() => this.pausePolling());
        onAppResume(() => this._onResume());
      }
    },

    /**
     * Iekšējā poll plānošana ar adaptīvu intervālu (backoff pie kļūdām).
     */
    _schedulePoll() {
      if (this.polling) clearTimeout(this.polling);
      // Adaptīvs intervāls: baseInterval * 2^failures (max ~35s).
      const delay = Math.min(
        this.pollingInterval * Math.pow(2, _consecutiveFailures),
        35000,
      );
      this.polling = setTimeout(async () => {
        if (!this.isFinished && this.matchId) {
          await this.fetchState();
          this._schedulePoll();
        } else {
          this.stopPolling();
        }
      }, delay);
    },

    stopPolling() {
      if (this.polling) {
        clearTimeout(this.polling);
        this.polling = null;
      }
      this.wasPolling = false;
      _consecutiveFailures = 0;
    },

    /**
     * Apturēt polling, saglabājot wasPolling=true (visibilitychange hidden).
     * Atsākšanu veic _onResume(). Neizmanto stopPolling(), jo tas nodzēš wasPolling.
     */
    pausePolling() {
      if (this.polling) {
        clearTimeout(this.polling);
        this.polling = null;
        // wasPolling paliek true — _onResume to izmantos atsākšanai.
        this.wasPolling = true;
      }
    },

    /**
     * Izsaukts no useAppResume pēc pamošanās.
     * Uzreiz pieprasām svaigu stāvokli un atsākam polling.
     */
    async _onResume() {
      if (!this.matchId || this.isFinished) return;
      // ETag atiestatīts — pēc ilgas pauzes gandrīz noteikti ir jauni dati.
      this.lastEtag = null;
      this.error = null;
      _consecutiveFailures = 0;
      await this.fetchState();
      // Atsākam polling, ja tas bija aktīvs pirms pauzes.
      if (this.wasPolling && !this.polling && !this.isFinished) {
        this._schedulePoll();
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
      try {
        const { data } = await Game.abandon(this.matchId, {}, { skipErrorToast: true });
        this.lastEtag = null;
        this.reset();
        return data;
      } catch (e) {
        // Ja mačs jau ir dzēsts / vairs neeksistē (route-model binding 404), neatgriežam kļūdu lietotājam.
        if (e?.response?.status === 404) {
          this.lastEtag = null;
          this.reset();
          return { message: DART_I18N?.lv?.game?.matchGoneToast || 'Spēle vairs nav pieejama.' };
        }
        throw e;
      }
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
      this.matchGoneHandled = false;
    },
  },
});
