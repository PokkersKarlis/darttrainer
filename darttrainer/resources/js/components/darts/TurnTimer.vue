<script setup lang="ts">
import { useLocale } from '@/composables/useLocale';
import type { TurnTimerState } from '@/stores/dartsPlay';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

const props = defineProps<{
    timer: TurnTimerState | null | undefined;
    isActiveSide: boolean;
    compact?: boolean;
    bar?: boolean;
    header?: boolean;
}>();

const { t } = useLocale();
const displaySeconds = ref(0);
let tickInterval: number | undefined;

function syncFromTimer() {
    if (!props.timer || props.timer.status === 'expired') {
        displaySeconds.value = 0;

        return;
    }

    const expiresAt = new Date(props.timer.expires_at).getTime();
    displaySeconds.value = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
}

const formatted = computed(() => {
    const total = displaySeconds.value;
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

const urgencyClass = computed(() => {
    if (!props.timer || props.timer.status === 'expired') {
        return 'turn-timer--expired';
    }

    if (displaySeconds.value <= 30) {
        return 'turn-timer--critical';
    }

    if (displaySeconds.value <= 60) {
        return 'turn-timer--warn';
    }

    return '';
});

watch(
    () => props.timer,
    () => syncFromTimer(),
    { deep: true, immediate: true },
);

onMounted(() => {
    syncFromTimer();
    tickInterval = window.setInterval(syncFromTimer, 250);
});

onUnmounted(() => {
    if (tickInterval !== undefined) {
        window.clearInterval(tickInterval);
    }
});
</script>

<template>
    <div
        v-if="timer"
        class="turn-timer"
        :class="[
            urgencyClass,
            {
                'turn-timer--mine': isActiveSide,
                'turn-timer--compact': compact,
                'turn-timer--bar': bar,
                'turn-timer--header': header,
            },
        ]"
        role="timer"
        :aria-label="t('games.play.timer.label', { name: timer.player_name, time: formatted })"
    >
        <div class="turn-timer__meta">
            <span class="turn-timer__kicker">
                {{ isActiveSide ? t('games.play.timer.yourTurn') : t('games.play.timer.theirTurn', { name: timer.player_name }) }}
            </span>
            <span v-if="timer.status === 'extended'" class="turn-timer__badge">{{ t('games.play.timer.extended') }}</span>
            <span v-else-if="timer.status === 'expired'" class="turn-timer__badge turn-timer__badge--expired">
                {{ t('games.play.timer.expired') }}
            </span>
        </div>
        <p class="turn-timer__clock">{{ formatted }}</p>
    </div>
</template>

<style scoped>
.turn-timer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 14px;
    border-radius: var(--game-radius);
    border: 1px solid rgba(57, 255, 20, 0.22);
    background: rgba(57, 255, 20, 0.06);
}

.turn-timer--mine {
    border-color: rgba(57, 255, 20, 0.45);
    box-shadow: inset 0 0 24px rgba(57, 255, 20, 0.06);
}

.turn-timer--warn {
    border-color: rgba(251, 191, 36, 0.45);
    background: rgba(251, 191, 36, 0.08);
}

.turn-timer--critical {
    border-color: rgba(251, 44, 95, 0.45);
    background: rgba(251, 44, 95, 0.08);
}

.turn-timer--expired {
    border-color: rgba(251, 44, 95, 0.55);
    background: rgba(251, 44, 95, 0.12);
}

.turn-timer__meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
}

.turn-timer__kicker {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #94a3b8;
}

.turn-timer__badge {
    align-self: flex-start;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #22d3ee;
    background: rgba(34, 211, 238, 0.12);
    border: 1px solid rgba(34, 211, 238, 0.25);
}

.turn-timer__badge--expired {
    color: #fb2c5f;
    background: rgba(251, 44, 95, 0.12);
    border-color: rgba(251, 44, 95, 0.35);
}

.turn-timer__clock {
    margin: 0;
    flex-shrink: 0;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: clamp(28px, 4vw, 36px);
    font-weight: 900;
    letter-spacing: 0.08em;
    color: #39ff14;
}

.turn-timer--warn .turn-timer__clock {
    color: #fbbf24;
}

.turn-timer--critical .turn-timer__clock,
.turn-timer--expired .turn-timer__clock {
    color: #fb2c5f;
}

.turn-timer--bar {
    flex: 0 0 auto;
    width: 100%;
    box-sizing: border-box;
    padding: clamp(8px, 1.4vh, 11px) clamp(12px, 2.5vw, 16px);
    gap: clamp(8px, 2vw, 14px);
    min-height: clamp(44px, 7vh, 52px);
}

.turn-timer--bar .turn-timer__meta {
    flex: 1 1 auto;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px 10px;
}

.turn-timer--bar .turn-timer__kicker {
    font-size: clamp(10px, 1.8vh, 12px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.turn-timer--bar .turn-timer__badge {
    font-size: clamp(9px, 1.6vh, 10px);
    padding: 2px 8px;
}

.turn-timer--bar .turn-timer__clock {
    font-size: clamp(24px, 4.5vh, 32px);
    line-height: 1;
}

.turn-timer--compact {
    flex-direction: column;
    align-items: stretch;
    justify-content: space-between;
    gap: 3px;
    padding: 6px;
    min-width: 0;
    height: 100%;
    max-height: 100%;
    box-sizing: border-box;
    overflow: hidden;
}

.turn-timer--compact .turn-timer__meta {
    gap: 2px;
    overflow: hidden;
}

.turn-timer--compact .turn-timer__kicker {
    font-size: 8px;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.turn-timer--compact .turn-timer__badge {
    font-size: 7px;
    padding: 1px 5px;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.turn-timer--compact .turn-timer__clock {
    font-size: clamp(18px, 3.5vh, 26px);
    text-align: center;
    align-self: center;
    line-height: 1;
}

.turn-timer--header {
    flex: 0 0 auto;
    flex-shrink: 0;
    align-self: center;
    gap: 8px;
    padding: 6px 10px;
    min-height: 36px;
    min-width: 108px;
    border-radius: 8px;
}

.turn-timer--header .turn-timer__meta {
    flex: 1 1 auto;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    min-width: 0;
}

.turn-timer--header .turn-timer__kicker {
    font-size: 9px;
    line-height: 1.2;
    max-width: 14ch;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.turn-timer--header .turn-timer__badge {
    font-size: 8px;
    padding: 1px 6px;
}

.turn-timer--header .turn-timer__clock {
    flex-shrink: 0;
    font-size: clamp(20px, 2.4vh, 26px);
    line-height: 1;
}
</style>
