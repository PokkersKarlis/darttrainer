<script setup>
/**
 * Layout viesu (neautentificētām) lapām: login, register, forgot/reset-password, verify-email.
 * Tumšā tēma saskaņota ar veco dart-app auth ekrānu izskatu (navy + amber akcents).
 */
import { Link } from '@inertiajs/vue3';

defineProps({
    /** @type {string|null} */
    status: { type: String, default: null },
});
</script>

<template>
    <div class="min-h-screen flex flex-col items-center justify-center bg-navy-950 px-5 py-8">
        <div class="w-full max-w-[420px] flex flex-col items-center gap-2 mb-7">
            <Link href="/" class="inline-flex items-center justify-center">
                <img src="/images/logo.png" alt="DartTrainer" class="h-[54px] w-auto max-w-[220px] object-contain" />
            </Link>
        </div>

        <div class="w-full max-w-[420px] bg-[#131720] border border-[#1e2738] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.45)] p-7">
            <div
                v-if="status"
                class="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-sm font-medium text-emerald-400"
            >
                {{ status }}
            </div>

            <slot />
        </div>
    </div>
</template>
