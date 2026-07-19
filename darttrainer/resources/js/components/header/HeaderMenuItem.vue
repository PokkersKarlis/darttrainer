<script setup lang="ts">
import type { HeaderMenuItemVariant } from '@/types/header';
import { Link } from '@inertiajs/vue3';

defineProps<{
    href: string;
    label: string;
    method?: 'get' | 'post';
    variant?: HeaderMenuItemVariant;
}>();

defineEmits<{
    select: [];
}>();
</script>

<template>
    <Link
        :href="href"
        :method="method === 'post' ? 'post' : 'get'"
        as="button"
        class="hdr-menu-item"
        :class="{ 'hdr-menu-item--danger': variant === 'danger' }"
        role="menuitem"
        @click="$emit('select')"
    >
        {{ label }}
    </Link>
</template>

<style scoped>
.hdr-menu-item {
    display: block;
    width: 100%;
    padding: 10px 12px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--hdr-text);
    font-size: 14px;
    font-weight: 600;
    text-align: left;
    text-decoration: none;
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;
}

.hdr-menu-item:hover {
    background: rgba(57, 255, 20, 0.08);
    color: var(--hdr-green);
}

.hdr-menu-item--danger:hover {
    background: rgba(251, 44, 95, 0.1);
    color: var(--hdr-pink);
}

@media (prefers-reduced-motion: reduce) {
    .hdr-menu-item {
        transition: none;
    }
}
</style>
