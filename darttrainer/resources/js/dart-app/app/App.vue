<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth.js';
import { useLocaleStore } from '../store/locale.js';
import { useFriendsStore } from '../store/friends.js';
import { dartSafeDisplayMessage } from '../utils/safeDisplay.js';
import EmailVerifyBanner from '../components/shell/EmailVerifyBanner.vue';
import FriendsIncomingModal from '../components/shell/FriendsIncomingModal.js';
import { applySocialMeta } from '../utils/socialMeta.js';
import HomeCanvasLayout from '../components/layout/HomeCanvasLayout.vue';

const APP_NAME = 'DartTrainer';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const locale = useLocaleStore();
const friends = useFriendsStore();
const toasts = ref([]);
const resendBusy = ref(false);

const t = (key) => locale.t(key);

const needsEmailVerify = computed(
  () => auth.hydrated && !!auth.user && !auth.user.email_verified_at,
);

/** Aktīvā spēle: pilnekrāna saturs bez globālā header/footer, sānjoslas u.c. */
const gameFocus = computed(() => !!route.meta.gameFocus);

/** Sākumlapa: pašai sava “canvas chrome” iekš `Home.vue`. */
const isHome = computed(() => route.path === '/');

window._dartToast = (message, type = 'success') => {
  const id = Date.now();
  let text =
    typeof dartSafeDisplayMessage === 'function' ? dartSafeDisplayMessage(message) : '';
  if (!text && message != null && typeof message !== 'object') {
    text = String(message).replace(/\0/g, '').trim().slice(0, 4000);
  }
  if (!text) text = type === 'error' ? 'Kļūda' : 'OK';
  toasts.value.push({ id, message: text, type });
  setTimeout(() => {
    toasts.value = toasts.value.filter((x) => x.id !== id);
  }, 3500);
};

async function resendVerification() {
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

/** E-pasta apstiprinājums: ?verified=1, ?already_verified=1 (ceļa query) vai vecais #/?verified=1 */
async function consumeVerifiedRedirectParam() {
  try {
    const searchParams = new URLSearchParams(window.location.search || '');

    if (searchParams.get('already_verified') === '1') {
      await auth.refreshMe();
      window._dartToast?.(t('auth.emailAlreadyVerified'), 'success');
      searchParams.delete('already_verified');
      const qs = searchParams.toString();
      const nextPath = window.location.pathname + (qs ? `?${qs}` : '');
      window.history.replaceState({}, '', nextPath || '/');
      const p = window.location.pathname;
      if (auth.user && (p === '/login' || p.endsWith('/login'))) {
        await router.replace('/');
      }
      return;
    }

    let params = searchParams;
    let fromHash = false;
    if (params.get('verified') !== '1') {
      const hash = window.location.hash || '';
      if (!hash.includes('?')) return;
      const q = hash.split('?')[1] || '';
      params = new URLSearchParams(q);
      if (params.get('verified') !== '1') return;
      fromHash = true;
    }
    const pathName = window.location.pathname;
    const isLoginPath = pathName === '/login' || pathName.endsWith('/login');
    await auth.refreshMe();
    const msg = isLoginPath
      ? t('auth.emailVerifiedPleaseLogin')
      : auth.user
        ? t('auth.emailVerifiedToast')
        : t('auth.emailVerifiedPleaseLogin');
    window._dartToast?.(msg, 'success');
    if (fromHash) {
      window.location.hash = '';
      return;
    }
    params.delete('verified');
    const qs = params.toString();
    const path = pathName + (qs ? `?${qs}` : '');
    window.history.replaceState({}, '', path || '/');
  } catch (_) {}
}

onMounted(async () => {
  locale.initFromStorage();
  /* init() no main — mutex; šeit gaidām, pēc tam ?verified=1 apstrāde ar svaigiem /auth/me datiem, lai bānera vairs nav */
  await auth.init();
  await consumeVerifiedRedirectParam();
  try {
    const key = route.meta?.titleKey;
    document.title =
      key && typeof key === 'string' ? `${locale.t(key)} · ${APP_NAME}` : APP_NAME;
    applySocialMeta(router.currentRoute.value);
  } catch (_) {}
});

watch(
  () => auth.user,
  (u) => {
    if (u && u.email_verified_at) friends.start();
    else friends.stop();
  },
  { immediate: true },
);

watch(
  () => locale.locale,
  () => {
    try {
      const key = route.meta?.titleKey;
      document.title =
        key && typeof key === 'string' ? `${locale.t(key)} · ${APP_NAME}` : APP_NAME;
      applySocialMeta(router.currentRoute.value);
    } catch (_) {}
  },
);
</script>

<template>
  <div
    v-cloak
    :class="['dt-app-root', { 'dt-app--game-focus': gameFocus, 'dt-app--home-canvas': isHome }]"
  >
    <!-- `/`: Home.vue jau satur visu sidebar/header/layout. -->
    <template v-if="isHome">
      <router-view />
    </template>

    <!-- `/game/*`: pilnekrāna spēles režīms -->
    <template v-else-if="gameFocus">
      <router-view />
    </template>

    <!-- Visas pārējās lapas: Home “canvas” layout (sidebar + header + ads) -->
    <HomeCanvasLayout v-else :title-key="route.meta?.titleKey || ''">
      <EmailVerifyBanner
        v-if="needsEmailVerify"
        :resend-busy="resendBusy"
        @resend="resendVerification"
      />
      <router-view />
    </HomeCanvasLayout>

    <!-- Modālis jābūt arī uz `/`, ja uzaicinājumus atver no segvārda izvēlnes galvenē -->
    <FriendsIncomingModal v-if="!gameFocus" />

    <div
      :style="
        gameFocus
          ? {
              position: 'fixed',
              top: 'max(12px, env(safe-area-inset-top, 0px))',
              right: 'max(12px, env(safe-area-inset-right, 0px))',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }
          : {
              position: 'fixed',
              bottom: isHome ? '16px' : '80px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              alignItems: 'center',
            }
      "
      :class="gameFocus ? '' : isHome ? '' : 'lg:bottom-4'"
    >
      <transition-group name="fade">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :style="
            toast.type === 'error'
              ? 'background:linear-gradient(135deg,#7f1d1d,#dc2626);border:1px solid rgba(248,113,113,.35)'
              : 'background:linear-gradient(135deg,#065f46,#059669);border:1px solid rgba(52,211,153,.25)'
          "
          style="
            padding: 10px 16px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 600;
            color: #fff;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
            width: min(92vw, 360px);
            max-width: 360px;
            text-align: center;
          "
        >
          {{ toast.message }}
        </div>
      </transition-group>
    </div>
  </div>
</template>
