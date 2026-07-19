<script setup lang="ts">
/**
 * Guest landing — athletic TrainDart surface with dartboard visual + feature icons.
 * Copy from guest/seo/features/closing catalogs.
 */
import AppVersionLabel from '@/components/AppVersionLabel.vue';
import AppTopBar from '@/components/AppTopBar.vue';
import CookieConsent from '@/components/CookieConsent.vue';
import { useCookieConsent } from '@/composables/useCookieConsent';
import { useLocale } from '@/composables/useLocale';
import { Head, Link, usePage } from '@inertiajs/vue3';
import { computed } from 'vue';
import type { SharedData } from '@/types';

const { t } = useLocale();
const { openSettings } = useCookieConsent();
const page = usePage<SharedData>();
const isAuthenticated = computed(() => !!page.props.auth.user);

type FeatureKey = 'stats' | 'training' | 'online' | 'data' | 'tournaments' | 'aiReports';
type FeatureTone = 'green' | 'cyan' | 'pink' | 'amber' | 'violet';
type FeatureKind = 'bars' | 'pulse' | 'board' | 'chart' | 'brackets' | 'article';

type FeatureItem = {
    key: FeatureKey;
    tone: FeatureTone;
    kind: FeatureKind;
    note?: boolean;
};

const features: FeatureItem[] = [
    { key: 'stats', tone: 'green', kind: 'bars' },
    { key: 'training', tone: 'cyan', kind: 'pulse' },
    { key: 'online', tone: 'pink', kind: 'board' },
    { key: 'data', tone: 'amber', kind: 'chart' },
    { key: 'tournaments', tone: 'green', kind: 'brackets', note: true },
    { key: 'aiReports', tone: 'violet', kind: 'article' },
];
</script>

