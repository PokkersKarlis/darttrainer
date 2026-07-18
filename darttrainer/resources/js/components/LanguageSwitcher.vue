<script setup lang="ts">
/** LV/EN valodas pārslēgs. Saglabā izvēli localStorage (skat. useLocale composable). */
import { useLocale } from '@/composables/useLocale';

const { locale, setLocale, t } = useLocale();
</script>

<template>
    <div class="lang-switch" role="group" aria-label="Language">
        <button type="button" class="lang-btn" :class="{ 'lang-btn--on': locale === 'lv' }" @click="setLocale('lv')">
            {{ t('lang.lv') }}
        </button>
        <button type="button" class="lang-btn" :class="{ 'lang-btn--on': locale === 'en' }" @click="setLocale('en')">
            {{ t('lang.en') }}
        </button>
    </div>
</template>

<style scoped>
.lang-switch {
    display: inline-flex;
    gap: 2px;
    padding: 3px;
    border-radius: 8px;
    background: #131a26;
    border: 1px solid #1f2937;
    flex-shrink: 0;
}
.lang-btn {
    padding: 5px 10px;
    border-radius: 6px;
    border: none;
    background: transparent;
    color: #64748b;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.5px;
    cursor: pointer;
    font-family: 'Barlow Condensed', sans-serif;
}
.lang-btn:hover {
    color: #cbd5e1;
}
.lang-btn--on {
    background: rgba(57, 255, 20, 0.14);
    color: #39ff14;
}
</style>
