<script setup lang="ts">
import HeaderMenuItem from '@/components/header/HeaderMenuItem.vue';
import type { HeaderMenuItem as HeaderMenuItemType } from '@/types/header';

defineProps<{
    open: boolean;
    items: HeaderMenuItemType[];
    notificationMessage?: string;
    showNotification?: boolean;
}>();

defineEmits<{
    close: [];
}>();
</script>

<template>
    <div v-if="open" class="hdr-menu" role="menu">
        <p v-if="showNotification && notificationMessage" class="hdr-menu-note">{{ notificationMessage }}</p>

        <HeaderMenuItem
            v-for="item in items"
            :key="item.key"
            :href="item.href"
            :label="item.label"
            :method="item.method"
            :variant="item.variant"
            @select="$emit('close')"
        />
    </div>
</template>

<style scoped>
.hdr-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    min-width: 190px;
    padding: 6px;
    border-radius: 12px;
    border: 1px solid var(--hdr-line);
    background: #0d1220;
    box-shadow: 0 18px 36px rgba(0, 0, 0, 0.45);
}

.hdr-menu-note {
    margin: 0;
    padding: 8px 10px 10px;
    border-bottom: 1px solid var(--hdr-line);
    color: var(--hdr-soft);
    font-size: 12px;
    line-height: 1.45;
}
</style>