<template>
    <Head>
        <title>{{ t('seo.title') }}</title>
        <meta head-key="description" name="description" :content="t('seo.description')" />
    </Head>

    <div class="tw">
        <div class="tw-atmosphere" aria-hidden="true">
            <div class="tw-glow tw-glow--a" />
            <div class="tw-glow tw-glow--b" />
            <div class="tw-gridlines" />
        </div>

        <AppTopBar />

        <section class="tw-hero">
            <div class="tw-hero-copy tw-rise">
                <p class="tw-kicker">
                    <span class="tw-kicker-ico" aria-hidden="true">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                            <circle cx="12" cy="12" r="9" />
                            <circle cx="12" cy="12" r="5" />
                            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                        </svg>
                    </span>
                    TrainDart
                </p>
                <h1 class="tw-h1">
                    <span>{{ t('guest.h1Line1') }}</span>
                    <span class="tw-h1-accent">{{ t('guest.h1Line2') }}</span>
                </h1>
                <p class="tw-lead">{{ t('guest.lead') }}</p>
                <div class="tw-hero-actions">
                    <Link v-if="!isAuthenticated" :href="route('register')" class="tw-cta tw-cta--lg">
                        {{ t('guest.register') }}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
                            <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                    </Link>
                    <Link v-else :href="route('profile.edit')" class="tw-cta tw-cta--lg">
                        {{ t('menu.settings') }}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
                            <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                    </Link>
                    <Link v-if="!isAuthenticated" :href="route('login')" class="tw-cta-ghost">{{ t('guest.login') }}</Link>
                </div>
            </div>

            <div class="tw-hero-visual tw-rise tw-rise--delay" aria-hidden="true">
                <svg class="tw-board" viewBox="0 0 320 320" fill="none">
                    <circle class="tw-board-ring tw-board-ring--outer" cx="160" cy="160" r="148" />
                    <circle class="tw-board-ring" cx="160" cy="160" r="118" />
                    <circle class="tw-board-ring tw-board-ring--mid" cx="160" cy="160" r="78" />
                    <circle class="tw-board-ring" cx="160" cy="160" r="42" />
                    <circle class="tw-board-bull" cx="160" cy="160" r="14" />
                    <g class="tw-board-spokes" stroke-linecap="round">
                        <path d="M160 18v46M160 256v46M18 160h46M256 160h46" />
                        <path d="M55 55l32 32M233 233l32 32M265 55l-32 32M87 233l-32 32" />
                    </g>
                    <g class="tw-dart">
                        <path d="M214 78l28-28" stroke-width="3" stroke-linecap="round" />
                        <path d="M238 54l18-6-6 18z" fill="currentColor" stroke="none" />
                        <circle cx="214" cy="78" r="5" fill="currentColor" stroke="none" />
                    </g>
                </svg>
                <div class="tw-score-chip">
                    <span class="tw-score-label">3DA</span>
                    <span class="tw-score-value">74.2</span>
                </div>
            </div>
        </section>

        <section class="tw-features">
            <div class="tw-section-head tw-rise">
                <h2 class="tw-section-title">{{ t('features.sectionTitle') }}</h2>
                <p class="tw-section-lead">{{ t('features.sectionLead') }}</p>
            </div>
            <div class="tw-grid">
                <article
                    v-for="(f, i) in features"
                    :key="f.key"
                    class="tw-feature tw-rise"
                    :style="{ '--delay': `${0.08 + i * 0.06}s` }"
                >
                    <span class="tw-feature-ico" :class="`tw-feature-ico--${f.tone}`" aria-hidden="true">
                        <!-- Stats: bar chart -->
                        <svg v-if="f.kind === 'bars'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                            <path d="M4 19V9M10 19V5M16 19v-7M20 19H3" />
                        </svg>
                        <!-- Training: pulse / drill -->
                        <svg v-else-if="f.kind === 'pulse'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 12h4l3 8 4-16 3 8h4" />
                        </svg>
                        <!-- Online: dartboard -->
                        <svg v-else-if="f.kind === 'board'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="9" />
                            <circle cx="12" cy="12" r="5.5" />
                            <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
                        </svg>
                        <!-- Match analysis: trend chart -->
                        <svg v-else-if="f.kind === 'chart'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 19V5M4 19h16" />
                            <path d="M8 17V11M12 17V7M16 17v-4" />
                        </svg>
                        <!-- Tournaments + API: bracket tree -->
                        <svg v-else-if="f.kind === 'brackets'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="5" cy="6" r="2" />
                            <circle cx="5" cy="18" r="2" />
                            <circle cx="19" cy="12" r="2" />
                            <path d="M7 6h8M7 18h8M7 6v12" />
                            <path d="M15 12h4" />
                        </svg>
                        <!-- AI reports: article -->
                        <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M6 4h10l4 4v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" />
                            <path d="M14 4v4h4M8 12h8M8 16h6" />
                            <path d="M18 3l2 2-3 3" />
                        </svg>
                    </span>
                    <h3 class="tw-feature-title">{{ t(`features.${f.key}.title`) }}</h3>
                    <p class="tw-feature-desc">{{ t(`features.${f.key}.desc`) }}</p>
                    <p v-if="f.note" class="tw-feature-note">{{ t(`features.${f.key}.note`) }}</p>
                </article>
            </div>
        </section>

        <section class="tw-closing tw-rise">
            <div class="tw-closing-panel">
                <div class="tw-closing-copy">
                    <h2 class="tw-section-title">{{ t('closing.title') }}</h2>
                    <p class="tw-section-lead tw-section-lead--tight">{{ t('closing.lead') }}</p>
                </div>
                <Link v-if="!isAuthenticated" :href="route('register')" class="tw-cta tw-cta--lg">
                    {{ t('closing.cta') }}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                </Link>
            </div>
        </section>

        <footer class="tw-foot">
            <p class="tw-foot-copy">
                {{ t('auth.brand.copyright') }}
                <AppVersionLabel />
            </p>
            <nav class="tw-foot-nav" :aria-label="t('legal.footer.terms')">
                <Link :href="route('terms')" class="tw-foot-link">{{ t('legal.footer.terms') }}</Link>
                <Link :href="route('privacy')" class="tw-foot-link">{{ t('legal.footer.privacy') }}</Link>
                <button type="button" class="tw-foot-link tw-foot-btn" @click="openSettings">
                    {{ t('cookies.banner.settings') }}
                </button>
            </nav>
        </footer>

        <CookieConsent />
    </div>
</template>

