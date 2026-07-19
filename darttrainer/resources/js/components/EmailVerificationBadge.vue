<script setup lang="ts">
import { useLocale } from '@/composables/useLocale';
import { usePage } from '@inertiajs/vue3';
import { computed } from 'vue';
import type { SharedData } from '@/types';

const { t } = useLocale();
const page = usePage<SharedData>();
const isApproved = computed(() => page.props.emailVerified);
</script>

<template>
    <div
        class="ev-badge"
        :class="isApproved ? 'ev-badge--approved' : 'ev-badge--pending'"
        role="status"
    >
        <span class="ev-badge-glow" aria-hidden="true" />
        <span class="ev-badge-dot" aria-hidden="true" />
        {{ isApproved ? t('index.emailApproved') : t('index.emailNotApproved') }}
    </div>
</template>

<style scoped>
.ev-badge {
    --ev-green: #39ff14;
    --ev-pink: #fb2c5f;
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 12px 18px;
    border-radius: 999px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border: 1px solid transparent;
    overflow: hidden;
}

.ev-badge-glow {
    position: absolute;
    inset: -40%;
    border-radius: 50%;
    filter: blur(18px);
    opacity: 0.45;
    pointer-events: none;
}

.ev-badge-dot {
    position: relative;
    z-index: 1;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
}

.ev-badge--approved {
    color: #0b0f19;
    background: color-mix(in srgb, var(--ev-green) 88%, #0b0f19);
    border-color: color-mix(in srgb, var(--ev-green) 60%, #1f2937);
    box-shadow: 0 0 24px rgba(57, 255, 20, 0.35);
}

.ev-badge--approved .ev-badge-glow {
    background: radial-gradient(circle, rgba(57, 255, 20, 0.55), transparent 70%);
}

.ev-badge--approved .ev-badge-dot {
    background: #0b0f19;
    box-shadow: 0 0 10px rgba(57, 255, 20, 0.8);
}

.ev-badge--pending {
    color: #f4f4f5;
    background: color-mix(in srgb, var(--ev-pink) 18%, #0d1220);
    border-color: color-mix(in srgb, var(--ev-pink) 45%, #1f2937);
    box-shadow: 0 0 24px rgba(251, 44, 95, 0.25);
}

.ev-badge--pending .ev-badge-glow {
    background: radial-gradient(circle, rgba(251, 44, 95, 0.45), transparent 70%);
}

.ev-badge--pending .ev-badge-dot {
    background: var(--ev-pink);
    box-shadow: 0 0 10px rgba(251, 44, 95, 0.85);
}

@media (prefers-reduced-motion: no-preference) {
    .ev-badge-glow {
        animation: ev-pulse 2.4s ease-in-out infinite;
    }
}

@keyframes ev-pulse {
    0%,
    100% {
        opacity: 0.35;
        transform: scale(0.95);
    }
    50% {
        opacity: 0.6;
        transform: scale(1.05);
    }
}

@media (prefers-reduced-motion: reduce) {
    .ev-badge-glow {
        animation: none;
    }
}
</style>
