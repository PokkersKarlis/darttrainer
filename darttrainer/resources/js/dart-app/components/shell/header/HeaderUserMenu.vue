<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore, useLocaleStore } from '../../../store/index.js';
import AdminLink from './AdminLink.vue';
import UserSummary from '../user/Summary.vue';

defineProps({
  needsEmailVerify: { type: Boolean, default: false },
});

const auth = useAuthStore();
const locale = useLocaleStore();
const t = (k) => locale.t(k);

const open = ref(false);
const rootRef = ref(null);

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
  <div class="header-user-menu flex min-w-0 items-center" style="flex: 0 1 auto; flex-shrink: 1">
  <!-- Desktop: kā līdz šim — skaidri redzama iziešana -->
  <div
    class="hidden lg:flex items-center gap-2"
    style="min-width: 0; flex-shrink: 1"
  >
    <AdminLink v-if="auth.user?.is_admin" :disabled="needsEmailVerify" />
    <UserSummary />
    <button
      type="button"
      :style="{
        fontSize: '12px',
        color: '#ef4444',
        background: 'rgba(239,68,68,.12)',
        border: 'none',
        padding: '5px 10px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '600',
        flexShrink: 0,
      }"
      @click="auth.logout()"
    >
      {{ t('shell.logout') }}
    </button>
  </div>

  <!-- Mobile: viena poga (avatars + bultiņa) → izvēlne ar admin (ja vajag) un iziešanu -->
  <div
    ref="rootRef"
    class="relative flex items-center lg:hidden"
    style="min-width: 0; flex-shrink: 0"
  >
    <button
      type="button"
      :aria-expanded="open"
      :aria-label="t('shell.accountMenuAria')"
      :style="{
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        padding: '4px 6px 4px 4px',
        margin: 0,
        background: open ? 'rgba(245,158,11,0.12)' : 'transparent',
        border: open ? '1px solid rgba(245,158,11,0.35)' : '1px solid transparent',
        borderRadius: '10px',
        cursor: 'pointer',
        minWidth: 0,
      }"
      @click="toggle"
    >
      <UserSummary show-chevron />
    </button>
    <div
      v-show="open"
      class="absolute right-0 z-[100] mt-1 min-w-[12rem] rounded-xl border border-slate-600/80 bg-[#0f1c30] py-1.5 shadow-xl shadow-black/50"
      style="top: 100%"
      role="menu"
    >
      <div
        v-if="auth.user?.is_admin"
        class="w-full border-b border-slate-700/50 px-2 pb-2"
        :class="needsEmailVerify ? 'opacity-50 pointer-events-none' : ''"
        style="box-sizing: border-box"
      >
        <div class="flex w-full items-center justify-center" style="min-width: 0">
          <AdminLink :disabled="needsEmailVerify" />
        </div>
      </div>
      <button
        type="button"
        role="menuitem"
        class="flex w-full items-center px-4 py-3 text-left text-sm font-semibold text-red-400 hover:bg-red-500/10"
        @click="
          () => {
            close();
            auth.logout();
          }
        "
      >
        {{ t('shell.logout') }}
      </button>
    </div>
  </div>
  </div>
</template>
