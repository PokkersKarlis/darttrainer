<script setup lang="ts">
import { useLocale } from '@/composables/useLocale';
import type { TurnThrow } from '@/stores/dartsPlay';
import { computed, ref } from 'vue';

const props = defineProps<{
    disabled?: boolean;
    loading?: boolean;
    turnThrows: TurnThrow[];
    dartsThisTurn: number;
}>();

const emit = defineEmits<{
    throw: [sector: number, multiplier: number];
    closeChat: [];
}>();

const { t } = useLocale();
const multiplier = ref<1 | 2 | 3>(1);

function interact() {
    emit('closeChat');
}

const sectors = [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

const multiplierLabel = computed(() => {
    if (multiplier.value === 2) {
        return t('games.play.double');
    }

    if (multiplier.value === 3) {
        return t('games.play.triple');
    }

    return t('games.play.single');
});

const inputLocked = computed(() => props.disabled || props.loading || props.dartsThisTurn >= 3);

function setMultiplier(next: 1 | 2 | 3) {
    interact();
    if (inputLocked.value) {
        return;
    }

    multiplier.value = next;
}

function submitSector(sector: number) {
    interact();
    if (props.disabled || props.loading || props.dartsThisTurn >= 3) {
        return;
    }

    if (sector === 25 && multiplier.value === 3) {
        return;
    }

    emit('throw', sector, multiplier.value);
}

function submitMiss() {
    interact();
    if (props.disabled || props.loading || props.dartsThisTurn >= 3) {
        return;
    }

    emit('throw', 0, 0);
}
</script>

<template>
    <section class="pad" @click="interact">
        <div class="pad-mult">
            <button
                type="button"
                class="pad-mult-btn pad-mult-btn--single"
                :class="{ 'pad-mult-btn--on': multiplier === 1 }"
                :disabled="inputLocked"
                @click="setMultiplier(1)"
            >
                {{ t('games.play.single') }}
            </button>
            <button
                type="button"
                class="pad-mult-btn pad-mult-btn--double"
                :class="{ 'pad-mult-btn--on': multiplier === 2 }"
                :disabled="inputLocked"
                @click="setMultiplier(2)"
            >
                {{ t('games.play.double') }}
            </button>
            <button
                type="button"
                class="pad-mult-btn pad-mult-btn--triple"
                :class="{ 'pad-mult-btn--on': multiplier === 3 }"
                :disabled="inputLocked"
                @click="setMultiplier(3)"
            >
                {{ t('games.play.triple') }}
            </button>
        </div>

        <p class="pad-hint">{{ t('games.play.multiplierActive', { label: multiplierLabel }) }}</p>

        <div class="pad-grid">
            <button v-for="sector in sectors" :key="sector" type="button" class="pad-sector" :disabled="inputLocked" @click="submitSector(sector)">
                {{ sector }}
            </button>
            <button
                v-if="multiplier !== 3"
                type="button"
                class="pad-sector pad-sector--bull"
                :class="{
                    'pad-sector--bull-single': multiplier === 1,
                    'pad-sector--bull-double': multiplier === 2,
                }"
                :disabled="inputLocked"
                @click="submitSector(25)"
            >
                25
            </button>
            <button type="button" class="pad-sector pad-sector--miss" :disabled="inputLocked" @click="submitMiss">
                {{ t('games.play.miss') }}
            </button>
        </div>
    </section>
</template>

<style scoped>
.pad {
    display: flex;
    flex-direction: column;
    gap: clamp(4px, 1vh, var(--game-gap-sm));
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
    border-radius: var(--game-radius);
    border: 1px solid #1f2937;
    background: linear-gradient(165deg, rgba(19, 26, 38, 0.88), rgba(13, 18, 32, 0.94));
    padding: clamp(8px, 1.4vh, var(--game-panel-pad));
    box-sizing: border-box;
}

.pad-mult {
    flex: 0 0 auto;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
}

.pad-mult-btn {
    padding: clamp(5px, 1.2vh, 8px) clamp(6px, 1.5vw, 10px);
    border-radius: 9px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
    color: #94a3b8;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    transition:
        border-color 0.15s ease,
        background 0.15s ease,
        color 0.15s ease;
}

.pad-mult-btn--single.pad-mult-btn--on,
.pad-mult-btn--double.pad-mult-btn--on,
.pad-mult-btn--triple.pad-mult-btn--on {
    border-color: rgba(57, 255, 20, 0.45);
    background: rgba(57, 255, 20, 0.12);
    color: #39ff14;
}

.pad-mult-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

.pad-hint {
    margin: 0;
    flex: 0 0 auto;
    color: #64748b;
    font-size: clamp(9px, 1.8vh, 11px);
}

.pad-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-template-rows: repeat(6, minmax(0, 1fr));
    gap: clamp(3px, 0.7vh, 6px);
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
}

.pad-sector {
    min-height: 0;
    height: 100%;
    padding: clamp(2px, 0.8vh, 10px) 0;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(0, 0, 0, 0.18);
    color: #e2e8f0;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: clamp(13px, 2.4vh, 18px);
    font-weight: 800;
    cursor: pointer;
    transition:
        border-color 0.15s ease,
        background 0.15s ease;
}

.pad-sector:hover:not(:disabled) {
    border-color: rgba(57, 255, 20, 0.35);
    background: rgba(57, 255, 20, 0.08);
}

.pad-sector:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

.pad-sector--bull {
    grid-column: span 2;
}

.pad-sector--bull-single {
    color: #39ff14;
    border-color: rgba(57, 255, 20, 0.45);
    background: rgba(57, 255, 20, 0.12);
}

.pad-sector--bull-single:hover:not(:disabled) {
    border-color: rgba(57, 255, 20, 0.65);
    background: rgba(57, 255, 20, 0.2);
}

.pad-sector--bull-double {
    color: #fb2c5f;
    border-color: rgba(251, 44, 95, 0.45);
    background: rgba(251, 44, 95, 0.12);
}

.pad-sector--bull-double:hover:not(:disabled) {
    border-color: rgba(251, 44, 95, 0.65);
    background: rgba(251, 44, 95, 0.2);
}

.pad-sector--miss {
    grid-column: span 2;
    color: #f8fafc;
    border-color: rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.04);
    font-size: clamp(11px, 2vh, 13px);
    letter-spacing: 0.06em;
    text-transform: uppercase;
}

.pad-sector--miss:hover:not(:disabled) {
    border-color: rgba(255, 255, 255, 0.28);
    background: rgba(255, 255, 255, 0.08);
}
</style>
