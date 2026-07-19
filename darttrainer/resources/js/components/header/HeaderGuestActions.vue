<script setup lang="ts">
import { useLocale } from '@/composables/useLocale';
import { Link } from '@inertiajs/vue3';

const { t } = useLocale();
</script>

<template>
    <nav class="hdr-guest" :aria-label="t('header.guestNav')">
        <Link :href="route('login')" class="hdr-guest-link">{{ t('guest.login') }}</Link>
        <Link :href="route('register')" class="hdr-guest-cta">{{ t('guest.register') }}</Link>
    </nav>
</template>

<style scoped>
.hdr-guest {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.hdr-guest-link {
    color: var(--hdr-soft);
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    white-space: nowrap;
    transition: color 0.2s ease;
}

.hdr-guest-link:hover {
    color: var(--hdr-green);
}

.hdr-guest-cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 12px;
    border-radius: 10px;
    background: var(--hdr-green);
    color: var(--hdr-bg);
    font-weight: 800;
    font-family: 'Barlow Condensed', sans-serif;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    font-size: 13px;
    text-decoration: none;
    white-space: nowrap;
    transition: transform 0.2s ease, filter 0.2s ease;
}

.hdr-guest-cta:hover {
    transform: translateY(-1px);
    filter: brightness(1.05);
}

@media (max-width: 480px) {
    .hdr-guest {
        gap: 6px;
    }

    .hdr-guest-link {
        font-size: 12px;
    }

    .hdr-guest-cta {
        padding: 7px 10px;
        font-size: 12px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .hdr-guest-link,
    .hdr-guest-cta {
        transition: none;
    }

    .hdr-guest-cta:hover {
        transform: none;
    }
}
</style>
