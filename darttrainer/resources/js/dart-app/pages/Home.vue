<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore, useLocaleStore } from '../store/index.js';
import { PublicApi, Rooms } from '../api/client.js';
import { useCanPlayGames } from '../composables/useCanPlayGames.js';
import { useCanPlayX01 } from '../composables/useCanPlayX01.js';

defineOptions({ name: 'HomePage' });

const auth = useAuthStore();
const locale = useLocaleStore();
const router = useRouter();
const canPlayGames = useCanPlayGames();
const canPlayX01 = useCanPlayX01();

const t = (key) => locale.t(key);

const activeRooms = ref([]);
const activeRoomsLoading = ref(false);
const summary = ref(null);
const summaryErr = ref(false);
const summaryLoading = ref(true);

const needsEmailVerify = computed(() => auth.needsEmailVerification);
const showActiveRoomsSection = computed(() => auth.hydrated && !!auth.user);
const showGuestCta = computed(() => auth.hydrated && !auth.user);
const showLoggedNavCards = computed(() => !!auth.user);

const x01OfferTitle = computed(() => {
  if (!canPlayGames.value) return t('nav.gamesTeaserHint');
  if (!canPlayX01.value) return t('nav.x01UnavailableHint');
  return '';
});

const x01HomeActionsEnabled = computed(() => canPlayGames.value && canPlayX01.value);

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

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(locale.locale === 'lv' ? 'lv-LV' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

async function refreshActiveRooms() {
  activeRooms.value = [];
  if (!auth.hydrated || !auth.user || auth.needsEmailVerification) {
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

function continueGame(room) {
  if (!room) return;
  if (needsEmailVerify.value) {
    window._dartToast?.(t('auth.verifyEmailToContinue'), 'error');
    return;
  }
  if (room.match_id) {
    router.push(`/game/${room.match_id}`);
    return;
  }
  if (room.game_type === 'x01' && !canPlayX01.value) {
    window._dartToast?.(t('nav.x01UnavailableHint'), 'error');
    return;
  }
  const path = room.game_type === 'cricket' ? '/lobby/cricket' : '/lobby/x01';
  const v = room.game_config?.variant;
  const query =
    room.game_type === 'x01' && (v === 301 || v === 501) ? { variant: String(v) } : {};
  router.push({ path, query });
}

function goExplore(path) {
  if (needsEmailVerify.value) {
    window._dartToast?.(t('auth.verifyEmailToContinue'), 'error');
    return;
  }
  if (
    (path === '/lobby/x01' || path === '/training/x01' || path.startsWith('/lobby/x01')) &&
    !canPlayX01.value
  ) {
    window._dartToast?.(t('nav.x01UnavailableHint'), 'error');
    return;
  }
  router.push(path);
}

function guestSocialTeaser() {
  window._dartToast?.(t('nav.gamesTeaserHint'), 'error');
}

function goLobbyCricket() {
  if (!canPlayGames.value) return;
  router.push('/lobby/cricket');
}

function goLobbyX01(variant) {
  if (!canPlayGames.value) return;
  if (!canPlayX01.value) {
    window._dartToast?.(t('nav.x01UnavailableHint'), 'error');
    return;
  }
  router.push({ path: '/lobby/x01', query: { variant: String(variant) } });
}

watch(() => [auth.hydrated, auth.user?.id], refreshActiveRooms, { immediate: true });
onMounted(loadSummary);
</script>

<template>
  <div style="flex: 1; overflow-y: auto; min-height: 0">
    <div style="padding: 16px 18px 24px; box-sizing: border-box">
      <div style="margin-bottom: 18px; display: flex; flex-direction: column; gap: 12px">
        <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap">
          <img
            src="/images/logo.png"
            alt="DartTrainer"
            style="
              height: 72px;
              width: auto;
              max-width: 260px;
              object-fit: contain;
              display: block;
            "
          />
          <p style="color: #64748b; font-size: 14px; margin: 0; max-width: 440px; line-height: 1.45">
            {{ t('home.tagline') }}
          </p>
        </div>
      </div>

      <div
        v-if="auth.hydrated"
        style="
          margin-bottom: 20px;
          padding: 14px 16px;
          background: #0f1c30;
          border: 1px solid #162540;
          border-radius: 14px;
        "
      >
        <div
          style="
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: #64748b;
            margin-bottom: 10px;
            line-height: 1.35;
          "
        >
          {{ t('nav.gamesOffered') }}
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 10px">
          <button
            type="button"
            :disabled="!canPlayGames"
            :title="!canPlayGames ? t('nav.gamesTeaserHint') : ''"
            style="
              flex: 1 1 auto;
              min-width: 7.5rem;
              padding: 10px 14px;
              border-radius: 10px;
              border: 1px solid #1e3050;
              background: #060d18;
              color: #e2e8f0;
              font-size: 13px;
              font-weight: 700;
              cursor: pointer;
              text-align: center;
              transition: background 0.15s, border-color 0.15s;
            "
            :style="!canPlayGames ? { opacity: 0.45, cursor: 'not-allowed' } : {}"
            @click="goLobbyCricket()"
            @mouseenter="
              if (canPlayGames) {
                ($event.currentTarget).style.background = '#162540';
                ($event.currentTarget).style.borderColor = '#334155';
              }
            "
            @mouseleave="
              if (canPlayGames) {
                ($event.currentTarget).style.background = '#060d18';
                ($event.currentTarget).style.borderColor = '#1e3050';
              }
            "
          >
            🏏 {{ t('nav.gameCricket') }}
          </button>
          <button
            type="button"
            :disabled="!x01HomeActionsEnabled"
            :title="x01OfferTitle"
            style="
              flex: 1 1 auto;
              min-width: 7.5rem;
              padding: 10px 14px;
              border-radius: 10px;
              border: 1px solid #1e3050;
              background: #060d18;
              color: #e2e8f0;
              font-size: 13px;
              font-weight: 700;
              cursor: pointer;
              text-align: center;
              transition: background 0.15s, border-color 0.15s;
            "
            :style="!x01HomeActionsEnabled ? { opacity: 0.45, cursor: 'not-allowed' } : {}"
            @click="goLobbyX01(501)"
            @mouseenter="
              if (x01HomeActionsEnabled) {
                ($event.currentTarget).style.background = '#162540';
                ($event.currentTarget).style.borderColor = '#334155';
              }
            "
            @mouseleave="
              if (x01HomeActionsEnabled) {
                ($event.currentTarget).style.background = '#060d18';
                ($event.currentTarget).style.borderColor = '#1e3050';
              }
            "
          >
            🎯 {{ t('nav.gameX01501') }}
          </button>
          <button
            type="button"
            :disabled="!x01HomeActionsEnabled"
            :title="x01OfferTitle"
            style="
              flex: 1 1 auto;
              min-width: 7.5rem;
              padding: 10px 14px;
              border-radius: 10px;
              border: 1px solid #1e3050;
              background: #060d18;
              color: #e2e8f0;
              font-size: 13px;
              font-weight: 700;
              cursor: pointer;
              text-align: center;
              transition: background 0.15s, border-color 0.15s;
            "
            :style="!x01HomeActionsEnabled ? { opacity: 0.45, cursor: 'not-allowed' } : {}"
            @click="goLobbyX01(301)"
            @mouseenter="
              if (x01HomeActionsEnabled) {
                ($event.currentTarget).style.background = '#162540';
                ($event.currentTarget).style.borderColor = '#334155';
              }
            "
            @mouseleave="
              if (x01HomeActionsEnabled) {
                ($event.currentTarget).style.background = '#060d18';
                ($event.currentTarget).style.borderColor = '#1e3050';
              }
            "
          >
            🎯 {{ t('nav.gameX01301') }}
          </button>
        </div>
      </div>

      <div
        v-if="showGuestCta"
        style="
          margin-bottom: 20px;
          padding: 14px 16px;
          background: #0f1c30;
          border: 1px solid #162540;
          border-radius: 14px;
        "
      >
        <div
          style="
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: #64748b;
            margin-bottom: 10px;
            line-height: 1.35;
          "
        >
          {{ t('home.guestNavTeasersTitle') }}
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 10px">
          <a
            href="/friends"
            role="button"
            class="nav-card--locked"
            style="
              flex: 1 1 160px;
              min-width: 0;
              background: #0f1c30;
              border: 1px solid #162540;
              border-radius: 14px;
              padding: 18px 16px;
              text-decoration: none;
              display: flex;
              flex-direction: column;
            "
            :title="t('nav.gamesTeaserHint')"
            @click.prevent="guestSocialTeaser()"
          >
            <span style="font-size: 24px; margin-bottom: 8px">👥</span>
            <span style="font-weight: 700; font-size: 14px; color: #f1f5f9; margin-bottom: 4px">{{
              t('nav.friends')
            }}</span>
            <span style="font-size: 12px; color: #475569; line-height: 1.35">{{
              t('home.registerHintSub')
            }}</span>
          </a>
          <a
            href="/stats"
            role="button"
            class="nav-card--locked"
            style="
              flex: 1 1 160px;
              min-width: 0;
              background: #0f1c30;
              border: 1px solid #162540;
              border-radius: 14px;
              padding: 18px 16px;
              text-decoration: none;
              display: flex;
              flex-direction: column;
            "
            :title="t('nav.gamesTeaserHint')"
            @click.prevent="guestSocialTeaser()"
          >
            <span style="font-size: 24px; margin-bottom: 8px">📊</span>
            <span style="font-weight: 700; font-size: 14px; color: #f1f5f9; margin-bottom: 4px">{{
              t('home.stats')
            }}</span>
            <span style="font-size: 12px; color: #475569; line-height: 1.35">{{
              t('home.registerHintSub')
            }}</span>
          </a>
        </div>
      </div>

      <div v-if="summaryLoading" style="margin-bottom: 16px; font-size: 13px; color: #64748b">
        {{ t('home.loadSummary') }}
      </div>

      <div
        v-else-if="summary"
        style="
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(108px, 1fr));
          gap: 10px;
          margin-bottom: 20px;
        "
      >
        <div style="background: #0f1c30; border: 1px solid #162540; border-radius: 12px; padding: 11px 12px">
          <div
            style="
              font-size: 9px;
              font-weight: 800;
              letter-spacing: 0.07em;
              text-transform: uppercase;
              color: #64748b;
              line-height: 1.25;
            "
          >
            {{ t('home.usersTotal') }}
          </div>
          <div style="font-size: 20px; font-weight: 900; color: #f59e0b; margin-top: 4px">
            {{ summary.users_total }}
          </div>
        </div>
        <div style="background: #0f1c30; border: 1px solid #162540; border-radius: 12px; padding: 11px 12px">
          <div
            style="
              font-size: 9px;
              font-weight: 800;
              letter-spacing: 0.07em;
              text-transform: uppercase;
              color: #64748b;
              line-height: 1.25;
            "
          >
            {{ t('home.activePlayers') }}
          </div>
          <div style="font-size: 20px; font-weight: 900; color: #34d399; margin-top: 4px">
            {{ summary.active_players }}
          </div>
        </div>
        <div style="background: #0f1c30; border: 1px solid #162540; border-radius: 12px; padding: 11px 12px">
          <div
            style="
              font-size: 9px;
              font-weight: 800;
              letter-spacing: 0.07em;
              text-transform: uppercase;
              color: #64748b;
              line-height: 1.25;
            "
          >
            {{ t('home.gamesTotal') }}
          </div>
          <div style="font-size: 20px; font-weight: 900; color: #e2e8f0; margin-top: 4px">
            {{ summary.games_total }}
          </div>
        </div>
        <div style="background: #0f1c30; border: 1px solid #162540; border-radius: 12px; padding: 11px 12px">
          <div
            style="
              font-size: 9px;
              font-weight: 800;
              letter-spacing: 0.07em;
              text-transform: uppercase;
              color: #64748b;
              line-height: 1.25;
            "
          >
            {{ t('home.matchesActive') }}
          </div>
          <div style="font-size: 20px; font-weight: 900; color: #38bdf8; margin-top: 4px">
            {{ summary.matches_active }}
          </div>
        </div>
        <div style="background: #0f1c30; border: 1px solid #162540; border-radius: 12px; padding: 11px 12px">
          <div
            style="
              font-size: 9px;
              font-weight: 800;
              letter-spacing: 0.07em;
              text-transform: uppercase;
              color: #64748b;
              line-height: 1.25;
            "
          >
            {{ t('home.roomsOpen') }}
          </div>
          <div style="font-size: 20px; font-weight: 900; color: #a78bfa; margin-top: 4px">
            {{ summary.rooms_open }}
          </div>
        </div>
        <div
          v-if="summary.last_registration_at"
          style="
            background: #0f1c30;
            border: 1px solid #162540;
            border-radius: 12px;
            padding: 11px 12px;
            grid-column: span 2;
            min-width: 0;
          "
        >
          <div
            style="
              font-size: 9px;
              font-weight: 800;
              letter-spacing: 0.07em;
              text-transform: uppercase;
              color: #64748b;
            "
          >
            {{ t('home.lastUser') }}
          </div>
          <div style="font-size: 14px; font-weight: 800; color: #f1f5f9; margin-top: 4px">
            {{ fmtDate(summary.last_registration_at) }}
          </div>
          <div style="font-size: 11px; color: #475569; margin-top: 3px; line-height: 1.35">
            {{ t('home.lastRegistrationPrivacy') }}
          </div>
        </div>
      </div>
      <div v-else-if="summaryErr" style="margin-bottom: 16px; font-size: 13px; color: #94a3b8">
        {{ t('home.summaryError') }}
      </div>

      <div v-if="showActiveRoomsSection" style="margin-bottom: 20px">
        <div
          style="
            color: #64748b;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            margin-bottom: 10px;
          "
        >
          {{ t('home.activeGamesTitle') }}
        </div>
        <div v-if="activeRoomsLoading" style="font-size: 13px; color: #64748b">
          {{ t('home.activeRoomsLoading') }}
        </div>
        <template v-else>
          <p
            v-if="!activeRooms.length"
            style="font-size: 13px; color: #64748b; margin: 0; line-height: 1.45"
          >
            {{ t('home.activeGamesEmpty') }}
          </p>
          <div v-else style="display: flex; flex-direction: column; gap: 10px">
            <div
              v-for="room in activeRooms"
              :key="room.id"
              style="
                background: linear-gradient(135deg, #052e16, #064e3b);
                border: 1px solid #065f46;
                border-radius: 14px;
                padding: 14px 18px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                flex-wrap: wrap;
              "
            >
              <div style="min-width: 0; flex: 1">
                <div style="color: #f1f5f9; font-weight: 600; font-size: 14px; line-height: 1.35">
                  {{ roomSummaryLine(room) }}
                  <span style="color: #475569; font-weight: 400"> · {{ t('home.roomCode') }} </span>
                  <span style="font-family: monospace; color: #f59e0b; font-weight: 700">{{
                    room.code
                  }}</span>
                  <span style="color: #475569; font-weight: 400"> · </span>
                  <span style="color: #94a3b8; font-weight: 600">{{ playModeLabel(room) }}</span>
                </div>
                <div style="color: #6ee7b7; font-size: 12px; margin-top: 5px; line-height: 1.35">
                  {{ roomStatusLabel(room) }}
                </div>
              </div>
              <button
                type="button"
                style="
                  flex-shrink: 0;
                  background: #10b981;
                  color: #fff;
                  font-weight: 700;
                  font-size: 13px;
                  padding: 9px 18px;
                  border-radius: 10px;
                  border: none;
                  cursor: pointer;
                  white-space: nowrap;
                  transition: background 0.15s;
                "
                @click="continueGame(room)"
                @mouseenter="($event.target).style.background = '#059669'"
                @mouseleave="($event.target).style.background = '#10b981'"
              >
                {{ room.match_id ? t('home.continue') : t('home.backToLobby') }}
              </button>
            </div>
          </div>
        </template>
      </div>

      <div
        v-if="showLoggedNavCards"
        style="
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        "
      >
        <a
          href="/lobby/x01"
          role="button"
          :class="{ 'nav-card--locked': needsEmailVerify || !canPlayX01 }"
          :title="
            needsEmailVerify
              ? t('auth.verifyEmailToContinue')
              : !canPlayX01
                ? t('nav.x01UnavailableHint')
                : ''
          "
          style="
            background: linear-gradient(135deg, #451a03, #78350f);
            border: 1px solid #92400e;
            border-radius: 14px;
            padding: 20px;
            text-decoration: none;
            display: flex;
            flex-direction: column;
            transition: all 0.2s;
            cursor: pointer;
          "
          @click.prevent="goExplore('/lobby/x01')"
          @mouseenter="
            if (!needsEmailVerify && canPlayX01) {
              ($event.currentTarget).style.transform = 'translateY(-2px)';
              ($event.currentTarget).style.boxShadow = '0 8px 24px rgba(245,158,11,.2)';
            }
          "
          @mouseleave="
            ($event.currentTarget).style.transform = '';
            ($event.currentTarget).style.boxShadow = '';
          "
        >
          <span style="font-size: 28px; margin-bottom: 10px">🎮</span>
          <span style="font-weight: 700; font-size: 15px; color: #fbbf24; margin-bottom: 4px">{{
            t('home.multiplayer')
          }}</span>
          <span style="font-size: 12px; color: #92400e">{{ t('home.multiplayerSub') }}</span>
        </a>

        <a
          href="/training/x01"
          role="button"
          :class="{ 'nav-card--locked': needsEmailVerify || !canPlayX01 }"
          :title="
            needsEmailVerify
              ? t('auth.verifyEmailToContinue')
              : !canPlayX01
                ? t('nav.x01UnavailableHint')
                : ''
          "
          style="
            background: linear-gradient(135deg, #1e1b4b, #312e81);
            border: 1px solid #4338ca;
            border-radius: 14px;
            padding: 20px;
            text-decoration: none;
            display: flex;
            flex-direction: column;
            transition: all 0.2s;
            cursor: pointer;
          "
          @click.prevent="goExplore('/training/x01')"
          @mouseenter="
            if (!needsEmailVerify && canPlayX01) {
              ($event.currentTarget).style.transform = 'translateY(-2px)';
              ($event.currentTarget).style.boxShadow = '0 8px 24px rgba(99,102,241,.25)';
            }
          "
          @mouseleave="
            ($event.currentTarget).style.transform = '';
            ($event.currentTarget).style.boxShadow = '';
          "
        >
          <span style="font-size: 28px; margin-bottom: 10px">🎯</span>
          <span style="font-weight: 700; font-size: 15px; color: #a5b4fc; margin-bottom: 4px">{{
            t('home.x01solo')
          }}</span>
          <span style="font-size: 12px; color: #4338ca">{{ t('home.x01soloSub') }}</span>
        </a>

        <a
          href="/stats"
          role="button"
          :class="{ 'nav-card--locked': needsEmailVerify }"
          style="
            background: #0f1c30;
            border: 1px solid #162540;
            border-radius: 14px;
            padding: 20px;
            text-decoration: none;
            display: flex;
            flex-direction: column;
            transition: all 0.2s;
          "
          @click.prevent="goExplore('/stats')"
          @mouseenter="
            ($event.currentTarget).style.background = '#162540';
            ($event.currentTarget).style.transform = 'translateY(-2px)';
          "
          @mouseleave="
            ($event.currentTarget).style.background = '#0f1c30';
            ($event.currentTarget).style.transform = '';
          "
        >
          <span style="font-size: 28px; margin-bottom: 10px">📊</span>
          <span style="font-weight: 700; font-size: 15px; color: #f1f5f9; margin-bottom: 4px">{{
            t('home.stats')
          }}</span>
          <span style="font-size: 12px; color: #334155">{{ t('home.statsSub') }}</span>
        </a>
      </div>

      <div
        v-if="showGuestCta && summary"
        style="display: flex; flex-wrap: wrap; gap: 16px; align-items: stretch; margin-bottom: 8px"
      >
        <div
          style="
            flex: 2;
            min-width: min(100%, 280px);
            background: #0f1c30;
            border: 1px solid #162540;
            border-radius: 14px;
            padding: 16px 18px;
          "
        >
          <div
            style="
              color: #94a3b8;
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 0.07em;
              text-transform: uppercase;
              margin-bottom: 12px;
            "
          >
            {{ t('home.topPlayersTitle') }}
          </div>
          <p
            v-if="!summary.top_players || !summary.top_players.length"
            style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.45"
          >
            {{ t('home.topPlayersEmpty') }}
          </p>
          <ol
            v-else
            style="
              margin: 0;
              padding: 0;
              list-style: none;
              display: flex;
              flex-direction: column;
              gap: 6px;
            "
          >
            <li
              v-for="(row, idx) in summary.top_players"
              :key="row.user_id"
              style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
                font-size: 13px;
                color: #e2e8f0;
                padding: 6px 0;
                border-bottom: 1px solid #1e3050;
              "
            >
              <span style="display: flex; align-items: center; gap: 8px; min-width: 0">
                <span style="color: #64748b; font-weight: 800; width: 24px; flex-shrink: 0"
                  >{{ idx + 1 }}.</span
                >
                <span style="font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{{
                  row.name
                }}</span>
              </span>
              <span
                style="color: #f59e0b; font-weight: 800; flex-shrink: 0; font-variant-numeric: tabular-nums"
                >{{ row.matches_count }} {{ t('home.topPlayersMatches') }}</span
              >
            </li>
          </ol>
        </div>
        <div
          style="
            flex: 1;
            min-width: min(100%, 260px);
            background: #0f1c30;
            border: 1px solid #162540;
            border-radius: 14px;
            padding: 18px 20px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 14px;
          "
        >
          <div>
            <div style="font-weight: 600; font-size: 14px; color: #f1f5f9; margin-bottom: 3px">
              {{ t('home.registerHint') }}
            </div>
            <div style="font-size: 12px; color: #475569; line-height: 1.4">
              {{ t('home.registerHintSub') }}
            </div>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap">
            <a
              href="/login"
              style="
                font-size: 13px;
                color: #94a3b8;
                background: #162540;
                padding: 9px 16px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                transition: background 0.15s;
              "
              @mouseenter="($event.currentTarget).style.background = '#1e3050'"
              @mouseleave="($event.currentTarget).style.background = '#162540'"
              >{{ t('shell.login') }}</a
            >
            <a
              href="/register"
              style="
                font-size: 13px;
                background: #f59e0b;
                color: #000;
                padding: 9px 16px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 700;
                transition: background 0.15s;
              "
              @mouseenter="($event.currentTarget).style.background = '#fbbf24'"
              @mouseleave="($event.currentTarget).style.background = '#f59e0b'"
              >{{ t('shell.register') }}</a
            >
          </div>
        </div>
      </div>

      <div
        v-else-if="showGuestCta && !summary && !summaryLoading"
        style="
          background: #0f1c30;
          border: 1px solid #162540;
          border-radius: 14px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        "
      >
        <div>
          <div style="font-weight: 600; font-size: 14px; color: #f1f5f9; margin-bottom: 3px">
            {{ t('home.registerHint') }}
          </div>
          <div style="font-size: 12px; color: #334155">{{ t('home.registerHintSub') }}</div>
        </div>
        <div style="display: flex; gap: 8px; flex-shrink: 0">
          <a
            href="/login"
            style="
              font-size: 13px;
              color: #94a3b8;
              background: #162540;
              padding: 8px 14px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: 600;
              transition: background 0.15s;
            "
            @mouseenter="($event.currentTarget).style.background = '#1e3050'"
            @mouseleave="($event.currentTarget).style.background = '#162540'"
            >{{ t('shell.login') }}</a
          >
          <a
            href="/register"
            style="
              font-size: 13px;
              background: #f59e0b;
              color: #000;
              padding: 8px 14px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: 700;
              transition: background 0.15s;
            "
            @mouseenter="($event.currentTarget).style.background = '#fbbf24'"
            @mouseleave="($event.currentTarget).style.background = '#f59e0b'"
            >{{ t('shell.register') }}</a
          >
        </div>
      </div>
    </div>
  </div>
</template>
