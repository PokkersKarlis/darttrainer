<script setup>
/**
 * Sākumlapa (Inertia). Pamata versija: sveiciens, spēļu režīmu izvēle, navigācija.
 * Dzīvās spēles / aktīvās istabas tiks pievienotas nākamajā solī.
 */
import { computed } from 'vue';
import AppLayout from '@/layouts/AppLayout.vue';
import { useAuth } from '@/composables/useAuth.js';
import { useI18n } from '@/composables/useI18n.js';
import { useToast } from '@/composables/useToast.js';
import { go } from '@/lib/spaBridge.js';
import { X01_LOBBY_AND_TRAINING_ENABLED } from '@/dart-app/composables/useCanPlayX01.js';

const { user, isLoggedIn, needsEmailVerify, canPlayGames } = useAuth();
const { t } = useI18n();
const { toast } = useToast();

const x01Enabled = X01_LOBBY_AND_TRAINING_ENABLED;

/**
 * @typedef {Object} GameMode
 * @property {string} id
 * @property {string} label
 * @property {string} desc
 * @property {string} color
 * @property {boolean} enabled
 */

/** @type {import('vue').ComputedRef<GameMode[]>} */
const gameModes = computed(() => [
    { id: 'cricket', label: t('nav.gameCricket'), desc: t('home.modeCricketDesc'), color: '#4a9eff', enabled: true },
    { id: 'x501', label: t('nav.gameX01501'), desc: t('home.modeX501Desc'), color: '#f5a623', enabled: x01Enabled },
    { id: 'x301', label: t('nav.gameX01301'), desc: t('home.modeX301Desc'), color: '#3ecf8e', enabled: x01Enabled },
]);

/** @param {GameMode} mode */
function playMode(mode) {
    if (!isLoggedIn.value) return go('/login');
    if (needsEmailVerify.value) return toast(t('auth.verifyEmailToContinue'), 'error');
    if (!canPlayGames.value) return toast(t('nav.gamesTeaserHint'), 'error');
    if (!mode.enabled) return toast(t('nav.x01UnavailableHint'), 'error');

    if (mode.id === 'cricket') return go('/lobby/cricket');
    return go(`/lobby/x01?variant=${mode.id === 'x501' ? 501 : 301}`);
}
</script>

<template>
    <AppLayout title-key="nav.home">
        <div class="mx-auto w-full max-w-4xl px-5 py-8">
            <!-- Sveiciens -->
            <header class="mb-8">
                <h1 class="text-2xl font-black tracking-tight text-slate-100">
                    <template v-if="isLoggedIn">
                        {{ t('home.greeting') }}, <span class="text-amber-400">{{ user.name }}</span>
                    </template>
                    <template v-else>
                        {{ t('home.brandWordmark') }}
                    </template>
                </h1>
                <p class="mt-1 text-sm text-slate-400">{{ t('home.subtitle') }}</p>
            </header>

            <!-- Viesa CTA -->
            <section
                v-if="!isLoggedIn"
                class="mb-8 rounded-2xl border border-[#1e2738] bg-[#131720] p-6"
            >
                <p class="text-slate-200 font-semibold mb-1">{{ t('home.guestCtaTitle') }}</p>
                <p class="text-sm text-slate-400 mb-4">{{ t('home.guestCtaText') }}</p>
                <div class="flex flex-wrap gap-3">
                    <button type="button" class="rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-extrabold text-navy-950 hover:opacity-90" @click="go('/register')">
                        {{ t('shell.register') }}
                    </button>
                    <button type="button" class="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-bold text-slate-200 hover:bg-slate-800" @click="go('/login')">
                        {{ t('shell.login') }}
                    </button>
                </div>
            </section>

            <!-- Spēļu režīmi -->
            <section>
                <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-200">
                    <span class="h-4 w-1.5 rounded-full bg-amber-500" />
                    {{ t('home.sbModes') }}
                </h2>

                <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <button
                        v-for="mode in gameModes"
                        :key="mode.id"
                        type="button"
                        class="group relative overflow-hidden rounded-2xl border border-[#1e2738] bg-[#131720] p-5 text-left transition-colors hover:border-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                        :disabled="!mode.enabled"
                        @click="playMode(mode)"
                    >
                        <span
                            class="absolute inset-x-0 top-0 h-1"
                            :style="{ background: mode.color }"
                        />
                        <p class="text-base font-extrabold text-slate-100">{{ mode.label }}</p>
                        <p class="mt-1 text-xs leading-relaxed text-slate-400">{{ mode.desc }}</p>
                        <p v-if="!mode.enabled" class="mt-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                            {{ t('nav.x01UnavailableHint') }}
                        </p>
                    </button>
                </div>
            </section>
        </div>
    </AppLayout>
</template>
