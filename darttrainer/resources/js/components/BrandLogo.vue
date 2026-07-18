<script setup lang="ts">
/** TrainDart logo: dartboard + līnijas grafiks + "TRAINDART" (DART zaļš, ar glow). */
withDefaults(defineProps<{ width?: number }>(), { width: 180 });

// Unikāls glow filtra ID katrai instancei (lai vairāki logo lapā nekonfliktē).
const glowId = `td-glow-${Math.random().toString(36).slice(2, 9)}`;
</script>

<template>
    <svg :width="width" :height="(width * 40) / 168" viewBox="0 0 168 40" style="overflow: visible">
        <defs>
            <filter :id="glowId">
                <feGaussianBlur stdDeviation="1.5" result="b" />
                <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>
        <circle cx="18" cy="20" r="14" fill="none" stroke="#1f2937" stroke-width="2.5" />
        <circle cx="18" cy="20" r="14" fill="none" stroke="#39ff14" stroke-width="2.5" :filter="`url(#${glowId})`" />
        <circle cx="18" cy="20" r="8.5" fill="none" stroke="#1f2937" stroke-width="2.5" />
        <circle cx="18" cy="20" r="3.2" fill="#39ff14" :filter="`url(#${glowId})`" />
        <polyline
            points="36,26 46,26 52,13 58,29 66,9"
            fill="none"
            stroke="#39ff14"
            stroke-width="2.6"
            stroke-linecap="round"
            stroke-linejoin="round"
            :filter="`url(#${glowId})`"
        />
        <polygon points="66,9 61,11.5 63.5,15.5" fill="#39ff14" :filter="`url(#${glowId})`" />
        <text x="76" y="27" font-family="'Barlow Condensed', sans-serif" font-weight="800" font-size="21" fill="#f4f4f5" letter-spacing="0.3">
            TRAIN<tspan fill="#39ff14">DART</tspan>
        </text>
    </svg>
</template>
