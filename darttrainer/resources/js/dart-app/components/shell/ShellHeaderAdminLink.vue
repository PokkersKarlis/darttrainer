<script setup>
import { useLocaleStore } from '../../store/index.js';

defineProps({
  disabled: { type: Boolean, default: false },
});

const locale = useLocaleStore();
const t = (k) => locale.t(k);
</script>

<template>
  <a
    href="#/admin"
    :class="{ 'nav-link--disabled': disabled }"
    style="
      display: inline-flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
      text-decoration: none;
      font-size: 12px;
      font-weight: 800;
      color: #0a1120;
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      padding: 8px 14px;
      border-radius: 10px;
      border: none;
      box-shadow: 0 2px 12px rgba(245, 158, 11, 0.35);
      white-space: nowrap;
      transition: filter 0.15s, transform 0.1s;
    "
  >
    <span aria-hidden="true">⚙️</span>{{ t('shell.adminBtn') }}
  </a>
</template>
