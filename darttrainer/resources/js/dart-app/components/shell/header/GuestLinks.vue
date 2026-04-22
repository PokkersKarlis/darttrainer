<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useLocaleStore } from '../../../store/index.js';

const locale = useLocaleStore();
const t = (k) => locale.t(k);

const open = ref(false);
const rootRef = ref(null);
const hoverLogin = ref(false);
const hoverRegister = ref(false);

function close() {
  open.value = false;
}

function toggle(e) {
  e?.stopPropagation?.();
  open.value = !open.value;
}

function onDocumentClick(e) {
  if (!open.value) return;
  if (rootRef.value && !rootRef.value.contains(e.target)) close();
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
  <div
    ref="rootRef"
    class="relative flex shrink-0 items-center"
    style="min-width: 0"
  >
    <!-- Mobile: viena poga, izvēlne ar login / register -->
    <button
      type="button"
      class="lg:hidden"
      :aria-expanded="open"
      :aria-haspopup="true"
      :aria-label="t('shell.guestMenuAria')"
      :style="{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        margin: 0,
        padding: 0,
        background: open ? 'rgba(245,158,11,0.16)' : 'linear-gradient(180deg, #1a2332 0%, #0f1828 100%)',
        border: open ? '2px solid rgba(245, 158, 11, 0.6)' : '2px solid rgba(245, 158, 11, 0.4)',
        borderRadius: '10px',
        cursor: 'pointer',
        color: open ? '#fde68a' : '#e2e8f0',
        flexShrink: 0,
        boxSizing: 'border-box',
        boxShadow: open ? '0 0 0 1px rgba(0,0,0,0.2) inset' : '0 1px 2px rgba(0,0,0,0.2)',
      }"
      @click="toggle"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </button>
    <div
      v-show="open"
      class="absolute right-0 z-[100] mt-1 w-[12.5rem] rounded-xl border border-amber-500/25 bg-[#0a1324] p-2 shadow-xl shadow-black/50 lg:hidden"
      style="top: 100%; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(245, 158, 11, 0.12) inset"
      role="menu"
    >
      <router-link
        to="/login"
        role="menuitem"
        class="mb-1.5 block w-full rounded-lg border-2 text-center text-sm font-extrabold"
        style="
          text-decoration: none;
          padding: 0.7rem 0.75rem;
          color: #f8fafc;
          background: linear-gradient(180deg, #1e2b45 0%, #152238 100%);
          border-color: rgba(245, 158, 11, 0.55);
          box-shadow: 0 1px 0 rgba(255, 255, 255, 0.06) inset;
        "
        :style="{
          borderColor: hoverLogin ? 'rgba(251, 191, 36, 0.9)' : 'rgba(245, 158, 11, 0.55)',
          background: hoverLogin
            ? 'linear-gradient(180deg, #243351 0%, #1a2844 100%)'
            : 'linear-gradient(180deg, #1e2b45 0%, #152238 100%)',
        }"
        @click="close"
        @mouseenter="hoverLogin = true"
        @mouseleave="hoverLogin = false"
      >
        {{ t('shell.login') }}
      </router-link>
      <router-link
        to="/register"
        role="menuitem"
        class="block w-full rounded-lg border-2 text-center text-sm font-extrabold"
        style="
          text-decoration: none;
          padding: 0.7rem 0.75rem;
          color: #0a0a0a;
          border-color: #d97706;
          background: linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%);
          box-shadow: 0 2px 10px rgba(245, 158, 11, 0.45), 0 1px 0 rgba(255, 255, 255, 0.2) inset;
        "
        :style="{
          filter: hoverRegister ? 'brightness(1.08)' : 'none',
        }"
        @click="close"
        @mouseenter="hoverRegister = true"
        @mouseleave="hoverRegister = false"
      >
        {{ t('shell.register') }}
      </router-link>
    </div>

    <!-- Desktop: tiešas saites -->
    <div class="hidden items-center gap-2.5 lg:flex" style="min-width: 0">
      <router-link
        to="/login"
        class="dt-header-login"
        style="
          font-size: 13px;
          font-weight: 800;
          color: #f1f5f9;
          text-decoration: none;
          padding: 7px 12px;
          border-radius: 8px;
          border: 2px solid rgba(245, 158, 11, 0.55);
          background: linear-gradient(180deg, #1a2840 0%, #101b2e 100%);
          box-shadow: 0 1px 0 rgba(255, 255, 255, 0.06) inset, 0 1px 3px rgba(0, 0, 0, 0.25);
          white-space: nowrap;
          flex-shrink: 0;
          transition: border-color 0.12s, filter 0.12s;
        "
        :style="{
          borderColor: hoverLogin ? 'rgba(251, 191, 36, 0.95)' : 'rgba(245, 158, 11, 0.55)',
          filter: hoverLogin ? 'brightness(1.06)' : 'none',
        }"
        @mouseenter="hoverLogin = true"
        @mouseleave="hoverLogin = false"
      >
        {{ t('shell.login') }}
      </router-link>
      <router-link
        to="/register"
        class="dt-header-register"
        style="
          font-size: 13px;
          background: linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%);
          color: #0a0a0a;
          font-weight: 800;
          padding: 7px 12px;
          border-radius: 8px;
          border: 2px solid #d97706;
          text-decoration: none;
          box-shadow: 0 2px 12px rgba(245, 158, 11, 0.4), 0 1px 0 rgba(255, 255, 255, 0.25) inset;
          white-space: nowrap;
          flex-shrink: 0;
          transition: filter 0.12s, box-shadow 0.12s;
        "
        :style="{
          filter: hoverRegister ? 'brightness(1.08)' : 'none',
        }"
        @mouseenter="hoverRegister = true"
        @mouseleave="hoverRegister = false"
      >
        {{ t('shell.register') }}
      </router-link>
    </div>
  </div>
</template>
