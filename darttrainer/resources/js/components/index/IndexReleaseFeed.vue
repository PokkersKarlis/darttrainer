<script setup lang="ts">
import DiscordIcon from '@/components/icons/DiscordIcon.vue';
import { useAppVersion } from '@/composables/useAppVersion';
import { useLocale } from '@/composables/useLocale';
import { Rocket, ShieldCheck, Target, Mail } from 'lucide-vue-next';

const BUGS_EMAIL = 'bugs@traindart.com';
const DISCORD_URL = 'https://discord.gg/9rKCHVu4V';

const { t } = useLocale();
const { version } = useAppVersion();
</script>

<template>
    <section class="ix-releases ix-rise" aria-labelledby="ix-releases-title">
        <header class="ix-releases-head">
            <p class="ix-releases-kicker">TrainDart</p>
            <h1 id="ix-releases-title" class="ix-releases-title">{{ t('index.releases.title') }}</h1>
            <p class="ix-releases-lead">{{ t('index.releases.lead') }}</p>
        </header>

        <div class="ix-releases-grid">
            <article class="ix-release ix-release--upcoming">
                <span class="ix-release-badge ix-release-badge--upcoming">
                    {{ t('index.releases.upcoming.badge') }}
                </span>
                <span class="ix-release-icon ix-release-icon--upcoming" aria-hidden="true">
                    <Rocket :size="20" :stroke-width="2.2" />
                </span>
                <h2 class="ix-release-title">{{ t('index.releases.upcoming.title') }}</h2>
                <p class="ix-release-text">{{ t('index.releases.upcoming.body') }}</p>
            </article>

            <article class="ix-release ix-release--games">
                <span class="ix-release-badge ix-release-badge--games">
                    {{ t('index.releases.games.badge') }}
                </span>
                <span class="ix-release-icon ix-release-icon--games" aria-hidden="true">
                    <Target :size="20" :stroke-width="2.2" />
                </span>
                <h2 class="ix-release-title">{{ t('index.releases.games.title') }}</h2>
                <p class="ix-release-text">{{ t('index.releases.games.body') }}</p>
            </article>

            <article class="ix-release ix-release--latest">
                <span class="ix-release-badge ix-release-badge--latest">
                    {{ t('index.releases.latest.badge') }}
                </span>
                <span class="ix-release-icon ix-release-icon--latest" aria-hidden="true">
                    <ShieldCheck :size="20" :stroke-width="2.2" />
                </span>
                <h2 class="ix-release-title">{{ t('index.releases.latest.title') }}</h2>
                <p class="ix-release-text">{{ t('index.releases.latest.body') }}</p>
                <p v-if="version" class="ix-release-version">{{ t('index.releases.latest.version', { version }) }}</p>
            </article>
        </div>

        <aside class="ix-support" aria-labelledby="ix-support-title">
            <div class="ix-support-copy">
                <h2 id="ix-support-title" class="ix-support-title">{{ t('index.support.title') }}</h2>
                <p class="ix-support-text">{{ t('index.support.body') }}</p>
            </div>

            <div class="ix-support-links">
                <a class="ix-support-link" :href="`mailto:${BUGS_EMAIL}`">
                    <span class="ix-support-link-icon" aria-hidden="true">
                        <Mail :size="18" :stroke-width="2.2" />
                    </span>
                    <span class="ix-support-link-copy">
                        <span class="ix-support-link-label">{{ t('index.support.emailLabel') }}</span>
                        <span class="ix-support-link-value">{{ BUGS_EMAIL }}</span>
                    </span>
                </a>

                <a
                    class="ix-support-link"
                    :href="DISCORD_URL"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <span class="ix-support-link-icon ix-support-link-icon--discord" aria-hidden="true">
                        <DiscordIcon :size="18" />
                    </span>
                    <span class="ix-support-link-copy">
                        <span class="ix-support-link-label">{{ t('index.support.discordLabel') }}</span>
                        <span class="ix-support-link-value">{{ t('index.support.discordAction') }}</span>
                    </span>
                </a>
            </div>
        </aside>
    </section>
</template>

<style scoped>
.ix-releases {
    width: 100%;
}

.ix-releases-head {
    margin-bottom: calc(18px * var(--ix-scale, 1));
}

.ix-releases-kicker {
    margin: 0 0 calc(10px * var(--ix-scale, 1));
    font-size: var(--ix-kicker-size, 12px);
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ix-green, #39ff14);
}

