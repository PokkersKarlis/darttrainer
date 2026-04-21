<script setup>
import { ref } from 'vue';
import { useLocaleStore } from '../../store/index.js';

const locale = useLocaleStore();
const t = (k) => locale.t(k);

const hoverLogin = ref(false);
const hoverRegister = ref(false);
</script>

<template>
  <a
    href="#/login"
    class="dt-header-login"
    style="
      font-size: 13px;
      color: #94a3b8;
      text-decoration: none;
      padding: 5px 8px;
      border-radius: 6px;
      transition: color 0.15s;
      white-space: nowrap;
      flex-shrink: 0;
    "
    :style="{ color: hoverLogin ? '#f1f5f9' : '#94a3b8' }"
    @mouseenter="hoverLogin = true"
    @mouseleave="hoverLogin = false"
  >
    {{ t('shell.login') }}
  </a>
  <a
    href="#/register"
    class="dt-header-register"
    style="
      font-size: 13px;
      background: #f59e0b;
      color: #000;
      font-weight: 700;
      padding: 6px 10px;
      border-radius: 8px;
      text-decoration: none;
      transition: background 0.15s;
      white-space: nowrap;
      flex-shrink: 0;
    "
    :style="{ background: hoverRegister ? '#fbbf24' : '#f59e0b' }"
    @mouseenter="hoverRegister = true"
    @mouseleave="hoverRegister = false"
  >
    {{ t('shell.register') }}
  </a>
</template>
