import { defineStore } from 'pinia';
import { Friends } from '../api/client.js';
import { DART_I18N } from '../i18n/messages.js';
import { useAuthStore } from './auth.js';

function dartFriendMsg(key, name) {
  const loc = (typeof localStorage !== 'undefined' && localStorage.getItem('dt_locale')) || 'lv';
  let tpl = DART_I18N?.[loc]?.friends?.[key];
  if (!tpl) tpl = DART_I18N?.en?.friends?.[key];
  if (!tpl) return key;
  return String(tpl).replace(/\{name\}/g, name);
}

export const useFriendsStore = defineStore('friends', {
  state: () => ({
    incoming: [],
    outgoing: [],
    outgoingStatusSeen: {},
    pollTimer: null,
    modalOpen: false,
    busyId: null,
  }),

  getters: {
    incomingCount: (s) => s.incoming.length,
  },

  actions: {
    stop() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer);
        this.pollTimer = null;
      }
      this.incoming = [];
      this.outgoing = [];
      this.outgoingStatusSeen = {};
      this.modalOpen = false;
    },

    start() {
      this.stop();
      this.refresh();
      this.pollTimer = setInterval(() => this.refresh(), 12000);
    },

    openModal() {
      this.modalOpen = true;
      this.refresh();
    },

    closeModal() {
      this.modalOpen = false;
    },

    checkOutgoingToasts(items) {
      const seen = this.outgoingStatusSeen;
      for (const row of items) {
        const prev = seen[row.id];
        if (prev === 'pending' && row.status === 'accepted') {
          window._dartToast?.(dartFriendMsg('toastTheyAccepted', row.user?.name ?? '?'), 'success');
        }
        if (prev === 'pending' && row.status === 'rejected') {
          window._dartToast?.(dartFriendMsg('toastTheyRejected', row.user?.name ?? '?'), 'error');
        }
        seen[row.id] = row.status;
      }
    },

    async refresh() {
      try {
        const auth = useAuthStore();
        if (!auth.user) return;
        const [inc, out] = await Promise.all([Friends.incoming(), Friends.outgoing()]);
        this.incoming = inc.data.items || [];
        this.checkOutgoingToasts(out.data.items || []);
        this.outgoing = out.data.items || [];
      } catch (_) {}
    },

    async acceptRequest(id) {
      if (this.busyId) return;
      this.busyId = id;
      try {
        await Friends.accept(id);
        window._dartToast?.(dartFriendMsg('toastYouAccepted', ''), 'success');
        await this.refresh();
      } catch (e) {
        const msg = e.response?.data?.error || 'Kļūda.';
        window._dartToast?.(msg, 'error');
      } finally {
        this.busyId = null;
      }
    },

    async rejectRequest(id) {
      if (this.busyId) return;
      this.busyId = id;
      try {
        await Friends.reject(id);
        await this.refresh();
      } catch (e) {
        const msg = e.response?.data?.error || 'Kļūda.';
        window._dartToast?.(msg, 'error');
      } finally {
        this.busyId = null;
      }
    },
  },
});
