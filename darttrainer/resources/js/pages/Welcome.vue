<script setup lang="ts">
import { Head, Link, usePage } from '@inertiajs/vue3';
import { computed } from 'vue';
import type { SharedData } from '@/types';

const page = usePage<SharedData>();
const user = computed(() => page.props.auth.user);
</script>

<template>
    <Head title="Sākums" />

    <div class="flex min-h-screen flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
        <!-- Augšjosla: brends + lietotājvārds / auth saites -->
        <header class="flex w-full items-center justify-between border-b border-[#19140015] px-6 py-4 dark:border-[#EDEDEC15]">
            <span class="text-lg font-semibold">DartTrainer</span>

            <nav class="flex items-center gap-3 text-sm">
                <template v-if="user">
                    <span class="text-[#706f6c] dark:text-[#A1A09A]">
                        Sveiks, <span class="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{{ user.name }}</span>
                    </span>
                    <Link
                        :href="route('logout')"
                        method="post"
                        as="button"
                        class="rounded-sm border border-[#19140035] px-4 py-1.5 leading-normal hover:border-[#1915014a] dark:border-[#3E3E3A] dark:hover:border-[#62605b]"
                    >
                        Iziet
                    </Link>
                </template>
                <template v-else>
                    <Link
                        :href="route('login')"
                        class="rounded-sm border border-transparent px-4 py-1.5 leading-normal hover:border-[#19140035] dark:hover:border-[#3E3E3A]"
                    >
                        Pieteikties
                    </Link>
                    <Link
                        :href="route('register')"
                        class="rounded-sm border border-[#19140035] px-4 py-1.5 leading-normal hover:border-[#1915014a] dark:border-[#3E3E3A] dark:hover:border-[#62605b]"
                    >
                        Reģistrēties
                    </Link>
                </template>
            </nav>
        </header>

        <!-- Saturs -->
        <main class="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-6 py-12">
            <!-- Ielogots: sveiciens + iespējas -->
            <template v-if="user">
                <h1 class="mb-2 text-2xl font-semibold">Sveiks atpakaļ, {{ user.name }} 👋</h1>
                <p class="mb-8 text-[#706f6c] dark:text-[#A1A09A]">Izvēlies, ko darīt tālāk.</p>

                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Link
                        :href="route('profile.edit')"
                        class="rounded-lg border border-[#19140015] p-5 transition-colors hover:border-[#1915014a] dark:border-[#EDEDEC15] dark:hover:border-[#62605b]"
                    >
                        <p class="font-medium">Profils un iestatījumi</p>
                        <p class="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">Rediģē savu profilu, paroli un izskatu.</p>
                    </Link>

                    <div class="rounded-lg border border-dashed border-[#19140015] p-5 opacity-70 dark:border-[#EDEDEC15]">
                        <p class="font-medium">Spēles un treniņš</p>
                        <p class="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">Drīzumā.</p>
                    </div>
                </div>
            </template>

            <!-- Viesis: aicinājums pieteikties -->
            <template v-else>
                <h1 class="mb-2 text-2xl font-semibold">DartTrainer</h1>
                <p class="mb-8 text-[#706f6c] dark:text-[#A1A09A]">Piesakies vai izveido kontu, lai sāktu.</p>
                <div class="flex gap-3">
                    <Link
                        :href="route('register')"
                        class="rounded-sm border border-black bg-[#1b1b18] px-5 py-2 text-sm text-white hover:bg-black dark:border-[#eeeeec] dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:bg-white"
                    >
                        Reģistrēties
                    </Link>
                    <Link
                        :href="route('login')"
                        class="rounded-sm border border-[#19140035] px-5 py-2 text-sm hover:border-[#1915014a] dark:border-[#3E3E3A] dark:hover:border-[#62605b]"
                    >
                        Pieteikties
                    </Link>
                </div>
            </template>
        </main>
    </div>
</template>
