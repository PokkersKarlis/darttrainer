<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore, useLocaleStore } from '../../store/index.js';
import { useCanPlayGames } from '../../composables/useCanPlayGames.js';
import { useCanPlayX01 } from '../../composables/useCanPlayX01.js';
import { DARTTRAINER_DISCORD_URL } from '../../constants/discord.js';
import HomeStrokeIcon from '../home/HomeStrokeIcon.vue';
import HeaderUserMenu from '../shell/header/HeaderUserMenu.vue';

defineOptions({ name: 'HomeCanvasLayout' });

const props = defineProps({
  titleKey: { type: String, default: '' },
});

const auth = useAuthStore();
const locale = useLocaleStore();
const route = useRoute();
const router = useRouter();
const canPlayGames = useCanPlayGames();
const canPlayX01 = useCanPlayX01();
const needsEmailVerify = computed(() => auth.needsEmailVerification);
const t = (k) => locale.t(k);
const discordUrl = DARTTRAINER_DISCORD_URL;

const isMobile = ref(
  typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches,
);
let mq;
function setMobileFlag() {
  isMobile.value = window.matchMedia('(max-width: 767px)').matches;
}
onMounted(() => {
  setMobileFlag();
  mq = window.matchMedia('(max-width: 767px)');
  mq.addEventListener('change', setMobileFlag);
});
onUnmounted(() => {
  mq?.removeEventListener('change', setMobileFlag);
});

function sbLobbyCricket() {
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
  router.push({ path: '/lobby/x01', query: { variant: String(v) } });
}
function goLobbyCricket() {
  return sbLobbyCricket();
}
function sbFriends() {
  if (!auth.user) return router.push('/login');
  if (needsEmailVerify.value) return window._dartToast?.(t('auth.verifyEmailToContinue'), 'error');
  router.push('/friends');
}
function sbStats() {
  if (!auth.user) return router.push('/login');
  if (needsEmailVerify.value) return window._dartToast?.(t('auth.verifyEmailToContinue'), 'error');
  router.push('/stats');
}
function sbSolo() {
  if (needsEmailVerify.value) return window._dartToast?.(t('auth.verifyEmailToContinue'), 'error');
  if (!canPlayX01.value) return window._dartToast?.(t('nav.x01UnavailableHint'), 'error');
  router.push('/training/x01');
}
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
</script>

