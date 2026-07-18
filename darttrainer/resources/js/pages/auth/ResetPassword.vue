<script setup>
import GuestLayout from '@/layouts/GuestLayout.vue';
import { useForm } from '@inertiajs/vue3';

const props = defineProps({
    email: { type: String, default: '' },
    token: { type: String, required: true },
});

const form = useForm({
    token: props.token,
    email: props.email,
    password: '',
    password_confirmation: '',
});

function submit() {
    form.post('/reset-password', {
        onFinish: () => form.reset('password', 'password_confirmation'),
    });
}
</script>

<template>
    <GuestLayout>
        <h1 class="text-center text-xl font-black tracking-tight text-slate-100 mb-1">Jauna parole</h1>
        <p class="text-center text-sm text-[#7b8ba8] mb-6">Ievadi un apstiprini savu jauno paroli.</p>

        <form @submit.prevent="submit" class="space-y-4">
            <div>
                <label for="email" class="block mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">E-pasts</label>
                <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    class="w-full rounded-lg border-[1.5px] border-[#252d3d] bg-[#0b0e14] px-3.5 py-2.5 text-[15px] text-slate-100 outline-none focus:border-amber-500"
                    required
                    autofocus
                    autocomplete="username"
                />
                <p v-if="form.errors.email" class="mt-1.5 text-sm text-red-400">{{ form.errors.email }}</p>
            </div>

            <div>
                <label for="password" class="block mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">Jaunā parole</label>
                <input
                    id="password"
                    v-model="form.password"
                    type="password"
                    class="w-full rounded-lg border-[1.5px] border-[#252d3d] bg-[#0b0e14] px-3.5 py-2.5 text-[15px] text-slate-100 outline-none focus:border-amber-500"
                    required
                    autocomplete="new-password"
                />
                <p v-if="form.errors.password" class="mt-1.5 text-sm text-red-400">{{ form.errors.password }}</p>
            </div>

            <div>
                <label for="password_confirmation" class="block mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Apstiprini paroli
                </label>
                <input
                    id="password_confirmation"
                    v-model="form.password_confirmation"
                    type="password"
                    class="w-full rounded-lg border-[1.5px] border-[#252d3d] bg-[#0b0e14] px-3.5 py-2.5 text-[15px] text-slate-100 outline-none focus:border-amber-500"
                    required
                    autocomplete="new-password"
                />
                <p v-if="form.errors.password_confirmation" class="mt-1.5 text-sm text-red-400">
                    {{ form.errors.password_confirmation }}
                </p>
            </div>

            <button
                type="submit"
                class="w-full rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-extrabold text-navy-950 transition-opacity hover:opacity-90 disabled:opacity-50"
                :disabled="form.processing"
            >
                {{ form.processing ? 'Notiek maiņa…' : 'Mainīt paroli' }}
            </button>
        </form>
    </GuestLayout>
</template>
