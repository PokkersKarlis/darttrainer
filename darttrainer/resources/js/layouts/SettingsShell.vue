<script setup lang="ts">
/** TrainDart tumšais iestatījumu apvalks: augšjosla + cilnes + saturs. */
import BrandLogo from '@/components/BrandLogo.vue';
import LanguageSwitcher from '@/components/LanguageSwitcher.vue';
import { useLocale } from '@/composables/useLocale';
import { Link } from '@inertiajs/vue3';
import { computed } from 'vue';

const { t } = useLocale();

const tabs = computed(() => [
    { label: t('settings.tabs.profile'), href: '/settings/profile' },
    { label: t('settings.tabs.password'), href: '/settings/password' },
    { label: t('settings.tabs.appearance'), href: '/settings/appearance' },
]);

const currentPath = computed(() => (typeof window !== 'undefined' ? window.location.pathname : ''));
</script>

<template>
    <div class="ts">
        <header class="ts-top">
            <Link href="/" class="ts-brand"><BrandLogo :width="150" /></Link>
            <div class="ts-top-actions">
                <LanguageSwitcher />
                <Link href="/" class="ts-back">← {{ t('settings.back') }}</Link>
            </div>
        </header>

        <main class="ts-main">
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
                    {{ tab.label }}
                </Link>
            </nav>

            <div class="ts-content">
                <slot />
            </div>
        </main>
    </div>
</template>

<style scoped>
.ts {
    min-height: 100vh;
    background: #0b0f19;
    color: #f4f4f5;
    font-family: Inter, sans-serif;
}
.ts-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 20px 28px;
    border-bottom: 1px solid #1f2937;
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
    color: #94a3b8;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
}
.ts-back:hover {
    color: #39ff14;
}
.ts-main {
    max-width: 640px;
    margin: 0 auto;
    padding: 40px 28px;
}
.ts-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 30px;
    margin: 0;
}
.ts-sub {
    color: #64748b;
    font-size: 14px;
    margin: 6px 0 24px;
}
.ts-tabs {
    display: flex;
    gap: 8px;
    border-bottom: 1px solid #1f2937;
    margin-bottom: 28px;
}
.ts-tab {
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 700;
    color: #94a3b8;
    text-decoration: none;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
}
.ts-tab:hover {
    color: #f4f4f5;
}
.ts-tab--on {
    color: #39ff14;
    border-bottom-color: #39ff14;
}
</style>
