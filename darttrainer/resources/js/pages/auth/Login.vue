<script setup lang="ts">
import AuthShell from '@/layouts/AuthShell.vue';
import { Head, Link, useForm } from '@inertiajs/vue3';
import { ref } from 'vue';

defineProps<{
    status?: string;
    canResetPassword: boolean;
}>();

const form = useForm({
    email: '',
    password: '',
    remember: false,
});

const showPassword = ref(false);

const submit = () => {
    form.post(route('login'), {
        onFinish: () => form.reset('password'),
    });
};
</script>

<template>
    <Head title="Pieteikties" />

    <AuthShell
        heading-line1="Welcome back."
        heading-line2="Time to check in."
        lead="Pick up where you left off — your averages, live matches and training streak are waiting."
    >
        <h2 class="td-h">Log in</h2>
        <p class="td-sub">Enter your details to access your dashboard.</p>

        <div v-if="status" class="td-status">{{ status }}</div>

        <form class="td-fields" @submit.prevent="submit">
            <div>
                <label class="td-label" for="email">Email Address</label>
                <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    class="td-input"
                    placeholder="you@example.com"
                    required
                    autofocus
                    autocomplete="email"
                />
                <p v-if="form.errors.email" class="td-error">{{ form.errors.email }}</p>
            </div>

            <div>
                <div class="td-label-row">
                    <label class="td-label" for="password">Password</label>
                    <Link v-if="canResetPassword" :href="route('password.request')" class="td-link">Forgot password?</Link>
                </div>
                <div class="td-input-wrap">
                    <input
                        id="password"
                        v-model="form.password"
                        :type="showPassword ? 'text' : 'password'"
                        class="td-input"
                        placeholder="Enter your password"
                        required
                        autocomplete="current-password"
                    />
                    <button type="button" class="td-eye" aria-label="Rādīt paroli" @click="showPassword = !showPassword">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" />
                        </svg>
                    </button>
                </div>
                <p v-if="form.errors.password" class="td-error">{{ form.errors.password }}</p>
            </div>

            <label class="td-check-row">
                <span class="td-check" :class="{ 'td-check--on': form.remember }">
                    <svg v-if="form.remember" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0b0f19" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                    </svg>
                </span>
                <input v-model="form.remember" type="checkbox" class="sr-only" />
                <span class="td-check-lbl">Remember me on this device</span>
            </label>

            <button type="submit" class="td-submit" :disabled="form.processing">
                {{ form.processing ? 'Logging in…' : 'Log In' }}
            </button>
        </form>

        <div class="td-foot">
            Don't have an account?
            <Link :href="route('register')" class="td-link td-link--bold">Sign up</Link>
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
.td-status {
    margin-bottom: 16px;
    border-radius: 10px;
    background: rgba(57, 255, 20, 0.08);
    border: 1px solid rgba(57, 255, 20, 0.25);
    padding: 10px 14px;
    font-size: 13px;
    color: #39ff14;
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
.td-label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
}
.td-label-row .td-label {
    margin-bottom: 0;
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
.td-input-wrap {
    position: relative;
}
.td-eye {
    position: absolute;
    top: 0;
    right: 14px;
    bottom: 0;
    display: flex;
    align-items: center;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
}
.td-link {
    font-size: 12px;
    color: #39ff14;
    text-decoration: none;
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
.td-check {
    width: 20px;
    height: 20px;
    border-radius: 6px;
    flex-shrink: 0;
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
.td-submit:disabled {
    opacity: 0.7;
    cursor: not-allowed;
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
