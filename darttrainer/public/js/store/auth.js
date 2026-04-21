const useAuthStore = Pinia.defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    /** True after first /auth/me completes — avoids flashing login UI while session is resolving */
    hydrated: false,
  }),

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

    async register(name, email, password, passwordConfirmation) {
      this.loading = true;
      try {
        const { data } = await Auth.register({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        });
        this.user = data.user;
        return true;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      try {
        await Auth.logout({ skipErrorToast: true });
      } catch (_) {
        /* session jau dzēsta vai tīkls */
      }
      try {
        if (typeof useFriendsStore === 'function') useFriendsStore().stop();
      } catch (_) {}
      this.user = null;
      window.location.hash = '/login';
    },

    /**
     * Session cookie invalid (revoked remotely, expired, etc.). No API call — avoids 401 loop.
     * Clears multiplayer polling state so errors do not repeat.
     */
    sessionInvalidated(toastMessage) {
      try {
        if (typeof useGameStore === 'function') {
          useGameStore().reset();
        }
      } catch (_) {}
      this.user = null;
      this.loading = false;
      this.hydrated = true;
      if (toastMessage && typeof window._dartToast === 'function') {
        window._dartToast(toastMessage, 'success');
      }
      window.location.hash = '/login';
    },

    /** Server rejected session because account is banned (403 account_banned). */
    accountBanned(title, banReason) {
      try {
        if (typeof useGameStore === 'function') {
          useGameStore().reset();
        }
      } catch (_) {}
      try {
        if (typeof useFriendsStore === 'function') useFriendsStore().stop();
      } catch (_) {}
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
