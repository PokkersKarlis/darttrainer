<script setup lang="ts">
import AuthShell from '@/layouts/AuthShell.vue';
import { Head, useForm } from '@inertiajs/vue3';

interface Props {
    token: string;
    email: string;
}
const props = defineProps<Props>();

const form = useForm({
    token: props.token,
    email: props.email,
    password: '',
    password_confirmation: '',
});

const submit = () => {
    form.post(route('password.store'), {
        onFinish: () => form.reset('password', 'password_confirmation'),
    });
};
</script>

<template>
    <Head title="Atjaunot paroli" />

    <AuthShell
        heading-line1="New password."
        heading-line2="Fresh start."
        lead="Izvēlies jaunu, drošu paroli un turpini treniņu."
    >
        <h2 class="td-h">Jauna parole</h2>
        <p class="td-sub">Ievadi un apstiprini savu jauno paroli.</p>

        <form class="td-fields" @submit.prevent="submit">
            <div>
                <label class="td-label" for="email">Email Address</label>
                <input id="email" v-model="form.email" type="email" class="td-input" readonly autocomplete="email" />
                <p v-if="form.errors.email" class="td-error">{{ form.errors.email }}</p>
            </div>
            <div>
                <label class="td-label" for="password">Jaunā parole</label>
                <input id="password" v-model="form.password" type="password" class="td-input" placeholder="Vismaz 8 rakstzīmes" required autofocus autocomplete="new-password" />
                <p v-if="form.errors.password" class="td-error">{{ form.errors.password }}</p>
            </div>
            <div>
                <label class="td-label" for="password_confirmation">Apstiprini paroli</label>
                <input id="password_confirmation" v-model="form.password_confirmation" type="password" class="td-input" placeholder="Atkārto paroli" required autocomplete="new-password" />
                <p v-if="form.errors.password_confirmation" class="td-error">{{ form.errors.password_confirmation }}</p>
            </div>
            <button type="submit" class="td-submit" :disabled="form.processing">
                {{ form.processing ? 'Notiek maiņa…' : 'Mainīt paroli' }}
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
.td-input::placeholder { color: #64748b; }
.td-error { margin-top: 6px; font-size: 12px; color: #fb2c5f; }
.td-submit { margin-top: 8px; padding: 14px; text-align: center; border-radius: 10px; background: #39ff14; color: #0b0f19; font-weight: 800; font-family: 'Barlow Condensed', sans-serif; letter-spacing: 0.5px; text-transform: uppercase; font-size: 16px; cursor: pointer; border: none; box-shadow: 0 0 20px rgba(57, 255, 20, 0.2); }
.td-submit:disabled { opacity: 0.7; cursor: not-allowed; }
</style>
