<script setup lang="ts">
import IndexEmailVerificationNotice from '@/components/index/IndexEmailVerificationNotice.vue';
import IndexHeroCard from '@/components/index/IndexHeroCard.vue';
import IndexShoutbox from '@/components/index/IndexShoutbox.vue';
import IndexWorkspace from '@/components/index/IndexWorkspace.vue';
import IndexLayout from '@/layouts/IndexLayout.vue';
import { useLocale } from '@/composables/useLocale';
import { Head, usePage } from '@inertiajs/vue3';
import { computed } from 'vue';

defineProps<{
    status?: string | null;
}>();

const { t } = useLocale();
const page = usePage();
const userId = computed(() => page.props.auth?.user?.id as number | undefined);
</script>

<template>
    <Head :title="t('index.title')" />

    <IndexLayout>
        <IndexWorkspace>
            <IndexEmailVerificationNotice :status="status" />
            <IndexHeroCard />
            <IndexShoutbox v-if="userId" :user-id="userId" />
        </IndexWorkspace>
    </IndexLayout>
</template>
