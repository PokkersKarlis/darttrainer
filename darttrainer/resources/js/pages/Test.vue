<script setup>
/**
 * Pagaidu pārbaudes lapa — demonstrē jauno Inertia shell (AppLayout).
 * Kad Home lapa (solis 2.2) gatava, šo failu un /_inertia-check maršrutu var dzēst.
 *
 * @typedef {Object} Props
 * @property {string} message
 */
import AppLayout from '@/layouts/AppLayout.vue';

defineProps({
    message: { type: String, default: '' },
});
</script>

<template>
    <AppLayout title="Inertia shell — pārbaude">
        <div class="p-6 text-slate-100">
            <p class="text-xl font-semibold mb-2">Shell strādā ✅</p>
            <p class="text-slate-400 text-sm">{{ message }}</p>
        </div>
    </AppLayout>
</template>