<template>
  <div class="dth-canvas dth-home">
    <div v-if="!isMobile" class="dth-canvas--desktop" aria-hidden="false">
      <aside class="dth-sb" aria-label="Navigācija">
        <div
          class="dth-sb-logo"
          role="link"
          tabindex="0"
          aria-label="DartTrainer"
          style="cursor: pointer"
          @click="router.push('/')"
          @keydown.enter.prevent="router.push('/')"
          @keydown.space.prevent="router.push('/')"
        >
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
            <button type="button" :class="['dth-sb-row', { 'dth-sb-row--on': isSbActive('home') }]" @click="router.push('/')">
              <HomeStrokeIcon name="home" :size="16" color="currentColor" />
              <span class="dth-sb-lbl">{{ t('nav.home') }}</span>
              <span v-if="isSbActive('home')" class="dth-sb-dot" />
            </button>

            <div class="dth-sb-sec">{{ t('home.sbMulti') }}</div>
            <button
              type="button"
              :class="['dth-sb-row', { 'dth-sb-row--on': isSbActive('lobby') }]"
              :disabled="!canPlayGames || needsEmailVerify"
              :title="!canPlayGames ? t('nav.gamesTeaserHint') : needsEmailVerify ? t('auth.verifyEmailToContinue') : ''"
              @click="sbLobbyCricket"
            >
              <HomeStrokeIcon name="target" :size="16" color="currentColor" />
              <span class="dth-sb-lbl">{{ t('nav.lobbyCricket') }}</span>
            </button>
            <button
              type="button"
              :class="['dth-sb-row', { 'dth-sb-row--on': isSbActive('friends') }]"
              :disabled="!canPlayGames || needsEmailVerify"
              :title="!canPlayGames ? t('nav.gamesTeaserHint') : needsEmailVerify ? t('auth.verifyEmailToContinue') : ''"
              @click="sbFriends"
            >
              <HomeStrokeIcon name="users" :size="16" color="currentColor" />
              <span class="dth-sb-lbl">{{ t('nav.friends') }}</span>
            </button>

            <div class="dth-sb-sec">{{ t('home.sbTrain') }}</div>
            <button
              type="button"
              :class="['dth-sb-row', { 'dth-sb-row--on': isSbActive('solo') }]"
              :disabled="needsEmailVerify || !canPlayX01"
              :title="needsEmailVerify ? t('auth.verifyEmailToContinue') : !canPlayX01 ? t('nav.x01UnavailableHint') : ''"
              @click="sbSolo"
            >
              <HomeStrokeIcon name="zap" :size="16" color="currentColor" />
              <span class="dth-sb-lbl">{{ t('nav.x01solo') }}</span>
            </button>

            <div class="dth-sb-sec">{{ t('home.sbProgress') }}</div>
            <button
              type="button"
              :class="['dth-sb-row', { 'dth-sb-row--on': isSbActive('stats') }]"
              :disabled="!canPlayGames || needsEmailVerify"
              :title="!canPlayGames ? t('nav.gamesTeaserHint') : needsEmailVerify ? t('auth.verifyEmailToContinue') : ''"
              @click="sbStats"
            >
              <HomeStrokeIcon name="bar" :size="16" color="currentColor" />
              <span class="dth-sb-lbl">{{ t('nav.stats') }}</span>
            </button>

            <div class="dth-sb-sec">{{ t('home.sbModes') }}</div>
            <button
              type="button"
              :class="['dth-sb-row', { 'dth-sb-row--on': isSbActive('cricket') }]"
              :disabled="!canPlayGames || needsEmailVerify"
              :title="!canPlayGames ? t('nav.gamesTeaserHint') : needsEmailVerify ? t('auth.verifyEmailToContinue') : ''"
              @click="goLobbyCricket"
            >
              <HomeStrokeIcon name="cricket" :size="16" color="currentColor" />
              <span class="dth-sb-lbl">{{ t('nav.gameCricket') }}</span>
            </button>
            <button
              type="button"
              :class="['dth-sb-row', { 'dth-sb-row--on': isSbActive('x501') }]"
              :disabled="!canPlayGames || needsEmailVerify || !canPlayX01"
              :title="
                needsEmailVerify
                  ? t('auth.verifyEmailToContinue')
                  : !canPlayGames
                    ? t('nav.gamesTeaserHint')
                    : !canPlayX01
                      ? t('nav.x01UnavailableHint')
                      : ''
              "
              @click="navX01Var(501)"
            >
              <HomeStrokeIcon name="star" :size="16" color="currentColor" />
              <span class="dth-sb-lbl">X01 — 501</span>
            </button>
            <button
              type="button"
              :class="['dth-sb-row', { 'dth-sb-row--on': isSbActive('x301') }]"
              :disabled="!canPlayGames || needsEmailVerify || !canPlayX01"
              :title="
                needsEmailVerify
                  ? t('auth.verifyEmailToContinue')
                  : !canPlayGames
                    ? t('nav.gamesTeaserHint')
                    : !canPlayX01
                      ? t('nav.x01UnavailableHint')
                      : ''
              "
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
          <span class="dth-tb-t">{{ props.titleKey ? t(props.titleKey) : '' }}</span>
          <div class="dh-tb-r">
            <div class="dth-locale" role="group" :aria-label="t('lang.lv') + ' / ' + t('lang.en')">
              <button type="button" :class="{ 'dth-locale--on': locale.locale === 'lv' }" @click="locale.setLocale('lv')">
                {{ t('lang.lv') }}
              </button>
              <button type="button" :class="{ 'dth-locale--on': locale.locale === 'en' }" @click="locale.setLocale('en')">
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
          <div :key="isMobile ? 'm' : 'd'" style="display: contents">
            <slot />
          </div>
        </div>
      </div>

      <div class="dth-ads" aria-hidden="true">
        <div v-for="j in 2" :key="j" class="dth-adslot">
          AD
          <span class="dth-adsz">60×160</span>
        </div>
      </div>
    </div>

    <!-- Mobile chrome: tāds pats top bar kā sākumlapā -->
    <div v-else class="dth-canvas--mobile">
      <div class="dth-mi-top">
        <div
          class="dth-mi-brand"
          role="link"
          tabindex="0"
          aria-label="DartTrainer"
          style="cursor: pointer"
          @click="router.push('/')"
          @keydown.enter.prevent="router.push('/')"
          @keydown.space.prevent="router.push('/')"
        >
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
        <div class="dth-locale dth-mi-locale" role="group" :aria-label="t('lang.lv') + ' / ' + t('lang.en')">
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
        <div :key="isMobile ? 'm' : 'd'" style="display: contents">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

