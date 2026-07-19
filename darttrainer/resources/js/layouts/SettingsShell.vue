<script setup lang="ts">
/**
 * TrainDart settings shell — athletic surface aligned with Welcome/Auth.
 */
import AppTopBar from '@/components/AppTopBar.vue';
import { useLocale } from '@/composables/useLocale';
import { Link } from '@inertiajs/vue3';
import { computed } from 'vue';

const { t } = useLocale();

const tabs = computed(() => [
    {
        label: t('settings.tabs.profile'),
        href: '/settings/profile',
        kind: 'profile' as const,
    },
    {
        label: t('settings.tabs.password'),
        href: '/settings/password',
        kind: 'password' as const,
    },
]);

const currentPath = computed(() => (typeof window !== 'undefined' ? window.location.pathname : ''));
</script>

<template>
    <div class="ts">
        <div class="ts-atmosphere" aria-hidden="true">
            <div class="ts-glow ts-glow--a" />
            <div class="ts-glow ts-glow--b" />
            <div class="ts-gridlines" />
        </div>

        <AppTopBar />

        <main class="ts-main ts-rise">
            <p class="ts-kicker">
                <span class="ts-kicker-ico" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                        <circle cx="12" cy="12" r="9" />
                        <circle cx="12" cy="12" r="5" />
                        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                    </svg>
                </span>
                TrainDart
            </p>
            <h1 class="ts-title">{{ t('settings.title') }}</h1>
            <p class="ts-sub">{{ t('settings.subtitle') }}</p>

            <nav class="ts-tabs">
                <Link
                    v-for="tab in tabs"
                    :key="tab.href"
                    :href="tab.href"
                    class="ts-tab"
                    :class="{ 'ts-tab--on': currentPath === tab.href }"
                >
                    <span class="ts-tab-ico" aria-hidden="true">
                        <svg v-if="tab.kind === 'profile'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 20a8 8 0 0116 0" />
                        </svg>
                        <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                            <rect x="5" y="11" width="14" height="10" rx="2" />
                            <path d="M8 11V7a4 4 0 018 0v4" />
                        </svg>
                    </span>
                    {{ tab.label }}
                </Link>
            </nav>

            <div class="ts-panel ts-rise" style="--delay: 0.08s">
                <slot />
            </div>
        </main>
    </div>
</template>

<style scoped>
.ts {
    --td-bg: #0b0f19;
    --td-panel: #0d1220;
    --td-line: #1f2937;
    --td-muted: #64748b;
    --td-soft: #94a3b8;
    --td-text: #f4f4f5;
    --td-green: #39ff14;
    --td-cyan: #22d3ee;

    position: relative;
    isolation: isolate;
    min-height: 100vh;
    overflow-x: clip;
    background: var(--td-bg);
    color: var(--td-text);
    font-family: Inter, sans-serif;
}

.ts-atmosphere {
    pointer-events: none;
    position: absolute;
    inset: 0;
    z-index: -1;
}
.ts-glow {
    position: absolute;
    border-radius: 50%;
}
.ts-glow--a {
    top: -14%;
    left: -10%;
    width: 520px;
    height: 520px;
    background: radial-gradient(circle, rgba(57, 255, 20, 0.12), transparent 68%);
}
.ts-glow--b {
    top: 30%;
    right: -16%;
    width: 460px;
    height: 460px;
    background: radial-gradient(circle, rgba(34, 211, 238, 0.07), transparent 70%);
}
.ts-gridlines {
    position: absolute;
    inset: 0;
    opacity: 0.3;
    background-image:
        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.5), transparent 75%);
}

.ts-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 18px 28px;
    border-bottom: 1px solid color-mix(in srgb, var(--td-line) 80%, transparent);
    backdrop-filter: blur(8px);
    background: color-mix(in srgb, var(--td-bg) 78%, transparent);
    position: sticky;
    top: 0;
    z-index: 20;
}
.ts-brand {
    display: inline-flex;
    text-decoration: none;
}
.ts-top-actions {
    display: flex;
    align-items: center;
    gap: 14px;
}
.ts-back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--td-soft);
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s ease;
}
.ts-back:hover {
    color: var(--td-green);
}

.ts-main {
    max-width: 680px;
    margin: 0 auto;
    padding: 40px 28px 56px;
}
.ts-kicker {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 10px;
    color: var(--td-green);
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800;
    font-size: 13px;
    letter-spacing: 1.6px;
    text-transform: uppercase;
}
.ts-kicker-ico {
    display: inline-flex;
    width: 22px;
    height: 22px;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    background: rgba(57, 255, 20, 0.12);
    border: 1px solid rgba(57, 255, 20, 0.25);
}
.ts-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: clamp(28px, 4vw, 34px);
    margin: 0;
}
.ts-sub {
    color: var(--td-muted);
    font-size: 14px;
    margin: 6px 0 24px;
}
.ts-tabs {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    padding: 6px;
    margin-bottom: 24px;
    border-radius: 14px;
    border: 1px solid var(--td-line);
    background: color-mix(in srgb, var(--td-panel) 88%, transparent);
}
.ts-tab {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    font-size: 14px;
    font-weight: 700;
    color: var(--td-soft);
    text-decoration: none;
    border-radius: 10px;
    transition: color 0.2s ease, background 0.2s ease;
}
.ts-tab:hover {
    color: var(--td-text);
    background: rgba(255, 255, 255, 0.03);
}
.ts-tab--on {
    color: var(--td-green);
    background: rgba(57, 255, 20, 0.1);
}
.ts-tab-ico {
    display: inline-flex;
    opacity: 0.85;
}
.ts-tab--on .ts-tab-ico {
    opacity: 1;
}

.ts-panel {
    padding: 28px;
    border-radius: 16px;
    border: 1px solid var(--td-line);
    background: linear-gradient(165deg, rgba(19, 26, 38, 0.88), rgba(13, 18, 32, 0.96));
}

.ts-rise {
    animation: ts-rise 0.65s ease both;
    animation-delay: var(--delay, 0s);
}

@keyframes ts-rise {
    from {
        opacity: 0;
        transform: translateY(12px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 560px) {
    .ts-panel {
        padding: 20px;
    }
    .ts-tabs {
        gap: 4px;
    }
    .ts-tab {
        flex: 1 1 auto;
        justify-content: center;
        padding: 10px 12px;
        font-size: 13px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .ts-rise {
        animation: none;
    }
}

/* Shared polish for settings page forms inside the panel */
:deep(.tf-h) {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
:deep(.tf-btn--green:hover) {
    filter: brightness(1.05);
    transform: translateY(-1px);
}
:deep(.tf-btn) {
    transition: transform 0.2s ease, filter 0.2s ease, opacity 0.2s ease;
}
:deep(.tf-input:focus),
:deep(.ap-tab--on) {
    outline: none;
}
</style>
