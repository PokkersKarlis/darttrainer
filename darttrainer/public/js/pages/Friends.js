const FriendsPage = {
  setup() {
    const auth   = useAuthStore();
    const locale = useLocaleStore();
    const friendsStore = useFriendsStore();
    const t      = (k) => locale.t(k);

    const searchQ    = Vue.ref('');
    const searchHits = Vue.ref([]);
    const searching  = Vue.ref(false);
    const friendList = Vue.ref([]);
    const loading    = Vue.ref(true);
    const tab        = Vue.ref('list');

    async function loadLists() {
      if (!auth.user) {
        loading.value = false;
        return;
      }
      loading.value = true;
      try {
        const { data } = await Friends.list();
        friendList.value = data.items || [];
        await friendsStore.refresh();
      } catch (_) {
        friendList.value = [];
      } finally {
        loading.value = false;
      }
    }

    Vue.onMounted(loadLists);

    let searchTimer = null;
    function onSearchInput() {
      if (searchTimer) clearTimeout(searchTimer);
      searchTimer = setTimeout(runSearch, 280);
    }

    async function runSearch() {
      const q = searchQ.value.trim();
      if (q.length < 1) {
        searchHits.value = [];
        return;
      }
      searching.value = true;
      try {
        const { data } = await Friends.search(q);
        searchHits.value = data.items || [];
      } catch (_) {
        searchHits.value = [];
      } finally {
        searching.value = false;
      }
    }

    async function sendRequest(userId) {
      try {
        await Friends.sendRequest(userId);
        window._dartToast?.(t('friends.requestSent'), 'success');
        await runSearch();
        friendsStore.refresh();
      } catch (e) {
        const msg = e.response?.data?.error || t('common.error');
        window._dartToast?.(msg, 'error');
      }
    }

    async function accept(id) {
      await friendsStore.acceptRequest(id);
      await loadLists();
    }

    async function reject(id) {
      await friendsStore.rejectRequest(id);
      await loadLists();
    }

    const removingId = Vue.ref(null);
    const removeModalOpen = Vue.ref(false);
    const removeTarget = Vue.ref(null);

    function openRemoveModal(f) {
      removeTarget.value = { id: f.id, name: f.name || '' };
      removeModalOpen.value = true;
    }

    function closeRemoveModal() {
      removeModalOpen.value = false;
      removeTarget.value = null;
    }

    async function confirmRemoveFriend() {
      const tgt = removeTarget.value;
      if (!tgt) return;
      removingId.value = tgt.id;
      try {
        await Friends.remove(tgt.id);
        window._dartToast?.(t('friends.removedToast'), 'success');
        closeRemoveModal();
        await loadLists();
        await runSearch();
      } catch (e) {
        const msg = e.response?.data?.error || t('common.error');
        window._dartToast?.(msg, 'error');
      } finally {
        removingId.value = null;
      }
    }

    return {
      auth, t, tab,
      searchQ, searchHits, searching, onSearchInput, runSearch, sendRequest,
      friendList, loading, friendsStore, accept, reject, loadLists,
      openRemoveModal, closeRemoveModal, confirmRemoveFriend,
      removeModalOpen, removeTarget, removingId,
    };
  },

  template: `
    <div class="min-h-full w-full flex flex-col bg-[#060d18] pb-36 lg:pb-16">
      <div class="max-w-lg mx-auto w-full px-4 py-4 lg:py-6 flex flex-col gap-4">
        <div class="text-center">
          <h1 class="text-xl sm:text-2xl font-black text-white tracking-tight">{{ t('friends.title') }}</h1>
          <p v-if="!auth.user" class="text-slate-600 text-xs sm:text-sm mt-0.5">{{ t('friends.subtitle') }}</p>
        </div>

        <template v-if="!auth.user">
          <p class="text-slate-500 text-sm text-center">{{ t('friends.loginHint') }}</p>
          <a href="#/login" class="text-center text-amber-400 font-bold text-sm">{{ t('friends.loginLink') }}</a>
        </template>

        <template v-else>
          <!-- Tabs: saraksts pirmais -->
          <div class="flex bg-slate-800/60 border border-slate-700/50 rounded-2xl p-1 gap-1">
            <button type="button" @click="tab = 'list'" class="flex-1 py-2 rounded-xl text-xs font-black transition"
                    :class="tab === 'list' ? 'bg-amber-500 text-black' : 'text-slate-500'">
              {{ t('friends.tabList') }}
            </button>
            <button type="button" @click="tab = 'incoming'" class="flex-1 py-2 rounded-xl text-xs font-black transition"
                    :class="tab === 'incoming' ? 'bg-amber-500 text-black' : 'text-slate-500'">
              {{ t('friends.tabIncoming') }}
              <span v-if="friendsStore.incomingCount" class="ml-0.5">({{ friendsStore.incomingCount }})</span>
            </button>
            <button type="button" @click="tab = 'outgoing'" class="flex-1 py-2 rounded-xl text-xs font-black transition"
                    :class="tab === 'outgoing' ? 'bg-amber-500 text-black' : 'text-slate-500'">
              {{ t('friends.tabOutgoing') }}
            </button>
          </div>

          <div v-if="loading" class="text-center text-slate-500 text-sm py-6">{{ t('friends.loading') }}</div>

          <template v-else-if="tab === 'list'">
            <div v-if="!friendList.length" class="text-center space-y-3 py-4 px-2">
              <p class="text-slate-600 text-sm">{{ t('friends.noFriends') }}</p>
              <p class="text-slate-500 text-xs leading-relaxed max-w-sm mx-auto">{{ t('friends.emptyListHint') }}</p>
              <button type="button" @click="loadLists()"
                      class="text-xs font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2">
                {{ t('friends.refreshList') }}
              </button>
            </div>
            <div v-for="f in friendList" :key="f.id"
                 class="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2.5">
              <div class="w-8 h-8 rounded-full bg-slate-700 text-amber-400 flex items-center justify-center text-xs font-black shrink-0">
                {{ f.name.charAt(0).toUpperCase() }}
              </div>
              <span class="text-white font-semibold text-sm flex-1 min-w-0 truncate">{{ f.name }}</span>
              <button type="button"
                      @click="openRemoveModal(f)"
                      :disabled="removingId === f.id"
                      class="shrink-0 text-[11px] font-bold text-red-400/90 hover:text-red-300 px-2 py-1 rounded-lg border border-red-500/30 hover:bg-red-500/10 disabled:opacity-40">
                {{ t('friends.removeFriend') }}
              </button>
            </div>
          </template>

          <template v-else-if="tab === 'incoming'">
            <div v-if="!friendsStore.incoming.length" class="text-center text-slate-600 text-sm py-6">{{ t('friends.noIncoming') }}</div>
            <div v-for="r in friendsStore.incoming" :key="r.id"
                 class="flex items-center justify-between gap-2 bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-3">
              <div>
                <div class="text-white font-bold text-sm">{{ r.user.name }}</div>
                <div class="text-[10px] text-slate-500">{{ t('friends.wantsFriend') }}</div>
              </div>
              <div class="flex gap-1.5 shrink-0">
                <button type="button" @click="accept(r.id)" :disabled="friendsStore.busyId === r.id"
                        class="text-xs font-black bg-emerald-600 text-white px-2.5 py-1.5 rounded-lg disabled:opacity-40">
                  {{ t('friends.accept') }}
                </button>
                <button type="button" @click="reject(r.id)" :disabled="friendsStore.busyId === r.id"
                        class="text-xs font-bold bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg disabled:opacity-40">
                  {{ t('friends.reject') }}
                </button>
              </div>
            </div>
          </template>

          <template v-else-if="tab === 'outgoing'">
            <div v-if="!friendsStore.outgoing.length" class="text-center text-slate-600 text-sm py-6">{{ t('friends.noOutgoing') }}</div>
            <div v-for="row in friendsStore.outgoing" :key="row.id"
                 class="flex items-center justify-between gap-2 bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2.5">
              <span class="text-white font-semibold text-sm">{{ row.user.name }}</span>
              <span class="text-[10px] font-bold uppercase shrink-0"
                    :class="row.status === 'pending' ? 'text-amber-400' : (row.status === 'accepted' ? 'text-emerald-400' : 'text-slate-500')">
                {{ row.status === 'pending' ? t('friends.stPending') : (row.status === 'accepted' ? t('friends.stAccepted') : t('friends.stRejected')) }}
              </span>
            </div>
            <button type="button" @click="friendsStore.refresh(); loadLists()"
                    class="text-xs text-slate-500 hover:text-amber-400 font-semibold py-2">
              {{ t('friends.refresh') }}
            </button>
          </template>

          <!-- Meklēšana un uzaicināšana — zem galvenajām cilnēm -->
          <div class="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-3 space-y-2 mt-4">
            <div class="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{{ t('friends.searchSectionTitle') }}</div>
            <input v-model="searchQ" @input="onSearchInput" type="search" maxlength="80"
                   :placeholder="t('friends.searchPlaceholder')"
                   class="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:border-amber-500 focus:outline-none" />
            <div v-if="searching" class="text-xs text-slate-500">{{ t('friends.searching') }}</div>
            <div v-else-if="searchQ.trim().length >= 1 && !searchHits.length" class="text-xs text-slate-600">{{ t('friends.noHits') }}</div>
            <div v-for="u in searchHits" :key="u.id"
                 class="flex items-center justify-between gap-2 py-2 border-t border-slate-700/40 first:border-t-0">
              <span class="text-white font-semibold text-sm">{{ u.name }}</span>
              <button v-if="u.relationship === 'none'" type="button" @click="sendRequest(u.id)"
                      class="text-xs font-black bg-amber-500 text-black px-3 py-1.5 rounded-lg shrink-0">
                {{ t('friends.sendRequest') }}
              </button>
              <span v-else-if="u.relationship === 'outgoing_pending'" class="text-[10px] text-slate-500 shrink-0">{{ t('friends.pendingOut') }}</span>
              <span v-else-if="u.relationship === 'incoming_pending'" class="text-[10px] text-amber-400 shrink-0">{{ t('friends.pendingIn') }}</span>
            </div>
          </div>
        </template>
      </div>

      <Teleport to="body">
        <Transition name="fade">
          <div v-if="removeModalOpen && removeTarget"
               class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
               @click.self="closeRemoveModal()">
            <div class="w-full max-w-sm rounded-2xl border border-slate-600/80 bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl shadow-black/50 overflow-hidden ring-1 ring-white/5">
              <div class="px-5 pt-5 pb-4 border-b border-slate-700/60">
                <div class="flex items-start gap-3">
                  <div class="w-11 h-11 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center text-xl shrink-0" aria-hidden="true">👋</div>
                  <div class="min-w-0">
                    <h3 class="text-lg font-black text-white leading-tight">{{ t('friends.removeModalTitle') }}</h3>
                    <p class="text-sm text-slate-300 mt-2 leading-snug">
                      {{ t('friends.removeConfirm').replace(/\{name\}/g, removeTarget.name || '…') }}
                    </p>
                    <p class="text-xs text-slate-500 mt-2 leading-relaxed">{{ t('friends.removeModalHint') }}</p>
                  </div>
                </div>
              </div>
              <div class="flex gap-2 p-4 bg-slate-900/40">
                <button type="button" @click="closeRemoveModal()"
                        class="flex-1 py-3 rounded-xl text-sm font-bold text-slate-200 bg-slate-700/90 hover:bg-slate-600 border border-slate-600/60 transition active:scale-[0.98]">
                  {{ t('friends.removeModalCancel') }}
                </button>
                <button type="button" @click="confirmRemoveFriend()" :disabled="removingId === removeTarget.id"
                        class="flex-1 py-3 rounded-xl text-sm font-black text-white bg-gradient-to-b from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 border border-red-400/30 shadow-lg shadow-red-950/40 disabled:opacity-45 transition active:scale-[0.98]">
                  {{ removingId === removeTarget.id ? t('friends.removeModalWorking') : t('friends.removeModalConfirmBtn') }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>
  `,
};
