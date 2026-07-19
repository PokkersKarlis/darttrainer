<script setup lang="ts">
import AuthShell from '@/layouts/AuthShell.vue';
import { useLocale } from '@/composables/useLocale';
import { Head, Link, useForm } from '@inertiajs/vue3';

defineProps<{ status?: string }>();

const { t, locale } = useLocale();

const form = useForm({ email: '', locale: locale.value });

const submit = () => {
    // Nosūta pašreiz izvēlēto valodu, lai atjaunošanas e-pasts atnāk tajā
    // pašā valodā, kāda ir izvēlēta lietotnē.
    form.locale = locale.value;
    form.post(route('password.email'));
};
</script>

<template>
    <Head :title="t('auth.forgot.title')" />

    <AuthShell :heading-line1="t('auth.forgot.heading1')" :heading-line2="t('auth.forgot.heading2')" :lead="t('auth.forgot.lead')">
        <h2 class="td-h">{{ t('auth.forgot.title') }}</h2>
        <p class="td-sub">{{ t('auth.forgot.subtitle') }}</p>

        <div v-if="status === 'reset-link-sent'" class="td-status">{{ t('auth.forgot.sent') }}</div>
        <div v-else-if="status === 'reset-link-failed'" class="td-status td-status--error">{{ t('auth.forgot.failed') }}</div>

        <form class="td-fields" @submit.prevent="submit">
            <div>
                <label class="td-label" for="email">{{ t('auth.field.email') }}</label>
                <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    class="td-input"
                    :placeholder="t('auth.field.emailPlaceholder')"
                    required
                    autofocus
                    autocomplete="email"
                />
                <p v-if="form.errors.email" class="td-error">{{ form.errors.email }}</p>
            </div>
            <button type="submit" class="td-submit" :disabled="form.processing">
                {{ form.processing ? t('auth.forgot.submitting') : t('auth.forgot.submit') }}
            </button>
        </form>

        <div class="td-foot">
            {{ t('auth.forgot.remember') }}
            <Link :href="route('login')" class="td-link td-link--bold">{{ t('auth.forgot.login') }}</Link>
        </div>
    </AuthShell>
</template>

<style scoped>
.td-h { font-family: 'Barlow Condensed', sans-serif; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; font-size: 30px; margin: 0 0 8px; }
.td-sub { color: #64748b; font-size: 14px; margin: 0 0 28px; }
.td-status { margin-bottom: 16px; border-radius: 10px; background: rgba(57, 255, 20, 0.08); border: 1px solid rgba(57, 255, 20, 0.25); padding: 10px 14px; font-size: 13px; color: #39ff14; }
.td-status--error { background: rgba(251, 44, 95, 0.08); border-color: rgba(251, 44, 95, 0.25); color: #fb2c5f; }
.td-fields { display: flex; flex-direction: column; gap: 16px; }
.td-label { display: block; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; margin-bottom: 8px; }
.td-input { width: 100%; padding: 13px 16px; border-radius: 10px; background: #131a26; border: 1px solid #1f2937; color: #f4f4f5; font-size: 14px; font-family: Inter, sans-serif; outline: none; }
.td-input:focus { border-color: #39ff14; }
.td-input::placeholder { color: #64748b; }
.td-error { margin-top: 6px; font-size: 12px; color: #fb2c5f; }
.td-link { color: #39ff14; text-decoration: none; }
.td-link--bold { font-weight: 600; }
.td-submit { margin-top: 8px; padding: 14px; text-align: center; border-radius: 10px; background: #39ff14; color: #0b0f19; font-weight: 800; font-family: 'Barlow Condensed', sans-serif; letter-spacing: 0.5px; text-transform: uppercase; font-size: 16px; cursor: pointer; border: none; box-shadow: 0 0 20px rgba(57, 255, 20, 0.2); }
.td-submit:disabled { opacity: 0.7; cursor: not-allowed; }
.td-foot { text-align: center; margin-top: 28px; font-size: 14px; color: #64748b; }
</style>