<style scoped>
.tw {
    --td-bg: #0b0f19;
    --td-panel: #0d1220;
    --td-line: #1f2937;
    --td-muted: #64748b;
    --td-soft: #94a3b8;
    --td-text: #f4f4f5;
    --td-green: #39ff14;
    --td-cyan: #22d3ee;
    --td-pink: #fb2c5f;
    --td-amber: #fbbf24;
    --td-violet: #a78bfa;

    position: relative;
    isolation: isolate;
    min-height: 100vh;
    overflow-x: clip;
    background: var(--td-bg);
    color: var(--td-text);
    font-family: Inter, sans-serif;
}

.tw-atmosphere {
    pointer-events: none;
    position: absolute;
    inset: 0;
    z-index: -1;
    overflow: hidden;
}
.tw-glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(8px);
}
.tw-glow--a {
    top: -12%;
    left: -8%;
    width: 55vw;
    height: 55vw;
    max-width: 640px;
    max-height: 640px;
    background: radial-gradient(circle, rgba(57, 255, 20, 0.14), transparent 68%);
}
.tw-glow--b {
    top: 18%;
    right: -18%;
    width: 50vw;
    height: 50vw;
    max-width: 560px;
    max-height: 560px;
    background: radial-gradient(circle, rgba(34, 211, 238, 0.08), transparent 70%);
}
.tw-gridlines {
    position: absolute;
    inset: 0;
    opacity: 0.35;
    background-image:
        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.55), transparent 72%);
}

.tw-top {
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
.tw-brand {
    display: inline-flex;
    flex-shrink: 1;
    min-width: 0;
    text-decoration: none;
}
.tw-brand-logo {
    display: block;
    max-width: 100%;
    height: auto;
}
.tw-top-end {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
}
.tw-top-nav {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: nowrap;
}
.tw-link {
    color: var(--td-soft);
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s ease;
}
.tw-link:hover {
    color: var(--td-green);
}

.tw-cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 10px;
    background: var(--td-green);
    color: var(--td-bg);
    font-weight: 800;
    font-family: 'Barlow Condensed', sans-serif;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    font-size: 14px;
    text-decoration: none;
    transition: transform 0.2s ease, filter 0.2s ease;
}
.tw-cta:hover {
    transform: translateY(-1px);
    filter: brightness(1.05);
}
.tw-cta--lg {
    padding: 14px 22px;
    font-size: 16px;
}
.tw-cta-ghost {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 13px 20px;
    border-radius: 10px;
    border: 1px solid #334155;
    color: var(--td-text);
    font-weight: 800;
    font-family: 'Barlow Condensed', sans-serif;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    font-size: 15px;
    text-decoration: none;
    background: transparent;
    transition: border-color 0.2s ease, color 0.2s ease;
}
.tw-cta-ghost:hover {
    border-color: var(--td-green);
    color: var(--td-green);
}

.tw-hero {
    max-width: 1120px;
    margin: 0 auto;
    padding: 56px 28px 48px;
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
    gap: 40px;
    align-items: center;
}
.tw-kicker {
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
.tw-kicker-ico {
    display: inline-flex;
    width: 22px;
    height: 22px;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    background: rgba(57, 255, 20, 0.12);
    border: 1px solid rgba(57, 255, 20, 0.25);
}
.tw-h1 {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    font-size: clamp(40px, 6.2vw, 64px);
    line-height: 0.98;
    margin: 0 0 18px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.tw-h1-accent {
    color: var(--td-green);
}
.tw-lead {
    max-width: 540px;
    color: var(--td-soft);
    font-size: 16px;
    line-height: 1.65;
    margin: 0 0 28px;
}
.tw-hero-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px 14px;
}
.tw-reassure {
    margin: 0;
    width: 100%;
    color: var(--td-muted);
    font-size: 13px;
}

.tw-hero-visual {
    position: relative;
    display: grid;
    place-items: center;
    min-height: 320px;
}
.tw-board {
    width: min(100%, 360px);
    aspect-ratio: 1;
    color: var(--td-green);
    animation: tw-board-drift 10s ease-in-out infinite;
}
.tw-board-ring {
    stroke: rgba(148, 163, 184, 0.28);
    stroke-width: 1.5;
}
.tw-board-ring--outer {
    stroke: rgba(57, 255, 20, 0.35);
    stroke-width: 2;
}
.tw-board-ring--mid {
    stroke: rgba(34, 211, 238, 0.35);
}
.tw-board-bull {
    fill: var(--td-green);
    opacity: 0.9;
}
.tw-board-spokes {
    stroke: rgba(148, 163, 184, 0.22);
    stroke-width: 1.5;
}
.tw-dart {
    color: var(--td-pink);
    animation: tw-dart-pulse 2.8s ease-in-out infinite;
}
.tw-score-chip {
    position: absolute;
    right: 8%;
    bottom: 12%;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 10px 14px;
    border-radius: 12px;
    background: color-mix(in srgb, var(--td-panel) 92%, transparent);
    border: 1px solid var(--td-line);
    backdrop-filter: blur(6px);
    animation: tw-chip-in 0.7s ease both;
    animation-delay: 0.35s;
}
.tw-score-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1px;
    color: var(--td-muted);
    text-transform: uppercase;
}
.tw-score-value {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 28px;
    font-weight: 900;
    line-height: 1;
    color: var(--td-cyan);
}

