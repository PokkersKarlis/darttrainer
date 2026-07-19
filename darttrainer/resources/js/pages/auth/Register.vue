<script setup lang="ts">
import AuthShell from '@/layouts/AuthShell.vue';
import PasswordField from '@/components/PasswordField.vue';
import { useLocale } from '@/composables/useLocale';
import { Head, Link, useForm } from '@inertiajs/vue3';

const { t, locale } = useLocale();

const form = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    locale: locale.value,
    terms_accepted: false,
    company: '',
});

const submit = () => {
    if (!form.terms_accepted) return;
    // Nosūta pašreiz izvēlēto valodu, lai apstiprinājuma e-pasts atnāk tajā
    // pašā valodā, kāda ir izvēlēta lietotnē (nevis vienmēr LV).
    form.locale = locale.value;
    form.post(route('register'), {
        onFinish: () => form.reset('password', 'password_confirmation'),
    });
};
</script>

<template>
    <Head :title="t('auth.register.title')" />

    <AuthShell :heading-line1="t('auth.register.heading1')" :heading-line2="t('auth.register.heading2')" :lead="t('auth.register.lead')">
        <h2 class="td-h">{{ t('auth.register.title') }}</h2>
        <p class="td-sub">{{ t('auth.register.subtitle') }}</p>

        <form class="td-fields" @submit.prevent="submit">
            <div>
                <label class="td-label" for="name">{{ t('auth.register.name') }}</label>
                <input
                    id="name"
                    v-model="form.name"
                    type="text"
                    class="td-input"
                    :placeholder="t('auth.register.namePlaceholder')"
                    required
                    autofocus
                    autocomplete="nickname"
                />
                <p class="td-hint">{{ t('auth.register.nameHint') }}</p>
                <p v-if="form.errors.name" class="td-error">{{ form.errors.name }}</p>
            </div>

            <div>
                <label class="td-label" for="email">{{ t('auth.field.email') }}</label>
                <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    class="td-input"
                    :placeholder="t('auth.field.emailPlaceholder')"
                    required
                    autocomplete="email"
                />
                <p v-if="form.errors.email" class="td-error">{{ form.errors.email }}</p>
            </div>

            <PasswordField
                id="password"
                v-model="form.password"
                :label="t('auth.field.password')"
                :placeholder="t('auth.register.passwordPlaceholder')"
                required
                autocomplete="new-password"
                show-strength
                :error="form.errors.password"
            />

            <PasswordField
                id="password_confirmation"
                v-model="form.password_confirmation"
                :label="t('auth.register.confirmPassword')"
                :placeholder="t('auth.register.confirmPasswordPlaceholder')"
                required
                autocomplete="new-password"
                :error="form.errors.password_confirmation"
            />

            <div class="td-hp" aria-hidden="true">
                <label for="company">{{ t('auth.register.honeypotLabel') }}</label>
                <input
                    id="company"
                    v-model="form.company"
                    type="text"
                    name="company"
                    tabindex="-1"
                    autocomplete="off"
                />
            </div>

            <label class="td-check-row td-check-row--top">
                <span class="td-check" :class="{ 'td-check--on': form.terms_accepted }">
                    <svg v-if="form.terms_accepted" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0b0f19" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                    </svg>
                </span>
                <input v-model="form.terms_accepted" type="checkbox" class="sr-only" />
                <span class="td-check-lbl">
                    {{ t('auth.register.termsPrefix') }}<Link :href="route('terms')" class="td-link" @click.stop>{{ t('auth.register.termsOfService') }}</Link
                    >{{ t('auth.register.termsAnd') }}<Link :href="route('privacy')" class="td-link" @click.stop>{{ t('auth.register.privacyPolicy') }}</Link>.
                </span>
            </label>
            <p v-if="form.errors.terms_accepted" class="td-error">{{ form.errors.terms_accepted }}</p>

            <button type="submit" class="td-submit" :class="{ 'td-submit--off': !form.terms_accepted }" :disabled="!form.terms_accepted || form.processing">
                {{ form.processing ? t('auth.register.submitting') : t('auth.register.submit') }}
            </button>
        </form>

        <div class="td-foot">
            {{ t('auth.register.haveAccount') }}
            <Link :href="route('login')" class="td-link td-link--bold">{{ t('auth.register.login') }}</Link>
        </div>
    </AuthShell>
</template>

<style scoped>
.td-h {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 30px;
    margin: 0 0 8px;
}
.td-sub {
    color: #64748b;
    font-size: 14px;
    margin: 0 0 28px;
}
.td-fields {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.td-label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #94a3b8;
    margin-bottom: 8px;
}
.td-input {
    width: 100%;
    padding: 13px 16px;
    border-radius: 10px;
    background: #131a26;
    border: 1px solid #1f2937;
    color: #f4f4f5;
    font-size: 14px;
    font-family: Inter, sans-serif;
    outline: none;
}
.td-input:focus {
    border-color: #39ff14;
}
.td-input::placeholder {
    color: #64748b;
}
.td-hint {
    margin: 6px 0 0;
    font-size: 12px;
    line-height: 1.5;
    color: #64748b;
}
.td-link {
    font-size: 12px;
    color: #39ff14;
    text-decoration: none;
}
.td-link:hover {
    text-decoration: underline;
}
.td-hp {
    position: absolute;
    left: -9999px;
    width: 1px;
    height: 1px;
    overflow: hidden;
}
.td-link--bold {
    font-weight: 600;
    font-size: 14px;
}
.td-check-row {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
}
.td-check-row--top {
    align-items: flex-start;
    margin-top: 4px;
}
.td-check {
    width: 20px;
    height: 20px;
    border-radius: 6px;
    flex-shrink: 0;
    margin-top: 1px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid #334155;
    transition: all 0.15s;
}
.td-check--on {
    background: #39ff14;
    border-color: #39ff14;
}
.td-check-lbl {
    font-size: 13px;
    color: #94a3b8;
    line-height: 1.5;
}
.td-submit {
    margin-top: 8px;
    padding: 14px;
    text-align: center;
    border-radius: 10px;
    background: #39ff14;
    color: #0b0f19;
    font-weight: 800;
    font-family: 'Barlow Condensed', sans-serif;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    font-size: 16px;
    cursor: pointer;
    border: none;
    transition: all 0.3s;
    box-shadow: 0 0 20px rgba(57, 255, 20, 0.2);
}
.td-submit--off {
    background: #1f2937;
    color: #64748b;
    cursor: not-allowed;
    box-shadow: none;
}
.td-error {
    margin-top: 6px;
    font-size: 12px;
    color: #fb2c5f;
}
.td-foot {
    text-align: center;
    margin-top: 28px;
    font-size: 14px;
    color: #64748b;
}
</style>
