<script setup lang="ts">
/**
 * Guest landing — uses guest/seo/features/closing catalogs.
 * Visual language matches AuthShell (dark surface + neon accent).
 */
import BrandLogo from '@/components/BrandLogo.vue';
import LanguageSwitcher from '@/components/LanguageSwitcher.vue';
import { useLocale } from '@/composables/useLocale';
import { Head, Link, usePage } from '@inertiajs/vue3';
import { computed } from 'vue';
import type { SharedData } from '@/types';

const { t } = useLocale();
const page = usePage<SharedData>();
const isAuthenticated = computed(() => !!page.props.auth.user);

const features = [
    { key: 'stats' as const },
    { key: 'training' as const },
    { key: 'online' as const },
    { key: 'tournaments' as const },
];
</script>

<template>
    <Head>
        <title>{{ t('seo.title') }}</title>
        <meta head-key="description" name="description" :content="t('seo.description')" />
    </Head>

    <div class="tw">
        <header class="tw-top">
            <Link href="/" class="tw-brand"><BrandLogo :width="160" /></Link>
            <div class="tw-top-actions">
                <LanguageSwitcher />
                <template v-if="isAuthenticated">
                    <Link :href="route('profile.edit')" class="tw-link">{{ t('menu.profile') }}</Link>
                </template>
                <template v-else>
                    <Link :href="route('login')" class="tw-link">{{ t('guest.login') }}</Link>
                    <Link :href="route('register')" class="tw-cta">{{ t('guest.register') }}</Link>
                </template>
            </div>
        </header>

        <section class="tw-hero">
            <h1 class="tw-h1">
                <span>{{ t('guest.h1Line1') }}</span>
                <span class="tw-h1-accent">{{ t('guest.h1Line2') }}</span>
            </h1>
            <p class="tw-lead">{{ t('guest.lead') }}</p>
            <div class="tw-hero-actions">
                <Link v-if="!isAuthenticated" :href="route('register')" class="tw-cta tw-cta--lg">{{ t('guest.register') }}</Link>
                <Link v-else :href="route('profile.edit')" class="tw-cta tw-cta--lg">{{ t('menu.profile') }}</Link>
                <p class="tw-reassure">{{ t('guest.reassurance') }}</p>
            </div>
        </section>

        <section class="tw-features">
            <h2 class="tw-section-title">{{ t('features.sectionTitle') }}</h2>
            <p class="tw-section-lead">{{ t('features.sectionLead') }}</p>
            <div class="tw-grid">
                <article v-for="f in features" :key="f.key" class="tw-feature">
                    <h3 class="tw-feature-title">{{ t(`features.${f.key}.title`) }}</h3>
                    <p class="tw-feature-desc">{{ t(`features.${f.key}.desc`) }}</p>
                </article>
            </div>
        </section>

        <section class="tw-closing">
            <h2 class="tw-section-title">{{ t('closing.title') }}</h2>
            <p class="tw-section-lead">{{ t('closing.lead') }}</p>
            <Link v-if="!isAuthenticated" :href="route('register')" class="tw-cta tw-cta--lg">{{ t('closing.cta') }}</Link>
        </section>

        <footer class="tw-foot">{{ t('auth.brand.copyright') }}</footer>
    </div>
</template>

<style scoped>
.tw {
    min-height: 100vh;
    background: #0b0f19;
    color: #f4f4f5;
    font-family: Inter, sans-serif;
    background-image: radial-gradient(circle at 15% 10%, rgba(57, 255, 20, 0.07), transparent 40%);
}
.tw-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 20px 28px;
    border-bottom: 1px solid #1f2937;
}
.tw-brand {
    display: inline-flex;
    text-decoration: none;
}
.tw-top-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: flex-end;
}
.tw-link {
    color: #94a3b8;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
}
.tw-link:hover {
    color: #39ff14;
}
.tw-cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 16px;
    border-radius: 10px;
    background: #39ff14;
    color: #0b0f19;
    font-weight: 800;
    font-family: 'Barlow Condensed', sans-serif;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    font-size: 14px;
    text-decoration: none;
}
.tw-cta--lg {
    padding: 14px 22px;
    font-size: 16px;
}
.tw-hero {
    max-width: 880px;
    margin: 0 auto;
    padding: 72px 28px 56px;
}
.tw-h1 {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: clamp(36px, 6vw, 56px);
    line-height: 1.05;
    margin: 0 0 18px;
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.tw-h1-accent {
    color: #39ff14;
}
.tw-lead {
    max-width: 620px;
    color: #94a3b8;
    font-size: 16px;
    line-height: 1.6;
    margin: 0 0 28px;
}
.tw-hero-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
}
.tw-reassure {
    margin: 0;
    color: #64748b;
    font-size: 13px;
}
.tw-features,
.tw-closing {
    max-width: 980px;
    margin: 0 auto;
    padding: 24px 28px 56px;
}
.tw-section-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 28px;
    margin: 0 0 8px;
}
.tw-section-lead {
    color: #64748b;
    font-size: 15px;
    margin: 0 0 28px;
    max-width: 640px;
}
.tw-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 18px;
}
.tw-feature {
    padding: 20px;
    border: 1px solid #1f2937;
    border-radius: 12px;
    background: #0d1220;
}
.tw-feature-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    font-size: 18px;
    margin: 0 0 8px;
}
.tw-feature-desc {
    margin: 0;
    color: #94a3b8;
    font-size: 14px;
    line-height: 1.5;
}
.tw-closing {
    text-align: left;
    padding-bottom: 72px;
}
.tw-foot {
    border-top: 1px solid #1f2937;
    padding: 20px 28px;
    color: #64748b;
    font-size: 13px;
}
</style>
