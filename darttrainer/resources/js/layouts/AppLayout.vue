<script setup>
/**
 * Persistent shell Inertia lapām — sānjosla + augšējā josla + reklāmu sleja (desktop),
 * kompaktā augšjosla (mobilajā), e-pasta apstiprināšanas banneris un toast paziņojumi.
 *
 * Tīra Inertia versija no vecā dart-app HomeCanvasLayout.vue. Atkalizmanto to pašu
 * dizaina CSS (dth-* klases no home-design.css), lai izskats paliek identisks.
 *
 * Navigācija:
 *  - migrētās lapas (/, /login, /register) → Inertia (bez pārlādes);
 *  - vēl nemigrētās (/friends, /stats, /lobby, /training, /admin) → pilna pārlāde caur go().
 *
 * @typedef {Object} Props
 * @property {string} [title] Augšjoslā rādāmais nosaukums (tulkojuma atslēga vai teksts).
 * @property {string} [titleKey] Tulkojuma atslēga nosaukumam (priekšroka pār `title`).
 */
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuth } from '@/composables/useAuth.js';
import { useI18n } from '@/composables/useI18n.js';
import { useToast } from '@/composables/useToast.js';
import { go } from '@/lib/spaBridge.js';
import UserMenu from '@/components/shell/UserMenu.vue';
import EmailVerifyBanner from '@/components/shell/EmailVerifyBanner.vue';

const props = defineProps({
    title: { type: String, default: '' },
    titleKey: { type: String, default: '' },
});

const { isLoggedIn, needsEmailVerify, canPlayGames } = useAuth();
const { locale, t } = useI18n();
const { toasts, toast } = useToast();

const headerTitle = computed(() => {
    if (props.titleKey) return t(props.titleKey);
    return props.title;
});

// ── Responsīvais karogs (mobilā vs desktop chrome) ──
const isMobile = ref(
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches,
);
let mq;
function setMobileFlag() {
    isMobile.value = window.matchMedia('(max-width: 767px)').matches;
}

onMounted(() => {
    locale.initFromStorage();
    setMobileFlag();
    mq = window.matchMedia('(max-width: 767px)');
    mq.addEventListener('change', setMobileFlag);
});
onUnmounted(() => {
    mq?.removeEventListener('change', setMobileFlag);
});

// ── Navigācija ar atļauju pārbaudēm ──
/**
 * @param {string} url
 * @param {{ requireGames?: boolean }} [opts]
 */
function navGuarded(url, opts = {}) {
    if (needsEmailVerify.value) {
        toast(t('auth.verifyEmailToContinue'), 'error');
        return;
    }
    if (opts.requireGames && !canPlayGames.value) {
        toast(t('nav.gamesTeaserHint'), 'error');
        return;
    }
    go(url);
}

function goFriends() {
    if (!isLoggedIn.value) return go('/login');
    navGuarded('/friends');
}
function goStats() {
    if (!isLoggedIn.value) return go('/login');
    navGuarded('/stats');
}

const isHomeActive = computed(() => window.location.pathname === '/');
</script>

