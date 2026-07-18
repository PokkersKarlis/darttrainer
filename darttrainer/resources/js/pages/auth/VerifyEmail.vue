<script setup lang="ts">
import AuthShell from '@/layouts/AuthShell.vue';
import { Head, Link, useForm } from '@inertiajs/vue3';

defineProps<{ status?: string }>();

const form = useForm({});
const submit = () => form.post(route('verification.send'));
</script>

<template>
    <Head title="Apstiprini e-pastu" />

    <AuthShell
        heading-line1="One more step."
        heading-line2="Verify to play."
        lead="Apstiprini e-pastu, lai atbloķētu tiešsaistes spēles, statistiku un draugus."
    >
        <h2 class="td-h">Apstiprini e-pastu</h2>
        <p class="td-sub">Noklikšķini uz saites, ko tikko nosūtījām. Nesaņēmi? Nosūti vēlreiz.</p>

        <div v-if="status === 'verification-link-sent'" class="td-status">
            Jauna apstiprinājuma saite nosūtīta uz tavu e-pastu.
        </div>

        <form class="td-fields" @submit.prevent="submit">
            <button type="submit" class="td-submit" :disabled="form.processing">
                {{ form.processing ? 'Sūta…' : 'Nosūtīt vēlreiz' }}
            </button>
        </form>

        <div class="td-foot">
            <Link :href="route('logout')" method="post" as="button" class="td-link td-link--bold">Iziet</Link>
        </div>
    </AuthShell>
</template>

<style scoped>
.td-h { font-family: 'Barlow Condensed', sans-serif; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; font-size: 30px; margin: 0 0 8px; }
.td-sub { color: #64748b; font-size: 14px; margin: 0 0 28px; }
.td-status { margin-bottom: 16px; border-radius: 10px; background: rgba(57, 255, 20, 0.08); border: 1px solid rgba(57, 255, 20, 0.25); padding: 10px 14px; font-size: 13px; color: #39ff14; }
.td-fields { display: flex; flex-direction: column; gap: 16px; }
.td-submit { padding: 14px; text-align: center; border-radius: 10px; background: #39ff14; color: #0b0f19; font-weight: 800; font-family: 'Barlow Condensed', sans-serif; letter-spacing: 0.5px; text-transform: uppercase; font-size: 16px; cursor: pointer; border: none; box-shadow: 0 0 20px rgba(57, 255, 20, 0.2); }
.td-submit:disabled { opacity: 0.7; cursor: not-allowed; }
.td-link { color: #39ff14; text-decoration: none; background: none; border: none; cursor: pointer; font-size: 14px; }
.td-link--bold { font-weight: 600; }
.td-foot { text-align: center; margin-top: 28px; font-size: 14px; color: #64748b; }
</style>
