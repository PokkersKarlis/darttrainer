<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore, useLocaleStore } from '../store/index.js';
import { PublicApi, Rooms } from '../api/client.js';
import { useCanPlayGames } from '../composables/useCanPlayGames.js';
import { useCanPlayX01 } from '../composables/useCanPlayX01.js';
import { useCanvasBnav } from '../composables/useCanvasBnav.js';
import { DARTTRAINER_DISCORD_URL } from '../constants/discord.js';
import HomeStrokeIcon from '../components/home/HomeStrokeIcon.vue';
import HeaderUserMenu from '../components/shell/header/HeaderUserMenu.vue';
import EmailVerifyBanner from '../components/shell/EmailVerifyBanner.vue';
import { HOME_PAGE_SNAPSHOT_VERSION } from './homePageMeta.js';
import { useCookieConsent } from '../composables/useCookieConsent.js';

defineOptions({ name: 'HomePage' });

const auth = useAuthStore();
const locale = useLocaleStore();
const route = useRoute();
const router = useRouter();
const canPlayGames = useCanPlayGames();
const canPlayX01 = useCanPlayX01();
const { bnav, bnavOn, bnavClick, bnavDisabled } = useCanvasBnav();

const t = (key) => locale.t(key);
const discordUrl = DARTTRAINER_DISCORD_URL;
const consent = useCookieConsent();
const canLoadPaypal = computed(() => consent.canFunctional.value || consent.canMarketing.value);

const summary = ref(null);
const summaryErr = ref(false);
const summaryLoading = ref(true);
const activeRooms = ref([]);
const activeRoomsLoading = ref(false);

const activeGame = ref('cricket');
const startMenuOpen = ref(false);
const showTutorial = ref(false);
const isMobile = ref(
  typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches,
);
const resendBusy = ref(false);

const needsEmailVerify = computed(() => auth.needsEmailVerification);
/** Ielogots, bet e-pasts neapstiprināts — nevar atvērt «Sākt spēli» izvēlni. */
const startGameMenuLocked = computed(() => needsEmailVerify.value);
const showGuestCta = computed(() => auth.hydrated && !auth.user);
const socialUnlocked = computed(() => canPlayGames.value);
const showMyActiveSection = computed(() => auth.hydrated && !!auth.user && !needsEmailVerify.value);

const liveMatches = computed(() => {
  const raw = summary.value?.live_matches;
  return Array.isArray(raw) ? raw : [];
});

const gameModes = computed(() => [
  { id: 'cricket', label: t('nav.gameCricket'), icon: 'target', color: '#4a9eff', desc: t('home.modeCricketDesc') },
  { id: 'x501', label: t('nav.gameX01501'), icon: 'zap', color: '#f5a623', desc: t('home.modeX501Desc') },
  { id: 'x301', label: t('nav.gameX01301'), icon: 'flame', color: '#3ecf8e', desc: t('home.modeX301Desc') },
]);

function matchGameLabel(kind) {
  switch (kind) {
    case 'cricket':
      return t('nav.gameCricket');
    case 'x01_301':
      return t('nav.gameX01301');
    case 'x01_501':
      return t('nav.gameX01501');
    case 'x01':
      return t('home.matchKindX01');
    default:
      return t('home.matchKindOther');
  }
}

let mq;

function setMobileFlag() {
  isMobile.value = window.matchMedia('(max-width: 767px)').matches;
}

