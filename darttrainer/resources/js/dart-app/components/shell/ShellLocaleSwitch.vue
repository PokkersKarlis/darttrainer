<script setup>
import { useLocaleStore } from '../../store/index.js';

const locale = useLocaleStore();
</script>

<template>
  <div
    class="dt-header-lang"
    style="display: flex; align-items: center; gap: 4px; flex-shrink: 0; margin-right: 2px"
  >
    <button
      type="button"
      :style="
        locale.locale === 'lv'
          ? 'font-size:11px;font-weight:800;padding:5px 9px;border-radius:6px;border:1px solid #f59e0b;background:#f59e0b;color:#000;cursor:pointer'
          : 'font-size:11px;font-weight:700;padding:5px 9px;border-radius:6px;border:1px solid #334155;background:transparent;color:#94a3b8;cursor:pointer'
      "
      @click="locale.setLocale('lv')"
    >
      {{ locale.t('lang.lv') }}
    </button>
    <button
      type="button"
      :style="
        locale.locale === 'en'
          ? 'font-size:11px;font-weight:800;padding:5px 9px;border-radius:6px;border:1px solid #f59e0b;background:#f59e0b;color:#000;cursor:pointer'
          : 'font-size:11px;font-weight:700;padding:5px 9px;border-radius:6px;border:1px solid #334155;background:transparent;color:#94a3b8;cursor:pointer'
      "
      @click="locale.setLocale('en')"
    >
      {{ locale.t('lang.en') }}
    </button>
  </div>
</template>
