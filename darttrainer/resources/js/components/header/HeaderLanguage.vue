<script setup lang="ts">
import LanguageSwitcher from '@/components/LanguageSwitcher.vue';
</script>

<template>
    <LanguageSwitcher class="hdr-lang" />
</template>

<style scoped>
@media (max-width: 480px) {
    .hdr-lang :deep(.lang-switch) {
        padding: 2px;
    }

    .hdr-lang :deep(.lang-btn) {
        padding: 4px 8px;
        font-size: 11px;
    }
}
</style>
