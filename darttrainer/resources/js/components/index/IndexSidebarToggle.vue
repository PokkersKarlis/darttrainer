<script setup lang="ts">
import { useLocale } from '@/composables/useLocale';
import { Menu } from 'lucide-vue-next';

defineEmits<{
    open: [];
}>();

const { t } = useLocale();
</script>

<template>
    <button type="button" class="ix-sidebar-toggle" @click="$emit('open')">
        <span class="ix-sidebar-toggle-icon" aria-hidden="true">
            <Menu :size="18" :stroke-width="2.4" />
        </span>
        {{ t('index.sidebar.open') }}
    </button>
</template>

<style scoped>
.ix-sidebar-toggle {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    justify-content: center;
    padding: calc(12px * var(--ix-scale, 1)) calc(14px * var(--ix-scale, 1));
    border-radius: calc(12px * var(--ix-scale, 1));
    border: 1px solid color-mix(in srgb, var(--ix-green, #39ff14) 24%, var(--ix-line, #1f2937));
    background: color-mix(in srgb, var(--ix-panel, #0d1220) 92%, transparent);
    color: var(--ix-text, #f4f4f5);
    font-family: 'Barlow Condensed', sans-serif;
    font-size: calc(14px * var(--ix-scale, 1));
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    box-shadow: 0 0 18px rgba(57, 255, 20, 0.08);
}

.ix-sidebar-toggle-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: calc(32px * var(--ix-scale, 1));
    height: calc(32px * var(--ix-scale, 1));
    border-radius: calc(8px * var(--ix-scale, 1));
    border: 1px solid color-mix(in srgb, var(--ix-green, #39ff14) 22%, var(--ix-line, #1f2937));
    color: var(--ix-green, #39ff14);
}
</style>
