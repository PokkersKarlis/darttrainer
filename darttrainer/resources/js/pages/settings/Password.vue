<script setup lang="ts">
import PasswordField from '@/components/PasswordField.vue';
import SettingsShell from '@/layouts/SettingsShell.vue';
import { useLocale } from '@/composables/useLocale';
import { Head, useForm } from '@inertiajs/vue3';
import { ref } from 'vue';

const { t } = useLocale();
const passwordInput = ref<InstanceType<typeof PasswordField>>();
const currentPasswordInput = ref<InstanceType<typeof PasswordField>>();

const form = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
});

const updatePassword = () => {
    form.put(route('password.update'), {
        preserveScroll: true,
        onSuccess: () => form.reset(),
        onError: (errors: Record<string, string>) => {
            if (errors.password) {
                form.reset('password', 'password_confirmation');
                passwordInput.value?.focus();
            }
            if (errors.current_password) {
                form.reset('current_password');
                currentPasswordInput.value?.focus();
            }
        },
    });
};
</script>

<template>
    <Head :title="t('settings.password.head')" />

    <SettingsShell>
        <section class="tf-section">
            <h2 class="tf-h">{{ t('settings.password.title') }}</h2>
            <p class="tf-desc">{{ t('settings.password.desc') }}</p>

            <form class="tf-form" @submit.prevent="updatePassword">
                <PasswordField
                    id="current_password"
                    ref="currentPasswordInput"
                    v-model="form.current_password"
                    :label="t('settings.password.current')"
                    autocomplete="current-password"
                    :error="form.errors.current_password"
                />

                <PasswordField
                    id="password"
                    ref="passwordInput"
                    v-model="form.password"
                    :label="t('settings.password.new')"
                    autocomplete="new-password"
                    show-strength
                    :error="form.errors.password"
                />

                <PasswordField
                    id="password_confirmation"
                    v-model="form.password_confirmation"
                    :label="t('settings.password.confirm')"
                    autocomplete="new-password"
                    :error="form.errors.password_confirmation"
                />

                <div class="tf-actions">
                    <button type="submit" class="tf-btn tf-btn--green" :disabled="form.processing">{{ t('settings.password.save') }}</button>
                    <span v-if="form.recentlySuccessful" class="tf-saved">{{ t('settings.saved') }}</span>
                </div>
            </form>
        </section>
    </SettingsShell>
</template>

<style scoped>
.tf-section {
    margin-bottom: 40px;
}
.tf-h {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 20px;
    margin: 0 0 4px;
}
.tf-desc {
    color: #64748b;
    font-size: 14px;
    margin: 0 0 20px;
}
.tf-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 460px;
}
.tf-actions {
    display: flex;
    align-items: center;
    gap: 14px;
}
.tf-saved {
    color: #39ff14;
    font-size: 13px;
}
.tf-btn {
    padding: 11px 20px;
    border-radius: 10px;
    font-weight: 800;
    font-family: 'Barlow Condensed', sans-serif;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    font-size: 14px;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
}
.tf-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
.tf-btn--green {
    background: #39ff14;
    color: #0b0f19;
    box-shadow: 0 0 20px rgba(57, 255, 20, 0.2);
}
</style>
