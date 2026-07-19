<script setup lang="ts">
import HeaderAccountMenu from '@/components/header/HeaderAccountMenu.vue';
import HeaderGuestActions from '@/components/header/HeaderGuestActions.vue';
import HeaderLanguage from '@/components/header/HeaderLanguage.vue';
import type { HeaderMenuItem } from '@/types/header';
import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/vue3';
import { computed } from 'vue';

const props = withDefaults(
    defineProps<{
        extraMenuItems?: HeaderMenuItem[];
        showGuestActions?: boolean;
    }>(),
    {
        extraMenuItems: () => [],
        showGuestActions: undefined,
    },
);

const page = usePage<SharedData>();
const isAuthenticated = computed(() => !!page.props.auth.user);
const showGuest = computed(() => props.showGuestActions ?? !isAuthenticated.value);
</script>

<template>
    <div class="hdr-actions">
        <HeaderLanguage />

        <HeaderAccountMenu v-if="isAuthenticated" :extra-items="extraMenuItems" />
        <HeaderGuestActions v-else-if="showGuest" />
    </div>
</template>

<style scoped>
.hdr-actions {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    flex-shrink: 0;
    min-width: 0;
}

@media (max-width: 480px) {
    .hdr-actions {
        gap: 6px;
    }
}
</style>
