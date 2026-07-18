<script setup>
/**
 * @typedef {Object} Props
 * @property {string|null} status
 */
import GuestLayout from '@/layouts/GuestLayout.vue';
import { Link, useForm } from '@inertiajs/vue3';

defineProps({
    status: { type: String, default: null },
});

const form = useForm({
    email: '',
    password: '',
    remember: false,
});

function submit() {
    form.post('/login', {
        onFinish: () => form.reset('password'),
    });
}
</script>

<template>
    <GuestLayout :status="status">
        <h1 class="text-center text-xl font-black tracking-tight text-slate-100 mb-1">Pieteikties</h1>
        <p class="text-center text-sm text-[#7b8ba8] mb-6">Turpini treniņu tur, kur pārtrauci.</p>

        <form @submit.prevent="submit" class="space-y-4">
            <div>
                <label for="email" class="block mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                    E-pasts
                </label>
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
                <label for="password" class="block mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Parole
                </label>
                <input
                    id="password"
                    v-model="form.password"
                    type="password"
                    class="w-full rounded-lg border-[1.5px] border-[#252d3d] bg-[#0b0e14] px-3.5 py-2.5 text-[15px] text-slate-100 outline-none focus:border-amber-500"
                    required
                    autocomplete="current-password"
                />
                <p v-if="form.errors.password" class="mt-1.5 text-sm text-red-400">{{ form.errors.password }}</p>
            </div>

            <div class="flex items-center justify-between text-sm">
                <label class="inline-flex items-center gap-2 text-[#7b8ba8]">
                    <input v-model="form.remember" type="checkbox" class="rounded border-[#334155] bg-[#0b0e14]" />
                    Atcerēties mani
                </label>

                <Link href="/forgot-password" class="font-bold text-amber-400 underline underline-offset-2">
                    Aizmirsi paroli?
                </Link>
            </div>

            <button
                type="submit"
                class="w-full rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-extrabold text-navy-950 transition-opacity hover:opacity-90 disabled:opacity-50"
                :disabled="form.processing"
            >
                {{ form.processing ? 'Notiek pieteikšanās…' : 'Pieteikties' }}
            </button>

            <p class="text-center text-sm text-[#5a6d82]">
                Nav konta?
                <Link href="/register" class="font-extrabold text-amber-400 underline underline-offset-2">
                    Reģistrējies
                </Link>
            </p>
        </form>
    </GuestLayout>
</template>