.tw-section-title--wide {
    max-width: 22ch;
}

.tw-spotlight,
.tw-reports {
    max-width: 1120px;
    margin: 0 auto;
    padding: 12px 28px 56px;
}
.tw-spotlight {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(280px, 0.95fr);
    gap: 36px;
    align-items: center;
}
.tw-checklist {
    list-style: none;
    margin: 22px 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.tw-checklist li {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--td-soft);
    font-size: 14px;
    font-weight: 600;
}
.tw-check {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 7px;
    flex-shrink: 0;
    color: var(--td-green);
    background: rgba(57, 255, 20, 0.12);
    border: 1px solid rgba(57, 255, 20, 0.25);
}

.tw-bracket {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 22px;
    border-radius: 16px;
    border: 1px solid var(--td-line);
    background: linear-gradient(165deg, rgba(19, 26, 38, 0.92), rgba(13, 18, 32, 0.98));
}
.tw-bracket-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
    flex: 1;
}
.tw-bracket-col--final {
    flex: 0.95;
}
.tw-bracket-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--td-muted);
}
.tw-match {
    border: 1px solid var(--td-line);
    border-radius: 12px;
    overflow: hidden;
    background: rgba(11, 15, 25, 0.55);
}
.tw-match--final {
    border-color: color-mix(in srgb, var(--td-green) 35%, var(--td-line));
}
.tw-match-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 12px;
    font-size: 13px;
    color: var(--td-soft);
    border-bottom: 1px solid var(--td-line);
}
.tw-match-row:last-child {
    border-bottom: none;
}
.tw-match-row b {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 16px;
    color: var(--td-text);
}
.tw-match-row--win {
    color: var(--td-text);
    background: rgba(57, 255, 20, 0.08);
}
.tw-match-row--win b {
    color: var(--td-green);
}
.tw-bracket-join {
    width: 18px;
    height: 88px;
    border-right: 2px solid color-mix(in srgb, var(--td-cyan) 45%, var(--td-line));
    border-top: 2px solid color-mix(in srgb, var(--td-cyan) 45%, var(--td-line));
    border-bottom: 2px solid color-mix(in srgb, var(--td-cyan) 45%, var(--td-line));
    border-radius: 0 10px 10px 0;
    flex-shrink: 0;
    opacity: 0.7;
}
.tw-champ {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
    padding: 8px 12px;
    border-radius: 10px;
    color: var(--td-amber);
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    font-size: 13px;
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid rgba(251, 191, 36, 0.22);
}

