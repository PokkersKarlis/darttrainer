<script setup lang="ts">
import { useLocale } from '@/composables/useLocale';
import { onClickOutside, useEventListener, useMediaQuery } from '@vueuse/core';
import { CircleHelp } from 'lucide-vue-next';
import { nextTick, ref, watch } from 'vue';

const { t } = useLocale();
const isOpen = ref(false);
const rootRef = ref<HTMLElement | null>(null);
const btnRef = ref<HTMLButtonElement | null>(null);
const canHover = useMediaQuery('(hover: hover) and (pointer: fine)');

const tipStyle = ref<{ top: string; left: string; width: string }>({
    top: '0px',
    left: '0px',
    width: '280px',
});

async function updateTipPosition(): Promise<void> {
    await nextTick();

    const button = btnRef.value;
    if (button === null) {
        return;
    }

    const rect = button.getBoundingClientRect();
    const width = Math.min(280, Math.max(200, window.innerWidth - 16));
    let left = rect.right - width;
    left = Math.max(8, Math.min(left, window.innerWidth - width - 8));

    tipStyle.value = {
        top: `${rect.bottom + 8}px`,
        left: `${left}px`,
        width: `${width}px`,
    };
}

function showTip(): void {
    isOpen.value = true;
}

function hideTip(): void {
    isOpen.value = false;
}

function onPointerEnter(): void {
    if (canHover.value) {
        showTip();
    }
}

function onPointerLeave(): void {
    if (canHover.value) {
        hideTip();
    }
}

function onButtonClick(event: MouseEvent): void {
    event.stopPropagation();

    if (canHover.value) {
        return;
    }

    isOpen.value = !isOpen.value;
}

function onFocus(): void {
    if (canHover.value) {
        showTip();
    }
}

function onBlur(): void {
    if (canHover.value) {
        hideTip();
    }
}

onClickOutside(rootRef, () => {
    if (!canHover.value && isOpen.value) {
        hideTip();
    }
});

watch(isOpen, (isOpen) => {
    if (isOpen) {
        void updateTipPosition();
    }
});

useEventListener(window, 'resize', () => {
    if (isOpen.value) {
        void updateTipPosition();
    }
});

useEventListener(window, 'scroll', () => {
    if (isOpen.value) {
        void updateTipPosition();
    }
}, true);
</script>

<template>
    <span ref="rootRef" class="input-mode-info">
        <button
            ref="btnRef"
            type="button"
            class="input-mode-info__btn"
            :aria-label="t('games.play.inputMode.infoLabel')"
            :aria-expanded="isOpen"
            @pointerenter="onPointerEnter"
            @pointerleave="onPointerLeave"
            @focus="onFocus"
            @blur="onBlur"
            @click="onButtonClick"
        >
            <CircleHelp class="input-mode-info__icon" aria-hidden="true" />
        </button>

        <Teleport to="body">
            <div
                v-show="isOpen"
                class="input-mode-info__tip"
                role="tooltip"
                :style="{ top: tipStyle.top, left: tipStyle.left, width: tipStyle.width }"
            >
                <p class="input-mode-info__title">{{ t('games.play.inputMode.infoTitle') }}</p>
                <ul class="input-mode-info__list">
                    <li>{{ t('games.play.inputMode.infoCalc') }}</li>
                    <li>{{ t('games.play.inputMode.infoQuality') }}</li>
                    <li>{{ t('games.play.inputMode.infoBoardReturn') }}</li>
                    <li>{{ t('games.play.inputMode.infoDefault') }}</li>
                </ul>
            </div>
        </Teleport>
    </span>
</template>

<style scoped>
.input-mode-info {
    position: relative;
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
}

.input-mode-info__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border-radius: 8px;
    border: 1px solid rgba(148, 163, 184, 0.35);
    background: rgba(255, 255, 255, 0.04);
    color: #94a3b8;
    cursor: help;
    touch-action: manipulation;
    transition:
        border-color 0.15s ease,
        color 0.15s ease,
        background 0.15s ease;
}

.input-mode-info__icon {
    width: 15px;
    height: 15px;
    stroke-width: 2.2;
}

.input-mode-info__btn:hover,
.input-mode-info__btn:focus-visible {
    border-color: rgba(34, 211, 238, 0.45);
    color: #22d3ee;
    background: rgba(34, 211, 238, 0.08);
    outline: none;
}

.input-mode-info__tip {
    position: fixed;
    z-index: 200;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid rgba(34, 211, 238, 0.25);
    background: rgba(13, 18, 32, 0.98);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
    pointer-events: none;
}

.input-mode-info__title {
    margin: 0 0 6px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #22d3ee;
}

.input-mode-info__list {
    margin: 0;
    padding-left: 16px;
    color: #cbd5e1;
    font-size: 11px;
    line-height: 1.45;
}

.input-mode-info__list li + li {
    margin-top: 4px;
}
</style>
