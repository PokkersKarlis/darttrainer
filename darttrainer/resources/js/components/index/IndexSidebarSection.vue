<script setup lang="ts">
defineProps<{
    title: string;
}>();
</script>

<template>
    <div class="ix-nav-section">
        <p class="ix-nav-section-title">{{ title }}</p>
        <div class="ix-nav-section-items">
            <slot />
        </div>
    </div>
</template>

<style scoped>
.ix-nav-section {
    display: flex;
    flex-direction: column;
    gap: calc(10px * var(--ix-scale, 1));
}

.ix-nav-section-title {
    margin: 0;
    padding: calc(6px * var(--ix-scale, 1)) calc(8px * var(--ix-scale, 1));
    border-radius: calc(8px * var(--ix-scale, 1));
    background: color-mix(in srgb, var(--ix-green, #39ff14) 6%, transparent);
    border: 1px solid color-mix(in srgb, var(--ix-green, #39ff14) 12%, transparent);
    font-family: 'Barlow Condensed', sans-serif;
    font-size: calc(11px * var(--ix-scale, 1));
    font-weight: 800;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--ix-green, #39ff14) 75%, var(--ix-text, #f4f4f5));
}

.ix-nav-section-items {
    display: flex;
    flex-direction: column;
    gap: calc(6px * var(--ix-scale, 1));
}
</style>