.tw-posts {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
}
.tw-post {
    padding: 18px;
    border-radius: 16px;
    border: 1px solid var(--td-line);
    background: linear-gradient(165deg, rgba(19, 26, 38, 0.92), rgba(13, 18, 32, 0.98));
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
    transition: border-color 0.25s ease, transform 0.25s ease;
}
.tw-post:hover {
    transform: translateY(-2px);
    border-color: color-mix(in srgb, var(--td-cyan) 30%, var(--td-line));
}
.tw-post-head {
    display: flex;
    align-items: center;
    gap: 10px;
}
.tw-post-avatar {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: 13px;
    color: var(--td-bg);
    background: var(--td-green);
    flex-shrink: 0;
}
.tw-post-avatar--fb {
    background: #1877f2;
    color: #fff;
    border-radius: 50%;
    font-size: 18px;
    text-transform: lowercase;
}
.tw-post-head strong {
    display: block;
    font-size: 13px;
    font-weight: 700;
    color: var(--td-text);
}
.tw-post-head small {
    display: block;
    margin-top: 2px;
    font-size: 11px;
    color: var(--td-muted);
}
.tw-post-media {
    aspect-ratio: 1;
    border-radius: 14px;
    display: grid;
    place-items: center;
    gap: 4px;
    background:
        radial-gradient(circle at 30% 25%, rgba(57, 255, 20, 0.2), transparent 45%),
        radial-gradient(circle at 70% 70%, rgba(251, 44, 95, 0.18), transparent 40%),
        #101826;
    border: 1px solid var(--td-line);
}
.tw-post-media-score {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: 56px;
    line-height: 1;
    color: var(--td-green);
    letter-spacing: 1px;
}
.tw-post-media-sub {
    font-size: 12px;
    font-weight: 600;
    color: var(--td-soft);
}
.tw-post-caption,
.tw-post-body {
    margin: 0;
    color: var(--td-soft);
    font-size: 13px;
    line-height: 1.5;
}
.tw-post-meta {
    margin-top: auto;
    padding-top: 10px;
    border-top: 1px solid var(--td-line);
    font-size: 11px;
    color: var(--td-muted);
    font-weight: 600;
}
.tw-post-tag {
    align-self: flex-start;
    padding: 4px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.3px;
    color: var(--td-amber);
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid rgba(251, 191, 36, 0.22);
}
.tw-post-blog-title {
    margin: 0;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    font-size: 20px;
    line-height: 1.15;
}
.tw-post-platform {
    margin-top: auto;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    color: var(--td-cyan);
}
.tw-post--ig .tw-post-caption {
    font-weight: 600;
    color: var(--td-text);
}

.tw-features,
.tw-closing {
    max-width: 1120px;
    margin: 0 auto;
    padding: 20px 28px 56px;
}
.tw-section-head {
    margin-bottom: 28px;
}
.tw-section-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: clamp(26px, 3.5vw, 34px);
    margin: 0 0 8px;
}
.tw-section-lead {
    color: var(--td-muted);
    font-size: 15px;
    line-height: 1.55;
    margin: 0;
    max-width: 640px;
}
.tw-section-lead--tight {
    margin-bottom: 0;
}
.tw-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
}
.tw-feature {
    padding: 22px;
    border: 1px solid var(--td-line);
    border-radius: 14px;
    background: linear-gradient(165deg, rgba(19, 26, 38, 0.9), rgba(13, 18, 32, 0.96));
    transition: border-color 0.25s ease, transform 0.25s ease;
}
.tw-feature:hover {
    border-color: color-mix(in srgb, var(--td-green) 35%, var(--td-line));
    transform: translateY(-2px);
}
.tw-feature-ico {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    margin-bottom: 14px;
}
.tw-feature-ico--green {
    color: var(--td-green);
    background: rgba(57, 255, 20, 0.1);
    border: 1px solid rgba(57, 255, 20, 0.22);
}
.tw-feature-ico--cyan {
    color: var(--td-cyan);
    background: rgba(34, 211, 238, 0.1);
    border: 1px solid rgba(34, 211, 238, 0.22);
}
.tw-feature-ico--pink {
    color: var(--td-pink);
    background: rgba(251, 44, 95, 0.1);
    border: 1px solid rgba(251, 44, 95, 0.22);
}
.tw-feature-ico--amber {
    color: var(--td-amber);
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid rgba(251, 191, 36, 0.22);
}
.tw-feature-ico--violet {
    color: var(--td-violet);
    background: rgba(167, 139, 250, 0.1);
    border: 1px solid rgba(167, 139, 250, 0.22);
}
.tw-feature-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    font-size: 19px;
    margin: 0 0 8px;
}
.tw-feature-desc {
    margin: 0;
    color: var(--td-soft);
    font-size: 14px;
    line-height: 1.55;
}
.tw-feature-note {
    margin: 10px 0 0;
    font-size: 12px;
    line-height: 1.45;
    color: var(--td-muted);
    font-style: italic;
}

