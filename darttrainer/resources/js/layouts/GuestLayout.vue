<script setup lang="ts">
/**
 * Guest shell for marketing and legal pages — matches Welcome athletic surface.
 */
import AppVersionLabel from '@/components/AppVersionLabel.vue';
import BrandLogo from '@/components/BrandLogo.vue';
import CookieConsent from '@/components/CookieConsent.vue';
import LanguageSwitcher from '@/components/LanguageSwitcher.vue';
import { useCookieConsent } from '@/composables/useCookieConsent';
import { useLocale } from '@/composables/useLocale';
import { Link } from '@inertiajs/vue3';

const { t } = useLocale();
const { openSettings } = useCookieConsent();
</script>

<template>
    <div class="gl">
        <div class="gl-atmosphere" aria-hidden="true">
            <div class="gl-glow gl-glow--a" />
            <div class="gl-glow gl-glow--b" />
            <div class="gl-gridlines" />
        </div>

        <header class="gl-top">
            <Link :href="route('home')" class="gl-brand" :aria-label="t('legal.back')">
                <BrandLogo :width="160" class="gl-brand-logo" />
            </Link>
            <LanguageSwitcher />
        </header>

        <main class="gl-main">
            <slot />
        </main>

        <footer class="gl-foot">
            <p class="gl-foot-copy">
                {{ t('auth.brand.copyright') }}
                <AppVersionLabel />
            </p>
            <nav class="gl-foot-nav" :aria-label="t('legal.footer.terms')">
                <Link :href="route('terms')" class="gl-foot-link">{{ t('legal.footer.terms') }}</Link>
                <Link :href="route('privacy')" class="gl-foot-link">{{ t('legal.footer.privacy') }}</Link>
                <button type="button" class="gl-foot-link gl-foot-btn" @click="openSettings">
                    {{ t('cookies.banner.settings') }}
                </button>
            </nav>
        </footer>

        <CookieConsent />
    </div>
</template>

<style scoped>
.gl {
    --td-bg: #0b0f19;
    --td-line: #1f2937;
    --td-muted: #64748b;
    --td-soft: #94a3b8;
    --td-text: #f4f4f5;
    --td-green: #39ff14;

    position: relative;
    isolation: isolate;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    overflow-x: clip;
    background: var(--td-bg);
    color: var(--td-text);
    font-family: Inter, sans-serif;
}

.gl-atmosphere {
    pointer-events: none;
    position: absolute;
    inset: 0;
    z-index: -1;
    overflow: hidden;
}
.gl-glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(8px);
}
.gl-glow--a {
    top: -12%;
    left: -8%;
    width: 55vw;
    height: 55vw;
    max-width: 640px;
    max-height: 640px;
    background: radial-gradient(circle, rgba(57, 255, 20, 0.14), transparent 68%);
}
.gl-glow--b {
    top: 18%;
    right: -18%;
    width: 50vw;
    height: 50vw;
    max-width: 560px;
    max-height: 560px;
    background: radial-gradient(circle, rgba(34, 211, 238, 0.08), transparent 70%);
}
.gl-gridlines {
    position: absolute;
    inset: 0;
    opacity: 0.35;
    background-image:
        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.55), transparent 72%);
}

.gl-top {
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
.gl-brand {
    display: inline-flex;
    flex-shrink: 1;
    min-width: 0;
    text-decoration: none;
}
.gl-brand-logo {
    display: block;
    max-width: 100%;
    height: auto;
}

.gl-main {
    flex: 1;
    width: min(760px, 100%);
    margin: 0 auto;
    padding: 40px 28px 56px;
}

.gl-foot {
    border-top: 1px solid var(--td-line);
    padding: 20px 28px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px 20px;
}
.gl-foot-copy {
    margin: 0;
    color: var(--td-muted);
    font-size: 13px;
}
.gl-foot-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 18px;
}
.gl-foot-link {
    color: var(--td-soft);
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s ease;
}
.gl-foot-link:hover {
    color: var(--td-green);
}
.gl-foot-btn {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-family: inherit;
}

@media (prefers-reduced-motion: reduce) {
    .gl-foot-link {
        transition: none;
    }
}
</style>
