<script setup lang="ts">
import type { LucideIcon } from 'lucide-vue-next';
import { Link } from '@inertiajs/vue3';
import { Lock } from 'lucide-vue-next';

defineProps<{
    href: string;
    label: string;
    hint?: string;
    icon: LucideIcon;
    disabled?: boolean;
}>();
</script>

<template>
    <component
        :is="disabled ? 'span' : Link"
        :href="disabled ? undefined : href"
        class="ix-nav-item"
        :class="{ 'ix-nav-item--disabled': disabled }"
        :aria-disabled="disabled ? 'true' : undefined"
        :tabindex="disabled ? -1 : undefined"
    >
        <span class="ix-nav-item-icon" aria-hidden="true">
            <component :is="icon" :size="18" :stroke-width="2.2" />
        </span>
        <span class="ix-nav-item-copy">
            <span class="ix-nav-item-label">{{ label }}</span>
            <span v-if="disabled && hint" class="ix-nav-item-hint">
                <Lock :size="12" :stroke-width="2.4" class="ix-nav-item-lock" aria-hidden="true" />
                {{ hint }}
            </span>
        </span>
    </component>
</template>

<style scoped>
.ix-nav-item {
    display: flex;
    align-items: flex-start;
    gap: calc(12px * var(--ix-scale, 1));
    width: 100%;
    padding: calc(12px * var(--ix-scale, 1)) calc(14px * var(--ix-scale, 1));
    border-radius: calc(12px * var(--ix-scale, 1));
    border: 1px solid transparent;
    background: transparent;
    color: var(--ix-text, #f4f4f5);
    text-decoration: none;
    cursor: pointer;
    transition:
        background 0.18s ease,
        border-color 0.18s ease,
        transform 0.18s ease,
        box-shadow 0.18s ease;
}

.ix-nav-item:hover {
    background: color-mix(in srgb, var(--ix-green, #39ff14) 8%, transparent);
    border-color: color-mix(in srgb, var(--ix-green, #39ff14) 18%, var(--ix-line, #1f2937));
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
}

.ix-nav-item-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: calc(36px * var(--ix-scale, 1));
    height: calc(36px * var(--ix-scale, 1));
    border-radius: calc(10px * var(--ix-scale, 1));
    border: 1px solid color-mix(in srgb, var(--ix-green, #39ff14) 24%, var(--ix-line, #1f2937));
    background: color-mix(in srgb, var(--ix-panel, #0d1220) 88%, transparent);
    color: var(--ix-green, #39ff14);
    box-shadow: inset 0 0 12px rgba(57, 255, 20, 0.08);
}

.ix-nav-item-copy {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    padding-top: 2px;
}

.ix-nav-item-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: calc(16px * var(--ix-scale, 1));
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    line-height: 1.1;
}

.ix-nav-item-hint {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: calc(11px * var(--ix-scale, 1));
    font-weight: 600;
    letter-spacing: 0.02em;
    color: var(--ix-muted, #64748b);
}

.ix-nav-item-lock {
    flex-shrink: 0;
    color: #fb2c5f;
}

.ix-nav-item--disabled {
    opacity: 0.52;
    cursor: not-allowed;
    pointer-events: none;
}

.ix-nav-item--disabled .ix-nav-item-icon {
    color: var(--ix-muted, #64748b);
    border-color: var(--ix-line, #1f2937);
    box-shadow: none;
}

.ix-nav-item--disabled:hover {
    transform: none;
    box-shadow: none;
    background: transparent;
    border-color: transparent;
}

@media (prefers-reduced-motion: reduce) {
    .ix-nav-item {
        transition: none;
    }
}
</style>
