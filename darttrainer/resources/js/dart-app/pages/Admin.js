import { AdminPanel } from '../api/client.js';
import * as Vue from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore, useLocaleStore } from '../store/index.js';

export default {
  setup() {
    const auth   = useAuthStore();
    const locale = useLocaleStore();
    const t      = (k) => locale.t(k);
    const router = useRouter();

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

    const ipCountryByIp = Vue.reactive({});
    const ipGeoBusyByIp = Vue.reactive({});

    function isPrivateIp(ip) {
      const s = String(ip || '').trim();
      if (!s) return true;
      if (s === '127.0.0.1' || s === '::1' || s === 'localhost') return true;
      if (s.startsWith('10.') || s.startsWith('192.168.') || s.startsWith('169.254.')) return true;
      // 172.16.0.0 – 172.31.255.255
      if (s.startsWith('172.')) {
        const parts = s.split('.');
        const n = Number(parts[1]);
        if (n >= 16 && n <= 31) return true;
      }
      return false;
    }

    function flagEmoji(countryCode) {
      const cc = String(countryCode || '').trim().toUpperCase();
      if (!/^[A-Z]{2}$/.test(cc)) return '';
      const A = 0x1F1E6;
      const c1 = cc.charCodeAt(0) - 65;
      const c2 = cc.charCodeAt(1) - 65;
      return String.fromCodePoint(A + c1, A + c2);
    }

    async function resolveIpCountry(ip) {
      const key = String(ip || '').trim();
      if (!key || isPrivateIp(key)) return;
      if (ipCountryByIp[key] || ipGeoBusyByIp[key]) return;
      ipGeoBusyByIp[key] = true;
      try {
        // Light external lookup with implicit caching in-memory.
        const r = await fetch(`https://ipapi.co/${encodeURIComponent(key)}/country/`, { cache: 'force-cache' });
        if (!r.ok) return;
        const cc = (await r.text()).trim().toUpperCase();
        if (/^[A-Z]{2}$/.test(cc)) {
          ipCountryByIp[key] = cc;
        }
      } catch (_) {
        // ignore
      } finally {
        ipGeoBusyByIp[key] = false;
      }
    }

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
        const ips = (data?.sessions || [])
          .map(s => s?.ip_address)
          .filter(Boolean);
        const uniq = Array.from(new Set(ips));
        uniq.slice(0, 50).forEach(ip => resolveIpCountry(ip));
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
      ipCountryByIp, flagEmoji,
    };
  },

  template: `
    <div class="flex-1 overflow-y-auto min-h-0" style="background:#0b0e14">
      <div class="max-w-6xl mx-auto px-4 py-8">

        <!-- Header -->
        <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                 style="background:linear-gradient(135deg,#f5a623,#f5c842)">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                   class="w-4 h-4" style="color:#0b0e14">
                <path fill-rule="evenodd" d="M9.661 2.237a.531.531 0 01.678 0 11.947 11.947 0 007.078 2.749.5.5 0 01.479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 01-.332 0C5.26 16.563 2 12.162 2 7a11.88 11.88 0 01.104-1.589.5.5 0 01.48-.425 11.947 11.947 0 007.077-2.749z" clip-rule="evenodd"/>
              </svg>
            </div>
            <h1 class="text-xl font-black" style="color:#e8eaf0">{{ t('admin.title') }}</h1>
          </div>
          <button type="button"
                  @click="loadOverview(); loadUsers(userPage); tab === 'audit' && loadAudit(auditPage)"
                  class="text-xs font-bold px-4 py-2 rounded-xl transition"
                  style="background:#1a2030;color:#7b8ba8;border:1px solid #252d3d"
                  onmouseover="this.style.color='#e8eaf0'" onmouseout="this.style.color='#7b8ba8'">
            {{ t('admin.refresh') }}
          </button>
        </div>

        <!-- Tabs -->
        <div class="flex gap-1 mb-6 p-1 rounded-xl" style="background:#131720;border:1px solid #1e2738">
          <button type="button" @click="tab = 'users'"
                  class="flex-1 sm:flex-none px-5 py-2 rounded-lg text-sm font-bold transition"
                  :style="tab === 'users'
                    ? 'background:linear-gradient(135deg,#f5a623,#f5c842);color:#0b0e14'
                    : 'color:#7b8ba8'">
            {{ t('admin.tabUsers') }}
          </button>
          <button type="button" @click="tab = 'monitor'"
                  class="flex-1 sm:flex-none px-5 py-2 rounded-lg text-sm font-bold transition"
                  :style="tab === 'monitor'
                    ? 'background:linear-gradient(135deg,#f5a623,#f5c842);color:#0b0e14'
                    : 'color:#7b8ba8'">
            {{ t('admin.tabMonitor') }}
          </button>
          <button type="button" @click="tab = 'audit'"
                  class="flex-1 sm:flex-none px-5 py-2 rounded-lg text-sm font-bold transition"
                  :style="tab === 'audit'
                    ? 'background:linear-gradient(135deg,#f5a623,#f5c842);color:#0b0e14'
                    : 'color:#7b8ba8'">
            {{ t('admin.tabAudit') }}
          </button>
        </div>

        <!-- ── USERS ───────────────────────────────────────────────────── -->
        <template v-if="tab === 'users'">

          <!-- Filters -->
          <div class="rounded-xl p-4 mb-4 space-y-3" style="background:#131720;border:1px solid #1e2738">
            <div class="flex flex-wrap gap-3 items-end">
              <div class="flex-1 min-w-[180px]">
                <label class="text-[10px] font-bold uppercase tracking-[0.1em]" style="color:#3a4a63">{{ t('admin.searchPlaceholder') }}</label>
                <input v-model="userFilters.search" type="text"
                       class="w-full mt-1 rounded-lg px-3 py-2 text-sm outline-none transition focus:ring-1"
                       style="background:#0b0e14;border:1px solid #1e2738;color:#e8eaf0"
                       onfocus="this.style.borderColor='#f5a623'" onblur="this.style.borderColor='#1e2738'"/>
              </div>
              <label class="flex items-center gap-2 text-sm cursor-pointer" style="color:#7b8ba8">
                <input type="checkbox" v-model="userFilters.only_admin" class="rounded"/>
                {{ t('admin.onlyAdmins') }}
              </label>
              <label class="flex items-center gap-2 text-sm cursor-pointer" style="color:#7b8ba8">
                <input type="checkbox" v-model="userFilters.only_banned" class="rounded"/>
                {{ t('admin.onlyBanned') }}
              </label>
              <div>
                <label class="text-[10px] font-bold uppercase tracking-[0.1em]" style="color:#3a4a63">{{ t('admin.dateFrom') }}</label>
                <input v-model="userFilters.date_from" type="date"
                       class="block mt-1 rounded-lg px-2 py-1.5 text-sm outline-none"
                       style="background:#0b0e14;border:1px solid #1e2738;color:#e8eaf0"
                       onfocus="this.style.borderColor='#f5a623'" onblur="this.style.borderColor='#1e2738'"/>
              </div>
              <div>
                <label class="text-[10px] font-bold uppercase tracking-[0.1em]" style="color:#3a4a63">{{ t('admin.dateTo') }}</label>
                <input v-model="userFilters.date_to" type="date"
                       class="block mt-1 rounded-lg px-2 py-1.5 text-sm outline-none"
                       style="background:#0b0e14;border:1px solid #1e2738;color:#e8eaf0"
                       onfocus="this.style.borderColor='#f5a623'" onblur="this.style.borderColor='#1e2738'"/>
              </div>
            </div>
            <p class="text-[10px]" style="color:#3a4a63">{{ t('admin.filtersAutoHint') }}</p>
          </div>

          <!-- Users table -->
          <div v-if="loading && !users.items.length" class="py-12 text-center" style="color:#3a4a63">…</div>
          <div v-else class="rounded-xl overflow-x-auto" style="background:#131720;border:1px solid #1e2738">
            <table class="w-full text-xs sm:text-sm min-w-[720px]">
              <thead>
                <tr style="background:#0b0e14">
                  <th class="text-left py-2.5 px-3 text-[10px] font-bold uppercase tracking-[0.1em]" style="color:#3a4a63">{{ t('admin.name') }}</th>
                  <th class="text-left py-2.5 px-3 text-[10px] font-bold uppercase tracking-[0.1em]" style="color:#3a4a63">{{ t('admin.email') }}</th>
                  <th class="text-center py-2.5 px-2 text-[10px] font-bold uppercase tracking-[0.1em]" style="color:#3a4a63">{{ t('admin.admin') }}</th>
                  <th class="text-center py-2.5 px-2 text-[10px] font-bold uppercase tracking-[0.1em]" style="color:#3a4a63">{{ t('admin.banned') }}</th>
                  <th class="text-left py-2.5 px-3 text-[10px] font-bold uppercase tracking-[0.1em]" style="color:#3a4a63">{{ t('admin.lastActivity') }}</th>
                  <th class="text-right py-2.5 px-2 text-[10px] font-bold uppercase tracking-[0.1em]" style="color:#3a4a63">{{ t('admin.sessions') }}</th>
                  <th class="py-2.5 px-3"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="u in users.items" :key="u.id" style="border-top:1px solid #1e2738">
                  <td class="py-2.5 px-3 font-medium" style="color:#e8eaf0">
                    <div class="flex items-center gap-1.5">
                      <span>{{ u.name }}</span>
                      <button type="button" class="text-[10px] font-mono transition"
                              style="color:#3a4a63"
                              onmouseover="this.style.color='#f5a623'" onmouseout="this.style.color='#3a4a63'"
                              @click="copyText('ID', u.id)">{{ t('admin.copyId') }}</button>
                    </div>
                  </td>
                  <td class="py-2.5 px-3" style="color:#7b8ba8">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span class="break-all">{{ u.email }}</span>
                      <button type="button" class="text-[10px] shrink-0 transition"
                              style="color:#3a4a63"
                              onmouseover="this.style.color='#f5a623'" onmouseout="this.style.color='#3a4a63'"
                              @click="copyText('email', u.email)">{{ t('admin.copyEmail') }}</button>
                    </div>
                  </td>
                  <td class="py-2.5 px-2 text-center">
                    <span v-if="u.is_admin" class="text-xs font-black" style="color:#f5a623">✓</span>
                    <span v-else style="color:#3a4a63">—</span>
                  </td>
                  <td class="py-2.5 px-2 text-center">
                    <span v-if="u.is_banned" class="text-xs font-black" style="color:#f87171" :title="u.ban_reason || ''">!</span>
                    <span v-else style="color:#3a4a63">—</span>
                  </td>
                  <td class="py-2.5 px-3 text-xs whitespace-nowrap" style="color:#3a4a63">{{ fmtTs(u.last_activity_ts) }}</td>
                  <td class="py-2.5 px-2 text-right font-mono text-xs" style="color:#7b8ba8">{{ u.session_count }}</td>
                  <td class="py-2.5 px-3 text-right">
                    <div class="flex flex-wrap justify-end gap-1">
                      <button type="button" @click="toggleAdmin(u)"
                              class="text-[10px] font-bold px-2 py-1 rounded-lg transition"
                              style="background:#1a2030;color:#7b8ba8;border:1px solid #252d3d"
                              onmouseover="this.style.color='#e8eaf0'" onmouseout="this.style.color='#7b8ba8'">{{ t('admin.toggleAdmin') }}</button>
                      <button v-if="!u.is_banned" type="button" @click="openBanModal(u)"
                              class="text-[10px] font-bold px-2 py-1 rounded-lg transition"
                              style="background:#2d1515;color:#f87171;border:1px solid rgba(239,68,68,.25)"
                              onmouseover="this.style.background='#3d1818'" onmouseout="this.style.background='#2d1515'">{{ t('admin.toggleBan') }}</button>
                      <button v-else type="button" @click="openUnbanModal(u)"
                              class="text-[10px] font-bold px-2 py-1 rounded-lg transition"
                              style="background:#0e2b1c;color:#3ecf8e;border:1px solid rgba(62,207,142,.2)"
                              onmouseover="this.style.background='#143820'" onmouseout="this.style.background='#0e2b1c'">{{ t('admin.unban') }}</button>
                      <button type="button" @click="openRevokeModal(u)"
                              class="text-[10px] font-bold px-2 py-1 rounded-lg transition"
                              style="background:#1a2030;color:#7b8ba8;border:1px solid #252d3d"
                              onmouseover="this.style.color='#e8eaf0'" onmouseout="this.style.color='#7b8ba8'">{{ t('admin.revokeSessions') }}</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="users.meta && users.meta.last_page > 1" class="flex justify-center items-center gap-3 mt-4">
            <button type="button" :disabled="userPage <= 1" @click="loadUsers(userPage - 1)"
                    class="w-9 h-9 rounded-xl text-sm font-black transition disabled:opacity-30"
                    style="background:#131720;color:#7b8ba8;border:1px solid #1e2738">‹</button>
            <span class="text-sm font-bold" style="color:#7b8ba8">{{ userPage }} / {{ users.meta.last_page }}</span>
            <button type="button" :disabled="userPage >= users.meta.last_page" @click="loadUsers(userPage + 1)"
                    class="w-9 h-9 rounded-xl text-sm font-black transition disabled:opacity-30"
                    style="background:#131720;color:#7b8ba8;border:1px solid #1e2738">›</button>
          </div>
        </template>

        <!-- ── MONITOR ─────────────────────────────────────────────────── -->
        <template v-else-if="tab === 'monitor' && overview">

          <!-- Stat cards -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
            <div class="rounded-xl p-4" style="background:#131720;border:1px solid #1e2738">
              <p class="text-[10px] font-bold uppercase tracking-[0.1em] mb-1" style="color:#3a4a63">{{ t('admin.usersTotal') }}</p>
              <p class="text-2xl font-black" style="color:#e8eaf0">{{ overview.users_total }}</p>
            </div>
            <div class="rounded-xl p-4" style="background:#131720;border:1px solid #1e2738">
              <p class="text-[10px] font-bold uppercase tracking-[0.1em] mb-1" style="color:#3a4a63">{{ t('admin.activePlayers') }}</p>
              <p class="text-2xl font-black" style="color:#3ecf8e">{{ overview.active_players }}</p>
            </div>
            <div class="rounded-xl p-4" style="background:#131720;border:1px solid #1e2738">
              <p class="text-[10px] font-bold uppercase tracking-[0.1em] mb-1" style="color:#3a4a63">{{ t('admin.gamesTotal') }}</p>
              <p class="text-2xl font-black" style="color:#e8eaf0">{{ overview.games_total }}</p>
            </div>
            <div class="rounded-xl p-4" style="background:#131720;border:1px solid #1e2738">
              <p class="text-[10px] font-bold uppercase tracking-[0.1em] mb-1" style="color:#3a4a63">{{ t('admin.matchesActive') }}</p>
              <p class="text-2xl font-black" style="color:#f5a623">{{ overview.matches_active }}</p>
            </div>
          </div>

          <!-- Analytics -->
          <p class="text-[10px] font-bold uppercase tracking-[0.1em] mb-3" style="color:#3a4a63">{{ t('admin.analyticsTitle') }}</p>
          <div v-if="overview.analytics" class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
            <div class="rounded-lg p-3" style="background:#0f1520;border:1px solid #1e2738">
              <div class="text-[11px] mb-1" style="color:#7b8ba8">{{ t('admin.usersNewToday') }}</div>
              <div class="text-lg font-black" style="color:#e8eaf0">{{ overview.analytics.users_new_today }}</div>
            </div>
            <div class="rounded-lg p-3" style="background:#0f1520;border:1px solid #1e2738">
              <div class="text-[11px] mb-1" style="color:#7b8ba8">{{ t('admin.usersNew7d') }}</div>
              <div class="text-lg font-black" style="color:#e8eaf0">{{ overview.analytics.users_new_7d }}</div>
            </div>
            <div class="rounded-lg p-3" style="background:#0f1520;border:1px solid #1e2738">
              <div class="text-[11px] mb-1" style="color:#7b8ba8">{{ t('admin.soloX01Today') }}</div>
              <div class="text-lg font-black" style="color:#a5b4fc">{{ overview.analytics.solo_x01_finished_today }}</div>
            </div>
            <div class="rounded-lg p-3" style="background:#0f1520;border:1px solid #1e2738">
              <div class="text-[11px] mb-1" style="color:#7b8ba8">{{ t('admin.soloX017d') }}</div>
              <div class="text-lg font-black" style="color:#a5b4fc">{{ overview.analytics.solo_x01_finished_7d }}</div>
            </div>
            <div class="rounded-lg p-3" style="background:#0f1520;border:1px solid #1e2738">
              <div class="text-[11px] mb-1" style="color:#7b8ba8">{{ t('admin.mpFinToday') }}</div>
              <div class="text-lg font-black" style="color:#3ecf8e">{{ overview.analytics.mp_matches_finished_today }}</div>
            </div>
            <div class="rounded-lg p-3" style="background:#0f1520;border:1px solid #1e2738">
              <div class="text-[11px] mb-1" style="color:#7b8ba8">{{ t('admin.mpFin7d') }}</div>
              <div class="text-lg font-black" style="color:#3ecf8e">{{ overview.analytics.mp_matches_finished_7d }}</div>
            </div>
            <div class="rounded-lg p-3" style="background:#0f1520;border:1px solid #1e2738">
              <div class="text-[11px] mb-1" style="color:#7b8ba8">{{ t('admin.mpAbToday') }}</div>
              <div class="text-lg font-black" style="color:#f87171">{{ overview.analytics.mp_matches_abandoned_today }}</div>
            </div>
            <div class="rounded-lg p-3" style="background:#0f1520;border:1px solid #1e2738">
              <div class="text-[11px] mb-1" style="color:#7b8ba8">{{ t('admin.mpAb7d') }}</div>
              <div class="text-lg font-black" style="color:#f87171">{{ overview.analytics.mp_matches_abandoned_7d }}</div>
            </div>
          </div>

          <!-- Top sessions -->
          <p class="text-[10px] font-bold uppercase tracking-[0.1em] mb-3" style="color:#3a4a63">{{ t('admin.topSessionsTitle') }}</p>
          <div class="rounded-xl overflow-x-auto mb-8" style="background:#131720;border:1px solid #1e2738">
            <table class="w-full text-sm">
              <tbody>
                <tr v-for="row in (overview.top_sessions || [])" :key="row.user_id" style="border-top:1px solid #1e2738">
                  <td class="py-2.5 px-4" style="color:#e8eaf0">{{ row.name }}</td>
                  <td class="py-2.5 px-4 text-right font-mono font-bold" style="color:#f5a623">{{ row.count }}</td>
                </tr>
                <tr v-if="!(overview.top_sessions && overview.top_sessions.length)">
                  <td class="py-6 text-center text-sm" style="color:#3a4a63">{{ t('stats.noData') }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Build info -->
          <details class="mb-8 rounded-xl" style="background:#131720;border:1px solid #1e2738">
            <summary class="px-4 py-3 cursor-pointer text-sm font-bold rounded-xl" style="color:#7b8ba8">{{ t('admin.buildTitle') }}</summary>
            <div v-if="overview.build" class="px-4 pb-4 text-sm space-y-2" style="border-top:1px solid #1e2738">
              <div class="pt-3"><span style="color:#3a4a63">{{ t('admin.appVersion') }}:</span> <span style="color:#e8eaf0">{{ overview.build.app_version || '—' }}</span></div>
              <div><span style="color:#3a4a63">{{ t('admin.laravelVer') }}:</span> <span style="color:#e8eaf0">{{ overview.build.laravel_version }}</span></div>
              <p class="text-[10px] font-bold uppercase tracking-[0.1em] pt-1" style="color:#3a4a63">{{ t('admin.lastMigrations') }}</p>
              <ul class="font-mono text-xs list-disc pl-4 space-y-0.5" style="color:#7b8ba8">
                <li v-for="m in (overview.build.last_migrations || [])" :key="m">{{ m }}</li>
              </ul>
            </div>
          </details>

          <!-- DB tables -->
          <details class="mb-8 rounded-xl" style="background:#131720;border:1px solid #1e2738">
            <summary class="px-4 py-3 cursor-pointer text-sm font-bold rounded-xl" style="color:#7b8ba8">{{ t('admin.dbTitle') }}</summary>
            <div v-if="overview.db" class="px-4 pb-4" style="border-top:1px solid #1e2738">
              <div class="pt-3 text-sm" style="color:#3a4a63">
                <span class="font-mono">{{ overview.db.driver || '—' }}</span>
                <span v-if="overview.db.database" class="ml-2 font-mono">{{ overview.db.database }}</span>
                <span class="ml-3" style="color:#7b8ba8">{{ t('admin.dbTotal') }}: {{ ((overview.db.total_bytes || 0) / (1024*1024)).toFixed(1) }} MB</span>
              </div>

              <div class="rounded-xl overflow-x-auto mt-3" style="background:#0f1520;border:1px solid #1e2738">
                <table class="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr style="background:#0b0e14">
                      <th class="text-left py-2.5 px-4 text-[10px] font-bold uppercase tracking-[0.1em]" style="color:#3a4a63">{{ t('admin.dbTable') }}</th>
                      <th class="text-right py-2.5 px-4 text-[10px] font-bold uppercase tracking-[0.1em]" style="color:#3a4a63">{{ t('admin.dbRows') }}</th>
                      <th class="text-right py-2.5 px-4 text-[10px] font-bold uppercase tracking-[0.1em]" style="color:#3a4a63">{{ t('admin.dbSize') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="r in (overview.db.tables || [])" :key="r.name" style="border-top:1px solid #1e2738">
                      <td class="py-2.5 px-4 font-mono text-xs" style="color:#e8eaf0">{{ r.name }}</td>
                      <td class="py-2.5 px-4 text-right font-mono text-xs" style="color:#7b8ba8">{{ r.rows }}</td>
                      <td class="py-2.5 px-4 text-right font-mono text-xs" style="color:#f5a623">{{ (r.size_bytes / (1024*1024)).toFixed(2) }} MB</td>
                    </tr>
                    <tr v-if="!(overview.db.tables && overview.db.tables.length)">
                      <td colspan="3" class="py-8 text-center text-sm" style="color:#3a4a63">{{ t('stats.noData') }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </details>

          <!-- Sessions -->
          <p class="text-[10px] font-bold uppercase tracking-[0.1em] mb-3" style="color:#3a4a63">{{ t('admin.sessionsTitle') }}</p>
          <div class="rounded-xl overflow-hidden mb-8" style="background:#131720;border:1px solid #1e2738">
            <div v-if="!overview.sessions || overview.sessions.length === 0"
                 class="p-6 text-center text-sm" style="color:#3a4a63">{{ t('admin.noSessions') }}</div>
            <table v-else class="w-full text-sm">
              <thead>
                <tr style="background:#0b0e14">
                  <th class="text-left py-2.5 px-4 text-[10px] font-bold uppercase tracking-[0.1em]" style="color:#3a4a63">{{ t('stats.player') }}</th>
                  <th class="text-left py-2.5 px-4 text-[10px] font-bold uppercase tracking-[0.1em]" style="color:#3a4a63">{{ t('admin.ip') }}</th>
                  <th class="text-right py-2.5 px-4 text-[10px] font-bold uppercase tracking-[0.1em]" style="color:#3a4a63">{{ t('admin.lastActivity') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in overview.sessions" :key="s.session_id" style="border-top:1px solid #1e2738">
                  <td class="py-2.5 px-4 font-medium" style="color:#e8eaf0">{{ s.user_name || ('#' + s.user_id) }}</td>
                  <td class="py-2.5 px-4 font-mono text-xs" style="color:#7b8ba8">
                    <span v-if="s.ip_address && ipCountryByIp[s.ip_address]" class="mr-2" :title="ipCountryByIp[s.ip_address]">
                      {{ flagEmoji(ipCountryByIp[s.ip_address]) }}
                    </span>
                    {{ s.ip_address || '—' }}
                  </td>
                  <td class="py-2.5 px-4 text-right text-xs" style="color:#3a4a63">{{ fmtTs(s.last_activity) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Active matches -->
          <p class="text-[10px] font-bold uppercase tracking-[0.1em] mb-3" style="color:#3a4a63">{{ t('admin.matchesTitle') }}</p>
          <div class="rounded-xl overflow-x-auto mb-8" style="background:#131720;border:1px solid #1e2738">
            <table class="w-full text-sm min-w-[420px]">
              <thead>
                <tr style="background:#0b0e14">
                  <th class="text-left py-2.5 px-4 text-[10px] font-bold uppercase tracking-[0.1em]" style="color:#3a4a63">ID</th>
                  <th class="text-left py-2.5 px-4 text-[10px] font-bold uppercase tracking-[0.1em]" style="color:#3a4a63">{{ t('admin.room') }}</th>
                  <th class="text-left py-2.5 px-4 text-[10px] font-bold uppercase tracking-[0.1em]" style="color:#3a4a63">Type</th>
                  <th class="py-2.5 px-4"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="m in overview.active_matches" :key="m.id" style="border-top:1px solid #1e2738">
                  <td class="py-2.5 px-4 font-mono text-xs" style="color:#7b8ba8">{{ m.id }}</td>
                  <td class="py-2.5 px-4 font-mono font-bold" style="color:#f5a623">{{ m.room_code }}</td>
                  <td class="py-2.5 px-4" style="color:#e8eaf0">{{ m.game_type }}</td>
                  <td class="py-2.5 px-4 text-right whitespace-nowrap">
                    <button type="button" @click="openInspectMatch(m.id)"
                            class="text-[10px] font-bold px-2 py-1 rounded-lg mr-1 transition"
                            style="background:#1a2030;color:#7b8ba8;border:1px solid #252d3d"
                            onmouseover="this.style.color='#e8eaf0'" onmouseout="this.style.color='#7b8ba8'">{{ t('admin.detail') }}</button>
                    <button type="button" @click="openDanger('match_abandon', m.id)"
                            class="text-[10px] font-bold px-2 py-1 rounded-lg transition"
                            style="background:#2d1515;color:#f87171;border:1px solid rgba(239,68,68,.25)"
                            onmouseover="this.style.background='#3d1818'" onmouseout="this.style.background='#2d1515'">{{ t('admin.forceAbandon') }}</button>
                  </td>
                </tr>
                <tr v-if="!overview.active_matches || overview.active_matches.length === 0">
                  <td colspan="4" class="py-8 text-center text-sm" style="color:#3a4a63">{{ t('stats.noData') }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Active rooms -->
          <p class="text-[10px] font-bold uppercase tracking-[0.1em] mb-3" style="color:#3a4a63">{{ t('admin.roomsTitle') }}</p>
          <div class="rounded-xl overflow-x-auto" style="background:#131720;border:1px solid #1e2738">
            <table class="w-full text-sm min-w-[480px]">
              <thead>
                <tr style="background:#0b0e14">
                  <th class="text-left py-2.5 px-4 text-[10px] font-bold uppercase tracking-[0.1em]" style="color:#3a4a63">ID</th>
                  <th class="text-left py-2.5 px-4 text-[10px] font-bold uppercase tracking-[0.1em]" style="color:#3a4a63">Code</th>
                  <th class="text-left py-2.5 px-4 text-[10px] font-bold uppercase tracking-[0.1em]" style="color:#3a4a63">Type</th>
                  <th class="text-left py-2.5 px-4 text-[10px] font-bold uppercase tracking-[0.1em]" style="color:#3a4a63">Status</th>
                  <th class="py-2.5 px-4"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in overview.active_rooms" :key="r.id" style="border-top:1px solid #1e2738">
                  <td class="py-2.5 px-4 font-mono text-xs" style="color:#7b8ba8">{{ r.id }}</td>
                  <td class="py-2.5 px-4 font-mono font-bold" style="color:#f5a623">{{ r.code }}</td>
                  <td class="py-2.5 px-4" style="color:#e8eaf0">{{ r.game_type }}</td>
                  <td class="py-2.5 px-4 text-xs" style="color:#7b8ba8">{{ r.status }}</td>
                  <td class="py-2.5 px-4 text-right whitespace-nowrap">
                    <button type="button" @click="openInspectRoom(r.id)"
                            class="text-[10px] font-bold px-2 py-1 rounded-lg mr-1 transition"
                            style="background:#1a2030;color:#7b8ba8;border:1px solid #252d3d"
                            onmouseover="this.style.color='#e8eaf0'" onmouseout="this.style.color='#7b8ba8'">{{ t('admin.detail') }}</button>
                    <button type="button" @click="openDanger('room_close', r.id)"
                            class="text-[10px] font-bold px-2 py-1 rounded-lg transition"
                            style="background:#2d1515;color:#f87171;border:1px solid rgba(239,68,68,.25)"
                            onmouseover="this.style.background='#3d1818'" onmouseout="this.style.background='#2d1515'">{{ t('admin.forceCloseRoom') }}</button>
                  </td>
                </tr>
                <tr v-if="!overview.active_rooms || overview.active_rooms.length === 0">
                  <td colspan="5" class="py-8 text-center text-sm" style="color:#3a4a63">{{ t('stats.noData') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <!-- ── AUDIT ──────────────────────────────────────────────────── -->
        <template v-else-if="tab === 'audit'">
          <div class="rounded-xl overflow-x-auto" style="background:#131720;border:1px solid #1e2738">
            <table class="w-full text-xs sm:text-sm min-w-[640px]">
              <thead>
                <tr style="background:#0b0e14">
                  <th class="text-left py-2.5 px-3 text-[10px] font-bold uppercase tracking-[0.1em]" style="color:#3a4a63">{{ t('admin.auditTime') }}</th>
                  <th class="text-left py-2.5 px-3 text-[10px] font-bold uppercase tracking-[0.1em]" style="color:#3a4a63">{{ t('admin.auditAction') }}</th>
                  <th class="text-left py-2.5 px-3 text-[10px] font-bold uppercase tracking-[0.1em]" style="color:#3a4a63">{{ t('admin.auditAdmin') }}</th>
                  <th class="text-left py-2.5 px-3 text-[10px] font-bold uppercase tracking-[0.1em]" style="color:#3a4a63">{{ t('admin.auditTarget') }}</th>
                  <th class="text-left py-2.5 px-3 text-[10px] font-bold uppercase tracking-[0.1em]" style="color:#3a4a63">{{ t('admin.auditMeta') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="a in audit.items" :key="a.id" style="border-top:1px solid #1e2738">
                  <td class="py-2.5 px-3 text-xs whitespace-nowrap" style="color:#3a4a63">{{ fmtIso(a.created_at) }}</td>
                  <td class="py-2.5 px-3 font-mono font-bold text-xs" style="color:#f5a623">{{ a.action }}</td>
                  <td class="py-2.5 px-3 font-medium" style="color:#e8eaf0">{{ a.admin_name }}</td>
                  <td class="py-2.5 px-3" style="color:#7b8ba8">{{ a.target_name || (a.target_user_id ? '#' + a.target_user_id : '—') }}</td>
                  <td class="py-2.5 px-3 font-mono text-[10px] break-all" style="color:#3a4a63">{{ JSON.stringify(a.metadata || {}) }}</td>
                </tr>
                <tr v-if="!audit.items.length">
                  <td colspan="5" class="py-10 text-center text-sm" style="color:#3a4a63">{{ t('stats.noData') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="audit.meta && audit.meta.last_page > 1" class="flex justify-center items-center gap-3 mt-4">
            <button type="button" :disabled="auditPage <= 1" @click="loadAudit(auditPage - 1)"
                    class="w-9 h-9 rounded-xl text-sm font-black transition disabled:opacity-30"
                    style="background:#131720;color:#7b8ba8;border:1px solid #1e2738">‹</button>
            <span class="text-sm font-bold" style="color:#7b8ba8">{{ auditPage }} / {{ audit.meta.last_page }}</span>
            <button type="button" :disabled="auditPage >= audit.meta.last_page" @click="loadAudit(auditPage + 1)"
                    class="w-9 h-9 rounded-xl text-sm font-black transition disabled:opacity-30"
                    style="background:#131720;color:#7b8ba8;border:1px solid #1e2738">›</button>
          </div>
        </template>

        <!-- ── Inspect JSON modal ──────────────────────────────────────── -->
        <Teleport to="body">
          <div v-if="inspectJson"
               class="fixed inset-0 z-[80] overflow-y-auto overscroll-y-contain flex items-start justify-center p-4 sm:p-6"
               style="background:rgba(0,0,0,.75)"
               @click.self="closeInspect">
            <div class="my-4 w-full max-w-3xl max-h-[min(85vh,calc(100dvh-2rem))] overflow-hidden flex flex-col shrink-0 rounded-2xl shadow-2xl"
                 style="background:#0f1520;border:1px solid #1e2738">
              <div class="shrink-0 px-4 py-3 flex justify-between items-center gap-2"
                   style="border-bottom:1px solid #1e2738">
                <span class="font-bold text-sm truncate" style="color:#e8eaf0">{{ inspectTitle }}</span>
                <button type="button" @click="closeInspect"
                        class="text-xl leading-none transition shrink-0"
                        style="color:#3a4a63"
                        onmouseover="this.style.color='#e8eaf0'" onmouseout="this.style.color='#3a4a63'">&times;</button>
              </div>
              <pre class="p-4 overflow-auto text-xs leading-relaxed font-mono flex-1 min-h-0"
                   style="color:#3ecf8e">{{ JSON.stringify(inspectJson, null, 2) }}</pre>
            </div>
          </div>
        </Teleport>

        <!-- ── Danger confirm ─────────────────────────────────────────── -->
        <Teleport to="body">
          <div v-if="danger.open"
               class="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden p-4"
               style="background:rgba(0,0,0,.8)"
               @click.self="danger.open = false">
            <div class="max-w-sm w-full rounded-2xl p-5 shadow-2xl overflow-hidden"
                 style="background:#130a0a;border:1px solid rgba(239,68,68,.25)">
              <div class="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                   style="background:#2d1515;border:1px solid rgba(239,68,68,.25)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                     class="w-4 h-4" style="color:#f87171">
                  <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
                </svg>
              </div>
              <h3 class="text-base font-black mb-1" style="color:#f87171">{{ t('admin.confirmDanger') }}</h3>
              <p class="text-sm mb-4" style="color:#7b8ba8">{{ t('admin.confirmDangerHint') }}</p>
              <label class="flex items-start gap-2 text-sm mb-5 cursor-pointer" style="color:#e8eaf0">
                <input type="checkbox" v-model="danger.chk" class="mt-0.5 rounded"/>
                <span>{{ t('admin.confirmCheckbox') }}</span>
              </label>
              <div class="flex gap-2">
                <button type="button" @click="danger.open = false"
                        class="flex-1 py-3 rounded-xl font-bold text-sm transition"
                        style="background:#1a2030;color:#7b8ba8;border:1px solid #252d3d">{{ t('admin.cancelBtn') }}</button>
                <button type="button" @click="execDanger" :disabled="!danger.chk"
                        class="flex-1 py-3 rounded-xl font-black text-sm transition disabled:opacity-30"
                        style="background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff">{{ t('admin.confirmBtn') }}</button>
              </div>
            </div>
          </div>
        </Teleport>

        <!-- ── User action modals ─────────────────────────────────────── -->
        <Teleport to="body">
          <div v-if="userModal.open"
               class="fixed inset-0 z-[90] overflow-y-auto overscroll-y-contain flex items-start sm:items-center justify-center p-4 sm:p-6"
               style="background:rgba(0,0,0,.8)"
               @click.self="closeUserModal">
            <div class="my-auto max-h-[calc(100dvh-3rem)] overflow-y-auto rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col"
                 style="background:#0f1520;border:1px solid #1e2738">

              <!-- Ban -->
              <template v-if="userModal.kind === 'ban'">
                <div class="w-9 h-9 rounded-lg flex items-center justify-center mb-4 shrink-0"
                     style="background:#2d1515;border:1px solid rgba(239,68,68,.25)">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                       class="w-4 h-4" style="color:#f87171">
                    <path fill-rule="evenodd" d="M13.562 4.438a7 7 0 11-9.124 9.124L13.562 4.438zm1.06 1.062L5.5 14.624A7 7 0 0014.623 5.5z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <h3 class="text-base font-black mb-1" style="color:#f87171">{{ t('admin.banModalTitle') }}</h3>
                <p class="text-sm font-bold mb-0.5" style="color:#f5a623">{{ userModal.user?.name }}</p>
                <p class="text-xs mb-4 break-all" style="color:#3a4a63">{{ userModal.user?.email }}</p>
                <label class="text-[10px] font-bold uppercase tracking-[0.1em]" style="color:#3a4a63">{{ t('admin.banModalHint') }}</label>
                <textarea v-model="userModal.banReason" rows="3"
                          class="w-full mt-1 mb-4 rounded-xl px-3 py-2 text-sm resize-y min-h-[4.5rem] outline-none"
                          style="background:#0b0e14;border:1px solid #1e2738;color:#e8eaf0"></textarea>
                <div class="flex gap-2">
                  <button type="button" @click="closeUserModal"
                          class="flex-1 py-3 rounded-xl font-bold text-sm"
                          style="background:#1a2030;color:#7b8ba8;border:1px solid #252d3d">{{ t('admin.cancelBtn') }}</button>
                  <button type="button" @click="submitUserModal" :disabled="userModalBusy"
                          class="flex-1 py-3 rounded-xl font-black text-sm disabled:opacity-40"
                          style="background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff">{{ t('admin.banModalConfirm') }}</button>
                </div>
              </template>

              <!-- Unban -->
              <template v-else-if="userModal.kind === 'unban'">
                <div class="w-9 h-9 rounded-lg flex items-center justify-center mb-4 shrink-0"
                     style="background:#0e2b1c;border:1px solid rgba(62,207,142,.2)">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                       class="w-4 h-4" style="color:#3ecf8e">
                    <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <h3 class="text-base font-black mb-2" style="color:#3ecf8e">{{ t('admin.unbanModalTitle') }}</h3>
                <p class="text-sm font-bold mb-1" style="color:#e8eaf0">{{ userModal.user?.name }}</p>
                <p class="text-sm mb-6" style="color:#7b8ba8">{{ t('admin.unbanModalBody') }}</p>
                <div class="flex gap-2">
                  <button type="button" @click="closeUserModal"
                          class="flex-1 py-3 rounded-xl font-bold text-sm"
                          style="background:#1a2030;color:#7b8ba8;border:1px solid #252d3d">{{ t('admin.cancelBtn') }}</button>
                  <button type="button" @click="submitUserModal" :disabled="userModalBusy"
                          class="flex-1 py-3 rounded-xl font-black text-sm disabled:opacity-40"
                          style="background:linear-gradient(135deg,#059669,#047857);color:#fff">{{ t('admin.unbanModalConfirm') }}</button>
                </div>
              </template>

              <!-- Revoke sessions -->
              <template v-else-if="userModal.kind === 'revoke'">
                <div class="w-9 h-9 rounded-lg flex items-center justify-center mb-4 shrink-0"
                     style="background:#2a1f08;border:1px solid rgba(245,166,35,.2)">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                       class="w-4 h-4" style="color:#f5a623">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <h3 class="text-base font-black mb-2" style="color:#f5a623">{{ t('admin.revokeModalTitle') }}</h3>
                <p class="text-sm font-bold mb-0.5" style="color:#e8eaf0">{{ userModal.user?.name }}</p>
                <p class="text-xs mb-4 break-all" style="color:#3a4a63">{{ userModal.user?.email }}</p>
                <p class="text-sm mb-4" style="color:#7b8ba8">{{ t('admin.revokeModalBody') }}</p>
                <label class="flex items-start gap-2 text-sm mb-5 cursor-pointer" style="color:#e8eaf0">
                  <input type="checkbox" v-model="userModal.revokeAck" class="mt-0.5 rounded"/>
                  <span>{{ t('admin.revokeModalAck') }}</span>
                </label>
                <div class="flex gap-2">
                  <button type="button" @click="closeUserModal"
                          class="flex-1 py-3 rounded-xl font-bold text-sm"
                          style="background:#1a2030;color:#7b8ba8;border:1px solid #252d3d">{{ t('admin.cancelBtn') }}</button>
                  <button type="button" @click="submitUserModal" :disabled="userModalBusy || !userModal.revokeAck"
                          class="flex-1 py-3 rounded-xl font-black text-sm disabled:opacity-40"
                          style="background:linear-gradient(135deg,#f5a623,#f5c842);color:#0b0e14">{{ t('admin.revokeModalConfirm') }}</button>
                </div>
              </template>

            </div>
          </div>
        </Teleport>

      </div>
    </div>
  `,
};
