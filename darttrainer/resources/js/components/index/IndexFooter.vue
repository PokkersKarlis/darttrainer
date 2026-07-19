<script setup lang="ts">
import AppVersionLabel from '@/components/AppVersionLabel.vue';
import { useLocale } from '@/composables/useLocale';

const { t } = useLocale();
</script>

<template>
    <footer class="ix-foot">
        <p class="ix-foot-copy">
            {{ t('auth.brand.copyright') }}
            <AppVersionLabel />
        </p>
    </footer>
</template>

<style scoped>
.ix-foot {
    border-top: 1px solid var(--ix-line, #1f2937);
    padding: var(--ix-foot-pad-y, 20px) var(--ix-foot-pad-x, 28px);
}

.ix-foot-copy {
    margin: 0;
    color: var(--ix-muted, #64748b);
    font-size: var(--ix-foot-size, 13px);
}
</style>
