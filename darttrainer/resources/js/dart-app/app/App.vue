<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '../store/auth.js';
import { useLocaleStore } from '../store/locale.js';
import { useFriendsStore } from '../store/friends.js';
import { dartSafeDisplayMessage } from '../utils/safeDisplay.js';
import AppShellHeader from '../components/shell/layout/AppShellHeader.vue';
import AppShellBody from '../components/shell/layout/AppShellBody.vue';

const auth = useAuthStore();
const locale = useLocaleStore();
const friends = useFriendsStore();
const toasts = ref([]);
const resendBusy = ref(false);

const t = (key) => locale.t(key);

const needsEmailVerify = computed(
  () => auth.hydrated && !!auth.user && !auth.user.email_verified_at,
);

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

function consumeVerifiedHash() {
  try {
    const hash = window.location.hash || '';
    if (!hash.includes('?')) return;
    const q = hash.split('?')[1] || '';
    const params = new URLSearchParams(q);
    if (params.get('verified') !== '1') return;
    auth.refreshMe().then(() => {
      window._dartToast?.(t('auth.emailVerifiedToast'), 'success');
    });
    window.location.hash = '#/';
  } catch (_) {}
}

onMounted(() => {
  locale.initFromStorage();
  consumeVerifiedHash();
});

watch(
  () => auth.user,
  (u) => {
    if (u && u.email_verified_at) friends.start();
    else friends.stop();
  },
  { immediate: true },
);
</script>

<template>
  <div
    v-cloak
    style="height: 100dvh; display: flex; flex-direction: column; overflow: hidden"
  >
    <AppShellHeader />
    <email-verify-banner
      v-if="needsEmailVerify"
      :resend-busy="resendBusy"
      @resend="resendVerification"
    />

    <div
      class="dt-app-shell-body"
      style="flex: 1; display: flex; flex-direction: column; min-height: 0; overflow: hidden"
    >
      <AppShellBody />
      <app-shell-footer />
    </div>

    <friends-incoming-modal />

    <div
      style="
        position: fixed;
        bottom: 80px;
        right: 16px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 8px;
      "
      class="lg:bottom-4"
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
