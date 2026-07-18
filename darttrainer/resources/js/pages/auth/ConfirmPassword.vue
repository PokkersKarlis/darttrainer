<script setup>
import GuestLayout from '@/layouts/GuestLayout.vue';
import { useForm } from '@inertiajs/vue3';

const form = useForm({
    password: '',
});

function submit() {
    form.post('/confirm-password', {
        onFinish: () => form.reset('password'),
    });
}
</script>

<template>
    <GuestLayout>
        <h1 class="text-center text-xl font-black tracking-tight text-slate-100 mb-1">Apstiprini paroli</h1>
        <p class="text-center text-sm text-[#7b8ba8] mb-6">
            Šī ir droša lietotnes sadaļa. Lūdzu, apstiprini savu paroli, pirms turpini.
        </p>

        <form @submit.prevent="submit" class="space-y-4">
            <div>
                <label for="password" class="block mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">Parole</label>
                <input
                    id="password"
                    v-model="form.password"
                    type="password"
                    class="w-full rounded-lg border-[1.5px] border-[#252d3d] bg-[#0b0e14] px-3.5 py-2.5 text-[15px] text-slate-100 outline-none focus:border-amber-500"
                    required
                    autofocus
                    autocomplete="current-password"
                />
                <p v-if="form.errors.password" class="mt-1.5 text-sm text-red-400">{{ form.errors.password }}</p>
            </div>

            <button
                type="submit"
                class="w-full rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-extrabold text-navy-950 transition-opacity hover:opacity-90 disabled:opacity-50"
                :disabled="form.processing"
            >
                {{ form.processing ? 'Apstiprina…' : 'Apstiprināt' }}
            </button>
        </form>
    </GuestLayout>
</template>
