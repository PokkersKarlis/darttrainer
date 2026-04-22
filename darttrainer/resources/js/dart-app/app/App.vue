<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth.js';
import { useLocaleStore } from '../store/locale.js';
import { useFriendsStore } from '../store/friends.js';
import { dartSafeDisplayMessage } from '../utils/safeDisplay.js';
import AppShellHeader from '../components/shell/layout/AppShellHeader.vue';
import AppShellBody from '../components/shell/layout/AppShellBody.vue';
import AppShellFooter from '../components/shell/AppShellFooter.js';
import EmailVerifyBanner from '../components/shell/EmailVerifyBanner.vue';
import FriendsIncomingModal from '../components/shell/FriendsIncomingModal.js';
import { applySocialMeta } from '../utils/socialMeta.js';

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

/** E-pasta apstiprinājums: ?verified=1 (history) vai vecais #/?verified=1 */
function consumeVerifiedRedirectParam() {
  try {
    let params = new URLSearchParams(window.location.search || '');
    if (params.get('verified') !== '1') {
      const hash = window.location.hash || '';
      if (!hash.includes('?')) return;
      const q = hash.split('?')[1] || '';
      params = new URLSearchParams(q);
      if (params.get('verified') !== '1') return;
      auth.refreshMe().then(() => {
        window._dartToast?.(t('auth.emailVerifiedToast'), 'success');
      });
      window.location.hash = '';
      return;
    }
    auth.refreshMe().then(() => {
      window._dartToast?.(t('auth.emailVerifiedToast'), 'success');
    });
    params.delete('verified');
    const qs = params.toString();
    const path = window.location.pathname + (qs ? `?${qs}` : '');
    window.history.replaceState({}, '', path || '/');
  } catch (_) {}
}

onMounted(() => {
  locale.initFromStorage();
  consumeVerifiedRedirectParam();
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
    :class="['dt-app-root', { 'dt-app--game-focus': gameFocus }]"
  >
    <AppShellHeader v-if="!gameFocus" />
    <EmailVerifyBanner
      v-if="!gameFocus && needsEmailVerify"
      :resend-busy="resendBusy"
      @resend="resendVerification"
    />

    <div
      class="dt-app-shell-body"
      style="flex: 1; display: flex; flex-direction: column; min-height: 0; overflow: hidden"
    >
      <AppShellBody :game-focus="gameFocus" />
      <AppShellFooter v-if="!gameFocus" />
    </div>

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
              bottom: '80px',
              right: '16px',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }
      "
      :class="gameFocus ? '' : 'lg:bottom-4'"
    >
      <transition-group name="fade">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :style="toast.type === 'error' ? 'background:#dc2626' : 'background:#059669'"
          style="
            padding: 10px 16px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 600;
            color: #fff;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
            max-width: 280px;
          "
        >
          {{ toast.message }}
        </div>
      </transition-group>
    </div>
  </div>
</template>
