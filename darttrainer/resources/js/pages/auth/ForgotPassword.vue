<script setup>
import GuestLayout from '@/layouts/GuestLayout.vue';
import { useForm } from '@inertiajs/vue3';

defineProps({
    status: { type: String, default: null },
});

const form = useForm({
    email: '',
});

function submit() {
    form.post('/forgot-password');
}
</script>

<template>
    <GuestLayout :status="status">
        <h1 class="text-center text-xl font-black tracking-tight text-slate-100 mb-1">Aizmirsi paroli?</h1>
        <p class="text-center text-sm text-[#7b8ba8] mb-6">
            Nav problēmu. Ievadi savu e-pastu, un mēs atsūtīsim saiti paroles maiņai.
        </p>

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
                />
                <p v-if="form.errors.email" class="mt-1.5 text-sm text-red-400">{{ form.errors.email }}</p>
            </div>

            <button
                type="submit"
                class="w-full rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-extrabold text-navy-950 transition-opacity hover:opacity-90 disabled:opacity-50"
                :disabled="form.processing"
            >
                {{ form.processing ? 'Sūta…' : 'Nosūtīt paroles maiņas saiti' }}
            </button>
        </form>
    </GuestLayout>
</template>
