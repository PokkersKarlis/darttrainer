<script setup>
import GuestLayout from '@/layouts/GuestLayout.vue';
import { useForm } from '@inertiajs/vue3';
import { computed } from 'vue';

const props = defineProps({
    status: { type: String, default: null },
});

const verificationLinkSent = computed(() => props.status === 'verification-link-sent');

const form = useForm({});
const logoutForm = useForm({});

function submit() {
    form.post('/email/verification-notification');
}

function logout() {
    logoutForm.post('/logout');
}
</script>

<template>
    <GuestLayout>
        <h1 class="text-center text-xl font-black tracking-tight text-slate-100 mb-1">Apstiprini e-pastu</h1>
        <p class="text-center text-sm text-[#7b8ba8] mb-6">
            Paldies par reģistrēšanos! Pirms turpini, apstiprini savu e-pasta adresi, noklikšķinot uz saites,
            ko tikko nosūtījām. Ja vēstuli nesaņēmi, varam nosūtīt vēlreiz.
        </p>

        <div
            v-if="verificationLinkSent"
            class="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-sm font-medium text-emerald-400"
        >
            Jauna apstiprinājuma saite tika nosūtīta uz e-pastu, ko norādīji reģistrējoties.
        </div>

        <div class="flex items-center justify-between">
            <button
                type="button"
                class="rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-extrabold text-navy-950 transition-opacity hover:opacity-90 disabled:opacity-50"
                :disabled="form.processing"
                @click="submit"
            >
                Nosūtīt vēlreiz
            </button>

            <button
                type="button"
                class="text-sm font-bold text-[#7b8ba8] underline underline-offset-2"
                @click="logout"
            >
                Iziet
            </button>
        </div>
    </GuestLayout>
</template>
