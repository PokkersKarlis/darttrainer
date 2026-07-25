<script setup lang="ts">
import { useLocale } from '@/composables/useLocale';

defineProps<{
    playerName: string;
    loading: boolean;
}>();

defineEmits<{
    extend: [];
    end: [];
    dismiss: [];
}>();

const { t } = useLocale();
</script>

<template>
    <div class="timeout-modal-bg" role="dialog" aria-modal="true" @click.self="$emit('dismiss')">
        <div class="timeout-modal">
            <p class="timeout-modal__kicker">{{ t('games.play.timer.timeoutKicker') }}</p>
            <h3 class="timeout-modal__title">{{ t('games.play.timer.timeoutTitle', { name: playerName }) }}</h3>
            <p class="timeout-modal__desc">{{ t('games.play.timer.timeoutDesc') }}</p>
            <p class="timeout-modal__note">{{ t('games.play.timer.endNote') }}</p>

            <div class="timeout-modal__actions">
                <button type="button" class="timeout-btn timeout-btn--ghost" :disabled="loading" @click="$emit('dismiss')">
                    {{ t('games.play.timer.later') }}
                </button>
                <button type="button" class="timeout-btn timeout-btn--extend" :disabled="loading" @click="$emit('extend')">
                    {{ t('games.play.timer.extend') }}
                </button>
                <button type="button" class="timeout-btn timeout-btn--danger" :disabled="loading" @click="$emit('end')">
                    {{ t('games.play.timer.endMatch') }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.timeout-modal-bg {
    position: fixed;
    inset: 0;
    z-index: 60;
    display: grid;
    place-items: center;
    padding: 20px;
    background: rgba(2, 6, 23, 0.78);
    backdrop-filter: blur(6px);
}

.timeout-modal {
    width: min(100%, 440px);
    padding: 22px;
    border-radius: 18px;
    border: 1px solid rgba(251, 44, 95, 0.35);
    background: linear-gradient(165deg, rgba(19, 26, 38, 0.96), rgba(13, 18, 32, 0.98));
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
    color: #e2e8f0;
}

.timeout-modal__kicker {
    margin: 0 0 8px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #fb2c5f;
}

.timeout-modal__title {
    margin: 0 0 10px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 28px;
    font-weight: 900;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #f8fafc;
}

.timeout-modal__desc,
.timeout-modal__note {
    margin: 0 0 10px;
    color: #cbd5e1;
    font-size: 14px;
    line-height: 1.5;
}

.timeout-modal__note {
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid rgba(251, 44, 95, 0.2);
    background: rgba(251, 44, 95, 0.08);
    color: #fca5a5;
}

.timeout-modal__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 18px;
}

.timeout-btn {
    flex: 1 1 calc(50% - 5px);
    min-width: 120px;
    padding: 11px 14px;
    border-radius: 12px;
    border: 1px solid transparent;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s ease;
}

.timeout-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
}

.timeout-btn--ghost {
    border-color: #1f2937;
    background: rgba(255, 255, 255, 0.03);
    color: #cbd5e1;
}

.timeout-btn--extend {
    border-color: rgba(57, 255, 20, 0.35);
    background: rgba(57, 255, 20, 0.12);
    color: #39ff14;
}

.timeout-btn--danger {
    border-color: rgba(251, 44, 95, 0.45);
    background: rgba(251, 44, 95, 0.14);
    color: #fb2c5f;
}
</style>