<template>
    <div class="dth-canvas dth-home">
        <!-- ───────────── DESKTOP ───────────── -->
        <div v-if="!isMobile" class="dth-canvas--desktop">
            <aside class="dth-sb" aria-label="Navigācija">
                <div
                    class="dth-sb-logo"
                    role="link"
                    tabindex="0"
                    aria-label="DartTrainer"
                    style="cursor: pointer"
                    @click="go('/')"
                    @keydown.enter.prevent="go('/')"
                    @keydown.space.prevent="go('/')"
                >
                    <img
                        class="dth-sb-logo-img"
                        src="/images/logo.png"
                        alt="DartTrainer"
                        width="160"
                        height="52"
                        loading="lazy"
                        decoding="async"
                    />
                    <div class="dth-sb-logo-sub" aria-hidden="true">
                        <span class="dth-sb-wordmark-line">{{ t('home.brandWordmark') }}</span>
                        <span class="dth-sb-beta">{{ t('home.betaBadge') }}</span>
                    </div>
                </div>

                <div class="dth-sb-nav">
                    <div>
                        <button
                            type="button"
                            :class="['dth-sb-row', { 'dth-sb-row--on': isHomeActive }]"
                            @click="go('/')"
                        >
                            <span class="dth-sb-lbl">{{ t('nav.home') }}</span>
                        </button>

                        <div class="dth-sb-sec">{{ t('home.sbMulti') }}</div>
                        <button
                            type="button"
                            class="dth-sb-row"
                            :disabled="!canPlayGames || needsEmailVerify"
                            @click="navGuarded('/lobby/cricket', { requireGames: true })"
                        >
                            <span class="dth-sb-lbl">{{ t('nav.lobbyCricket') }}</span>
                        </button>
                        <button
                            type="button"
                            class="dth-sb-row"
                            :disabled="!canPlayGames || needsEmailVerify"
                            @click="goFriends"
                        >
                            <span class="dth-sb-lbl">{{ t('nav.friends') }}</span>
                        </button>

                        <div class="dth-sb-sec">{{ t('home.sbProgress') }}</div>
                        <button
                            type="button"
                            class="dth-sb-row"
                            :disabled="!canPlayGames || needsEmailVerify"
                            @click="goStats"
                        >
                            <span class="dth-sb-lbl">{{ t('nav.stats') }}</span>
                        </button>
                    </div>
                </div>
            </aside>

            <div class="dth-mid">
                <div class="dth-tb">
                    <span class="dth-tb-t">{{ headerTitle }}</span>
                    <div class="dh-tb-r">
                        <div class="dth-locale" role="group" :aria-label="t('lang.lv') + ' / ' + t('lang.en')">
                            <button type="button" :class="{ 'dth-locale--on': locale.locale === 'lv' }" @click="locale.setLocale('lv')">
                                {{ t('lang.lv') }}
                            </button>
                            <button type="button" :class="{ 'dth-locale--on': locale.locale === 'en' }" @click="locale.setLocale('en')">
                                {{ t('lang.en') }}
                            </button>
                        </div>
                        <UserMenu />
                    </div>
                </div>

                <div class="dth-sc">
                    <EmailVerifyBanner v-if="needsEmailVerify" />
                    <slot />
                </div>
            </div>

            <div class="dth-ads" aria-hidden="true">
                <div v-for="j in 2" :key="j" class="dth-adslot">
                    AD<span class="dth-adsz">60×160</span>
                </div>
            </div>
        </div>

        <!-- ───────────── MOBILE ───────────── -->
        <div v-else class="dth-canvas--mobile">
            <div class="dth-mi-top">
                <div
                    class="dth-mi-brand"
                    role="link"
                    tabindex="0"
                    aria-label="DartTrainer"
                    style="cursor: pointer"
                    @click="go('/')"
                    @keydown.enter.prevent="go('/')"
                    @keydown.space.prevent="go('/')"
                >
                    <img
                        class="dth-mi-logo-img"
                        src="/images/logo.png"
                        alt=""
                        width="120"
                        height="40"
                        loading="lazy"
                        decoding="async"
                    />
                    <div class="dth-mi-logo-sub">
                        <span class="dth-mi-wm">{{ t('home.brandWordmark') }}</span>
                        <span class="dth-mi-beta">{{ t('home.betaBadge') }}</span>
                    </div>
                </div>
                <div
                    v-if="!isLoggedIn"
                    class="dth-locale dth-mi-locale"
                    role="group"
                    :aria-label="t('lang.lv') + ' / ' + t('lang.en')"
                >
                    <button type="button" :class="{ 'dth-locale--on': locale.locale === 'lv' }" @click="locale.setLocale('lv')">
                        {{ t('lang.lv') }}
                    </button>
                    <button type="button" :class="{ 'dth-locale--on': locale.locale === 'en' }" @click="locale.setLocale('en')">
                        {{ t('lang.en') }}
                    </button>
                </div>
                <div class="dth-mi-r" style="min-width: 0; flex: 0 1 auto">
                    <UserMenu />
                </div>
            </div>
            <div class="dh-mi-sc">
                <EmailVerifyBanner v-if="needsEmailVerify" />
                <slot />
            </div>
        </div>

        <!-- ───────────── TOASTS ───────────── -->
        <div class="dt-toast-stack" aria-live="polite">
            <transition-group name="fade">
                <div
                    v-for="item in toasts"
                    :key="item.id"
                    class="dt-toast"
                    :class="item.type === 'error' ? 'dt-toast--error' : 'dt-toast--success'"
                >
                    {{ item.message }}
                </div>
            </transition-group>
        </div>
    </div>
</template>

<style scoped>
.dt-toast-stack {
    position: fixed;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
}
.dt-toast {
    padding: 10px 16px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    width: min(92vw, 360px);
    max-width: 360px;
    text-align: center;
}
.dt-toast--success {
    background: linear-gradient(135deg, #065f46, #059669);
    border: 1px solid rgba(52, 211, 153, 0.25);
}
.dt-toast--error {
    background: linear-gradient(135deg, #7f1d1d, #dc2626);
    border: 1px solid rgba(248, 113, 113, 0.35);
}
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
