<script setup lang="ts">
import AuthShell from '@/layouts/AuthShell.vue';
import { useLocale } from '@/composables/useLocale';
import { Head, Link, useForm } from '@inertiajs/vue3';

defineProps<{ status?: string }>();

const { t, locale } = useLocale();

const form = useForm({ locale: locale.value });
const submit = () => {
    // Nosūta pašreiz izvēlēto valodu, lai jaunā apstiprinājuma e-pasta vēstule
    // atnāk tajā pašā valodā, kāda ir izvēlēta lietotnē.
    form.locale = locale.value;
    form.post(route('verification.send'));
};
</script>

<template>
    <Head :title="t('auth.verify.title')" />

    <AuthShell :heading-line1="t('auth.verify.heading1')" :heading-line2="t('auth.verify.heading2')" :lead="t('auth.verify.lead')">
        <h2 class="td-h">{{ t('auth.verify.title') }}</h2>
        <p class="td-sub">{{ t('auth.verify.subtitle') }}</p>

        <div v-if="status === 'verification-link-sent'" class="td-status">
            {{ t('auth.verify.sent') }}
        </div>
        <div v-else-if="status === 'verification-link-failed'" class="td-status td-status--error">
            {{ t('auth.verify.failed') }}
        </div>

        <form class="td-fields" @submit.prevent="submit">
            <button type="submit" class="td-submit" :disabled="form.processing">
                {{ form.processing ? t('auth.verify.submitting') : t('auth.verify.submit') }}
            </button>
        </form>

        <div class="td-foot">
            <Link :href="route('logout')" method="post" as="button" class="td-link td-link--bold">{{ t('auth.verify.logout') }}</Link>
        </div>
    </AuthShell>
</template>

<style scoped>
.td-h { font-family: 'Barlow Condensed', sans-serif; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; font-size: 30px; margin: 0 0 8px; }
.td-sub { color: #64748b; font-size: 14px; margin: 0 0 28px; }
.td-status { margin-bottom: 16px; border-radius: 10px; background: rgba(57, 255, 20, 0.08); border: 1px solid rgba(57, 255, 20, 0.25); padding: 10px 14px; font-size: 13px; color: #39ff14; }
.td-status--error { background: rgba(251, 44, 95, 0.08); border-color: rgba(251, 44, 95, 0.25); color: #fb2c5f; }
.td-fields { display: flex; flex-direction: column; gap: 16px; }
.td-submit { padding: 14px; text-align: center; border-radius: 10px; background: #39ff14; color: #0b0f19; font-weight: 800; font-family: 'Barlow Condensed', sans-serif; letter-spacing: 0.5px; text-transform: uppercase; font-size: 16px; cursor: pointer; border: none; box-shadow: 0 0 20px rgba(57, 255, 20, 0.2); }
.td-submit:disabled { opacity: 0.7; cursor: not-allowed; }
.td-link { color: #39ff14; text-decoration: none; background: none; border: none; cursor: pointer; font-size: 14px; }
.td-link--bold { font-weight: 600; }
.td-foot { text-align: center; margin-top: 28px; font-size: 14px; color: #64748b; }
</style>
