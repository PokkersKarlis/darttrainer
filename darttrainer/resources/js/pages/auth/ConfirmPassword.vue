<script setup lang="ts">
import AuthShell from '@/layouts/AuthShell.vue';
import { useLocale } from '@/composables/useLocale';
import { Head, useForm } from '@inertiajs/vue3';

const { t } = useLocale();

const form = useForm({ password: '' });

const submit = () => {
    form.post(route('password.confirm'), {
        onFinish: () => form.reset(),
    });
};
</script>

<template>
    <Head :title="t('auth.confirm.title')" />

    <AuthShell :heading-line1="t('auth.confirm.heading1')" :heading-line2="t('auth.confirm.heading2')" :lead="t('auth.confirm.lead')">
        <h2 class="td-h">{{ t('auth.confirm.title') }}</h2>
        <p class="td-sub">{{ t('auth.confirm.subtitle') }}</p>

        <form class="td-fields" @submit.prevent="submit">
            <div>
                <label class="td-label" for="password">{{ t('auth.field.password') }}</label>
                <input id="password" v-model="form.password" type="password" class="td-input" required autofocus autocomplete="current-password" />
                <p v-if="form.errors.password" class="td-error">{{ form.errors.password }}</p>
            </div>
            <button type="submit" class="td-submit" :disabled="form.processing">
                {{ form.processing ? t('auth.confirm.submitting') : t('auth.confirm.submit') }}
            </button>
        </form>
    </AuthShell>
</template>

<style scoped>
.td-h { font-family: 'Barlow Condensed', sans-serif; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; font-size: 30px; margin: 0 0 8px; }
.td-sub { color: #64748b; font-size: 14px; margin: 0 0 28px; }
.td-fields { display: flex; flex-direction: column; gap: 16px; }
.td-label { display: block; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; margin-bottom: 8px; }
.td-input { width: 100%; padding: 13px 16px; border-radius: 10px; background: #131a26; border: 1px solid #1f2937; color: #f4f4f5; font-size: 14px; font-family: Inter, sans-serif; outline: none; }
.td-input:focus { border-color: #39ff14; }
.td-error { margin-top: 6px; font-size: 12px; color: #fb2c5f; }
.td-submit { margin-top: 8px; padding: 14px; text-align: center; border-radius: 10px; background: #39ff14; color: #0b0f19; font-weight: 800; font-family: 'Barlow Condensed', sans-serif; letter-spacing: 0.5px; text-transform: uppercase; font-size: 16px; cursor: pointer; border: none; box-shadow: 0 0 20px rgba(57, 255, 20, 0.2); }
.td-submit:disabled { opacity: 0.7; cursor: not-allowed; }
</style>
