<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { Stats, Training } from '../api/client.js';
import { useLocaleStore } from '../store/index.js';
import { useCanvasBnav } from '../composables/useCanvasBnav.js';
import HomeStrokeIcon from '../components/home/HomeStrokeIcon.vue';

defineOptions({ name: 'StatisticsPage' });

const locale = useLocaleStore();
const t = (k) => locale.t(k);
const { bnav, bnavOn, bnavClick, bnavDisabled } = useCanvasBnav();

const loading = ref(true);
const me = ref(null);
const leaderboardCricket = ref([]);
const leaderboardSolo = ref([]);
const protocolMatches = ref([]);
const protocolLoading = ref(false);
const soloProtocols = ref([]);
const soloProtocolLoading = ref(false);

const open = reactive({
  cricket: true,
  x01: true,
  protocol: false,
  lbCricket: true,
  lbSolo: true,
});

function toggle(key) {
  open[key] = !open[key];
}

const soloBars = computed(() => {
  const s = me.value?.x01_solo;
  if (!s || !s.games_finished) {
    return { avgW: 0, coW: 0, gamesW: 0, maxAvg: 60 };
  }
  const avgW = Math.min(100, (s.average / 60) * 100);
  const coW = Math.min(100, s.checkout_percent || 0);
  const gamesW = Math.min(100, (s.games_finished / 20) * 100);
  return { avgW, coW, gamesW, maxAvg: 60 };
});

async function loadMe() {
  try {
    const { data } = await Stats.me();
    me.value = data;
  } catch (_) {
    me.value = null;
  }
}

function protocolGameLabel(gt) {
  if (gt === 'cricket') return t('stats.protocolTypeCricket');
  if (gt === 'x01') return t('stats.protocolTypeX01');
  return gt || '—';
}

