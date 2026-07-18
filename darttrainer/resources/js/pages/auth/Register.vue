<script setup lang="ts">
import AuthShell from '@/layouts/AuthShell.vue';
import { Head, Link, useForm } from '@inertiajs/vue3';
import { computed, ref } from 'vue';

const form = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
});

const showPassword = ref(false);
const termsAccepted = ref(false);

/** Vienkāršs paroles stipruma novērtējums (0–4). */
const strength = computed(() => {
    const p = form.password;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
});

const strengthMeta = computed(() => {
    if (!form.password) return { width: '0%', color: '#1f2937', label: '' };
    if (strength.value <= 1) return { width: '35%', color: '#fbbf24', label: 'Weak — add numbers and symbols for a stronger score' };
    if (strength.value === 2) return { width: '60%', color: '#fbbf24', label: 'Fair — getting there' };
    if (strength.value === 3) return { width: '80%', color: '#39ff14', label: 'Good' };
    return { width: '100%', color: '#39ff14', label: 'Strong' };
});

const submit = () => {
    if (!termsAccepted.value) return;
    form.post(route('register'), {
        onFinish: () => form.reset('password', 'password_confirmation'),
    });
};
</script>

<template>
    <Head title="Reģistrēties" />

    <AuthShell
        heading-line1="Track every dart."
        heading-line2="Sharpen every leg."
        lead="Join players tracking averages, checkouts and live matches — and training with structured drills built for real improvement."
    >
        <h2 class="td-h">Create your account</h2>
        <p class="td-sub">Start tracking your game in under a minute.</p>

        <form class="td-fields" @submit.prevent="submit">
            <div>
                <label class="td-label" for="name">Full Name</label>
                <input id="name" v-model="form.name" type="text" class="td-input" placeholder="Marcus Reid" required autofocus autocomplete="name" />
                <p v-if="form.errors.name" class="td-error">{{ form.errors.name }}</p>
            </div>

            <div>
                <label class="td-label" for="email">Email Address</label>
                <input id="email" v-model="form.email" type="email" class="td-input" placeholder="you@example.com" required autocomplete="email" />
                <p v-if="form.errors.email" class="td-error">{{ form.errors.email }}</p>
            </div>

            <div>
                <label class="td-label" for="password">Password</label>
                <div class="td-input-wrap">
                    <input
                        id="password"
                        v-model="form.password"
                        :type="showPassword ? 'text' : 'password'"
                        class="td-input"
                        placeholder="At least 8 characters"
                        required
                        autocomplete="new-password"
                    />
                    <button type="button" class="td-eye" aria-label="Rādīt paroli" @click="showPassword = !showPassword">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" />
                        </svg>
                    </button>
                </div>
                <div class="td-strength-track">
                    <div class="td-strength-fill" :style="{ width: strengthMeta.width, background: strengthMeta.color }" />
                </div>
                <div v-if="strengthMeta.label" class="td-strength-lbl">{{ strengthMeta.label }}</div>
                <p v-if="form.errors.password" class="td-error">{{ form.errors.password }}</p>
            </div>

            <div>
                <label class="td-label" for="password_confirmation">Confirm Password</label>
                <input
                    id="password_confirmation"
                    v-model="form.password_confirmation"
                    type="password"
                    class="td-input"
                    placeholder="Re-enter your password"
                    required
                    autocomplete="new-password"
                />
                <p v-if="form.errors.password_confirmation" class="td-error">{{ form.errors.password_confirmation }}</p>
            </div>

            <label class="td-check-row td-check-row--top">
                <span class="td-check" :class="{ 'td-check--on': termsAccepted }">
                    <svg v-if="termsAccepted" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0b0f19" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                    </svg>
                </span>
                <input v-model="termsAccepted" type="checkbox" class="sr-only" />
                <span class="td-check-lbl">
                    I agree to the <a href="#" class="td-link">Terms of Service</a> and <a href="#" class="td-link">Privacy Policy</a>
                </span>
            </label>

            <button type="submit" class="td-submit" :class="{ 'td-submit--off': !termsAccepted }" :disabled="!termsAccepted || form.processing">
                {{ form.processing ? 'Creating…' : 'Create Account' }}
            </button>
        </form>

        <div class="td-foot">
            Already have an account?
            <Link :href="route('login')" class="td-link td-link--bold">Log in</Link>
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
.td-strength-track {
    margin-top: 10px;
    height: 4px;
    border-radius: 4px;
    background: #1f2937;
    overflow: hidden;
}
.td-strength-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.2s;
}
.td-strength-lbl {
    margin-top: 6px;
    font-size: 12px;
    color: #64748b;
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
