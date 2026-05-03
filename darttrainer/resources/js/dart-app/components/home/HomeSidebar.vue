<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore, useLocaleStore } from '../../store/index.js';
import { useCanPlayGames } from '../../composables/useCanPlayGames.js';
import { useCanPlayX01 } from '../../composables/useCanPlayX01.js';
import { DARTTRAINER_DISCORD_URL } from '../../constants/discord.js';
import { useCookieConsent } from '../../composables/useCookieConsent.js';
import HomeStrokeIcon from './HomeStrokeIcon.vue';

const auth = useAuthStore();
const locale = useLocaleStore();
const route = useRoute();
const router = useRouter();
const canPlayGames = useCanPlayGames();
const canPlayX01 = useCanPlayX01();
const discordUrl = DARTTRAINER_DISCORD_URL;
const consent = useCookieConsent();
const canLoadPaypal = computed(() => consent.canFunctional.value || consent.canMarketing.value);

const t = (key) => locale.t(key);
const needsEmailVerify = computed(() => auth.needsEmailVerification);
const showGuestCta = computed(() => auth.hydrated && !auth.user);

function isSbActive(id) {
  if (id === 'home') return route.path === '/';
  if (id === 'lobby') return route.path === '/lobby/cricket' || route.path === '/lobby/x01';
  if (id === 'friends') return route.path.startsWith('/friends');
  if (id === 'solo') return route.path === '/training/x01';
  if (id === 'stats') return route.path === '/stats';
  if (id === 'cricket') return route.path === '/lobby/cricket';
  if (id === 'x501') return route.path === '/lobby/x01' && String(route.query.variant) === '501';
  if (id === 'x301') return route.path === '/lobby/x01' && String(route.query.variant) === '301';
  return false;
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

function goLobbyCricket() {
  if (showGuestCta.value) return router.push('/login');
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

function sbFriends() {
  if (showGuestCta.value) { router.push('/login'); return; }
  if (needsEmailVerify.value) return;
  router.push('/friends');
}
function sbStats() {
  if (showGuestCta.value) { router.push('/login'); return; }
  if (needsEmailVerify.value) return;
  router.push('/stats');
}
function sbSolo() {
  if (needsEmailVerify.value) { window._dartToast?.(t('auth.verifyEmailToContinue'), 'error'); return; }
  if (!canPlayX01.value) { window._dartToast?.(t('nav.x01UnavailableHint'), 'error'); return; }
  router.push('/training/x01');
}
function sbLobby() {
  if (needsEmailVerify.value) { window._dartToast?.(t('auth.verifyEmailToContinue'), 'error'); return; }
  if (!canPlayGames.value) { window._dartToast?.(t('nav.gamesTeaserHint'), 'error'); return; }
  router.push('/lobby/cricket');
}
function navX01Var(v) {
  if (needsEmailVerify.value) { window._dartToast?.(t('auth.verifyEmailToContinue'), 'error'); return; }
  if (!canPlayGames.value) { window._dartToast?.(t('nav.gamesTeaserHint'), 'error'); return; }
  if (!canPlayX01.value) { window._dartToast?.(t('nav.x01UnavailableHint'), 'error'); return; }
  goLobbyX01(v);
}
</script>

<template>
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
          :disabled="needsEmailVerify"
          :title="needsEmailVerify ? t('auth.verifyEmailToContinue') : ''"
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
</template>
