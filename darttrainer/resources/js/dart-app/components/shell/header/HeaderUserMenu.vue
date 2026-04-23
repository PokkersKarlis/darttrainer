<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore, useLocaleStore, useFriendsStore } from '../../../store/index.js';
import AdminLink from './AdminLink.vue';

const props = defineProps({
  needsEmailVerify: { type: Boolean, default: false },
  /**
   * Viesiem: `true` — kompaktā izvēlne visos platuma režīmos; `false` — tikai zem `lg`.
   * Ielogotajiem: vienota josla (segvārds + Iziet) visos platuma režīmos.
   */
  forceCompact: { type: Boolean, default: false },
});

const auth = useAuthStore();
const locale = useLocaleStore();
const friends = useFriendsStore();
const router = useRouter();
const route = useRoute();
const t = (k) => locale.t(k);

const open = ref(false);
const rootRef = ref(null);

const displayNick = computed(() => {
  const n = auth.user?.name;
  if (n && String(n).trim()) return String(n).trim();
  return '—';
});

function close() {
  open.value = false;
}

function toggle(e) {
  e?.stopPropagation?.();
  open.value = !open.value;
}

function onDocumentClick(e) {
  if (!open.value) return;
  const el = rootRef.value;
  if (el && !el.contains(e.target)) close();
}

function onKeydown(e) {
  if (e.key === 'Escape') close();
}

function goLogin() {
  close();
  router.push('/login');
}
function goRegister() {
  close();
  router.push('/register');
}

function onLogout() {
  close();
  auth.logout();
}

function setLocale(code) {
  locale.setLocale(code);
  close();
}

function openFriendsModal() {
  if (props.needsEmailVerify) {
    window._dartToast?.(t('auth.verifyEmailToContinue'), 'error');
    return;
  }
  close();
  friends.openModal();
}

function goFriendsPage() {
  close();
  router.push('/friends');
}

watch(
  () => route.fullPath,
  () => {
    close();
  },
);

onMounted(() => {
  document.addEventListener('click', onDocumentClick, true);
  document.addEventListener('keydown', onKeydown);
});
onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick, true);
  document.removeEventListener('keydown', onKeydown);
});
</script>

<template>
  <div ref="rootRef" class="header-user-menu flex min-w-0 items-center" style="flex: 0 1 auto; flex-shrink: 1">
    <!-- Ielogots: segvārda poga + Iziet; segvārdā — admin / uzaicinājumi / draugi -->
    <template v-if="auth.user">
      <div class="dth-logged-strip">
        <div class="dth-nick-dd">
          <button
            type="button"
            class="dth-nick-pill"
            :class="{ 'dth-nick-pill--open': open }"
            :aria-expanded="open"
            :aria-label="t('shell.accountMenuAria')"
            @click="toggle"
          >
            <span class="dth-nick-status" aria-hidden="true" />
            <span class="dth-nick-text">{{ displayNick }}</span>
            <span v-if="friends.incomingCount" class="dth-nick-hot" :title="t('friends.incomingModalTitle')">
              {{ friends.incomingCount }}
            </span>
          </button>
          <div v-show="open" class="dth-um-menu dth-account-flyout" role="menu">
            <div class="dth-account-flyout-inner">
              <div v-if="auth.user?.is_admin" class="dth-account-flyout-admin" :class="{ 'is-disabled': needsEmailVerify }">
                <AdminLink :disabled="needsEmailVerify" />
              </div>
              <button
                v-if="friends.incomingCount"
                type="button"
                role="menuitem"
                class="dth-btn dth-btn--sm dth-btn--outline dth-btn--full dth-account-flyout-row"
                :disabled="needsEmailVerify"
                @click="openFriendsModal"
              >
                <span class="dth-account-flyout-row-t">{{ t('shell.accountMenuOpenInvites') }}</span>
                <span class="dth-account-flyout-badge">{{ friends.incomingCount }}</span>
              </button>
              <button
                type="button"
                role="menuitem"
                class="dth-btn dth-btn--sm dth-btn--ghost dth-btn--full"
                :disabled="needsEmailVerify"
                @click="goFriendsPage"
              >
                {{ t('shell.accountMenuFriendsLink') }}
              </button>
              <div
                class="dth-locale dth-locale--flyout lg:hidden"
                role="group"
                :aria-label="t('lang.lv') + ' / ' + t('lang.en')"
              >
                <button
                  type="button"
                  role="menuitem"
                  :class="{ 'dth-locale--on': locale.locale === 'lv' }"
                  @click="setLocale('lv')"
                >
                  {{ t('lang.lv') }}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  :class="{ 'dth-locale--on': locale.locale === 'en' }"
                  @click="setLocale('en')"
                >
                  {{ t('lang.en') }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <button type="button" class="dth-logout-header" @click="onLogout">
          {{ t('shell.logoutHeader') }}
        </button>
      </div>
    </template>

    <!-- Viesis: kompaktā poga + izvēlne -->
    <div
      v-else-if="auth.hydrated"
      class="relative flex items-center"
      :class="forceCompact ? 'flex-shrink-0' : 'lg:hidden flex-shrink-0'"
      style="min-width: 0"
    >
      <button
        type="button"
        class="dth-um-trigger-btn"
        :class="{ 'dth-um-trigger-btn--open': open }"
        :aria-expanded="open"
        :aria-label="t('shell.guestMenuAria')"
        @click="toggle"
      >
        <div class="dth-um-trigger-inner">
          <span class="dth-um-av-guest" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round" />
              <circle cx="12" cy="7" r="4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span class="lg:hidden dth-um-chevron" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </div>
      </button>
      <div v-show="open" class="dth-um-menu" role="menu">
        <div class="dth-um-menu-actions">
          <button type="button" role="menuitem" class="dth-btn dth-btn--sm dth-btn--ghost dth-btn--full" @click="goLogin">
            {{ t('shell.login') }}
          </button>
          <button type="button" role="menuitem" class="dth-btn dth-btn--sm dth-btn--accent dth-btn--full" @click="goRegister">
            {{ t('shell.register') }}
          </button>
        </div>
      </div>
    </div>
    <span v-else style="opacity: 0.6; font-size: 12px">…</span>
  </div>
</template>
