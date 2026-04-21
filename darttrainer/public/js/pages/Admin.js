const AdminPage = {
  setup() {
    const auth   = useAuthStore();
    const locale = useLocaleStore();
    const t      = (k) => locale.t(k);
    const router = VueRouter.useRouter();

    const tab       = Vue.ref('users');
    const loading   = Vue.ref(false);
    const overview  = Vue.ref(null);
    const users     = Vue.ref({ items: [], meta: {} });
    const userPage  = Vue.ref(1);
    const userFilters = Vue.reactive({
      search: '',
      only_admin: false,
      only_banned: false,
      date_from: '',
      date_to: '',
    });

    const audit     = Vue.ref({ items: [], meta: {} });
    const auditPage = Vue.ref(1);

    const inspectJson = Vue.ref(null);
    const inspectTitle = Vue.ref('');

    const danger = Vue.reactive({
      open: false,
      kind: '', // 'match_abandon' | 'room_close'
      id: null,
      chk: false,
    });

    const userModal = Vue.reactive({
      open: false,
      kind: '', // 'ban' | 'unban' | 'revoke'
      user: null,
      banReason: '',
      revokeAck: false,
    });
    const userModalBusy = Vue.ref(false);
    let userFilterTimer = null;

    function copyText(label, text) {
      const s = String(text ?? '');
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(s).then(() => {
          window._dartToast?.(t('admin.copied') + ': ' + label, 'success');
        }).catch(() => window._dartToast?.('Copy failed', 'error'));
      } else {
        window._dartToast?.('Clipboard nav pieejams', 'error');
      }
    }

    async function loadOverview() {
      try {
        const { data } = await AdminPanel.overview();
        overview.value = data;
      } catch (e) {
        if (e.response?.status === 403) {
          window._dartToast?.(t('admin.forbidden'), 'error');
          router.push('/');
        }
      }
    }

    function userQueryParams(page) {
      const p = { page, per_page: 25 };
      if (userFilters.search?.trim()) p.search = userFilters.search.trim();
      if (userFilters.only_admin) p.only_admin = 1;
      if (userFilters.only_banned) p.only_banned = 1;
      if (userFilters.date_from) p.date_from = userFilters.date_from;
      if (userFilters.date_to) p.date_to = userFilters.date_to;
      return p;
    }

    async function loadUsers(page = 1) {
      loading.value = true;
      try {
        const { data } = await AdminPanel.users(userQueryParams(page));
        users.value = { items: data.items ?? [], meta: data.meta ?? {} };
        userPage.value = page;
      } finally {
        loading.value = false;
      }
    }

    async function loadAudit(page = 1) {
      loading.value = true;
      try {
        const { data } = await AdminPanel.auditLog({ page, per_page: 30 });
        audit.value = { items: data.items ?? [], meta: data.meta ?? {} };
        auditPage.value = page;
      } finally {
        loading.value = false;
      }
    }

    async function toggleAdmin(u) {
      try {
        await AdminPanel.updateUser(u.id, { is_admin: !u.is_admin });
        await loadUsers(userPage.value);
        await loadOverview();
      } catch (e) {
        window._dartToast?.(e.response?.data?.message || 'Error', 'error');
      }
    }

    function openBanModal(u) {
      userModal.kind = 'ban';
      userModal.user = u;
      userModal.banReason = u.ban_reason || '';
      userModal.revokeAck = false;
      userModal.open = true;
    }

    function openUnbanModal(u) {
      userModal.kind = 'unban';
      userModal.user = u;
      userModal.banReason = '';
      userModal.revokeAck = false;
      userModal.open = true;
    }

    function openRevokeModal(u) {
      userModal.kind = 'revoke';
      userModal.user = u;
      userModal.banReason = '';
      userModal.revokeAck = false;
      userModal.open = true;
    }

    function closeUserModal() {
      userModal.open = false;
      userModal.user = null;
      userModal.kind = '';
      userModal.banReason = '';
      userModal.revokeAck = false;
      userModalBusy.value = false;
    }

    async function submitUserModal() {
      const u = userModal.user;
      if (!u || userModalBusy.value) return;
      if (userModal.kind === 'revoke' && !userModal.revokeAck) return;
      userModalBusy.value = true;
      try {
        if (userModal.kind === 'ban') {
          await AdminPanel.updateUser(u.id, {
            is_banned: true,
            ban_reason: userModal.banReason.trim() || null,
          });
        } else if (userModal.kind === 'unban') {
          await AdminPanel.updateUser(u.id, { is_banned: false });
        } else if (userModal.kind === 'revoke') {
          const { data } = await AdminPanel.revokeSessions(u.id);
          window._dartToast?.('OK: ' + (data.deleted ?? 0), 'success');
        }
        closeUserModal();
        await loadUsers(userPage.value);
        await loadOverview();
      } catch (e) {
        window._dartToast?.(e.response?.data?.message || 'Error', 'error');
      } finally {
        userModalBusy.value = false;
      }
    }

    async function openInspectMatch(id) {
      try {
        const { data } = await AdminPanel.inspectMatch(id);
        inspectTitle.value = 'Match #' + id;
        inspectJson.value = data;
      } catch (e) {
        window._dartToast?.(e.response?.data?.message || 'Error', 'error');
      }
    }

    async function openInspectRoom(id) {
      try {
        const { data } = await AdminPanel.inspectRoom(id);
        inspectTitle.value = 'Room #' + id;
        inspectJson.value = data;
      } catch (e) {
        window._dartToast?.(e.response?.data?.message || 'Error', 'error');
      }
    }

    function openDanger(kind, id) {
      danger.kind = kind;
      danger.id = id;
      danger.chk = false;
      danger.open = true;
    }

    async function execDanger() {
      if (!danger.chk) return;
      try {
        if (danger.kind === 'match_abandon') {
          await AdminPanel.forceAbandonMatch(danger.id, { confirm: true });
        } else if (danger.kind === 'room_close') {
          await AdminPanel.forceCloseRoom(danger.id, { confirm: true });
        }
        danger.open = false;
        inspectJson.value = null;
        inspectTitle.value = '';
        window._dartToast?.('OK', 'success');
        await loadOverview();
      } catch (e) {
        window._dartToast?.(e.response?.data?.message || 'Error', 'error');
      }
    }

    function closeInspect() {
      inspectJson.value = null;
      inspectTitle.value = '';
    }

    function fmtTs(ts) {
      if (ts == null) return '—';
      const d = new Date(typeof ts === 'number' ? ts * 1000 : ts);
      return isNaN(d.getTime()) ? '—' : d.toLocaleString(locale.locale === 'lv' ? 'lv-LV' : 'en-GB');
    }

    function fmtIso(iso) {
      if (!iso) return '—';
      const d = new Date(iso);
      return isNaN(d.getTime()) ? '—' : d.toLocaleString(locale.locale === 'lv' ? 'lv-LV' : 'en-GB');
    }

    Vue.watch(
      () => auth.hydrated,
      async (h) => {
        if (!h) return;
        if (!auth.user?.is_admin) {
          router.replace('/');
          return;
        }
        await Promise.all([loadOverview(), loadUsers(1), loadAudit(1)]);
      },
      { immediate: true },
    );

    Vue.watch(
      () => [
        userFilters.search,
        userFilters.only_admin,
        userFilters.only_banned,
        userFilters.date_from,
        userFilters.date_to,
      ],
      () => {
        if (!auth.hydrated || !auth.user?.is_admin) return;
        clearTimeout(userFilterTimer);
        userFilterTimer = setTimeout(() => {
          loadUsers(1);
        }, 400);
      },
    );

    Vue.onUnmounted(() => {
      clearTimeout(userFilterTimer);
    });

    return {
      auth, t, locale, tab, loading, overview, users, userPage, userFilters,
      audit, auditPage,
      inspectJson, inspectTitle, danger, userModal, userModalBusy,
      loadOverview, loadUsers, loadAudit, toggleAdmin,
      openBanModal, openUnbanModal, openRevokeModal, closeUserModal, submitUserModal,
      copyText, fmtTs, fmtIso,
      openInspectMatch, openInspectRoom, openDanger, execDanger, closeInspect,
    };
  },

  template: `
    <div class="flex-1 overflow-y-auto min-h-0">
      <div class="max-w-6xl mx-auto px-4 py-8">
        <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 class="text-2xl font-black text-white">{{ t('admin.title') }}</h1>
          <button type="button" @click="loadOverview(); loadUsers(userPage); tab === 'audit' && loadAudit(auditPage)"
                  class="text-sm font-bold px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition">
            {{ t('admin.refresh') }}
          </button>
        </div>

        <div class="flex flex-wrap gap-2 mb-6">
          <button type="button" @click="tab = 'users'"
                  class="px-4 py-2 rounded-xl text-sm font-bold transition"
                  :class="tab === 'users' ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400 hover:text-white'">
            {{ t('admin.tabUsers') }}
          </button>
          <button type="button" @click="tab = 'monitor'"
                  class="px-4 py-2 rounded-xl text-sm font-bold transition"
                  :class="tab === 'monitor' ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400 hover:text-white'">
            {{ t('admin.tabMonitor') }}
          </button>
          <button type="button" @click="tab = 'audit'"
                  class="px-4 py-2 rounded-xl text-sm font-bold transition"
                  :class="tab === 'audit' ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400 hover:text-white'">
            {{ t('admin.tabAudit') }}
          </button>
        </div>

        <!-- USERS -->
        <template v-if="tab === 'users'">
          <div class="bg-slate-800/80 border border-slate-700 rounded-xl p-4 mb-4 space-y-3">
            <div class="flex flex-wrap gap-2 items-end">
              <div class="flex-1 min-w-[180px]">
                <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{{ t('admin.searchPlaceholder') }}</label>
                <input v-model="userFilters.search" type="text" class="w-full mt-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white"/>
              </div>
              <label class="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input type="checkbox" v-model="userFilters.only_admin" class="rounded border-slate-600"/>
                {{ t('admin.onlyAdmins') }}
              </label>
              <label class="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input type="checkbox" v-model="userFilters.only_banned" class="rounded border-slate-600"/>
                {{ t('admin.onlyBanned') }}
              </label>
              <div>
                <label class="text-[10px] font-bold text-slate-500 uppercase">{{ t('admin.dateFrom') }}</label>
                <input v-model="userFilters.date_from" type="date" class="block mt-1 bg-slate-900 border border-slate-600 rounded-lg px-2 py-1.5 text-sm text-white"/>
              </div>
              <div>
                <label class="text-[10px] font-bold text-slate-500 uppercase">{{ t('admin.dateTo') }}</label>
                <input v-model="userFilters.date_to" type="date" class="block mt-1 bg-slate-900 border border-slate-600 rounded-lg px-2 py-1.5 text-sm text-white"/>
              </div>
            </div>
            <p class="text-[10px] text-slate-500">{{ t('admin.filtersAutoHint') }}</p>
          </div>

          <div v-if="loading && !users.items.length" class="text-slate-500 py-8 text-center">…</div>
          <div v-else class="bg-slate-800/80 border border-slate-700 rounded-xl overflow-x-auto">
            <table class="w-full text-xs sm:text-sm min-w-[720px]">
              <thead class="text-slate-500 bg-slate-900/50">
                <tr>
                  <th class="text-left py-2 px-2">{{ t('admin.name') }}</th>
                  <th class="text-left py-2 px-2">{{ t('admin.email') }}</th>
                  <th class="text-center py-2 px-1">{{ t('admin.admin') }}</th>
                  <th class="text-center py-2 px-1">{{ t('admin.banned') }}</th>
                  <th class="text-left py-2 px-2">{{ t('admin.lastActivity') }}</th>
                  <th class="text-right py-2 px-1">{{ t('admin.sessions') }}</th>
                  <th class="text-right py-2 px-2"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="u in users.items" :key="u.id" class="border-t border-slate-700/60">
                  <td class="py-2 px-2 text-white font-medium">
                    <div class="flex items-center gap-1">
                      <span>{{ u.name }}</span>
                      <button type="button" class="text-slate-500 hover:text-amber-400 text-[10px] font-mono" @click="copyText('ID', u.id)">{{ t('admin.copyId') }}</button>
                    </div>
                  </td>
                  <td class="py-2 px-2 text-slate-400">
                    <div class="flex items-center gap-1 flex-wrap">
                      <span class="break-all">{{ u.email }}</span>
                      <button type="button" class="text-slate-500 hover:text-amber-400 shrink-0 text-[10px]" @click="copyText('email', u.email)">{{ t('admin.copyEmail') }}</button>
                    </div>
                  </td>
                  <td class="py-2 px-1 text-center">
                    <span v-if="u.is_admin" class="text-amber-400 font-bold">✓</span>
                    <span v-else class="text-slate-600">—</span>
                  </td>
                  <td class="py-2 px-1 text-center">
                    <span v-if="u.is_banned" class="text-red-400 font-bold" :title="u.ban_reason || ''">!</span>
                    <span v-else class="text-slate-600">—</span>
                  </td>
                  <td class="py-2 px-2 text-slate-500 whitespace-nowrap">{{ fmtTs(u.last_activity_ts) }}</td>
                  <td class="py-2 px-1 text-right text-slate-400 font-mono">{{ u.session_count }}</td>
                  <td class="py-2 px-2 text-right">
                    <div class="flex flex-wrap justify-end gap-1">
                      <button type="button" @click="toggleAdmin(u)"
                              class="text-[10px] font-bold px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white">{{ t('admin.toggleAdmin') }}</button>
                      <button v-if="!u.is_banned" type="button" @click="openBanModal(u)"
                              class="text-[10px] font-bold px-2 py-1 rounded bg-red-900/50 hover:bg-red-800 text-red-200">{{ t('admin.toggleBan') }}</button>
                      <button v-else type="button" @click="openUnbanModal(u)"
                              class="text-[10px] font-bold px-2 py-1 rounded bg-emerald-900/40 hover:bg-emerald-800 text-emerald-200">{{ t('admin.unban') }}</button>
                      <button type="button" @click="openRevokeModal(u)"
                              class="text-[10px] font-bold px-2 py-1 rounded bg-slate-600 hover:bg-slate-500 text-white">{{ t('admin.revokeSessions') }}</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="users.meta && users.meta.last_page > 1" class="flex justify-center items-center gap-3 mt-4">
            <button type="button" :disabled="userPage <= 1" @click="loadUsers(userPage - 1)"
                    class="px-4 py-2 rounded-xl text-sm font-bold bg-slate-800 text-white disabled:opacity-30">‹</button>
            <span class="text-slate-400 text-sm">{{ userPage }} / {{ users.meta.last_page }}</span>
            <button type="button" :disabled="userPage >= users.meta.last_page" @click="loadUsers(userPage + 1)"
                    class="px-4 py-2 rounded-xl text-sm font-bold bg-slate-800 text-white disabled:opacity-30">›</button>
          </div>
        </template>

        <!-- MONITOR -->
        <template v-else-if="tab === 'monitor' && overview">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
            <div class="bg-slate-800 border border-slate-700 rounded-xl p-3">
              <p class="text-slate-500 text-[10px] uppercase font-bold">{{ t('admin.usersTotal') }}</p>
              <p class="text-xl font-black text-white">{{ overview.users_total }}</p>
            </div>
            <div class="bg-slate-800 border border-slate-700 rounded-xl p-3">
              <p class="text-slate-500 text-[10px] uppercase font-bold">{{ t('admin.activePlayers') }}</p>
              <p class="text-xl font-black text-emerald-400">{{ overview.active_players }}</p>
            </div>
            <div class="bg-slate-800 border border-slate-700 rounded-xl p-3">
              <p class="text-slate-500 text-[10px] uppercase font-bold">{{ t('admin.gamesTotal') }}</p>
              <p class="text-xl font-black text-white">{{ overview.games_total }}</p>
            </div>
            <div class="bg-slate-800 border border-slate-700 rounded-xl p-3">
              <p class="text-slate-500 text-[10px] uppercase font-bold">{{ t('admin.matchesActive') }}</p>
              <p class="text-xl font-black text-amber-400">{{ overview.matches_active }}</p>
            </div>
          </div>

          <h2 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">{{ t('admin.analyticsTitle') }}</h2>
          <div v-if="overview.analytics" class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8 text-xs">
            <div class="bg-slate-900/60 border border-slate-700 rounded-lg p-2">
              <div class="text-slate-500">{{ t('admin.usersNewToday') }}</div>
              <div class="text-lg font-black text-white">{{ overview.analytics.users_new_today }}</div>
            </div>
            <div class="bg-slate-900/60 border border-slate-700 rounded-lg p-2">
              <div class="text-slate-500">{{ t('admin.usersNew7d') }}</div>
              <div class="text-lg font-black text-white">{{ overview.analytics.users_new_7d }}</div>
            </div>
            <div class="bg-slate-900/60 border border-slate-700 rounded-lg p-2">
              <div class="text-slate-500">{{ t('admin.soloX01Today') }}</div>
              <div class="text-lg font-black text-indigo-300">{{ overview.analytics.solo_x01_finished_today }}</div>
            </div>
            <div class="bg-slate-900/60 border border-slate-700 rounded-lg p-2">
              <div class="text-slate-500">{{ t('admin.soloX017d') }}</div>
              <div class="text-lg font-black text-indigo-300">{{ overview.analytics.solo_x01_finished_7d }}</div>
            </div>
            <div class="bg-slate-900/60 border border-slate-700 rounded-lg p-2">
              <div class="text-slate-500">{{ t('admin.mpFinToday') }}</div>
              <div class="text-lg font-black text-emerald-300">{{ overview.analytics.mp_matches_finished_today }}</div>
            </div>
            <div class="bg-slate-900/60 border border-slate-700 rounded-lg p-2">
              <div class="text-slate-500">{{ t('admin.mpFin7d') }}</div>
              <div class="text-lg font-black text-emerald-300">{{ overview.analytics.mp_matches_finished_7d }}</div>
            </div>
            <div class="bg-slate-900/60 border border-slate-700 rounded-lg p-2">
              <div class="text-slate-500">{{ t('admin.mpAbToday') }}</div>
              <div class="text-lg font-black text-red-300">{{ overview.analytics.mp_matches_abandoned_today }}</div>
            </div>
            <div class="bg-slate-900/60 border border-slate-700 rounded-lg p-2">
              <div class="text-slate-500">{{ t('admin.mpAb7d') }}</div>
              <div class="text-lg font-black text-red-300">{{ overview.analytics.mp_matches_abandoned_7d }}</div>
            </div>
          </div>

          <h2 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">{{ t('admin.topSessionsTitle') }}</h2>
          <div class="bg-slate-800/80 border border-slate-700 rounded-xl overflow-x-auto mb-8">
            <table class="w-full text-sm">
              <tbody>
                <tr v-for="row in (overview.top_sessions || [])" :key="row.user_id" class="border-t border-slate-700/60">
                  <td class="py-2 px-3 text-white">{{ row.name }}</td>
                  <td class="py-2 px-3 text-right text-amber-400 font-mono">{{ row.count }}</td>
                </tr>
                <tr v-if="!(overview.top_sessions && overview.top_sessions.length)">
                  <td class="py-4 text-center text-slate-500">{{ t('stats.noData') }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <details class="mb-8 bg-slate-800/60 border border-slate-700 rounded-xl p-4">
            <summary class="cursor-pointer font-bold text-slate-300">{{ t('admin.buildTitle') }}</summary>
            <div v-if="overview.build" class="mt-3 text-sm text-slate-400 space-y-2">
              <div><span class="text-slate-500">{{ t('admin.appVersion') }}:</span> {{ overview.build.app_version || '—' }}</div>
              <div><span class="text-slate-500">{{ t('admin.laravelVer') }}:</span> {{ overview.build.laravel_version }}</div>
              <div class="text-slate-500 text-xs font-bold uppercase">{{ t('admin.lastMigrations') }}</div>
              <ul class="font-mono text-xs text-slate-300 list-disc pl-4">
                <li v-for="m in (overview.build.last_migrations || [])" :key="m">{{ m }}</li>
              </ul>
            </div>
          </details>

          <h2 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">{{ t('admin.sessionsTitle') }}</h2>
          <div class="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden mb-8">
            <div v-if="!overview.sessions || overview.sessions.length === 0" class="p-6 text-center text-slate-500 text-sm">{{ t('admin.noSessions') }}</div>
            <table v-else class="w-full text-sm">
              <thead class="text-slate-500 bg-slate-900/50">
                <tr>
                  <th class="text-left py-2 px-3">{{ t('stats.player') }}</th>
                  <th class="text-left py-2 px-3">{{ t('admin.ip') }}</th>
                  <th class="text-right py-2 px-3">{{ t('admin.lastActivity') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in overview.sessions" :key="s.session_id" class="border-t border-slate-700/60">
                  <td class="py-2 px-3 text-white">{{ s.user_name || ('#' + s.user_id) }}</td>
                  <td class="py-2 px-3 text-slate-400 font-mono text-xs">{{ s.ip_address || '—' }}</td>
                  <td class="py-2 px-3 text-right text-slate-400">{{ fmtTs(s.last_activity) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">{{ t('admin.matchesTitle') }}</h2>
          <div class="bg-slate-800/80 border border-slate-700 rounded-xl overflow-x-auto mb-8">
            <table class="w-full text-sm min-w-[420px]">
              <thead class="text-slate-500 bg-slate-900/50">
                <tr>
                  <th class="text-left py-2 px-3">ID</th>
                  <th class="text-left py-2 px-3">{{ t('admin.room') }}</th>
                  <th class="text-left py-2 px-3">Type</th>
                  <th class="text-right py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="m in overview.active_matches" :key="m.id" class="border-t border-slate-700/60">
                  <td class="py-2 px-3 font-mono text-slate-300">{{ m.id }}</td>
                  <td class="py-2 px-3 text-amber-400 font-mono">{{ m.room_code }}</td>
                  <td class="py-2 px-3">{{ m.game_type }}</td>
                  <td class="py-2 px-3 text-right whitespace-nowrap">
                    <button type="button" @click="openInspectMatch(m.id)"
                            class="text-[10px] font-bold px-2 py-1 rounded bg-slate-700 text-white mr-1">{{ t('admin.detail') }}</button>
                    <button type="button" @click="openDanger('match_abandon', m.id)"
                            class="text-[10px] font-bold px-2 py-1 rounded bg-red-900/60 text-red-200">{{ t('admin.forceAbandon') }}</button>
                  </td>
                </tr>
                <tr v-if="!overview.active_matches || overview.active_matches.length === 0">
                  <td colspan="4" class="py-6 text-center text-slate-500">{{ t('stats.noData') }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">{{ t('admin.roomsTitle') }}</h2>
          <div class="bg-slate-800/80 border border-slate-700 rounded-xl overflow-x-auto">
            <table class="w-full text-sm min-w-[480px]">
              <thead class="text-slate-500 bg-slate-900/50">
                <tr>
                  <th class="text-left py-2 px-3">ID</th>
                  <th class="text-left py-2 px-3">Code</th>
                  <th class="text-left py-2 px-3">Type</th>
                  <th class="text-left py-2 px-3">Status</th>
                  <th class="text-right py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in overview.active_rooms" :key="r.id" class="border-t border-slate-700/60">
                  <td class="py-2 px-3 font-mono text-slate-300">{{ r.id }}</td>
                  <td class="py-2 px-3 text-amber-400 font-mono">{{ r.code }}</td>
                  <td class="py-2 px-3">{{ r.game_type }}</td>
                  <td class="py-2 px-3 text-slate-400">{{ r.status }}</td>
                  <td class="py-2 px-3 text-right whitespace-nowrap">
                    <button type="button" @click="openInspectRoom(r.id)"
                            class="text-[10px] font-bold px-2 py-1 rounded bg-slate-700 text-white mr-1">{{ t('admin.detail') }}</button>
                    <button type="button" @click="openDanger('room_close', r.id)"
                            class="text-[10px] font-bold px-2 py-1 rounded bg-red-900/60 text-red-200">{{ t('admin.forceCloseRoom') }}</button>
                  </td>
                </tr>
                <tr v-if="!overview.active_rooms || overview.active_rooms.length === 0">
                  <td colspan="5" class="py-6 text-center text-slate-500">{{ t('stats.noData') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <!-- AUDIT -->
        <template v-else-if="tab === 'audit'">
          <div class="bg-slate-800/80 border border-slate-700 rounded-xl overflow-x-auto">
            <table class="w-full text-xs sm:text-sm min-w-[640px]">
              <thead class="text-slate-500 bg-slate-900/50">
                <tr>
                  <th class="text-left py-2 px-2">{{ t('admin.auditTime') }}</th>
                  <th class="text-left py-2 px-2">{{ t('admin.auditAction') }}</th>
                  <th class="text-left py-2 px-2">{{ t('admin.auditAdmin') }}</th>
                  <th class="text-left py-2 px-2">{{ t('admin.auditTarget') }}</th>
                  <th class="text-left py-2 px-2">{{ t('admin.auditMeta') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="a in audit.items" :key="a.id" class="border-t border-slate-700/60">
                  <td class="py-2 px-2 text-slate-400 whitespace-nowrap">{{ fmtIso(a.created_at) }}</td>
                  <td class="py-2 px-2 text-amber-300 font-mono">{{ a.action }}</td>
                  <td class="py-2 px-2 text-white">{{ a.admin_name }}</td>
                  <td class="py-2 px-2 text-slate-300">{{ a.target_name || (a.target_user_id ? '#' + a.target_user_id : '—') }}</td>
                  <td class="py-2 px-2 text-slate-500 font-mono text-[10px] break-all">{{ JSON.stringify(a.metadata || {}) }}</td>
                </tr>
                <tr v-if="!audit.items.length">
                  <td colspan="5" class="py-8 text-center text-slate-500">{{ t('stats.noData') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="audit.meta && audit.meta.last_page > 1" class="flex justify-center items-center gap-3 mt-4">
            <button type="button" :disabled="auditPage <= 1" @click="loadAudit(auditPage - 1)"
                    class="px-4 py-2 rounded-xl text-sm font-bold bg-slate-800 text-white disabled:opacity-30">‹</button>
            <span class="text-slate-400 text-sm">{{ auditPage }} / {{ audit.meta.last_page }}</span>
            <button type="button" :disabled="auditPage >= audit.meta.last_page" @click="loadAudit(auditPage + 1)"
                    class="px-4 py-2 rounded-xl text-sm font-bold bg-slate-800 text-white disabled:opacity-30">›</button>
          </div>
        </template>

        <!-- Inspect JSON modal -->
        <Teleport to="body">
          <div v-if="inspectJson" class="fixed inset-0 z-[80] overflow-y-auto overscroll-y-contain flex items-start justify-center bg-black/70 p-4 sm:p-6" @click.self="closeInspect">
            <div class="my-4 w-full max-w-3xl max-h-[min(85vh,calc(100dvh-2rem))] overflow-hidden flex flex-col shrink-0 bg-[#0d1a2e] border border-slate-600 rounded-2xl shadow-2xl">
              <div class="shrink-0 px-4 py-3 border-b border-slate-700 flex justify-between items-center gap-2">
                <span class="font-bold text-white text-sm truncate">{{ inspectTitle }}</span>
                <button type="button" @click="closeInspect" class="text-slate-400 hover:text-white text-xl leading-none shrink-0">&times;</button>
              </div>
              <pre class="p-4 overflow-auto text-xs leading-relaxed text-emerald-200/90 font-mono flex-1 min-h-0">{{ JSON.stringify(inspectJson, null, 2) }}</pre>
            </div>
          </div>
        </Teleport>

        <!-- Danger confirm -->
        <Teleport to="body">
          <div v-if="danger.open" class="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-black/80 p-4" @click.self="danger.open = false">
            <div class="bg-[#1a0a0a] border border-red-900/50 rounded-2xl max-w-sm w-full p-5 shadow-2xl overflow-hidden">
              <h3 class="text-lg font-black text-red-300 mb-2">{{ t('admin.confirmDanger') }}</h3>
              <p class="text-sm text-slate-400 mb-4">{{ t('admin.confirmDangerHint') }}</p>
              <label class="flex items-start gap-2 text-sm text-slate-200 mb-4 cursor-pointer">
                <input type="checkbox" v-model="danger.chk" class="mt-1 rounded border-slate-600"/>
                <span>{{ t('admin.confirmCheckbox') }}</span>
              </label>
              <div class="flex gap-2">
                <button type="button" @click="danger.open = false" class="flex-1 py-3 rounded-xl bg-slate-700 font-bold text-white">{{ t('admin.cancelBtn') }}</button>
                <button type="button" @click="execDanger" :disabled="!danger.chk"
                        class="flex-1 py-3 rounded-xl bg-red-600 font-black text-white disabled:opacity-30">{{ t('admin.confirmBtn') }}</button>
              </div>
            </div>
          </div>
        </Teleport>

        <!-- Ban / unban / revoke sessions -->
        <Teleport to="body">
          <div v-if="userModal.open" class="fixed inset-0 z-[90] overflow-y-auto overscroll-y-contain flex items-start sm:items-center justify-center bg-black/80 p-4 sm:p-6" @click.self="closeUserModal">
            <div class="my-auto max-h-[calc(100dvh-3rem)] overflow-y-auto bg-[#0d1a2e] border border-slate-600 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col">
              <template v-if="userModal.kind === 'ban'">
                <h3 class="text-lg font-black text-red-300 mb-1">{{ t('admin.banModalTitle') }}</h3>
                <p class="text-sm text-amber-200/90 font-bold mb-1">{{ userModal.user?.name }}</p>
                <p class="text-xs text-slate-500 mb-3 break-all">{{ userModal.user?.email }}</p>
                <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{{ t('admin.banModalHint') }}</label>
                <textarea v-model="userModal.banReason" rows="3"
                          class="w-full mt-1 mb-3 bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white resize-y min-h-[4.5rem]"></textarea>
                <div class="flex gap-2">
                  <button type="button" @click="closeUserModal" class="flex-1 py-3 rounded-xl bg-slate-700 font-bold text-white">{{ t('admin.cancelBtn') }}</button>
                  <button type="button" @click="submitUserModal" :disabled="userModalBusy"
                          class="flex-1 py-3 rounded-xl bg-red-600 font-black text-white disabled:opacity-40">{{ t('admin.banModalConfirm') }}</button>
                </div>
              </template>
              <template v-else-if="userModal.kind === 'unban'">
                <h3 class="text-lg font-black text-emerald-300 mb-2">{{ t('admin.unbanModalTitle') }}</h3>
                <p class="text-sm text-slate-300 mb-1"><strong class="text-white">{{ userModal.user?.name }}</strong></p>
                <p class="text-sm text-slate-400 mb-6">{{ t('admin.unbanModalBody') }}</p>
                <div class="flex gap-2">
                  <button type="button" @click="closeUserModal" class="flex-1 py-3 rounded-xl bg-slate-700 font-bold text-white">{{ t('admin.cancelBtn') }}</button>
                  <button type="button" @click="submitUserModal" :disabled="userModalBusy"
                          class="flex-1 py-3 rounded-xl bg-emerald-600 font-black text-white disabled:opacity-40">{{ t('admin.unbanModalConfirm') }}</button>
                </div>
              </template>
              <template v-else-if="userModal.kind === 'revoke'">
                <h3 class="text-lg font-black text-amber-300 mb-2">{{ t('admin.revokeModalTitle') }}</h3>
                <p class="text-sm text-white font-bold mb-1">{{ userModal.user?.name }}</p>
                <p class="text-xs text-slate-500 mb-3 break-all">{{ userModal.user?.email }}</p>
                <p class="text-sm text-slate-400 mb-4">{{ t('admin.revokeModalBody') }}</p>
                <label class="flex items-start gap-2 text-sm text-slate-200 mb-4 cursor-pointer">
                  <input type="checkbox" v-model="userModal.revokeAck" class="mt-1 rounded border-slate-600"/>
                  <span>{{ t('admin.revokeModalAck') }}</span>
                </label>
                <div class="flex gap-2">
                  <button type="button" @click="closeUserModal" class="flex-1 py-3 rounded-xl bg-slate-700 font-bold text-white">{{ t('admin.cancelBtn') }}</button>
                  <button type="button" @click="submitUserModal" :disabled="userModalBusy || !userModal.revokeAck"
                          class="flex-1 py-3 rounded-xl bg-amber-500 font-black text-black disabled:opacity-40">{{ t('admin.revokeModalConfirm') }}</button>
                </div>
              </template>
            </div>
          </div>
        </Teleport>
      </div>
    </div>
  `,
};
