<script setup lang="ts">
import AuthShell from '@/layouts/AuthShell.vue';
import { Head, Link, useForm } from '@inertiajs/vue3';

defineProps<{ status?: string }>();

const form = useForm({ email: '' });

const submit = () => form.post(route('password.email'));
</script>

<template>
    <Head title="Aizmirsi paroli" />

    <AuthShell
        heading-line1="Locked out?"
        heading-line2="Let's fix that."
        lead="Ievadi savu e-pastu, un mēs atsūtīsim saiti paroles atjaunošanai."
    >
        <h2 class="td-h">Aizmirsi paroli?</h2>
        <p class="td-sub">Ievadi e-pastu, un saņemsi paroles atjaunošanas saiti.</p>

        <div v-if="status" class="td-status">{{ status }}</div>

        <form class="td-fields" @submit.prevent="submit">
            <div>
                <label class="td-label" for="email">Email Address</label>
                <input id="email" v-model="form.email" type="email" class="td-input" placeholder="you@example.com" required autofocus autocomplete="email" />
                <p v-if="form.errors.email" class="td-error">{{ form.errors.email }}</p>
            </div>
            <button type="submit" class="td-submit" :disabled="form.processing">
                {{ form.processing ? 'Sūta…' : 'Nosūtīt saiti' }}
            </button>
        </form>

        <div class="td-foot">
            Atceries paroli?
            <Link :href="route('login')" class="td-link td-link--bold">Pieteikties</Link>
        </div>
    </AuthShell>
</template>

<style scoped>
.td-h { font-family: 'Barlow Condensed', sans-serif; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; font-size: 30px; margin: 0 0 8px; }
.td-sub { color: #64748b; font-size: 14px; margin: 0 0 28px; }
.td-status { margin-bottom: 16px; border-radius: 10px; background: rgba(57, 255, 20, 0.08); border: 1px solid rgba(57, 255, 20, 0.25); padding: 10px 14px; font-size: 13px; color: #39ff14; }
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
