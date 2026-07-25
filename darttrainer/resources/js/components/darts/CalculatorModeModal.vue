<script setup lang="ts">
import { useLocale } from '@/composables/useLocale';

defineProps<{
    loading: boolean;
}>();

const emit = defineEmits<{
    confirm: [];
    cancel: [];
}>();

const { t } = useLocale();
</script>

<template>
    <div class="calc-mode-bg" @click.self="emit('cancel')">
        <div class="calc-mode">
            <p class="calc-mode__kicker">{{ t('games.play.calculatorMode.kicker') }}</p>
            <h3 class="calc-mode__title">{{ t('games.play.calculatorMode.title') }}</h3>
            <p class="calc-mode__desc">{{ t('games.play.calculatorMode.desc') }}</p>
            <ul class="calc-mode__list">
                <li>{{ t('games.play.calculatorMode.pointStandard') }}</li>
                <li>{{ t('games.play.calculatorMode.pointBasic') }}</li>
                <li>{{ t('games.play.calculatorMode.pointHeatmap') }}</li>
                <li>{{ t('games.play.calculatorMode.pointIrreversible') }}</li>
            </ul>
            <div class="calc-mode__actions">
                <button type="button" class="calc-mode__btn calc-mode__btn--ghost" :disabled="loading" @click="emit('cancel')">
                    {{ t('games.play.calculatorMode.cancel') }}
                </button>
                <button type="button" class="calc-mode__btn calc-mode__btn--confirm" :disabled="loading" @click="emit('confirm')">
                    {{ t('games.play.calculatorMode.confirm') }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.calc-mode-bg {
    position: fixed;
    inset: 0;
    z-index: 65;
    display: grid;
    place-items: center;
    padding: 16px;
    background: rgba(2, 6, 23, 0.82);
}

.calc-mode {
    width: min(100%, 420px);
    padding: 20px;
    border-radius: 16px;
    border: 1px solid rgba(34, 211, 238, 0.35);
    background: linear-gradient(165deg, rgba(13, 18, 32, 0.98), rgba(11, 15, 25, 0.98));
    box-shadow: 0 0 40px rgba(34, 211, 238, 0.12);
}

.calc-mode__kicker {
    margin: 0 0 6px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #22d3ee;
}

.calc-mode__title {
    margin: 0 0 10px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 26px;
    font-weight: 900;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #f4f4f5;
}

.calc-mode__desc {
    margin: 0 0 12px;
    color: #94a3b8;
    font-size: 13px;
    line-height: 1.5;
}

.calc-mode__list {
    margin: 0 0 18px;
    padding-left: 18px;
    color: #cbd5e1;
    font-size: 12px;
    line-height: 1.6;
}

.calc-mode__actions {
    display: flex;
    gap: 8px;
}

.calc-mode__btn {
    flex: 1;
    padding: 11px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
}

.calc-mode__btn--ghost {
    border: 1px solid #334155;
    background: transparent;
    color: #94a3b8;
}

.calc-mode__btn--confirm {
    border: 1px solid rgba(34, 211, 238, 0.45);
    background: rgba(34, 211, 238, 0.15);
    color: #22d3ee;
}
</style>