.ix-releases-title {
    margin: 0 0 calc(8px * var(--ix-scale, 1));
    font-family: 'Barlow Condensed', sans-serif;
    font-size: var(--ix-title-size, clamp(32px, 5vw, 48px));
    font-weight: 900;
    line-height: 1;
    letter-spacing: 0.02em;
    text-transform: uppercase;
}

.ix-releases-lead {
    margin: 0;
    max-width: 52ch;
    font-size: calc(14px * var(--ix-scale, 1));
    line-height: 1.55;
    color: color-mix(in srgb, var(--ix-text, #f4f4f5) 82%, var(--ix-muted, #64748b));
}

.ix-releases-grid {
    display: grid;
    gap: calc(14px * var(--ix-scale, 1));
    grid-template-columns: 1fr;
}

@media (min-width: 720px) {
    .ix-releases-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .ix-release--latest {
        grid-column: 1 / -1;
    }
}

.ix-release {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: calc(10px * var(--ix-scale, 1));
    min-height: calc(148px * var(--ix-scale, 1));
    padding: calc(18px * var(--ix-scale, 1)) calc(18px * var(--ix-scale, 1)) calc(16px * var(--ix-scale, 1));
    border-radius: calc(16px * var(--ix-scale, 1));
    border: 1px solid var(--ix-line, #1f2937);
    background: color-mix(in srgb, var(--ix-panel, #0d1220) 92%, transparent);
    overflow: hidden;
    box-shadow: 0 calc(16px * var(--ix-scale, 1)) calc(32px * var(--ix-scale, 1)) rgba(0, 0, 0, 0.22);
}

.ix-release::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.55;
    background: radial-gradient(circle at top right, var(--ix-release-glow, transparent), transparent 62%);
}

.ix-release-badge {
    position: relative;
    z-index: 1;
    align-self: flex-start;
    padding: calc(5px * var(--ix-scale, 1)) calc(10px * var(--ix-scale, 1));
    border-radius: 999px;
    border: 1px solid transparent;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: calc(11px * var(--ix-scale, 1));
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}

.ix-release-icon {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: calc(40px * var(--ix-scale, 1));
    height: calc(40px * var(--ix-scale, 1));
    border-radius: calc(11px * var(--ix-scale, 1));
    border: 1px solid var(--ix-line, #1f2937);
}

.ix-release-title {
    position: relative;
    z-index: 1;
    margin: 0;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: calc(22px * var(--ix-scale, 1));
    font-weight: 900;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    line-height: 1.05;
}

.ix-release-text {
    position: relative;
    z-index: 1;
    margin: 0;
    font-size: calc(13px * var(--ix-scale, 1));
    line-height: 1.55;
    color: color-mix(in srgb, var(--ix-text, #f4f4f5) 84%, var(--ix-muted, #64748b));
}

.ix-release-version {
    position: relative;
    z-index: 1;
    margin: calc(4px * var(--ix-scale, 1)) 0 0;
    font-size: calc(11px * var(--ix-scale, 1));
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ix-muted, #64748b);
}

.ix-release--upcoming {
    --ix-release-glow: rgba(34, 211, 238, 0.16);
    border-color: color-mix(in srgb, var(--ix-cyan, #22d3ee) 28%, var(--ix-line, #1f2937));
}

.ix-release-badge--upcoming {
    color: #0b0f19;
    background: color-mix(in srgb, var(--ix-cyan, #22d3ee) 88%, white);
    border-color: color-mix(in srgb, var(--ix-cyan, #22d3ee) 50%, var(--ix-line, #1f2937));
}

.ix-release-icon--upcoming {
    color: var(--ix-cyan, #22d3ee);
    border-color: color-mix(in srgb, var(--ix-cyan, #22d3ee) 30%, var(--ix-line, #1f2937));
    background: color-mix(in srgb, var(--ix-cyan, #22d3ee) 10%, var(--ix-panel, #0d1220));
}

.ix-release--games {
    --ix-release-glow: rgba(57, 255, 20, 0.14);
    border-color: color-mix(in srgb, var(--ix-green, #39ff14) 24%, var(--ix-line, #1f2937));
}

.ix-release-badge--games {
    color: #0b0f19;
    background: color-mix(in srgb, var(--ix-green, #39ff14) 86%, #0b0f19);
    border-color: color-mix(in srgb, var(--ix-green, #39ff14) 45%, var(--ix-line, #1f2937));
}

.ix-release-icon--games {
    color: var(--ix-green, #39ff14);
    border-color: color-mix(in srgb, var(--ix-green, #39ff14) 28%, var(--ix-line, #1f2937));
    background: color-mix(in srgb, var(--ix-green, #39ff14) 8%, var(--ix-panel, #0d1220));
}

.ix-release--latest {
    --ix-release-glow: rgba(251, 191, 36, 0.1);
    border-color: color-mix(in srgb, #fbbf24 22%, var(--ix-line, #1f2937));
}

.ix-release-badge--latest {
    color: #fbbf24;
    background: color-mix(in srgb, #fbbf24 10%, var(--ix-panel, #0d1220));
    border-color: color-mix(in srgb, #fbbf24 28%, var(--ix-line, #1f2937));
}

.ix-release-icon--latest {
    color: #fbbf24;
    border-color: color-mix(in srgb, #fbbf24 24%, var(--ix-line, #1f2937));
    background: color-mix(in srgb, #fbbf24 8%, var(--ix-panel, #0d1220));
}

.ix-support {
    display: flex;
    flex-direction: column;
    gap: calc(16px * var(--ix-scale, 1));
    margin-top: calc(18px * var(--ix-scale, 1));
    padding: calc(18px * var(--ix-scale, 1)) calc(20px * var(--ix-scale, 1));
    border-radius: calc(16px * var(--ix-scale, 1));
    border: 1px solid color-mix(in srgb, var(--ix-cyan, #22d3ee) 18%, var(--ix-line, #1f2937));
    background:
        radial-gradient(circle at top left, rgba(34, 211, 238, 0.08), transparent 55%),
        color-mix(in srgb, var(--ix-panel, #0d1220) 92%, transparent);
    box-shadow: 0 calc(14px * var(--ix-scale, 1)) calc(28px * var(--ix-scale, 1)) rgba(0, 0, 0, 0.2);
}

.ix-support-title {
    margin: 0 0 calc(6px * var(--ix-scale, 1));
    font-family: 'Barlow Condensed', sans-serif;
    font-size: calc(20px * var(--ix-scale, 1));
    font-weight: 900;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

.ix-support-text {
    margin: 0;
    font-size: calc(13px * var(--ix-scale, 1));
    line-height: 1.55;
    color: color-mix(in srgb, var(--ix-text, #f4f4f5) 82%, var(--ix-muted, #64748b));
}

.ix-support-links {
    display: grid;
    gap: calc(10px * var(--ix-scale, 1));
    grid-template-columns: 1fr;
}

@media (min-width: 640px) {
    .ix-support {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    }

    .ix-support-links {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        min-width: min(100%, 520px);
    }
}

.ix-support-link {
    display: flex;
    align-items: center;
    gap: calc(12px * var(--ix-scale, 1));
    padding: calc(12px * var(--ix-scale, 1)) calc(14px * var(--ix-scale, 1));
    border-radius: calc(12px * var(--ix-scale, 1));
    border: 1px solid var(--ix-line, #1f2937);
    background: color-mix(in srgb, var(--ix-bg, #0b0f19) 55%, transparent);
    color: var(--ix-text, #f4f4f5);
    text-decoration: none;
    transition:
        border-color 0.18s ease,
        transform 0.18s ease,
        box-shadow 0.18s ease;
}

.ix-support-link:hover {
    border-color: color-mix(in srgb, var(--ix-green, #39ff14) 28%, var(--ix-line, #1f2937));
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
}

.ix-support-link-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: calc(38px * var(--ix-scale, 1));
    height: calc(38px * var(--ix-scale, 1));
    border-radius: calc(10px * var(--ix-scale, 1));
    border: 1px solid color-mix(in srgb, var(--ix-green, #39ff14) 24%, var(--ix-line, #1f2937));
    color: var(--ix-green, #39ff14);
    background: color-mix(in srgb, var(--ix-green, #39ff14) 8%, var(--ix-panel, #0d1220));
}

.ix-support-link-icon--discord {
    color: #5865f2;
    border-color: color-mix(in srgb, #5865f2 35%, var(--ix-line, #1f2937));
    background: color-mix(in srgb, #5865f2 12%, var(--ix-panel, #0d1220));
}

.ix-support-link-copy {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
}

.ix-support-link-label {
    font-size: calc(10px * var(--ix-scale, 1));
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ix-muted, #64748b);
}

.ix-support-link-value {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: calc(15px * var(--ix-scale, 1));
    font-weight: 800;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    line-height: 1.1;
    overflow: hidden;
    text-overflow: ellipsis;
}

.ix-rise {
    animation: ix-rise 0.55s ease both;
}

@keyframes ix-rise {
    from {
        opacity: 0;
        transform: translateY(calc(14px * var(--ix-scale, 1)));
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (prefers-reduced-motion: reduce) {
    .ix-rise {
        animation: none;
    }

    .ix-support-link {
        transition: none;
    }
}
</style>
