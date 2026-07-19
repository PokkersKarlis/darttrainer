<script setup lang="ts">
/** LV/EN valodas pārslēgs. Saglabā izvēli serverī (session/cookie/user) caur useLocale. */
import { useLocale, type Locale } from '@/composables/useLocale';

const { locale, setLocale, t } = useLocale();

function pick(next: Locale) {
    setLocale(next);
}
</script>

<template>
    <div class="lang-switch" role="group" :aria-label="t('lang.label')">
        <button
            type="button"
            class="lang-btn"
            :class="{ 'lang-btn--on': locale === 'lv' }"
            :aria-pressed="locale === 'lv'"
            @click="pick('lv')"
        >
            {{ t('lang.lv') }}
        </button>
        <button
            type="button"
            class="lang-btn"
            :class="{ 'lang-btn--on': locale === 'en' }"
            :aria-pressed="locale === 'en'"
            @click="pick('en')"
        >
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
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    user-select: none;
    outline: none;
    transition: color 0.15s ease, background 0.15s ease;
}
.lang-btn--on {
    background: rgba(57, 255, 20, 0.14);
    color: #39ff14;
}
/* Keep active styling on touch devices (mobile :hover/:focus can stick otherwise). */
.lang-btn--on,
.lang-btn--on:hover,
.lang-btn--on:focus,
.lang-btn--on:focus-visible,
.lang-btn--on:active {
    background: rgba(57, 255, 20, 0.14);
    color: #39ff14;
}
@media (hover: hover) and (pointer: fine) {
    .lang-btn:not(.lang-btn--on):hover {
        color: #cbd5e1;
    }
}
.lang-btn:focus-visible:not(.lang-btn--on) {
    box-shadow: 0 0 0 2px #0b0f19, 0 0 0 4px #39ff14;
}
.lang-btn:not(.lang-btn--on):active {
    color: #cbd5e1;
}
</style>
