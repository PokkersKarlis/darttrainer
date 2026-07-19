<script setup lang="ts">
import IndexSidebarItem from '@/components/index/IndexSidebarItem.vue';
import IndexSidebarSection from '@/components/index/IndexSidebarSection.vue';
import { useLocale } from '@/composables/useLocale';
import { Target, X } from 'lucide-vue-next';

withDefaults(
    defineProps<{
        mode?: 'docked' | 'drawer';
    }>(),
    {
        mode: 'docked',
    },
);

defineEmits<{
    close: [];
}>();

const { t } = useLocale();
</script>

<template>
    <aside
        class="ix-sidebar"
        :class="{
            'ix-sidebar--docked': mode === 'docked',
            'ix-sidebar--drawer': mode === 'drawer',
        }"
    >
        <div class="ix-sidebar-surface" aria-hidden="true">
            <span class="ix-sidebar-accent" />
            <span class="ix-sidebar-glow" />
            <span class="ix-sidebar-grid" />
        </div>

        <div class="ix-sidebar-head">
            <p class="ix-sidebar-kicker">{{ t('index.sidebar.kicker') }}</p>
            <button
                v-if="mode === 'drawer'"
                type="button"
                class="ix-sidebar-close"
                :aria-label="t('index.sidebar.close')"
                @click="$emit('close')"
            >
                <X :size="18" :stroke-width="2.4" />
            </button>
        </div>

        <nav class="ix-sidebar-nav" :aria-label="t('index.sidebar.aria')">
            <IndexSidebarSection :title="t('index.sidebar.games.title')">
                <IndexSidebarItem
                    href="#"
                    :label="t('index.sidebar.games.x01Multiplayer')"
                    :hint="t('index.sidebar.games.comingSoon')"
                    :icon="Target"
                    disabled
                />
            </IndexSidebarSection>
        </nav>
    </aside>
</template>

<style scoped>
.ix-sidebar {
    position: relative;
    isolation: isolate;
    display: flex;
    flex-direction: column;
    gap: calc(18px * var(--ix-scale, 1));
    min-height: 0;
    overflow: auto;
}

.ix-sidebar-surface {
    pointer-events: none;
    position: absolute;
    inset: 0;
    z-index: -1;
    border-radius: inherit;
    overflow: hidden;
}

.ix-sidebar-accent {
    position: absolute;
    top: 10%;
    bottom: 10%;
    left: 0;
    width: 3px;
    border-radius: 999px;
    background: linear-gradient(
        180deg,
        transparent,
        color-mix(in srgb, var(--ix-green, #39ff14) 85%, white),
        color-mix(in srgb, var(--ix-cyan, #22d3ee) 70%, white),
        transparent
    );
    box-shadow: 0 0 16px rgba(57, 255, 20, 0.45);
}

.ix-sidebar-glow {
    position: absolute;
    top: -20%;
    left: -30%;
    width: 80%;
    height: 55%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(57, 255, 20, 0.12), transparent 68%);
}

.ix-sidebar-grid {
    position: absolute;
    inset: 0;
    opacity: 0.22;
    background-image:
        linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
    background-size: var(--ix-grid-size, 48px) var(--ix-grid-size, 48px);
    mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.65), transparent 88%);
}

.ix-sidebar--docked {
    width: var(--ix-sidebar-width, 260px);
    flex-shrink: 0;
    height: 100%;
    padding: calc(20px * var(--ix-scale, 1)) calc(18px * var(--ix-scale, 1));
    border-radius: calc(18px * var(--ix-scale, 1));
    border: 1px solid color-mix(in srgb, var(--ix-green, #39ff14) 16%, var(--ix-line, #1f2937));
    background: color-mix(in srgb, var(--ix-panel, #0d1220) 94%, transparent);
    box-shadow:
        0 calc(20px * var(--ix-scale, 1)) calc(40px * var(--ix-scale, 1)) rgba(0, 0, 0, 0.32),
        inset 0 1px 0 rgba(255, 255, 255, 0.04),
        0 0 0 1px rgba(57, 255, 20, 0.04);
}

.ix-sidebar--drawer {
    position: relative;
    z-index: 1;
    width: min(var(--ix-drawer-width, 300px), 88vw);
    height: 100%;
    padding: calc(22px * var(--ix-scale, 1)) calc(18px * var(--ix-scale, 1));
    border-radius: 0 calc(18px * var(--ix-scale, 1)) calc(18px * var(--ix-scale, 1)) 0;
    border: 1px solid color-mix(in srgb, var(--ix-green, #39ff14) 20%, var(--ix-line, #1f2937));
    border-left: none;
    background: color-mix(in srgb, var(--ix-panel, #0d1220) 96%, transparent);
    box-shadow:
        calc(16px * var(--ix-scale, 1)) 0 calc(40px * var(--ix-scale, 1)) rgba(0, 0, 0, 0.45),
        inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.ix-sidebar-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding-left: calc(8px * var(--ix-scale, 1));
}

.ix-sidebar-kicker {
    margin: 0;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: calc(22px * var(--ix-scale, 1));
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ix-green, #39ff14);
    text-shadow: 0 0 18px rgba(57, 255, 20, 0.25);
}

.ix-sidebar-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: calc(36px * var(--ix-scale, 1));
    height: calc(36px * var(--ix-scale, 1));
    border-radius: calc(10px * var(--ix-scale, 1));
    border: 1px solid var(--ix-line, #1f2937);
    background: color-mix(in srgb, var(--ix-bg, #0b0f19) 70%, transparent);
    color: var(--ix-text, #f4f4f5);
    cursor: pointer;
    transition: border-color 0.15s ease, color 0.15s ease;
}

.ix-sidebar-close:hover {
    border-color: color-mix(in srgb, var(--ix-green, #39ff14) 35%, var(--ix-line, #1f2937));
    color: var(--ix-green, #39ff14);
}

.ix-sidebar-nav {
    flex: 1;
    min-height: 0;
    padding-left: calc(4px * var(--ix-scale, 1));
}

@media (prefers-reduced-motion: reduce) {
    .ix-sidebar-close {
        transition: none;
    }
}
</style>