function fmtProtocolEnd(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(locale.locale === 'lv' ? 'lv-LV' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function loadProtocolMatches() {
  protocolLoading.value = true;
  try {
    const { data } = await Stats.recentMatches({ limit: 40 });
    protocolMatches.value = data.items ?? [];
  } catch (_) {
    protocolMatches.value = [];
  } finally {
    protocolLoading.value = false;
  }
}

async function loadSoloProtocols() {
  soloProtocolLoading.value = true;
  try {
    const { data } = await Training.x01Finished({ limit: 40 });
    soloProtocols.value = data.items ?? [];
  } catch (_) {
    soloProtocols.value = [];
  } finally {
    soloProtocolLoading.value = false;
  }
}

function fmtSoloProtocolModes(row) {
  const i = row.in_mode === 'double' ? 'D' : 'S';
  const o = row.out_mode === 'double' ? 'D' : 'S';
  return `${i}-in / ${o}-out`;
}

async function loadLeaderboards() {
  try {
    const [cr, xs] = await Promise.all([Stats.leaderboard('cricket'), Stats.leaderboard('x01_solo')]);
    leaderboardCricket.value = cr.data.items ?? [];
    leaderboardSolo.value = xs.data.items ?? [];
  } catch (_) {
    leaderboardCricket.value = [];
    leaderboardSolo.value = [];
  }
}

async function loadAll() {
  loading.value = true;
  try {
    await loadMe();
    const tasks = [loadLeaderboards()];
    if (me.value) {
      tasks.push(loadProtocolMatches());
      tasks.push(loadSoloProtocols());
    }
    await Promise.all(tasks);
  } finally {
    loading.value = false;
  }
}

onMounted(loadAll);
</script>

<template>
  <div class="dh-st-view">
    <div class="dh-st-page">
      <div class="dh-st-head">
        <h1 class="dh-st-title">{{ t('stats.title') }}</h1>
        <p class="dh-st-sub">{{ t('stats.subtitle') }}</p>
      </div>

      <div v-if="loading" class="dh-st-muted">{{ t('stats.loading') }}</div>

      <template v-else>
        <div v-if="!me" class="dh-st-login">
          <p>{{ t('stats.loginHint') }}</p>
          <RouterLink to="/login" class="dth-btn dth-btn--accent dth-btn--md dth-btn--full">{{ t('stats.loginLink') }}</RouterLink>
        </div>

        <template v-else>
          <!-- Cricket -->
          <section class="dh-st-sec">
            <button type="button" class="dh-st-sec-hd" @click="toggle('cricket')">
              <span class="dh-st-sec-title">{{ t('stats.cricketBlock') }}</span>
              <span class="dh-st-sec-toggle">{{ open.cricket ? t('stats.close') : t('stats.open') }}</span>
            </button>
            <div v-show="open.cricket" class="dh-st-sec-bd">
              <div v-if="me.cricket && me.cricket.legs_played > 0" class="dh-statg dh-statg--user">
                <div class="dh-stat">
                  <div class="dh-stat-v dh-stat-v--amber">{{ me.cricket_average }}</div>
                  <div class="dh-stat-l">{{ t('stats.avg3') }}</div>
                </div>
                <div class="dh-stat">
                  <div class="dh-stat-v">{{ me.cricket.legs_played }}</div>
                  <div class="dh-stat-l">{{ t('stats.legsPlayed') }}</div>
                </div>
                <div class="dh-stat">
                  <div class="dh-stat-v dh-stat-v--emerald">{{ me.cricket.legs_won }}</div>
                  <div class="dh-stat-l">{{ t('stats.legsWon') }}</div>
                </div>
                <div class="dh-stat">
                  <div class="dh-stat-v dh-stat-v--amber">{{ me.cricket.win_rate }}%</div>
                  <div class="dh-stat-l">{{ t('stats.winRate') }}</div>
                </div>
                <div class="dh-stat dh-stat--span2">
                  <div class="dh-stat-v dh-stat-v--amber">{{ me.cricket.avg_points_per_leg }}</div>
                  <div class="dh-stat-l">{{ t('stats.avgPtsLeg') }}</div>
                </div>
              </div>
              <div v-else class="dh-st-empty">{{ t('stats.noCricket') }}</div>
            </div>
          </section>

          <!-- X01 solo -->
          <section class="dh-st-sec">
            <button type="button" class="dh-st-sec-hd" @click="toggle('x01')">
              <span class="dh-st-sec-title">{{ t('stats.x01Block') }}</span>
              <span class="dh-st-sec-toggle">{{ open.x01 ? t('stats.close') : t('stats.open') }}</span>
            </button>
            <div v-show="open.x01" class="dh-st-sec-bd">
              <div v-if="me.x01_solo && me.x01_solo.games_finished > 0">
                <div class="dh-st-infog">
                  <div class="dh-st-infog-lab">X01 solo</div>
                  <div class="dh-st-bar-row">
                    <div class="dh-st-bar-hd">
                      <span>{{ t('stats.avg3') }}</span>
                      <span class="dh-st-bar-val dh-st-bar-val--amber">{{ me.x01_solo.average }}</span>
                    </div>
                    <div class="dh-st-bar-track">
                      <div class="dh-st-bar-fill dh-st-bar-fill--avg" :style="{ width: soloBars.avgW + '%' }" />
                    </div>
                  </div>
                  <div class="dh-st-bar-row">
                    <div class="dh-st-bar-hd">
                      <span>{{ t('stats.checkout') }}</span>
                      <span class="dh-st-bar-val dh-st-bar-val--em">{{ me.x01_solo.checkout_percent }}%</span>
                    </div>
                    <div class="dh-st-bar-track">
                      <div class="dh-st-bar-fill dh-st-bar-fill--co" :style="{ width: soloBars.coW + '%' }" />
                    </div>
                  </div>
                  <div class="dh-st-bar-row">
                    <div class="dh-st-bar-hd">
                      <span>{{ t('stats.gamesFinished') }}</span>
                      <span class="dh-st-bar-val dh-st-bar-val--sky">{{ me.x01_solo.games_finished }}</span>
                    </div>
                    <div class="dh-st-bar-track">
                      <div class="dh-st-bar-fill dh-st-bar-fill--games" :style="{ width: soloBars.gamesW + '%' }" />
                    </div>
                  </div>
                  <p class="dh-st-infog-hint">{{ t('stats.infographicHint') }}</p>
                </div>

                <div class="dh-statg dh-statg--user">
                  <div class="dh-stat">
                    <div class="dh-stat-v">{{ me.x01_solo.high_turn }}</div>
                    <div class="dh-stat-l">{{ t('stats.highTurn') }}</div>
                  </div>
                  <div class="dh-stat">
                    <div class="dh-stat-v dh-stat-v--red">{{ me.x01_solo.busts }}</div>
                    <div class="dh-stat-l">{{ t('stats.busts') }}</div>
                  </div>
                  <div class="dh-stat">
                    <div class="dh-stat-v">{{ me.x01_solo.total_darts }}</div>
                    <div class="dh-stat-l">{{ t('stats.soloDarts') }}</div>
                  </div>
                  <div class="dh-stat">
                    <div v-if="me.x01_solo.by_variant && Object.keys(me.x01_solo.by_variant).length" class="dh-st-variants">
                      <span v-for="(cnt, v) in me.x01_solo.by_variant" :key="String(v)" class="dh-st-var-chip">{{ v }}: {{ cnt }} </span>
                    </div>
                    <div v-else class="dh-st-variants">—</div>
                    <div class="dh-stat-l">501 / 301</div>
                  </div>
                </div>
              </div>
              <div v-else class="dh-st-empty">{{ t('stats.noSolo') }}</div>
            </div>
          </section>

          <!-- Protokoli -->
          <section class="dh-st-sec">
            <button type="button" class="dh-st-sec-hd" @click="toggle('protocol')">
              <div>
                <span class="dh-st-sec-title">{{ t('stats.protocolSectionTitle') }}</span>
                <span class="dh-st-sec-sub">{{ t('stats.protocolSectionSubtitle') }}</span>
              </div>
              <span class="dh-st-sec-toggle">{{ open.protocol ? t('stats.close') : t('stats.open') }}</span>
            </button>
            <div v-show="open.protocol" class="dh-st-sec-bd">
              <div v-if="protocolLoading" class="dh-st-muted" style="padding: 20px 0">{{ t('stats.loading') }}</div>
              <div v-else-if="!protocolMatches.length" class="dh-st-empty">{{ t('stats.protocolEmpty') }}</div>
              <div v-else class="dh-st-table-wrap">
                <table class="dh-st-table">
                  <thead>
                    <tr>
                      <th>{{ t('stats.protocolRoomCol') }}</th>
                      <th>{{ t('stats.protocolFinished') }}</th>
                      <th>{{ t('stats.protocolWinner') }}</th>
                      <th class="dh-st-th-num" />
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in protocolMatches" :key="row.match_id">
                      <td>
                        <span class="dh-st-mono">{{ row.room_code }}</span>
                        <span class="dh-st-protocol-sub">{{ protocolGameLabel(row.game_type) }}</span>
                      </td>
                      <td class="tabular-nums">{{ fmtProtocolEnd(row.finished_at) }}</td>
                      <td>{{ row.winner_name || '—' }}</td>
                      <td class="dh-st-td-num">
                        <RouterLink class="dh-st-link" :to="'/game/' + row.match_id">{{ t('stats.protocolOpen') }}</RouterLink>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="dh-st-solo-split">
                <h3>{{ t('stats.soloProtocolTitle') }}</h3>
                <p>{{ t('stats.soloProtocolSub') }}</p>
                <div v-if="soloProtocolLoading" class="dh-st-muted" style="padding: 16px 0">{{ t('stats.loading') }}</div>
                <div v-else-if="!soloProtocols.length" class="dh-st-empty">{{ t('stats.soloProtocolEmpty') }}</div>
                <div v-else class="dh-st-table-wrap dh-st-table-wrap--sm">
                  <table class="dh-st-table">
                    <thead>
                      <tr>
                        <th>{{ t('stats.soloProtocolColVariant') }}</th>
                        <th>{{ t('stats.soloProtocolColModes') }}</th>
                        <th>{{ t('stats.soloProtocolColMeta') }}</th>
                        <th>{{ t('stats.protocolFinished') }}</th>
                        <th class="dh-st-th-num" />
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="row in soloProtocols" :key="'solo-' + row.id">
                        <td><span class="dh-st-mono">{{ row.variant }}</span></td>
                        <td class="text-xs">{{ fmtSoloProtocolModes(row) }}</td>
                        <td class="tabular-nums text-xs">{{ row.turns_count }} · {{ row.darts_count }}</td>
                        <td class="tabular-nums">{{ fmtProtocolEnd(row.finished_at) }}</td>
                        <td class="dh-st-td-num">
                          <RouterLink class="dh-st-link" :to="{ path: '/training/x01', query: { protocol: String(row.id) } }">
                            {{ t('stats.soloProtocolOpen') }}
                          </RouterLink>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          <!-- Leaderboard cricket -->
          <section class="dh-st-sec">
            <button type="button" class="dh-st-sec-hd" @click="toggle('lbCricket')">
              <span class="dh-st-sec-title">{{ t('stats.leaderboardCricket') }}</span>
              <span class="dh-st-sec-toggle">{{ open.lbCricket ? t('stats.close') : t('stats.open') }}</span>
            </button>
            <div v-show="open.lbCricket" class="dh-st-sec-bd">
              <div class="dh-st-table-wrap dh-st-table-wrap--flat">
                <table class="dh-st-table">
                <thead>
                  <tr>
                    <th>{{ t('stats.rank') }}</th>
                    <th>{{ t('stats.player') }}</th>
                    <th class="dh-st-th-num">{{ t('stats.winRateShort') }}</th>
                    <th class="dh-st-th-num">{{ t('stats.wonTotal') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in leaderboardCricket" :key="row.user_id">
                    <td class="dh-st-mono" style="color: #7b8ba8">{{ idx + 1 }}</td>
                    <td style="color: #e8eaf0; font-weight: 600">{{ row.name }}</td>
                    <td class="dh-st-td-num" :class="row.win_rate >= 50 ? 'dh-st-win-good' : 'dh-st-win-bad'">{{ row.win_rate }}%</td>
                    <td class="dh-st-td-num" style="color: #cbd5e1">{{ row.legs_won }} / {{ row.legs_played }}</td>
                  </tr>
                  <tr v-if="leaderboardCricket.length === 0">
                    <td colspan="4" class="dh-st-muted" style="padding: 20px">{{ t('stats.noData') }}</td>
                  </tr>
                </tbody>
              </table>
              </div>
            </div>
          </section>

          <!-- Leaderboard solo -->
          <section class="dh-st-sec">
            <button type="button" class="dh-st-sec-hd" @click="toggle('lbSolo')">
              <span class="dh-st-sec-title">{{ t('stats.leaderboardSolo') }}</span>
              <span class="dh-st-sec-toggle">{{ open.lbSolo ? t('stats.close') : t('stats.open') }}</span>
            </button>
            <div v-show="open.lbSolo" class="dh-st-sec-bd">
              <div class="dh-st-table-wrap dh-st-table-wrap--flat">
                <table class="dh-st-table">
                <thead>
                  <tr>
                    <th>{{ t('stats.rank') }}</th>
                    <th>{{ t('stats.player') }}</th>
                    <th class="dh-st-th-num">{{ t('stats.avg3') }}</th>
                    <th class="dh-st-th-num">{{ t('stats.soloDarts') }}</th>
                    <th class="dh-st-th-num">{{ t('stats.soloGames') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in leaderboardSolo" :key="row.user_id">
                    <td class="dh-st-mono" style="color: #7b8ba8">{{ idx + 1 }}</td>
                    <td style="color: #e8eaf0; font-weight: 600">{{ row.name }}</td>
                    <td class="dh-st-td-num dh-stat-v--amber" style="font-size: 14px">{{ row.average }}</td>
                    <td class="dh-st-td-num" style="color: #cbd5e1">{{ row.total_darts }}</td>
                    <td class="dh-st-td-num" style="color: #cbd5e1">{{ row.games }}</td>
                  </tr>
                  <tr v-if="leaderboardSolo.length === 0">
                    <td colspan="5" class="dh-st-muted" style="padding: 20px">{{ t('stats.noData') }}</td>
                  </tr>
                </tbody>
              </table>
              </div>
            </div>
          </section>
        </template>
      </template>
    </div>

    <div class="dth-bnav dth-bnav--mob-only" role="navigation" :aria-label="t('nav.bnavAria')">
      <button
        v-for="b in bnav"
        :key="b.id"
        type="button"
        :class="['dth-bnav-b', { 'dth-bnav-b--on': bnavOn(b) }]"
        :aria-disabled="bnavDisabled(b)"
        :aria-current="bnavOn(b) ? 'page' : undefined"
        @click="bnavClick(b)"
      >
        <HomeStrokeIcon :name="b.icon" :size="20" color="currentColor" />
        <span class="dh-bn-lb">{{ b.label }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.dh-st-view {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  box-sizing: border-box;
}
.dh-st-page {
  flex: 1 1 auto;
  min-height: 0;
}
.text-xs {
  font-size: 11px;
}
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
.dh-st-var-chip {
  margin-right: 6px;
}
</style>
