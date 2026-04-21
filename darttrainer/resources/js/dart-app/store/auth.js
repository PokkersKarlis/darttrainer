import { defineStore } from 'pinia';
import { Auth } from '../api/client.js';

async function stopFriendsStore() {
  try {
    const { useFriendsStore } = await import('./friends.js');
    useFriendsStore().stop();
  } catch (_) {}
}

function resetGameStoreFireAndForget() {
  import('./game.js')
    .then(({ useGameStore }) => {
      try {
        useGameStore().reset();
      } catch (_) {}
    })
    .catch(() => {});
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    hydrated: false,
  }),

  getters: {
    needsEmailVerification: (state) => !!(state.user && !state.user.email_verified_at),
  },

  actions: {
    async init() {
      this.loading = true;
      try {
        const { data } = await Auth.me();
        this.user = data.user;
      } catch (_) {
        this.user = null;
      } finally {
        this.loading = false;
        this.hydrated = true;
      }
    },

    async refreshMe() {
      try {
        const { data } = await Auth.me();
        this.user = data.user;
      } catch (_) {
        this.user = null;
      }
    },

    async login(email, password) {
      this.loading = true;
      try {
        const { data } = await Auth.login({ email, password });
        this.user = data.user;
        return true;
      } finally {
        this.loading = false;
      }
    },

    async register({ name, email, password, passwordConfirmation, accountType, clubName }) {
      this.loading = true;
      try {
        const { data } = await Auth.register({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
          account_type: accountType,
          club_name: accountType === 'club' ? clubName : null,
        });
        this.user = data.user;
        return true;
      } finally {
        this.loading = false;
      }
    },

    async resendVerificationEmail() {
      await Auth.resendVerification();
    },

    async logout() {
      try {
        await Auth.logout({ skipErrorToast: true });
      } catch (_) {}
      await stopFriendsStore();
      this.user = null;
      window.location.hash = '/login';
    },

    sessionInvalidated(toastMessage) {
      resetGameStoreFireAndForget();
      this.user = null;
      this.loading = false;
      this.hydrated = true;
      if (toastMessage && typeof window._dartToast === 'function') {
        window._dartToast(toastMessage, 'success');
      }
      window.location.hash = '/login';
    },

    accountBanned(title, banReason) {
      resetGameStoreFireAndForget();
      void stopFriendsStore();
      this.user = null;
      this.loading = false;
      this.hydrated = true;
      const lines = [title || '', banReason ? String(banReason).trim() : ''].filter(Boolean);
      if (lines.length && typeof window._dartToast === 'function') {
        window._dartToast(lines.join('\n\n'), 'error');
      }
      window.location.hash = '/login';
    },
  },
});
