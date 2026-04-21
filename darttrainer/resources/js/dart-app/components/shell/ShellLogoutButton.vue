<script setup>
import { ref } from 'vue';
import { useAuthStore, useLocaleStore } from '../../store/index.js';

const auth = useAuthStore();
const locale = useLocaleStore();
const t = (k) => locale.t(k);

const hover = ref(false);
</script>

<template>
  <button
    type="button"
    :style="{
      fontSize: '12px',
      color: '#ef4444',
      background: hover ? 'rgba(239,68,68,.22)' : 'rgba(239,68,68,.12)',
      border: 'none',
      padding: '5px 10px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'background 0.15s',
    }"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
    @click="auth.logout()"
  >
    {{ t('shell.logout') }}
  </button>
</template>
