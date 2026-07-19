<script setup lang="ts">
import BrandLogo from '@/components/BrandLogo.vue';
import { useLocale } from '@/composables/useLocale';
import { Link } from '@inertiajs/vue3';

withDefaults(
    defineProps<{
        href?: string;
        logoWidth?: number;
    }>(),
    {
        href: undefined,
        logoWidth: 168,
    },
);

const { t } = useLocale();
</script>

<template>
    <Link :href="href ?? route('home')" class="hdr-brand" :aria-label="t('header.home')">
        <BrandLogo class="hdr-brand-logo" :width="logoWidth" />
    </Link>
</template>

<style scoped>
.hdr-brand {
    display: inline-flex;
    flex-shrink: 1;
    min-width: 0;
    text-decoration: none;
}

.hdr-brand-logo {
    display: block;
    max-width: 100%;
    height: auto;
}
</style>
