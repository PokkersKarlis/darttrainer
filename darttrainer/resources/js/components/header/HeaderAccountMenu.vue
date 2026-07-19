<script setup lang="ts">
import HeaderMenuPanel from '@/components/header/HeaderMenuPanel.vue';
import HeaderUserTrigger from '@/components/header/HeaderUserTrigger.vue';
import { useHeaderAccountMenu } from '@/composables/useHeaderAccountMenu';
import type { HeaderMenuItem } from '@/types/header';
import { onClickOutside } from '@vueuse/core';
import { computed, ref } from 'vue';

const props = withDefaults(
    defineProps<{
        extraItems?: HeaderMenuItem[];
    }>(),
    {
        extraItems: () => [],
    },
);

const menuOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);

const { user, hasNotification, notificationMessage, items } = useHeaderAccountMenu();

const menuItems = computed(() => [...items.value, ...props.extraItems]);

onClickOutside(menuRef, () => {
    menuOpen.value = false;
});

function toggleMenu() {
    menuOpen.value = !menuOpen.value;
}

function closeMenu() {
    menuOpen.value = false;
}
</script>

<template>
    <div v-if="user" ref="menuRef" class="hdr-account">
        <HeaderUserTrigger
            :name="user.name"
            :show-notification="hasNotification"
            :expanded="menuOpen"
            @toggle="toggleMenu"
        />

        <HeaderMenuPanel
            :open="menuOpen"
            :items="menuItems"
            :show-notification="hasNotification"
            :notification-message="notificationMessage"
            @close="closeMenu"
        />
    </div>
</template>

<style scoped>
.hdr-account {
    position: relative;
    flex-shrink: 0;
}
</style>
