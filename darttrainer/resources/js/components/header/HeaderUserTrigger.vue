<script setup lang="ts">
import HeaderNotificationDot from '@/components/header/HeaderNotificationDot.vue';
import { getInitials } from '@/composables/useInitials';
import { useLocale } from '@/composables/useLocale';
import { computed } from 'vue';

const props = defineProps<{
    name?: string;
    showNotification?: boolean;
    expanded?: boolean;
}>();

defineEmits<{
    toggle: [];
}>();

const { t } = useLocale();
const initials = computed(() => getInitials(props.name));
</script>

<template>
    <button
        type="button"
        class="hdr-user-btn"
        :aria-expanded="expanded"
        :aria-haspopup="true"
        :aria-label="t('header.accountMenu')"
        @click="$emit('toggle')"
    >
        <span class="hdr-user-avatar" aria-hidden="true">{{ initials }}</span>
        <HeaderNotificationDot v-if="showNotification" :title="t('header.verifyEmail')" />
    </button>
</template>

<style scoped>
.hdr-user-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    border: 1px solid var(--hdr-line);
    background: #131a26;
    color: var(--hdr-text);
    cursor: pointer;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.hdr-user-btn:hover,
.hdr-user-btn[aria-expanded='true'] {
    border-color: color-mix(in srgb, var(--hdr-green) 45%, var(--hdr-line));
    box-shadow: 0 0 0 1px rgba(57, 255, 20, 0.12);
}

.hdr-user-avatar {
    font-size: 13px;
    font-weight: 800;
    font-family: 'Barlow Condensed', sans-serif;
    letter-spacing: 0.04em;
}

@media (prefers-reduced-motion: reduce) {
    .hdr-user-btn {
        transition: none;
    }
}
</style>
