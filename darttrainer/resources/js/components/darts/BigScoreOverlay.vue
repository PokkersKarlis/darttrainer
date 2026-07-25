<script setup lang="ts">
import { useLocale } from '@/composables/useLocale';
import type { ScoreCelebrationTier } from '@/lib/scoreCelebration';
import { computed, onMounted, ref } from 'vue';

const props = defineProps<{
    playerName: string;
    points: number;
    tier: ScoreCelebrationTier;
}>();

const emit = defineEmits<{
    finished: [];
}>();

const { t } = useLocale();
const visible = ref(true);

const durationMs = computed(() => {
    switch (props.tier) {
        case 'bigFish':
        case 'special171':
        case 'maximum':
            return 3200;
        case 'great':
            return 2800;
        case 'good':
            return 2500;
        default:
            return 2200;
    }
});

onMounted(() => {
    window.setTimeout(() => {
        visible.value = false;
        window.setTimeout(() => emit('finished'), 400);
    }, durationMs.value);
});

const kicker = computed(() => {
    if (props.tier === 'bigFish') {
        return t('games.play.bigScore.bigFish');
    }

    if (props.tier === 'special171') {
        return t('games.play.bigScore.special171');
    }

    if (props.tier === 'maximum') {
        return t('games.play.bigScore.maximum');
    }

    return t(`games.play.bigScore.tier.${props.tier}`);
});

const label = computed(() => t('games.play.bigScore.label', { name: props.playerName, points: props.points }));
</script>

<template>
    <Transition name="big-score">
        <div v-if="visible" class="big-score" :class="`big-score--${tier}`" role="status" aria-live="polite">
            <div class="big-score__burst big-score__burst--a" aria-hidden="true" />
            <div
                v-if="tier === 'maximum' || tier === 'special171' || tier === 'bigFish'"
                class="big-score__burst big-score__burst--b"
                aria-hidden="true"
            />
            <div v-if="tier === 'bigFish'" class="big-score__fish" aria-hidden="true">🐟</div>
            <p class="big-score__kicker">{{ kicker }}</p>
            <p class="big-score__points">{{ points }}</p>
            <p class="big-score__name">{{ label }}</p>
        </div>
    </Transition>
</template>

<style scoped>
.big-score {
    position: fixed;
    inset: 0;
    z-index: 70;
    display: grid;
    place-items: center;
    pointer-events: none;
    background: rgba(2, 6, 23, 0.55);
}

.big-score--solid {
    background: rgba(2, 6, 23, 0.5);
}

.big-score--good {
    background: rgba(2, 6, 23, 0.62);
}

.big-score--great {
    background: rgba(2, 6, 23, 0.72);
}

.big-score--maximum,
.big-score--special171,
.big-score--bigFish {
    background: rgba(2, 6, 23, 0.82);
}

.big-score__burst {
    position: absolute;
    border-radius: 50%;
    animation: big-score-pulse 1.2s ease-out infinite;
}

.big-score__burst--a {
    width: min(80vw, 420px);
    height: min(80vw, 420px);
    background: radial-gradient(circle, rgba(57, 255, 20, 0.28), transparent 68%);
}

.big-score--good .big-score__burst--a {
    background: radial-gradient(circle, rgba(34, 211, 238, 0.3), transparent 68%);
}

.big-score--great .big-score__burst--a {
    background: radial-gradient(circle, rgba(251, 191, 36, 0.32), transparent 68%);
}

.big-score--maximum .big-score__burst--a,
.big-score--special171 .big-score__burst--a {
    background: radial-gradient(circle, rgba(57, 255, 20, 0.42), transparent 65%);
}

.big-score--bigFish .big-score__burst--a {
    background: radial-gradient(circle, rgba(34, 211, 238, 0.45), transparent 65%);
}

.big-score__burst--b {
    width: min(95vw, 520px);
    height: min(95vw, 520px);
    background: radial-gradient(circle, rgba(251, 44, 95, 0.18), transparent 70%);
    animation-duration: 0.9s;
}

.big-score__fish {
    position: relative;
    font-size: clamp(48px, 12vw, 72px);
    animation: big-score-fish 1.4s ease-in-out infinite;
}

.big-score__kicker {
    position: relative;
    margin: 0 0 8px;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #fbbf24;
}

.big-score--solid .big-score__kicker {
    color: #94a3b8;
    font-size: 11px;
}

.big-score--good .big-score__kicker {
    color: #22d3ee;
}

.big-score--great .big-score__kicker {
    color: #fbbf24;
    font-size: 13px;
}

.big-score--maximum .big-score__kicker,
.big-score--special171 .big-score__kicker {
    color: #39ff14;
    font-size: 14px;
}

.big-score--bigFish .big-score__kicker {
    color: #22d3ee;
    font-size: 16px;
    letter-spacing: 0.18em;
}

.big-score__points {
    position: relative;
    margin: 0;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    line-height: 1;
    color: #39ff14;
    text-shadow: 0 0 40px rgba(57, 255, 20, 0.45);
    animation: big-score-pop 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.big-score--solid .big-score__points {
    font-size: clamp(56px, 14vw, 88px);
    text-shadow: 0 0 24px rgba(57, 255, 20, 0.25);
}

.big-score--good .big-score__points {
    font-size: clamp(64px, 15vw, 96px);
}

.big-score--great .big-score__points {
    font-size: clamp(72px, 17vw, 108px);
    color: #fbbf24;
    text-shadow: 0 0 48px rgba(251, 191, 36, 0.4);
}

.big-score--maximum .big-score__points,
.big-score--special171 .big-score__points {
    font-size: clamp(84px, 20vw, 128px);
    animation:
        big-score-pop 0.55s cubic-bezier(0.22, 1, 0.36, 1),
        big-score-shake 0.6s ease 0.55s;
}

.big-score--bigFish .big-score__points {
    font-size: clamp(88px, 22vw, 132px);
    color: #22d3ee;
    text-shadow: 0 0 56px rgba(34, 211, 238, 0.5);
}

.big-score__name {
    position: relative;
    margin: 10px 0 0;
    font-size: 16px;
    font-weight: 700;
    color: #e2e8f0;
}

.big-score-enter-active,
.big-score-leave-active {
    transition: opacity 0.35s ease;
}

.big-score-enter-from,
.big-score-leave-to {
    opacity: 0;
}

@keyframes big-score-pop {
    0% {
        transform: scale(0.6);
        opacity: 0;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}

@keyframes big-score-pulse {
    0%,
    100% {
        transform: scale(0.95);
        opacity: 0.7;
    }
    50% {
        transform: scale(1.05);
        opacity: 1;
    }
}

@keyframes big-score-shake {
    0%,
    100% {
        transform: rotate(0deg) scale(1);
    }
    25% {
        transform: rotate(-2deg) scale(1.02);
    }
    75% {
        transform: rotate(2deg) scale(1.02);
    }
}

@keyframes big-score-fish {
    0%,
    100% {
        transform: translateY(0) rotate(-8deg);
    }
    50% {
        transform: translateY(-8px) rotate(8deg);
    }
}

@media (prefers-reduced-motion: reduce) {
    .big-score__burst,
    .big-score__points,
    .big-score__fish {
        animation: none;
    }
}
</style>
