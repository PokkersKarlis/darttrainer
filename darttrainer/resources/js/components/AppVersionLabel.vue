<script setup lang="ts">
import { useAppVersion } from '@/composables/useAppVersion';
import { useLocale } from '@/composables/useLocale';

const { version } = useAppVersion();
const { t } = useLocale();
</script>

<template>
    <span v-if="version" class="app-version">{{ t('version', { version }) }}</span>
</template>

<style scoped>
.app-version {
    opacity: 0.72;
    font-size: 0.92em;
    white-space: nowrap;
}
</style>
