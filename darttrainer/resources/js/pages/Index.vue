<script setup lang="ts">
import IndexEmailVerificationNotice from '@/components/index/IndexEmailVerificationNotice.vue';
import IndexHeroCard from '@/components/index/IndexHeroCard.vue';
import IndexWorkspace from '@/components/index/IndexWorkspace.vue';
import IndexLayout from '@/layouts/IndexLayout.vue';
import { useLocale } from '@/composables/useLocale';
import { Head } from '@inertiajs/vue3';

defineProps<{
    status?: string | null;
}>();

const { t } = useLocale();
</script>

<template>
    <Head :title="t('index.title')" />

    <IndexLayout>
        <IndexWorkspace>
            <IndexEmailVerificationNotice :status="status" />
            <IndexHeroCard />
        </IndexWorkspace>
    </IndexLayout>
</template>
