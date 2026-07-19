<script setup lang="ts">
import GuestLayout from '@/layouts/GuestLayout.vue';
import { useLocale } from '@/composables/useLocale';
import { Head, Link } from '@inertiajs/vue3';
import { computed } from 'vue';

const { t, tm } = useLocale();

type LegalSection = { title: string; body: string };

const sections = computed(() => tm('legal.terms.sections') as LegalSection[]);
</script>

<template>
    <Head :title="t('legal.terms.title')" />

    <GuestLayout>
        <article class="legal gl-rise">
            <Link :href="route('home')" class="legal-back">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                {{ t('legal.back') }}
            </Link>

            <header class="legal-head">
                <p class="legal-kicker">TrainDart</p>
                <h1 class="legal-title">{{ t('legal.terms.title') }}</h1>
                <p class="legal-updated">{{ t('legal.updated') }}</p>
            </header>

            <div class="legal-panel">
                <section v-for="(section, index) in sections" :key="index" class="legal-section">
                    <h2 class="legal-section-title">{{ section.title }}</h2>
                    <p class="legal-section-body">{{ section.body }}</p>
                </section>
            </div>
        </article>
    </GuestLayout>
</template>

<style scoped>
.legal-back {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 28px;
    color: #94a3b8;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s ease;
}
.legal-back:hover {
    color: #39ff14;
}

.legal-head {
    margin-bottom: 28px;
}
.legal-kicker {
    margin: 0 0 10px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #39ff14;
}
.legal-title {
    margin: 0 0 10px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: clamp(34px, 6vw, 48px);
    font-weight: 900;
    line-height: 1;
    letter-spacing: 0.02em;
    text-transform: uppercase;
}
.legal-updated {
    margin: 0;
    color: #64748b;
    font-size: 14px;
}

.legal-panel {
    border: 1px solid #1f2937;
    border-radius: 16px;
    background: color-mix(in srgb, #0d1220 92%, transparent);
    padding: 8px 0;
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.25);
}

.legal-section {
    padding: 22px 24px;
    border-bottom: 1px solid #1f2937;
}
.legal-section:last-child {
    border-bottom: none;
}
.legal-section-title {
    margin: 0 0 10px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 20px;
    font-weight: 800;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    color: #f4f4f5;
}
.legal-section-body {
    margin: 0;
    color: #94a3b8;
    font-size: 15px;
    line-height: 1.65;
}

.gl-rise {
    animation: gl-rise 0.65s ease both;
}
@keyframes gl-rise {
    from {
        opacity: 0;
        transform: translateY(14px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (prefers-reduced-motion: reduce) {
    .gl-rise {
        animation: none;
    }
    .legal-back {
        transition: none;
    }
}
</style>
