<script setup lang="ts">
import HeaderActions from '@/components/header/HeaderActions.vue';
import HeaderBrand from '@/components/header/HeaderBrand.vue';
import HeaderShell from '@/components/header/HeaderShell.vue';
import type { HeaderMenuItem } from '@/types/header';

withDefaults(
    defineProps<{
        logoWidth?: number;
        extraMenuItems?: HeaderMenuItem[];
    }>(),
    {
        logoWidth: 168,
        extraMenuItems: () => [],
    },
);
</script>

<template>
    <HeaderShell>
        <HeaderBrand :logo-width="logoWidth" />
        <HeaderActions :extra-menu-items="extraMenuItems" />
    </HeaderShell>
</template>
