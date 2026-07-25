<script setup lang="ts">
import { useLocale } from '@/composables/useLocale';
import { Head, Link } from '@inertiajs/vue3';
import { computed } from 'vue';

const props = defineProps<{
    reason?: string;
}>();

const { t } = useLocale();

const title = computed(() => {
    if (props.reason === 'all_left') {
        return t('games.matchGone.allLeftTitle');
    }

    if (props.reason === 'turn_timeout') {
        return t('games.matchGone.timeoutTitle');
    }

    return t('games.matchGone.title');
});

const desc = computed(() => {
    if (props.reason === 'all_left') {
        return t('games.matchGone.allLeftDesc');
    }

    if (props.reason === 'turn_timeout') {
        return t('games.matchGone.timeoutDesc');
    }

    return t('games.matchGone.desc');
});
</script>

<template>
    <Head :title="title" />

    <div class="gone-page">
        <div class="gone-atmosphere" aria-hidden="true">
            <div class="gone-glow gone-glow--a" />
            <div class="gone-glow gone-glow--b" />
            <div class="gone-grid" />
        </div>

        <main class="gone-panel">
            <p class="gone-code">404</p>
            <h1 class="gone-title">{{ title }}</h1>
            <p class="gone-desc">{{ desc }}</p>
            <p class="gone-note">{{ t('games.matchGone.note') }}</p>

            <Link :href="route('home')" class="gone-cta">{{ t('games.matchGone.home') }}</Link>
        </main>
    </div>
</template>

<style scoped>
.gone-page {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 24px;
    background: #0b0f19;
    color: #f4f4f5;
    font-family: Inter, sans-serif;
}

.gone-atmosphere {
    pointer-events: none;
    position: absolute;
    inset: 0;
}

.gone-glow {
    position: absolute;
    border-radius: 50%;
}

.gone-glow--a {
    top: -20%;
    left: -10%;
    width: 520px;
    height: 520px;
    background: radial-gradient(circle, rgba(251, 44, 95, 0.12), transparent 68%);
}

.gone-glow--b {
    bottom: -18%;
    right: -8%;
    width: 460px;
    height: 460px;
    background: radial-gradient(circle, rgba(57, 255, 20, 0.08), transparent 70%);
}

.gone-grid {
    position: absolute;
    inset: 0;
    opacity: 0.22;
    background-image:
        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 48px 48px;
}

.gone-panel {
    position: relative;
    z-index: 1;
    width: min(100%, 520px);
    padding: 28px 24px;
    border-radius: 20px;
    border: 1px solid rgba(251, 44, 95, 0.25);
    background: linear-gradient(165deg, rgba(19, 26, 38, 0.94), rgba(13, 18, 32, 0.98));
    text-align: center;
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.45);
}

.gone-code {
    margin: 0 0 8px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 72px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: 0.08em;
    color: rgba(251, 44, 95, 0.85);
}

.gone-title {
    margin: 0 0 12px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: clamp(28px, 5vw, 36px);
    font-weight: 900;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

.gone-desc,
.gone-note {
    margin: 0 0 12px;
    color: #94a3b8;
    font-size: 15px;
    line-height: 1.55;
}

.gone-note {
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid rgba(251, 44, 95, 0.18);
    background: rgba(251, 44, 95, 0.08);
    color: #fca5a5;
}

.gone-cta {
    display: inline-flex;
    margin-top: 10px;
    padding: 12px 18px;
    border-radius: 12px;
    border: 1px solid rgba(57, 255, 20, 0.35);
    background: rgba(57, 255, 20, 0.12);
    color: #39ff14;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-decoration: none;
}
</style>
