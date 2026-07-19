<script setup lang="ts">
/**
 * TrainDart auth shell — athletic brand panel + form column.
 * Visual language aligned with Welcome (atmosphere, icons, motion).
 */
import BrandLogo from '@/components/BrandLogo.vue';
import LanguageSwitcher from '@/components/LanguageSwitcher.vue';
import { useLocale } from '@/composables/useLocale';

const { t } = useLocale();

withDefaults(
    defineProps<{
        headingLine1: string;
        headingLine2: string;
        lead: string;
    }>(),
    {},
);

const brandFeatures = [
    {
        key: 'feature1',
        tone: 'green' as const,
        kind: 'bars' as const,
    },
    {
        key: 'feature2',
        tone: 'cyan' as const,
        kind: 'live' as const,
    },
    {
        key: 'feature3',
        tone: 'pink' as const,
        kind: 'friends' as const,
    },
];
</script>

<template>
    <div class="td-auth">
        <div class="td-atmosphere" aria-hidden="true">
            <div class="td-glow td-glow--a" />
            <div class="td-glow td-glow--b" />
            <div class="td-gridlines" />
        </div>

        <aside class="td-brand">
            <div class="td-brand-board" aria-hidden="true">
                <svg class="td-board" viewBox="0 0 320 320" fill="none">
                    <circle class="td-board-ring td-board-ring--outer" cx="160" cy="160" r="148" />
                    <circle class="td-board-ring" cx="160" cy="160" r="118" />
                    <circle class="td-board-ring td-board-ring--mid" cx="160" cy="160" r="78" />
                    <circle class="td-board-ring" cx="160" cy="160" r="42" />
                    <circle class="td-board-bull" cx="160" cy="160" r="14" />
                    <g class="td-board-spokes" stroke-linecap="round">
                        <path d="M160 18v46M160 256v46M18 160h46M256 160h46" />
                        <path d="M55 55l32 32M233 233l32 32M265 55l-32 32M87 233l-32 32" />
                    </g>
                </svg>
            </div>

            <div class="td-brand-top td-rise">
                <BrandLogo :width="180" class="td-brand-logo" />
                <LanguageSwitcher />
            </div>

            <div class="td-brand-body td-rise td-rise--delay">
                <p class="td-kicker">
                    <span class="td-kicker-ico" aria-hidden="true">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                            <circle cx="12" cy="12" r="9" />
                            <circle cx="12" cy="12" r="5" />
                            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                        </svg>
                    </span>
                    TrainDart
                </p>
                <h1 class="td-brand-h">{{ headingLine1 }}<br /><span class="td-brand-h-accent">{{ headingLine2 }}</span></h1>
                <p class="td-brand-lead">{{ lead }}</p>

                <div class="td-features">
                    <div
                        v-for="(f, i) in brandFeatures"
                        :key="f.key"
                        class="td-feature td-rise"
                        :style="{ '--delay': `${0.18 + i * 0.06}s` }"
                    >
                        <span class="td-feature-ico" :class="`td-feature-ico--${f.tone}`" aria-hidden="true">
                            <svg v-if="f.kind === 'bars'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                                <path d="M4 19V9M10 19V5M16 19v-7M20 19H3" />
                            </svg>
                            <svg v-else-if="f.kind === 'live'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                                <circle cx="12" cy="12" r="2" fill="currentColor" />
                                <path d="M8.5 15.5a5 5 0 010-7M15.5 15.5a5 5 0 000-7" />
                            </svg>
                            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                                <circle cx="9" cy="8" r="3" />
                                <path d="M3 20a6 6 0 0112 0" />
                                <circle cx="17" cy="8" r="2.5" />
                            </svg>
                        </span>
                        <span class="td-feature-txt">{{ t(`auth.brand.${f.key}`) }}</span>
                    </div>
                </div>
            </div>

            <div class="td-brand-foot td-rise" style="--delay: 0.4s">{{ t('auth.brand.copyright') }}</div>
        </aside>

        <main class="td-form-wrap">
            <div class="td-form td-rise td-rise--form">
                <div class="td-mobile-top">
                    <BrandLogo :width="140" class="td-mobile-logo" />
                    <LanguageSwitcher class="td-mobile-lang" />
                </div>
                <slot />
            </div>
        </main>
    </div>
</template>

<style scoped>
.td-auth {
    --td-bg: #0b0f19;
    --td-panel: #0d1220;
    --td-line: #1f2937;
    --td-muted: #64748b;
    --td-soft: #94a3b8;
    --td-text: #f4f4f5;
    --td-green: #39ff14;
    --td-cyan: #22d3ee;
    --td-pink: #fb2c5f;

    position: relative;
    isolation: isolate;
    min-height: 100vh;
    display: flex;
    overflow: hidden;
    font-family: Inter, sans-serif;
    background: var(--td-bg);
    color: var(--td-text);
}