.tw-closing-panel {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding: 28px;
    border-radius: 16px;
    border: 1px solid color-mix(in srgb, var(--td-green) 28%, var(--td-line));
    background:
        linear-gradient(120deg, rgba(57, 255, 20, 0.08), transparent 42%),
        var(--td-panel);
}
.tw-closing-copy {
    min-width: 0;
}

.tw-foot {
    border-top: 1px solid var(--td-line);
    padding: 20px 28px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px 20px;
}
.tw-foot-copy {
    margin: 0;
    color: var(--td-muted);
    font-size: 13px;
}
.tw-foot-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 18px;
}
.tw-foot-link {
    color: var(--td-soft);
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s ease;
}
.tw-foot-link:hover {
    color: var(--td-green);
}
.tw-foot-btn {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-family: inherit;
}

.tw-rise {
    animation: tw-rise 0.65s ease both;
    animation-delay: var(--delay, 0s);
}
.tw-rise--delay {
    animation-delay: 0.12s;
}

@keyframes tw-rise {
    from {
        opacity: 0;
        transform: translateY(14px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
@keyframes tw-board-drift {
    0%,
    100% {
        transform: rotate(-2deg) translateY(0);
    }
    50% {
        transform: rotate(2deg) translateY(-6px);
    }
}
@keyframes tw-dart-pulse {
    0%,
    100% {
        opacity: 0.85;
        transform: translate(0, 0);
    }
    50% {
        opacity: 1;
        transform: translate(-2px, 2px);
    }
}
@keyframes tw-chip-in {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 640px) {
    .tw-top {
        display: grid;
        grid-template-columns: 1fr auto;
        grid-template-areas:
            'brand lang'
            'nav nav';
        align-items: center;
        padding: 10px 14px 12px;
        gap: 8px 10px;
    }
    .tw-brand {
        grid-area: brand;
    }
    .tw-top-end {
        display: contents;
    }
    .tw-top-lang {
        grid-area: lang;
        justify-self: end;
    }
    .tw-top-nav {
        grid-area: nav;
        justify-content: flex-end;
        gap: 8px;
        width: 100%;
    }
    .tw-brand-logo {
        width: 128px !important;
        height: auto !important;
    }
    .tw-top-end :deep(.lang-switch) {
        padding: 2px;
    }
    .tw-top-end :deep(.lang-btn) {
        padding: 4px 8px;
        font-size: 11px;
    }
    .tw-top-link {
        font-size: 12px;
        white-space: nowrap;
    }
    .tw-top-cta {
        padding: 8px 12px;
        font-size: 12px;
        letter-spacing: 0.3px;
        white-space: nowrap;
    }
}

@media (max-width: 900px) {
    .tw-hero {
        grid-template-columns: 1fr;
        padding-top: 40px;
        gap: 28px;
    }
    .tw-hero-visual {
        order: -1;
        min-height: 240px;
    }
    .tw-board {
        width: min(100%, 260px);
    }
    .tw-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .tw-spotlight {
        grid-template-columns: 1fr;
    }
    .tw-bracket {
        flex-direction: column;
        align-items: stretch;
    }
    .tw-bracket-join {
        width: 100%;
        height: 18px;
        border: none;
        border-bottom: 2px solid color-mix(in srgb, var(--td-cyan) 45%, var(--td-line));
        border-radius: 0;
    }
    .tw-posts {
        grid-template-columns: 1fr;
    }
    .tw-closing-panel {
        flex-direction: column;
        align-items: flex-start;
    }
}

@media (max-width: 560px) {
    .tw-grid {
        grid-template-columns: 1fr;
    }
}

@media (prefers-reduced-motion: reduce) {
    .tw-rise,
    .tw-board,
    .tw-dart,
    .tw-score-chip {
        animation: none;
    }
}
</style>
