<script setup lang="ts">
import SettingsShell from '@/layouts/SettingsShell.vue';
import { Head, useForm } from '@inertiajs/vue3';
import { ref } from 'vue';

const passwordInput = ref<HTMLInputElement>();
const currentPasswordInput = ref<HTMLInputElement>();

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
    <Head title="Paroles iestatījumi" />

    <SettingsShell>
        <section class="tf-section">
            <h2 class="tf-h">Mainīt paroli</h2>
            <p class="tf-desc">Izmanto garu, nejaušu paroli, lai konts būtu drošs.</p>

            <form class="tf-form" @submit.prevent="updatePassword">
                <div>
                    <label class="tf-label" for="current_password">Pašreizējā parole</label>
                    <input id="current_password" ref="currentPasswordInput" v-model="form.current_password" type="password" class="tf-input" autocomplete="current-password" />
                    <p v-if="form.errors.current_password" class="tf-error">{{ form.errors.current_password }}</p>
                </div>

                <div>
                    <label class="tf-label" for="password">Jaunā parole</label>
                    <input id="password" ref="passwordInput" v-model="form.password" type="password" class="tf-input" autocomplete="new-password" />
                    <p v-if="form.errors.password" class="tf-error">{{ form.errors.password }}</p>
                </div>

                <div>
                    <label class="tf-label" for="password_confirmation">Apstiprini paroli</label>
                    <input id="password_confirmation" v-model="form.password_confirmation" type="password" class="tf-input" autocomplete="new-password" />
                    <p v-if="form.errors.password_confirmation" class="tf-error">{{ form.errors.password_confirmation }}</p>
                </div>

                <div class="tf-actions">
                    <button type="submit" class="tf-btn tf-btn--green" :disabled="form.processing">Saglabāt paroli</button>
                    <span v-if="form.recentlySuccessful" class="tf-saved">Saglabāts.</span>
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
.tf-label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #94a3b8;
    margin-bottom: 8px;
}
.tf-input {
    width: 100%;
    padding: 12px 14px;
    border-radius: 10px;
    background: #131a26;
    border: 1px solid #1f2937;
    color: #f4f4f5;
    font-size: 14px;
    font-family: Inter, sans-serif;
    outline: none;
}
.tf-input:focus {
    border-color: #39ff14;
}
.tf-error {
    margin-top: 6px;
    font-size: 12px;
    color: #fb2c5f;
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