.td-atmosphere {
    pointer-events: none;
    position: absolute;
    inset: 0;
    z-index: -1;
}
.td-glow {
    position: absolute;
    border-radius: 50%;
}
.td-glow--a {
    top: -18%;
    left: -10%;
    width: 520px;
    height: 520px;
    background: radial-gradient(circle, rgba(57, 255, 20, 0.12), transparent 68%);
}
.td-glow--b {
    bottom: -20%;
    right: -12%;
    width: 480px;
    height: 480px;
    background: radial-gradient(circle, rgba(34, 211, 238, 0.08), transparent 70%);
}
.td-gridlines {
    position: absolute;
    inset: 0;
    opacity: 0.28;
    background-image:
        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: linear-gradient(90deg, rgba(0, 0, 0, 0.55), transparent 55%);
}

.td-brand {
    display: none;
    position: relative;
    flex-direction: column;
    justify-content: space-between;
    width: 480px;
    flex-shrink: 0;
    padding: 48px 52px;
    background: color-mix(in srgb, var(--td-panel) 92%, transparent);
    border-right: 1px solid color-mix(in srgb, var(--td-line) 85%, transparent);
    overflow: hidden;
}
.td-brand-board {
    position: absolute;
    right: -18%;
    bottom: 8%;
    width: 320px;
    opacity: 0.55;
    pointer-events: none;
}
.td-board {
    width: 100%;
    color: var(--td-green);
    animation: td-board-drift 12s ease-in-out infinite;
}
.td-board-ring {
    stroke: rgba(148, 163, 184, 0.25);
    stroke-width: 1.5;
}
.td-board-ring--outer {
    stroke: rgba(57, 255, 20, 0.32);
    stroke-width: 2;
}
.td-board-ring--mid {
    stroke: rgba(34, 211, 238, 0.3);
}
.td-board-bull {
    fill: var(--td-green);
    opacity: 0.85;
}
.td-board-spokes {
    stroke: rgba(148, 163, 184, 0.18);
    stroke-width: 1.5;
}

.td-brand-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 40px;
    position: relative;
    z-index: 1;
}
.td-brand-body {
    max-width: 400px;
    position: relative;
    z-index: 1;
}
.td-kicker {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 14px;
    color: var(--td-green);
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800;
    font-size: 13px;
    letter-spacing: 1.6px;
    text-transform: uppercase;
}
.td-kicker-ico {
    display: inline-flex;
    width: 22px;
    height: 22px;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    background: rgba(57, 255, 20, 0.12);
    border: 1px solid rgba(57, 255, 20, 0.25);
}
.td-brand-h {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    font-size: clamp(36px, 3.4vw, 44px);
    line-height: 1.02;
    margin: 0 0 18px;
}
.td-brand-h-accent {
    color: var(--td-green);
}
.td-brand-lead {
    color: var(--td-soft);
    font-size: 15px;
    line-height: 1.6;
    margin: 0 0 32px;
}
.td-features {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.td-feature {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 14px;
    border-radius: 12px;
    border: 1px solid var(--td-line);
    background: linear-gradient(165deg, rgba(19, 26, 38, 0.75), rgba(13, 18, 32, 0.9));
    transition: border-color 0.2s ease, transform 0.2s ease;
}
.td-feature:hover {
    border-color: color-mix(in srgb, var(--td-green) 30%, var(--td-line));
    transform: translateX(2px);
}
.td-feature-ico {
    width: 40px;
    height: 40px;
    border-radius: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}
.td-feature-ico--green {
    color: var(--td-green);
    background: rgba(57, 255, 20, 0.1);
    border: 1px solid rgba(57, 255, 20, 0.22);
}
.td-feature-ico--cyan {
    color: var(--td-cyan);
    background: rgba(34, 211, 238, 0.1);
    border: 1px solid rgba(34, 211, 238, 0.22);
}
.td-feature-ico--pink {
    color: var(--td-pink);
    background: rgba(251, 44, 95, 0.1);
    border: 1px solid rgba(251, 44, 95, 0.22);
}
.td-feature-txt {
    font-size: 14px;
    line-height: 1.4;
    color: #cbd5e1;
}
.td-brand-foot {
    color: #475569;
    font-size: 12px;
    position: relative;
    z-index: 1;
}

.td-form-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px;
    position: relative;
    z-index: 1;
}
.td-form {
    width: 100%;
    max-width: 420px;
}
.td-mobile-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
}
.td-mobile-logo {
    display: block;
}

.td-rise {
    animation: td-rise 0.65s ease both;
    animation-delay: var(--delay, 0s);
}
.td-rise--delay {
    animation-delay: 0.1s;
}
.td-rise--form {
    animation-delay: 0.08s;
}

@keyframes td-rise {
    from {
        opacity: 0;
        transform: translateY(12px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
@keyframes td-board-drift {
    0%,
    100% {
        transform: rotate(-3deg) translateY(0);
    }
    50% {
        transform: rotate(2deg) translateY(-8px);
    }
}

@media (min-width: 960px) {
    .td-brand {
        display: flex;
    }
    .td-mobile-top {
        display: none;
    }
}

@media (prefers-reduced-motion: reduce) {
    .td-rise,
    .td-board {
        animation: none;
    }
}
</style>