function fmtRegDay(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(locale.locale === 'lv' ? 'lv-LV' : 'en-GB', { day: 'numeric', month: 'short' });
}
function fmtRegYear(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return String(d.getFullYear());
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

function roomSummaryLine(room) {
  if (!room) return '';
  if (room.game_type === 'x01') {
    const v = room.game_config?.variant;
    return v != null ? `X01 ${v}` : 'X01';
  }
  if (room.game_type === 'cricket') {
    return (room.game_config?.cricket_type || 'standard') === 'random'
      ? t('lobby.cricketRandomShort')
      : t('lobby.cricketStandardShort');
  }
  return String(room.game_type || '').replace(/_/g, ' ').toUpperCase();
}
function roomStatusLabel(room) {
  if (!room) return '';
  if (room.match_status === 'suspended') return t('home.statusSuspended');
  if (room.match_id) return t('home.statusPlaying');
  return t('home.statusLobby');
}
function playModeLabel(room) {
  if (!room) return '';
  return room.play_mode === 'local' ? t('home.playModeLocalShort') : t('home.playModeOnlineShort');
}
async function refreshActiveRooms() {
  activeRooms.value = [];
  if (!auth.hydrated || !auth.user || needsEmailVerify.value) {
    activeRoomsLoading.value = false;
    return;
  }
  activeRoomsLoading.value = true;
  try {
    const { data } = await Rooms.myActives();
    activeRooms.value = Array.isArray(data?.items) ? data.items : [];
  } catch (_) {
    activeRooms.value = [];
  } finally {
    activeRoomsLoading.value = false;
  }
}
function continueActiveRoom(room) {
  if (!room) return;
  if (needsEmailVerify.value) {
    window._dartToast?.(t('auth.verifyEmailToContinue'), 'error');
    return;
  }
  router.push(room.match_id ? `/game/${room.match_id}` : '/lobby');
}

function goLobbyCricket() {
  if (needsEmailVerify.value) {
    window._dartToast?.(t('auth.verifyEmailToContinue'), 'error');
    return;
  }
  if (!canPlayGames.value) {
    window._dartToast?.(t('nav.gamesTeaserHint'), 'error');
    return;
  }
  router.push('/lobby/cricket');
}

function goLobbyX01(variant) {
  if (needsEmailVerify.value) {
    window._dartToast?.(t('auth.verifyEmailToContinue'), 'error');
    return;
  }
  if (!canPlayGames.value) {
    window._dartToast?.(t('nav.gamesTeaserHint'), 'error');
    return;
  }
  if (!canPlayX01.value) {
    window._dartToast?.(t('nav.x01UnavailableHint'), 'error');
    return;
  }
  router.push({ path: '/lobby/x01', query: { variant: String(variant) } });
}

function toggleLearn() {
  showTutorial.value = !showTutorial.value;
}

function pickStartMode(mode) {
  startMenuOpen.value = false;
  if (needsEmailVerify.value) {
    window._dartToast?.(t('auth.verifyEmailToContinue'), 'error');
    return;
  }
  if (mode === 'cricket') {
    if (!canPlayGames.value) {
      router.push('/register');
      return;
    }
    goLobbyCricket();
    return;
  }
  if (!canPlayGames.value) {
    window._dartToast?.(t('nav.gamesTeaserHint'), 'error');
    return;
  }
  if (!canPlayX01.value) {
    return;
  }
  goLobbyX01(mode === 'x501' ? 501 : 301);
}

async function resendVerificationFromHome() {
  if (!auth.user || resendBusy.value) return;
  resendBusy.value = true;
  try {
    await auth.resendVerificationEmail();
    window._dartToast?.(t('auth.resendSent'), 'success');
  } catch (_) {
    window._dartToast?.(t('common.error'), 'error');
  } finally {
    resendBusy.value = false;
  }
}

function onDocMousedownForStart(e) {
  if (!startMenuOpen.value) return;
  const el = e.target;
  if (el && typeof el.closest === 'function' && el.closest('.dth-start-wrap')) {
    return;
  }
  startMenuOpen.value = false;
}

function navX01Var(v) {
  if (needsEmailVerify.value) {
    window._dartToast?.(t('auth.verifyEmailToContinue'), 'error');
    return;
  }
  if (!canPlayGames.value) {
    window._dartToast?.(t('nav.gamesTeaserHint'), 'error');
    return;
  }
  if (!canPlayX01.value) {
    window._dartToast?.(t('nav.x01UnavailableHint'), 'error');
    return;
  }
  goLobbyX01(v);
}

function sbFriends() {
  if (showGuestCta.value) {
    router.push('/login');
    return;
  }
  if (needsEmailVerify.value) {
    window._dartToast?.(t('auth.verifyEmailToContinue'), 'error');
    return;
  }
  router.push('/friends');
}
function sbStats() {
  if (showGuestCta.value) {
    router.push('/login');
    return;
  }
  if (needsEmailVerify.value) {
    window._dartToast?.(t('auth.verifyEmailToContinue'), 'error');
    return;
  }
  router.push('/stats');
}
function sbSolo() {
  if (needsEmailVerify.value) {
    window._dartToast?.(t('auth.verifyEmailToContinue'), 'error');
    return;
  }
  if (!canPlayX01.value) {
    window._dartToast?.(t('nav.x01UnavailableHint'), 'error');
    return;
  }
  router.push('/training/x01');
}
function sbLobby() {
  if (needsEmailVerify.value) {
    window._dartToast?.(t('auth.verifyEmailToContinue'), 'error');
    return;
  }
  if (!canPlayGames.value) {
    window._dartToast?.(t('nav.gamesTeaserHint'), 'error');
    return;
  }
  router.push('/lobby/cricket');
}

function isSbActive(id) {
  if (id === 'home') return route.path === '/';
  if (id === 'lobby') return route.path === '/lobby/cricket' || route.path === '/lobby/x01';
  if (id === 'friends') return route.path.startsWith('/friends');
  if (id === 'solo') return route.path === '/training/x01';
  if (id === 'stats') return route.path === '/stats';
  if (id === 'cricket') return route.path === '/lobby/cricket';
  if (id === 'x501') {
    return route.path === '/lobby/x01' && String(route.query.variant) === '501';
  }
  if (id === 'x301') {
    return route.path === '/lobby/x01' && String(route.query.variant) === '301';
  }
  return false;
}

watch(startGameMenuLocked, (locked) => {
  if (locked) startMenuOpen.value = false;
});
watch(
  () => [auth.hydrated, auth.user?.id, needsEmailVerify.value],
  () => {
    void refreshActiveRooms();
  },
  { immediate: true },
);
onMounted(() => {
  setMobileFlag();
  mq = window.matchMedia('(max-width: 767px)');
  mq.addEventListener('change', setMobileFlag);
  document.addEventListener('mousedown', onDocMousedownForStart, true);
  loadSummary();
});
onUnmounted(() => {
  mq?.removeEventListener('change', setMobileFlag);
  document.removeEventListener('mousedown', onDocMousedownForStart, true);
});
</script>

<template>
  <div
    class="dth-canvas dth-home"
    :data-home-page-snapshot="String(HOME_PAGE_SNAPSHOT_VERSION)"
  >
    <!-- Desktop (mock) -->
    <div v-if="!isMobile" class="dth-canvas--desktop dth-show-desktop" aria-hidden="false">
      <aside class="dth-sb" aria-label="Navigācija">
        <div class="dth-sb-logo">
          <img
            class="dth-sb-logo-img"
            src="/images/logo.png"
            alt="DartTrainer"
            width="160"
            height="52"
            loading="lazy"
            decoding="async"
          />
          <div class="dth-sb-logo-sub" aria-hidden="true">
            <span class="dth-sb-wordmark-line">{{ t('home.brandWordmark') }}</span>
            <span class="dth-sb-beta">{{ t('home.betaBadge') }}</span>
          </div>
        </div>
        <div class="dth-sb-nav">
          <div>
            <button
              type="button"
              :class="['dth-sb-row', { 'dth-sb-row--on': isSbActive('home') }]"
              @click="router.push('/')"
            >
              <HomeStrokeIcon name="home" :size="16" color="currentColor" />
              <span class="dth-sb-lbl">{{ t('nav.home') }}</span>
              <span v-if="isSbActive('home')" class="dth-sb-dot" />
            </button>
            <div class="dth-sb-sec">
              {{ t('home.sbMulti') }}
            </div>
            <button
              type="button"
              :class="['dth-sb-row', { 'dth-sb-row--on': isSbActive('lobby') }]"
              :disabled="!canPlayGames"
              :title="!canPlayGames ? t('nav.gamesTeaserHint') : ''"
              @click="sbLobby"
            >
              <HomeStrokeIcon name="target" :size="16" color="currentColor" />
              <span class="dth-sb-lbl">{{ t('nav.lobbyCricket') }}</span>
            </button>
            <button
              type="button"
              :class="['dth-sb-row', { 'dth-sb-row--on': isSbActive('friends') }]"
              :disabled="!canPlayGames"
              :title="!canPlayGames ? t('nav.gamesTeaserHint') : ''"
              @click="sbFriends"
            >
              <HomeStrokeIcon name="users" :size="16" color="currentColor" />
              <span class="dth-sb-lbl">{{ t('nav.friends') }}</span>
            </button>
            <div class="dth-sb-sec">
              {{ t('home.sbTrain') }}
            </div>
            <button
              type="button"
              :class="['dth-sb-row', { 'dth-sb-row--on': isSbActive('solo') }]"
              :disabled="!canPlayGames || !canPlayX01"
              :title="!canPlayGames ? t('nav.gamesTeaserHint') : !canPlayX01 ? t('nav.x01UnavailableHint') : ''"
              @click="sbSolo"
            >
              <HomeStrokeIcon name="zap" :size="16" color="currentColor" />
              <span class="dth-sb-lbl">{{ t('nav.x01solo') }}</span>
            </button>
            <div class="dth-sb-sec">
              {{ t('home.sbProgress') }}
            </div>
            <button
              type="button"
              :class="['dth-sb-row', { 'dth-sb-row--on': isSbActive('stats') }]"
              :disabled="!canPlayGames"
              :title="!canPlayGames ? t('nav.gamesTeaserHint') : ''"
              @click="sbStats"
            >
              <HomeStrokeIcon name="bar" :size="16" color="currentColor" />
              <span class="dth-sb-lbl">{{ t('nav.stats') }}</span>
            </button>
            <div class="dth-sb-sec">
              {{ t('home.sbModes') }}
            </div>
            <button
              type="button"
              :class="['dth-sb-row', { 'dth-sb-row--on': isSbActive('cricket') }]"
              :disabled="!canPlayGames"
              @click="goLobbyCricket"
            >
              <HomeStrokeIcon name="cricket" :size="16" color="currentColor" />
              <span class="dth-sb-lbl">{{ t('nav.gameCricket') }}</span>
            </button>
            <button
              type="button"
              :class="['dth-sb-row', { 'dth-sb-row--on': isSbActive('x501') }]"
              :disabled="!canPlayGames || !canPlayX01"
              @click="navX01Var(501)"
            >
              <HomeStrokeIcon name="star" :size="16" color="currentColor" />
              <span class="dth-sb-lbl">X01 — 501</span>
            </button>
            <button
              type="button"
              :class="['dth-sb-row', { 'dth-sb-row--on': isSbActive('x301') }]"
              :disabled="!canPlayGames || !canPlayX01"
              @click="navX01Var(301)"
            >
              <HomeStrokeIcon name="star" :size="16" color="currentColor" />
              <span class="dth-sb-lbl">X01 — 301</span>
            </button>
          </div>
        </div>
        <div class="dth-sb-foot">
          <a :href="discordUrl" class="dth-sb-disc" target="_blank" rel="noopener noreferrer">
            <HomeStrokeIcon name="discord" :size="16" color="#5865F2" />
            <span>{{ t('nav.discord') }}</span>
          </a>
          <form
            v-if="canLoadPaypal"
            action="https://www.paypal.com/donate"
            method="post"
            target="_blank"
            rel="noopener noreferrer"
            class="dth-sb-donate"
            style="text-align: center; padding: 0"
          >
            <input type="hidden" name="hosted_button_id" value="A3THH5ND6F4NJ" />
            <input
              type="image"
              src="https://pics.paypal.com/00/s/YTViYjhlMWYtOWZiMC00YTg0LThhYmYtZWFmMDU2NzFmNmE1/file.JPG"
              name="submit"
              :title="t('home.homeDonate')"
              :alt="t('home.homeDonate')"
              style="max-width: 100%; height: auto; max-height: 36px; border-radius: 6px; cursor: pointer"
            />
            <img alt="" src="https://www.paypal.com/en_LV/i/scr/pixel.gif" width="1" height="1" style="display: none" />
          </form>
        </div>
      </aside>
      <div class="dth-mid">
        <div class="dth-tb">
          <span class="dth-tb-t">{{ t('nav.home') }}</span>
          <div class="dh-tb-r">
            <div class="dth-locale" role="group" :aria-label="t('lang.lv') + ' / ' + t('lang.en')">
              <button
                type="button"
                :class="{ 'dth-locale--on': locale.locale === 'lv' }"
                @click="locale.setLocale('lv')"
              >
                {{ t('lang.lv') }}
              </button>
              <button
                type="button"
                :class="{ 'dth-locale--on': locale.locale === 'en' }"
                @click="locale.setLocale('en')"
              >
                {{ t('lang.en') }}
              </button>
            </div>
            <template v-if="auth.hydrated && auth.user">
              <div class="dth-um dth-um--compact">
                <HeaderUserMenu :needs-email-verify="!!needsEmailVerify" :force-compact="true" />
              </div>
            </template>
            <template v-else-if="auth.hydrated && !auth.user">
              <div class="dth-tb-auth">
                <button type="button" class="dth-btn dth-btn--ghost dth-btn--sm" @click="router.push('/login')">
                  {{ t('shell.login') }}
                </button>
                <button type="button" class="dth-btn dth-btn--accent dth-btn--sm" @click="router.push('/register')">
                  {{ t('shell.register') }}
                </button>
              </div>
            </template>
            <span v-else class="dth-btn dth-btn--ghost dth-btn--sm" style="pointer-events: none; opacity: 0.5">…</span>
          </div>
        </div>
        <div class="dth-sc">
          <div v-if="needsEmailVerify" class="dh-email-verify">
            <EmailVerifyBanner :resend-busy="resendBusy" @resend="resendVerificationFromHome" />
          </div>
          <div class="dth-warn" role="status">
            <div class="dth-warn-ic" aria-hidden="true">⚠</div>
            <div class="dh-warn-body">
              <div class="dh-warn-h">
                {{ t('home.rebuildNoticeTitle') }}
              </div>
              <p class="dh-warn-p">
                {{ t('home.rebuildNoticeP1') }}
              </p>
              <div class="dth-warn-links">
                <a :href="discordUrl" target="_blank" rel="noopener noreferrer" class="dth-warn-dc">
                  <HomeStrokeIcon name="discord" :size="14" color="#5865F2" />
                  {{ t('nav.discord') }}
                </a>
                <a class="dth-warn-mail" href="mailto:bugs@traindart.com">bugs@traindart.com</a>
              </div>
            </div>
          </div>
          <div class="dth-hero dth-hero--stack">
            <div class="dth-hero-top">
              <div class="dth-hero-ico" aria-hidden="true">
                <HomeStrokeIcon name="target" :size="26" color="#0b0e14" />
              </div>
              <div>
                <div class="dh-hero-b">
                  {{ t('home.brandShort') }}
                </div>
                <p class="dh-hero-s">
                  {{ t('home.tagline') }}
                </p>
              </div>
              <div class="dth-hero-cta">
                <button
                  type="button"
                  class="dth-btn dth-btn--outline dth-btn--sm"
                  :aria-expanded="showTutorial"
                  aria-controls="dt-learn"
                  @click="toggleLearn"
                >
                  {{ showTutorial ? t('home.learnClose') : t('home.learnMore') }}
                </button>
                <div class="dth-start-wrap">
                  <button
                    type="button"
                    class="dth-btn dth-btn--accent dth-btn--sm"
                    :disabled="startGameMenuLocked"
                    :aria-expanded="startMenuOpen"
                    :title="startGameMenuLocked ? t('auth.verifyEmailToContinue') : ''"
                    aria-haspopup="menu"
                    @click="startMenuOpen = !startMenuOpen"
                  >
                    <HomeStrokeIcon name="play" :size="14" color="#0b0e14" />
                    {{ t('home.startGame') }}
                  </button>
                  <div
                    v-show="startMenuOpen && !startGameMenuLocked"
                    class="dth-start-menu"
                    role="menu"
                    :aria-label="t('home.pickGameTitle')"
                    @click.stop
                  >
                    <div class="dth-start-h">
                      {{ t('home.pickGameTitle') }}
                    </div>
                    <button
                      type="button"
                      class="dth-start-row dth-start-row--on"
                      role="menuitem"
                      @click="pickStartMode('cricket')"
                    >
                      <span
                        class="dth-start-row-ico"
                        style="background: #4a9eff33"
                      >
                        <HomeStrokeIcon name="target" :size="18" color="#4a9eff" />
                      </span>
                      <span class="dth-start-row-meta">
                        <span>{{ t('nav.gameCricket') }}</span>
                        <span class="dth-start-row-d">{{ t('home.modeCricketDesc') }}</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      class="dth-start-row"
                      role="menuitem"
                      :disabled="!canPlayX01"
                      :title="!canPlayX01 ? t('nav.x01UnavailableHint') : ''"
                      :aria-disabled="!canPlayX01"
                      @click="pickStartMode('x501')"
                    >
                      <span
                        class="dth-start-row-ico"
                        style="background: #f5a62333"
                      >
                        <HomeStrokeIcon name="zap" :size="18" color="#f5a623" />
                      </span>
                      <span class="dth-start-row-meta">
                        <span>{{ t('nav.gameX01501') }}</span>
                        <span class="dth-start-row-d">{{
                          !canPlayX01 ? t('home.x01DisabledInMenu') : t('home.modeX501Desc')
                        }}</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      class="dth-start-row"
                      role="menuitem"
                      :disabled="!canPlayX01"
                      :title="!canPlayX01 ? t('nav.x01UnavailableHint') : ''"
                      :aria-disabled="!canPlayX01"
                      @click="pickStartMode('x301')"
                    >
                      <span
                        class="dth-start-row-ico"
                        style="background: #3ecf8e33"
                      >
                        <HomeStrokeIcon name="flame" :size="18" color="#3ecf8e" />
                      </span>
                      <span class="dth-start-row-meta">
                        <span>{{ t('nav.gameX01301') }}</span>
                        <span class="dth-start-row-d">{{
                          !canPlayX01 ? t('home.x01DisabledInMenu') : t('home.modeX301Desc')
                        }}</span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div
              id="dt-learn"
              v-show="showTutorial"
              class="dh-learn dh-learn--in-hero"
              role="region"
              :aria-label="t('home.tutorialTitle')"
              :aria-hidden="!showTutorial"
            >
              <div class="dh-slabel">
                {{ t('home.tutorialTitle') }}
              </div>
              <p class="dh-learn-body">
                {{ t('home.tutorialBody') }}
              </p>
            </div>
          </div>
          <div v-if="showMyActiveSection" class="dh-mine">
            <div class="dh-slabel">
              {{ t('home.activeGamesTitle') }}
            </div>
            <p v-if="activeRoomsLoading" class="dh-muted">
              {{ t('home.activeRoomsLoading') }}
            </p>
            <template v-else>
              <p v-if="!activeRooms.length" class="dh-muted">
                {{ t('home.activeGamesEmpty') }}
              </p>
              <div v-else class="dh-mine-list">
                <div
                  v-for="r in activeRooms"
                  :key="r.id"
                  class="dh-mine-row"
                >
                  <div class="dh-mine-txt">
                    <div class="dh-mine-t">
                      <span class="dth-e">{{ roomSummaryLine(r) }}</span>
                      <span class="dh-mine-mid">·</span>
                      <span>{{ t('home.roomCode') }}</span>
                      <span class="dh-mine-code">{{ r.code }}</span>
                      <span class="dh-mine-mid">·</span>
                      <span>{{ playModeLabel(r) }}</span>
                    </div>
                    <div class="dh-mine-s">
                      {{ roomStatusLabel(r) }}
                    </div>
                  </div>
                  <button
                    type="button"
                    class="dth-btn dth-btn--accent dth-btn--sm"
                    @click="continueActiveRoom(r)"
                  >
                    {{ r.match_id ? t('home.continue') : t('home.backToLobby') }}
                  </button>
                </div>
              </div>
            </template>
          </div>
          <div id="dt-modes">
            <div class="dh-slabel">
              {{ t('nav.gamesOffered') }}
            </div>
            <div class="dh-modes">
              <button
                v-for="g in gameModes"
                :key="g.id"
                type="button"
                class="dh-mode"
                :style="{
                  border: `1px solid ${activeGame === g.id ? g.color + '80' : '#1e2738'}`,
                  background: activeGame === g.id ? g.color + '1f' : '#131720',
                }"
                @click="activeGame = g.id"
              >
                <div
                  class="dh-mo-ico"
                  :style="{ background: g.color + '33' }"
                >
                  <HomeStrokeIcon :name="g.icon" :size="20" :color="g.color" />
                </div>
                <div>
                  <div
                    class="dh-mo-t"
                    :class="{ 'dh-mo-t--a': activeGame === g.id }"
                  >
                    {{ g.label }}
                  </div>
                  <div class="dh-mo-d">
                    {{ g.desc }}
                  </div>
                </div>
                <div
                  v-if="activeGame === g.id"
                  class="dh-mo-dot"
                  :style="{ background: g.color }"
                />
              </button>
            </div>
          </div>
          <div class="dh-lockg">
            <template v-if="!socialUnlocked || needsEmailVerify">
              <div
                v-for="card in [
                  { k: 'f', i: 'users', lab: t('nav.friends'), d: t('home.friendsLockedDesc') },
                  { k: 's', i: 'bar', lab: t('nav.stats'), d: t('home.statsLockedDesc') },
                ]"
                :key="card.k"
                class="dh-lock"
              >
                <div class="dh-lock-h">
                  <div class="dh-lock-ico">
                    <HomeStrokeIcon :name="card.i" :size="18" color="#7b8ba8" />
                  </div>
                  <span class="dh-lock-t">{{ card.lab }}</span>
                  <span class="dh-bad">{{ t('home.lockedBadge') }}</span>
                </div>
                <p class="dh-lock-x">
                  {{ card.d }}
                </p>
                <button
                  type="button"
                  class="dth-btn dth-btn--accent dth-btn--sm dth-btn--full"
                  @click="router.push('/login')"
                >
                  {{ t('home.signInCta') }}
                </button>
              </div>
            </template>
            <template v-else>
              <a
                class="dh-lock"
                href="/friends"
                @click.prevent="router.push('/friends')"
              >
                <div class="dh-lock-h">
                  <div class="dh-lock-ico dh-lock-ico--open">
                    <HomeStrokeIcon name="users" :size="18" color="#f5a623" />
                  </div>
                  <span class="dh-lock-t">{{ t('nav.friends') }}</span>
                </div>
                <p class="dh-lock-x">
                  {{ t('home.registerHintSub') }}
                </p>
                <span class="dth-btn dth-btn--accent dth-btn--sm dth-btn--full" style="text-align: center">{{
                  t('home.openCta')
                }}</span>
              </a>
              <a class="dh-lock" href="/stats" @click.prevent="router.push('/stats')">
                <div class="dh-lock-h">
                  <div class="dh-lock-ico dh-lock-ico--open">
                    <HomeStrokeIcon name="bar" :size="18" color="#f5a623" />
                  </div>
                  <span class="dh-lock-t">{{ t('nav.stats') }}</span>
                </div>
                <p class="dh-lock-x">
                  {{ t('home.statsSub') }}
                </p>
                <span class="dth-btn dth-btn--accent dth-btn--sm dth-btn--full" style="text-align: center">{{
                  t('home.openCta')
                }}</span>
              </a>
            </template>
          </div>
          <p v-if="summaryLoading" class="dh-muted">
            {{ t('home.loadSummary') }}
          </p>
          <template v-else-if="summary && !summaryErr">
            <div>
              <div class="dh-slabel">
                {{ t('home.platformStatsTitle') }}
              </div>
              <div class="dh-statg">
                <div class="dh-stat">
                  <div class="dh-stat-v dh-stat-v--amber">
                    {{ summary.users_total }}
                  </div>
                  <div class="dh-stat-l">
                    {{ t('home.usersTotal') }}
                  </div>
                </div>
                <div class="dh-stat">
                  <div class="dh-stat-v dh-stat-v--emerald">
                    {{ summary.active_players }}
                  </div>
                  <div class="dh-stat-l">
                    {{ t('home.activePlayers') }}
                  </div>
                </div>
                <div class="dh-stat">
                  <div class="dh-stat-v dh-stat-v--amber">
                    {{ summary.games_total }}
                  </div>
                  <div class="dh-stat-l">
                    {{ t('home.gamesTotal') }}
                  </div>
                </div>
                <div class="dh-stat">
                  <div class="dh-stat-v dh-stat-v--red">
                    {{ summary.matches_active }}
                  </div>
                  <div class="dh-stat-l">
                    {{ t('home.matchesActive') }}
                  </div>
                </div>
                <div class="dh-stat">
                  <div class="dh-stat-v dh-stat-v--emerald">
                    {{ summary.rooms_open }}
                  </div>
                  <div class="dh-stat-l">
                    {{ t('home.roomsOpen') }}
                  </div>
                </div>
                <div v-if="summary.last_registration_at" class="dh-stat">
                  <div class="dh-stat-v dh-stat-v--amber">
                    {{ fmtRegDay(summary.last_registration_at) }}
                  </div>
                  <div v-if="fmtRegYear(summary.last_registration_at)" class="dh-stat-s">
                    {{ fmtRegYear(summary.last_registration_at) }}
                  </div>
                  <div class="dh-stat-l">
                    {{ t('home.lastUser') }}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div class="dh-slabel">
                {{ t('home.liveMatchesSection') }}
              </div>
              <p v-if="!liveMatches.length" class="dh-muted">
                {{ t('home.liveMatchesEmpty') }}
              </p>
              <div v-else class="dh-lives">
                <div
                  v-for="m in liveMatches"
                  :key="m.match_id"
                  class="dh-lv-row"
                >
                  <div class="dh-pill">
                    <span class="dh-pill-dot" />
                    <span class="dh-pill-t">{{ t('home.liveBadge') }}</span>
                  </div>
                  <div class="dh-gt">
                    {{ matchGameLabel(m.game_kind) }}
                  </div>
                  <div class="dh-p12">
                    <span class="dth-e">{{ m.p1 }}</span>
                    <span class="dh-vs">VS</span>
                    <span class="dth-e">{{ m.p2 }}</span>
                  </div>
                  <div class="dh-rd">
                    {{ t('home.roundShort') }} {{ m.round }}
                  </div>
                  <div class="dh-tid">
                    #{{ m.short_id }}
                  </div>
                  <div class="dh-lv-watch">
                    <button
                      type="button"
                      class="dth-btn dth-btn--ghost dth-btn--sm"
                      disabled
                      :title="t('home.watchMatchSoon')"
                    >
                      {{ t('home.watchMatch') }}
                    </button>
                    <span class="dh-lv-hint">{{ t('home.watchMatchSoon') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <p v-else class="dh-muted">
            {{ t('home.summaryError') }}
          </p>
        </div>
      </div>
      <div class="dth-ads" aria-hidden="true">
        <div
          v-for="j in 2"
          :key="j"
          class="dth-adslot"
        >
          AD
          <span class="dth-adsz">60×160</span>
        </div>
      </div>
    </div>

    <!-- Mobile (mock) -->
    <div v-else class="dth-canvas--mobile dth-show-mobile">
      <div class="dth-mi-top">
        <div class="dth-mi-brand" aria-hidden="true">
          <img
            class="dth-mi-logo-img"
            src="/images/logo.png"
            alt=""
            width="120"
            height="40"
            loading="lazy"
            decoding="async"
          />
          <div class="dth-mi-logo-sub">
            <span class="dth-mi-wm">{{ t('home.brandWordmark') }}</span>
            <span class="dth-mi-beta">{{ t('home.betaBadge') }}</span>
          </div>
        </div>
        <div
          v-if="!(auth.hydrated && auth.user)"
          class="dth-locale dth-mi-locale"
          role="group"
          :aria-label="t('lang.lv') + ' / ' + t('lang.en')"
        >
          <button type="button" :class="{ 'dth-locale--on': locale.locale === 'lv' }" @click="locale.setLocale('lv')">
            {{ t('lang.lv') }}
          </button>
          <button type="button" :class="{ 'dth-locale--on': locale.locale === 'en' }" @click="locale.setLocale('en')">
            {{ t('lang.en') }}
          </button>
        </div>
        <div v-if="auth.hydrated" class="dth-mi-r" style="min-width: 0; flex: 0 1 auto">
          <HeaderUserMenu :needs-email-verify="!!needsEmailVerify" />
        </div>
        <span v-else class="dth-mi-r" style="opacity: 0.5">…</span>
      </div>
      <div class="dh-mi-sc">
        <div class="dh-mi-w">
          <span class="dh-mi-wsp" aria-hidden="true">⚠</span>
          <div>
            <div class="dh-mi-wh">
              {{ t('home.rebuildNoticeTitle') }}
            </div>
            <p class="dh-mi-wp">
              {{ t('home.rebuildShort') }}
            </p>
            <div class="dh-mi-wx">
              <a :href="discordUrl" class="dh-mi-wa" target="_blank" rel="noopener noreferrer">{{
                t('nav.discord')
              }}</a>
              <a class="dh-mi-wb" href="mailto:bugs@traindart.com">bugs@traindart.com</a>
            </div>

            <div class="mt-2 flex flex-wrap items-center gap-2">
              <a
                :href="discordUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="dth-btn dth-btn--outline dth-btn--sm"
              >
                {{ t('nav.discord') }}
              </a>
              <form
                v-if="canLoadPaypal"
                action="https://www.paypal.com/donate"
                method="post"
                target="_blank"
                rel="noopener noreferrer"
                style="margin: 0"
              >
                <input type="hidden" name="hosted_button_id" value="A3THH5ND6F4NJ" />
                <button type="submit" class="dth-btn dth-btn--accent dth-btn--sm">
                  {{ t('home.homeDonate') }}
                </button>
              </form>
            </div>
          </div>
        </div>
        <div v-if="needsEmailVerify" class="dh-email-verify">
          <EmailVerifyBanner :resend-busy="resendBusy" @resend="resendVerificationFromHome" />
        </div>
        <div class="dh-hero-m">
          <div class="dh-hero-m-head">
            <div class="dh-hero-m-ico" aria-hidden="true">
              <HomeStrokeIcon name="target" :size="22" color="#0b0e14" />
            </div>
            <div class="dh-hero-m-tx">
              <div class="dh-hero-b">
                {{ t('home.brandShort') }}
              </div>
              <p class="dh-hero-s">
                {{ t('home.tagline') }}
              </p>
            </div>
          </div>
          <div class="dh-hero-m-actions">
            <button
              type="button"
              class="dth-btn dth-btn--outline dth-btn--sm"
              :aria-expanded="showTutorial"
              aria-controls="dt-learn"
              @click="toggleLearn"
            >
              {{ showTutorial ? t('home.learnClose') : t('home.learnMore') }}
            </button>
            <div class="dth-start-wrap">
              <button
                type="button"
                class="dth-btn dth-btn--accent dth-btn--sm"
                :disabled="startGameMenuLocked"
                :aria-expanded="startMenuOpen"
                :title="startGameMenuLocked ? t('auth.verifyEmailToContinue') : ''"
                aria-haspopup="menu"
                @click="startMenuOpen = !startMenuOpen"
              >
                <HomeStrokeIcon name="play" :size="13" color="#0b0e14" />
                {{ t('home.playShort') }}
              </button>
              <div
                v-show="startMenuOpen && !startGameMenuLocked"
                class="dth-start-menu dth-start-menu--mob"
                role="menu"
                :aria-label="t('home.pickGameTitle')"
                @click.stop
              >
                <div class="dth-start-h">
                  {{ t('home.pickGameTitle') }}
                </div>
                <button
                  type="button"
                  class="dth-start-row dth-start-row--on"
                  role="menuitem"
                  @click="pickStartMode('cricket')"
                >
                  <span class="dth-start-row-ico" style="background: #4a9eff33">
                    <HomeStrokeIcon name="target" :size="18" color="#4a9eff" />
                  </span>
                  <span class="dth-start-row-meta">
                    <span>{{ t('nav.gameCricket') }}</span>
                    <span class="dth-start-row-d">{{ t('home.modeCricketDesc') }}</span>
                  </span>
                </button>
                <button
                  type="button"
                  class="dth-start-row"
                  role="menuitem"
                  :disabled="!canPlayX01"
                  :title="!canPlayX01 ? t('nav.x01UnavailableHint') : ''"
                  @click="pickStartMode('x501')"
                >
                  <span class="dth-start-row-ico" style="background: #f5a62333">
                    <HomeStrokeIcon name="zap" :size="18" color="#f5a623" />
                  </span>
                  <span class="dth-start-row-meta">
                    <span>{{ t('nav.gameX01501') }}</span>
                    <span class="dth-start-row-d">{{
                      !canPlayX01 ? t('home.x01DisabledInMenu') : t('home.modeX501Desc')
                    }}</span>
                  </span>
                </button>
                <button
                  type="button"
                  class="dth-start-row"
                  role="menuitem"
                  :disabled="!canPlayX01"
                  :title="!canPlayX01 ? t('nav.x01UnavailableHint') : ''"
                  @click="pickStartMode('x301')"
                >
                  <span class="dth-start-row-ico" style="background: #3ecf8e33">
                    <HomeStrokeIcon name="flame" :size="18" color="#3ecf8e" />
                  </span>
                  <span class="dth-start-row-meta">
                    <span>{{ t('nav.gameX01301') }}</span>
                    <span class="dth-start-row-d">{{
                      !canPlayX01 ? t('home.x01DisabledInMenu') : t('home.modeX301Desc')
                    }}</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
          <div
            id="dt-learn"
            v-show="showTutorial"
            class="dh-learn dh-learn--in-hero"
            role="region"
            :aria-label="t('home.tutorialTitle')"
            :aria-hidden="!showTutorial"
          >
            <div class="dh-slabel">
              {{ t('home.tutorialTitle') }}
            </div>
            <p class="dh-learn-body">
              {{ t('home.tutorialBody') }}
            </p>
          </div>
        </div>
        <div v-if="showMyActiveSection" class="dh-mine dh-mi-mine">
          <div class="dh-slabel">
            {{ t('home.activeGamesTitle') }}
          </div>
          <p v-if="activeRoomsLoading" class="dh-muted">
            {{ t('home.activeRoomsLoading') }}
          </p>
          <template v-else>
            <p v-if="!activeRooms.length" class="dh-muted">
              {{ t('home.activeGamesEmpty') }}
            </p>
            <div v-else class="dh-mine-list">
              <div
                v-for="r in activeRooms"
                :key="'m-ar-' + r.id"
                class="dh-mine-row"
              >
                <div class="dh-mine-txt">
                  <div class="dh-mine-t">
                    <span class="dth-e">{{ roomSummaryLine(r) }}</span>
                    <span class="dh-mine-mid">·</span>
                    <span>{{ t('home.roomCode') }}</span>
                    <span class="dh-mine-code">{{ r.code }}</span>
                    <span class="dh-mine-mid">·</span>
                    <span>{{ playModeLabel(r) }}</span>
                  </div>
                  <div class="dh-mine-s">
                    {{ roomStatusLabel(r) }}
                  </div>
                </div>
                <button
                  type="button"
                  class="dth-btn dth-btn--accent dth-btn--sm"
                  @click="continueActiveRoom(r)"
                >
                  {{ r.match_id ? t('home.continue') : t('home.backToLobby') }}
                </button>
              </div>
            </div>
          </template>
        </div>
        <div class="dh-slabel">
          {{ t('nav.gamesOffered') }}
        </div>
        <div class="dh-mo-grid3">
          <button
            v-for="g in gameModes"
            :key="'m-' + g.id"
            type="button"
            class="dh-mo-b"
            :style="{
              border: `1px solid ${activeGame === g.id ? g.color + '80' : '#1e2738'}`,
              background: activeGame === g.id ? g.color + '1f' : '#131720',
            }"
            @click="activeGame = g.id"
          >
            <div
              class="dh-mo-ico2"
              :style="{ background: g.color + '33' }"
            >
              <HomeStrokeIcon :name="g.icon" :size="18" :color="g.color" />
            </div>
            <span
              class="dh-mo-ttl"
              :class="{ 'dh-mo-ttl--a': activeGame === g.id }"
            >{{ g.label }}</span>
          </button>
        </div>
        <div v-if="!socialUnlocked || needsEmailVerify" class="dh-mi-lockg">
          <div
            v-for="c in [
              { k: 'f', i: 'users', t: t('nav.friends') },
              { k: 's', i: 'bar', t: t('nav.stats') },
            ]"
            :key="c.k"
            class="dh-mi-lc"
          >
            <div class="dh-mi-lh">
              <div class="dh-mi-ico3">
                <HomeStrokeIcon :name="c.i" :size="15" color="#7b8ba8" />
              </div>
              <span class="dh-mi-lt">{{ c.t }}</span>
            </div>
            <p class="dh-mi-lp">
              {{ t('home.registerHintSub') }}
            </p>
            <button type="button" class="dth-btn dth-btn--accent" @click="router.push('/login')">
              {{ t('home.signInCta') }}
            </button>
          </div>
        </div>
        <div v-else class="dh-mi-lockg">
          <a
            class="dh-mi-lc"
            href="/friends"
            @click.prevent="router.push('/friends')"
          >
            <div class="dh-mi-lh">
              <div class="dh-mi-ico3 dh-mi-ico3--open">
                <HomeStrokeIcon name="users" :size="15" color="#f5a623" />
              </div>
              <span class="dh-mi-lt">{{ t('nav.friends') }}</span>
            </div>
            <p class="dh-mi-lp">
              {{ t('home.registerHintSub') }}
            </p>
          </a>
          <a class="dh-mi-lc" href="/stats" @click.prevent="router.push('/stats')">
            <div class="dh-mi-lh">
              <div class="dh-mi-ico3 dh-mi-ico3--open">
                <HomeStrokeIcon name="bar" :size="15" color="#f5a623" />
              </div>
              <span class="dh-mi-lt">{{ t('nav.stats') }}</span>
            </div>
            <p class="dh-mi-lp">
              {{ t('home.statsSub') }}
            </p>
          </a>
        </div>
        <p v-if="summaryLoading" class="dh-muted">
          {{ t('home.loadSummary') }}
        </p>
        <template v-else-if="summary && !summaryErr">
          <div class="dh-slabel">
            {{ t('home.platformStatsTitle') }}
          </div>
          <div class="dh-mi-stg">
            <div class="dh-mi-st">
              <div class="dh-stat-v dh-stat-v--amber">
                {{ summary.users_total }}
              </div>
              <div class="dh-stat-l">{{ t('home.usersTotal') }}</div>
            </div>
            <div class="dh-mi-st">
              <div class="dh-stat-v dh-stat-v--emerald">
                {{ summary.active_players }}
              </div>
              <div class="dh-stat-l">{{ t('home.activePlayers') }}</div>
            </div>
            <div class="dh-mi-st">
              <div class="dh-stat-v dh-stat-v--amber">
                {{ summary.games_total }}
              </div>
              <div class="dh-stat-l">{{ t('home.gamesTotal') }}</div>
            </div>
            <div class="dh-mi-st">
              <div class="dh-stat-v dh-stat-v--red">
                {{ summary.matches_active }}
              </div>
              <div class="dh-stat-l">{{ t('home.matchesActive') }}</div>
            </div>
            <div class="dh-mi-st">
              <div class="dh-stat-v dh-stat-v--emerald">
                {{ summary.rooms_open }}
              </div>
              <div class="dh-stat-l">{{ t('home.roomsOpen') }}</div>
            </div>
            <div v-if="summary.last_registration_at" class="dh-mi-st">
              <div class="dh-stat-v dh-stat-v--amber">
                {{ fmtRegDay(summary.last_registration_at) }}
              </div>
              <div v-if="fmtRegYear(summary.last_registration_at)" class="dh-stat-s">
                {{ fmtRegYear(summary.last_registration_at) }}
              </div>
              <div class="dh-stat-l">{{ t('home.lastUser') }}</div>
            </div>
            <div v-else class="dh-mi-st">
              <div class="dh-stat-v">—</div>
              <div class="dh-stat-l">{{ t('home.lastUser') }}</div>
            </div>
          </div>
          <div class="dh-slabel">
            {{ t('home.liveMatchesSection') }}
          </div>
          <p v-if="!liveMatches.length" class="dh-muted">
            {{ t('home.liveMatchesEmpty') }}
          </p>
          <div v-else>
            <div
              v-for="m in liveMatches"
              :key="'mb-' + m.match_id"
              class="dh-mi-lv"
              style="align-items: flex-start"
            >
              <div class="dh-mi-lv--hd" style="flex-shrink: 0; padding-top: 2px">
                <div class="dh-mi-sd" />
                <span class="dh-mi-lab">{{ t('home.liveBadge') }}</span>
              </div>
              <div class="dh-mi-lm" style="flex: 1; min-width: 0; margin: 0">
                <div class="dh-mi-l1">
                  {{ m.p1 }} <span style="color: #3a4a63">vs</span> {{ m.p2 }}
                </div>
                <div class="dh-mi-l2">
                  {{ matchGameLabel(m.game_kind) }} · {{ t('home.roundShort') }} {{ m.round }}
                </div>
              </div>
              <div class="dh-mi-lvWatch">
                <button type="button" class="dh-mi-lb" disabled :title="t('home.watchMatchSoon')">
                  {{ t('home.watchShort') }}
                </button>
                <span class="dh-mi-lv-hint">{{ t('home.watchMatchSoon') }}</span>
              </div>
            </div>
          </div>
        </template>
        <p v-else class="dh-muted" style="padding-bottom: 12px">
          {{ t('home.summaryError') }}
        </p>
      </div>
      <div class="dth-bnav" role="navigation" :aria-label="t('nav.bnavAria')">
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
  </div>
</template>

<style scoped>
.dth-e {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
</style>
