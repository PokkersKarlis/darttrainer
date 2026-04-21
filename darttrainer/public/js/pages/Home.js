const HomePage = {
  setup() {
    const auth   = useAuthStore();
    const locale = useLocaleStore();
    const t      = (k) => locale.t(k);
    const router = VueRouter.useRouter();
    const activeRooms        = Vue.ref([]);
    const activeRoomsLoading = Vue.ref(false);
    const summary         = Vue.ref(null);
    const summaryErr      = Vue.ref(false);
    const summaryLoading  = Vue.ref(true);

    function roomSummaryLine(room) {
      if (!room) return '';
      if (room.game_type === 'x01') {
        const v = room.game_config?.variant;
        return v != null ? `X01 ${v}` : 'X01';
      }
      if (room.game_type === 'cricket') {
        return room.game_config?.cricket_type === 'random'
          ? t('lobby.cricketRandomShort')
          : t('lobby.cricketStandardShort');
      }
      return String(room.game_type).replace(/_/g, ' ').toUpperCase();
    }

    function roomStatusLabel(room) {
      if (!room) return '';
      if (room.match_status === 'suspended') return t('home.statusSuspended');
      if (room.match_id && room.match_status === 'active') return t('home.statusPlaying');
      if (room.match_id) return t('home.statusPlaying');
      return t('home.statusLobby');
    }

    function playModeLabel(room) {
      if (!room) return '';
      return room.play_mode === 'local' ? t('home.playModeLocalShort') : t('home.playModeOnlineShort');
    }

    async function refreshActiveRooms() {
      activeRooms.value = [];
      if (!auth.hydrated || !auth.user) {
        activeRoomsLoading.value = false;
        return;
      }
      activeRoomsLoading.value = true;
      try {
        const { data } = await Rooms.myActives();
        activeRooms.value = Array.isArray(data.items) ? data.items : [];
      } catch (_) {
        activeRooms.value = [];
      } finally {
        activeRoomsLoading.value = false;
      }
    }

    async function loadSummary() {
      summaryErr.value = false;
      summaryLoading.value = true;
      try {
        const { data } = await PublicApi.homeSummary();
        summary.value = data;
      } catch (_) {
        summary.value = null;
        summaryErr.value = true;
      } finally {
        summaryLoading.value = false;
      }
    }

    function fmtDate(iso) {
      if (!iso) return '—';
      const d = new Date(iso);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString(locale.locale === 'lv' ? 'lv-LV' : 'en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
      });
    }

    Vue.watch(() => [auth.hydrated, auth.user?.id], refreshActiveRooms, { immediate: true });
    Vue.onMounted(loadSummary);

    function continueGame(room) {
      if (!room) return;
      router.push(room.match_id ? `/game/${room.match_id}` : '/lobby');
    }

    return {
      auth,
      activeRooms,
      activeRoomsLoading,
      continueGame,
      roomSummaryLine,
      roomStatusLabel,
      playModeLabel,
      summary,
      summaryErr,
      summaryLoading,
      t,
      fmtDate,
      loadSummary,
    };
  },

  template: `
    <div style="flex:1;overflow-y:auto;min-height:0">
    <div style="max-width:900px;margin:0 auto;padding:28px 20px">

      <div style="margin-bottom:22px;display:flex;flex-direction:column;gap:14px">
        <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap">
          <img src="/images/logo.png" alt="DartTrainer"
               style="height:76px;width:auto;max-width:280px;object-fit:contain;display:block"/>
          <p style="color:#64748b;font-size:14px;margin:0;max-width:340px;line-height:1.45">
            {{ t('home.tagline') }}
          </p>
        </div>
      </div>

      <div v-if="summaryLoading" style="margin-bottom:16px;font-size:13px;color:#64748b">{{ t('home.loadSummary') }}</div>

      <!-- Public stats strip -->
      <div v-else-if="summary" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-bottom:22px">
        <div style="background:#0f1c30;border:1px solid #162540;border-radius:12px;padding:12px 14px">
          <div style="font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#64748b">{{ t('home.usersTotal') }}</div>
          <div style="font-size:22px;font-weight:900;color:#f59e0b;margin-top:4px">{{ summary.users_total }}</div>
        </div>
        <div style="background:#0f1c30;border:1px solid #162540;border-radius:12px;padding:12px 14px">
          <div style="font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#64748b">{{ t('home.activePlayers') }}</div>
          <div style="font-size:22px;font-weight:900;color:#34d399;margin-top:4px">{{ summary.active_players }}</div>
        </div>
        <div style="background:#0f1c30;border:1px solid #162540;border-radius:12px;padding:12px 14px">
          <div style="font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#64748b">{{ t('home.gamesTotal') }}</div>
          <div style="font-size:22px;font-weight:900;color:#e2e8f0;margin-top:4px">{{ summary.games_total }}</div>
        </div>
        <div v-if="summary.last_registration_at" style="background:#0f1c30;border:1px solid #162540;border-radius:12px;padding:12px 14px;grid-column:span 2;min-width:0">
          <div style="font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#64748b">{{ t('home.lastUser') }}</div>
          <div style="font-size:15px;font-weight:800;color:#f1f5f9;margin-top:6px">{{ fmtDate(summary.last_registration_at) }}</div>
          <div style="font-size:12px;color:#475569;margin-top:4px;line-height:1.35">{{ t('home.lastRegistrationPrivacy') }}</div>
        </div>
      </div>
      <div v-else-if="summaryErr" style="margin-bottom:16px;font-size:13px;color:#94a3b8">{{ t('home.summaryError') }}</div>

      <div v-if="auth.hydrated && auth.user" style="margin-bottom:20px">
        <div style="color:#64748b;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;margin-bottom:10px">
          {{ t('home.activeGamesTitle') }}
        </div>
        <div v-if="activeRoomsLoading" style="font-size:13px;color:#64748b">{{ t('home.activeRoomsLoading') }}</div>
        <template v-else>
          <p v-if="!activeRooms.length" style="font-size:13px;color:#64748b;margin:0;line-height:1.45">{{ t('home.activeGamesEmpty') }}</p>
          <div v-else style="display:flex;flex-direction:column;gap:10px">
            <div v-for="room in activeRooms" :key="room.id"
                 style="background:linear-gradient(135deg,#052e16,#064e3b);border:1px solid #065f46;border-radius:14px;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">
              <div style="min-width:0;flex:1">
                <div style="color:#f1f5f9;font-weight:600;font-size:14px;line-height:1.35">
                  {{ roomSummaryLine(room) }}
                  <span style="color:#475569;font-weight:400"> · {{ t('home.roomCode') }} </span>
                  <span style="font-family:monospace;color:#f59e0b;font-weight:700">{{ room.code }}</span>
                  <span style="color:#475569;font-weight:400"> · </span>
                  <span style="color:#94a3b8;font-weight:600">{{ playModeLabel(room) }}</span>
                </div>
                <div style="color:#6ee7b7;font-size:12px;margin-top:5px;line-height:1.35">{{ roomStatusLabel(room) }}</div>
              </div>
              <button type="button" @click="continueGame(room)"
                      style="flex-shrink:0;background:#10b981;color:#fff;font-weight:700;font-size:13px;padding:9px 18px;border-radius:10px;border:none;cursor:pointer;white-space:nowrap;transition:background .15s"
                      onmouseover="this.style.background='#059669'"
                      onmouseout="this.style.background='#10b981'">
                {{ room.match_id ? t('home.continue') : t('home.backToLobby') }}
              </button>
            </div>
          </div>
        </template>
      </div>

      <div v-if="auth.user" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-bottom:20px">

        <a href="#/lobby"
           style="background:linear-gradient(135deg,#451a03,#78350f);border:1px solid #92400e;border-radius:14px;padding:20px;text-decoration:none;display:flex;flex-direction:column;transition:all .2s;cursor:pointer"
           onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(245,158,11,.2)'"
           onmouseout="this.style.transform='';this.style.boxShadow=''">
          <span style="font-size:28px;margin-bottom:10px">🎮</span>
          <span style="font-weight:700;font-size:15px;color:#fbbf24;margin-bottom:4px">{{ t('home.multiplayer') }}</span>
          <span style="font-size:12px;color:#92400e">{{ t('home.multiplayerSub') }}</span>
        </a>

        <a href="#/training/x01"
           style="background:linear-gradient(135deg,#1e1b4b,#312e81);border:1px solid #4338ca;border-radius:14px;padding:20px;text-decoration:none;display:flex;flex-direction:column;transition:all .2s;cursor:pointer"
           onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(99,102,241,.25)'"
           onmouseout="this.style.transform='';this.style.boxShadow=''">
          <span style="font-size:28px;margin-bottom:10px">🎯</span>
          <span style="font-weight:700;font-size:15px;color:#a5b4fc;margin-bottom:4px">{{ t('home.x01solo') }}</span>
          <span style="font-size:12px;color:#4338ca">{{ t('home.x01soloSub') }}</span>
        </a>

        <a href="#/stats"
           style="background:#0f1c30;border:1px solid #162540;border-radius:14px;padding:20px;text-decoration:none;display:flex;flex-direction:column;transition:all .2s"
           onmouseover="this.style.background='#162540';this.style.transform='translateY(-2px)'"
           onmouseout="this.style.background='#0f1c30';this.style.transform=''">
          <span style="font-size:28px;margin-bottom:10px">📊</span>
          <span style="font-weight:700;font-size:15px;color:#f1f5f9;margin-bottom:4px">{{ t('home.stats') }}</span>
          <span style="font-size:12px;color:#334155">{{ t('home.statsSub') }}</span>
        </a>
      </div>

      <div v-if="auth.hydrated && !auth.user"
           style="background:#0f1c30;border:1px solid #162540;border-radius:14px;padding:18px 20px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">
        <div>
          <div style="font-weight:600;font-size:14px;color:#f1f5f9;margin-bottom:3px">{{ t('home.registerHint') }}</div>
          <div style="font-size:12px;color:#334155">{{ t('home.registerHintSub') }}</div>
        </div>
        <div style="display:flex;gap:8px;flex-shrink:0">
          <a href="#/login"
             style="font-size:13px;color:#94a3b8;background:#162540;padding:8px 14px;border-radius:8px;text-decoration:none;font-weight:600;transition:background .15s"
             onmouseover="this.style.background='#1e3050'"
             onmouseout="this.style.background='#162540'">{{ t('shell.login') }}</a>
          <a href="#/register"
             style="font-size:13px;background:#f59e0b;color:#000;padding:8px 14px;border-radius:8px;text-decoration:none;font-weight:700;transition:background .15s"
             onmouseover="this.style.background='#fbbf24'"
             onmouseout="this.style.background='#f59e0b'">{{ t('shell.register') }}</a>
        </div>
      </div>

    </div>
    </div>
  `,
};
