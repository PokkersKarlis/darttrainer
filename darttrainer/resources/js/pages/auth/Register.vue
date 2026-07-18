<script setup>
import GuestLayout from '@/layouts/GuestLayout.vue';
import { Link, useForm } from '@inertiajs/vue3';
import { computed } from 'vue';

const form = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    account_type: 'player',
    club_name: '',
});

const isClub = computed(() => form.account_type === 'club');

function submit() {
    form.post('/register', {
        onFinish: () => form.reset('password', 'password_confirmation'),
    });
}
</script>

<template>
    <GuestLayout>
        <h1 class="text-center text-xl font-black tracking-tight text-slate-100 mb-1">Reģistrēties</h1>
        <p class="text-center text-sm text-[#7b8ba8] mb-6">Izveido kontu un sāc trenēties.</p>

        <form @submit.prevent="submit" class="space-y-4">
            <div>
                <label for="name" class="block mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">Vārds</label>
                <input
                    id="name"
                    v-model="form.name"
                    type="text"
                    class="w-full rounded-lg border-[1.5px] border-[#252d3d] bg-[#0b0e14] px-3.5 py-2.5 text-[15px] text-slate-100 outline-none focus:border-amber-500"
                    required
                    autofocus
                    autocomplete="name"
                />
                <p v-if="form.errors.name" class="mt-1.5 text-sm text-red-400">{{ form.errors.name }}</p>
            </div>

            <div>
                <label for="email" class="block mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">E-pasts</label>
                <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    class="w-full rounded-lg border-[1.5px] border-[#252d3d] bg-[#0b0e14] px-3.5 py-2.5 text-[15px] text-slate-100 outline-none focus:border-amber-500"
                    required
                    autocomplete="username"
                />
                <p v-if="form.errors.email" class="mt-1.5 text-sm text-red-400">{{ form.errors.email }}</p>
            </div>

            <fieldset>
                <legend class="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Konta tips</legend>
                <div class="flex gap-3">
                    <label
                        class="flex-1 cursor-pointer rounded-xl border-2 px-3 py-2.5 text-center text-[13px] font-extrabold transition-colors"
                        :class="form.account_type === 'player'
                            ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                            : 'border-slate-700 bg-[#060d18] text-slate-400'"
                    >
                        <input v-model="form.account_type" type="radio" value="player" class="sr-only" />
                        Spēlētājs
                    </label>
                    <label
                        class="flex-1 cursor-pointer rounded-xl border-2 px-3 py-2.5 text-center text-[13px] font-extrabold transition-colors"
                        :class="form.account_type === 'club'
                            ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                            : 'border-slate-700 bg-[#060d18] text-slate-400'"
                    >
                        <input v-model="form.account_type" type="radio" value="club" class="sr-only" />
                        Klubs
                    </label>
                </div>
                <p v-if="form.errors.account_type" class="mt-1.5 text-sm text-red-400">{{ form.errors.account_type }}</p>
            </fieldset>

            <div v-if="isClub" class="rounded-xl border border-slate-700 bg-amber-500/[0.06] p-3.5">
                <label for="club_name" class="block mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Kluba nosaukums
                </label>
                <input
                    id="club_name"
                    v-model="form.club_name"
                    type="text"
                    class="w-full rounded-lg border-[1.5px] border-[#252d3d] bg-[#0b0e14] px-3.5 py-2.5 text-[15px] text-slate-100 outline-none focus:border-amber-500"
                />
                <p v-if="form.errors.club_name" class="mt-1.5 text-sm text-red-400">{{ form.errors.club_name }}</p>
            </div>

            <div>
                <label for="password" class="block mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">Parole</label>
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
                {{ form.processing ? 'Notiek reģistrācija…' : 'Reģistrēties' }}
            </button>

            <p class="text-center text-sm text-[#5a6d82]">
                Jau ir konts?
                <Link href="/login" class="font-extrabold text-amber-400 underline underline-offset-2">Pieteikties</Link>
            </p>
        </form>
    </GuestLayout>
</template>
