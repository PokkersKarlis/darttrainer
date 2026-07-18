<script setup lang="ts">
import BrandLogo from '@/components/BrandLogo.vue';
import LanguageSwitcher from '@/components/LanguageSwitcher.vue';
import NavIcon from '@/components/NavIcon.vue';
import { useLocale } from '@/composables/useLocale';
import { Head, Link, router, usePage } from '@inertiajs/vue3';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { SharedData } from '@/types';

const page = usePage<SharedData>();
const user = computed(() => page.props.auth.user);
const { t, locale } = useLocale();

const pageTitle = computed(() => t('header.title'));

// ── Lietotāja profila izvēlne (dropdown) ──
// Kopīgs stāvoklis gan darbvirsmas sānjoslas, gan mobilās apakšjoslas trigerim,
// jo mobilajā izkārtojumā darbvirsmas sānjosla ir paslēpta (skat. .td-side--left).
const menuOpen = ref(false);
const menuDesktopRef = ref<HTMLElement | null>(null);
const menuMobileRef = ref<HTMLElement | null>(null);

function toggleMenu() {
    menuOpen.value = !menuOpen.value;
}
function logout() {
    menuOpen.value = false;
    router.post(route('logout'));
}
function onDocClick(e: MouseEvent) {
    if (!menuOpen.value) return;
    const target = e.target as Node;
    const insideDesktop = menuDesktopRef.value?.contains(target);
    const insideMobile = menuMobileRef.value?.contains(target);
    if (!insideDesktop && !insideMobile) {
        menuOpen.value = false;
    }
}
onMounted(() => document.addEventListener('click', onDocClick, true));
onUnmounted(() => document.removeEventListener('click', onDocClick, true));

// ── Mobilā aizvelkamā izvēlne (hamburgeris → nav aizkars) ──
const mobileDrawerOpen = ref(false);
function toggleDrawer() {
    mobileDrawerOpen.value = !mobileDrawerOpen.value;
}
function closeDrawer() {
    mobileDrawerOpen.value = false;
}

const firstName = computed(() => user.value?.name?.split(' ')[0] ?? '');
const initials = computed(() =>
    (user.value?.name ?? '')
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase(),
);

// ── Vietturu dati (līdz reāliem spēļu datiem) ──
const nav = [
    { key: 'dashboard', active: true },
    { key: 'play', active: false },
    { key: 'training', active: false },
    { key: 'tournaments', active: false },
    { key: 'live', active: false },
    { key: 'friends', active: false },
];

const mobileNav = [
    { key: 'home', active: true },
    { key: 'play', active: false },
    { key: 'stats', active: false },
];

const statsRaw = [
    { key: 'avg', value: '74.2', trend: '+2.1', up: true },
    { key: 'checkout', value: '38%', trend: '+4%', up: true },
    { key: '180s', value: '12', trend: '+3', up: true },
    { key: 'legsWon', value: '58%', trend: '−1%', up: false },
];

const formGuide = ['W', 'W', 'L', 'W', 'W', 'W', 'L', 'W', 'L', 'W'];

const liveMatches = [
    { p1: 'J. Price', score1: 4, score2: 3, p2: 'M. Suljović', leg1: 4, leg2: 3, avg1: 98.4, avg2: 91.2 },
    { p1: 'D. Cross', score1: 2, score2: 5, p2: 'G. Anderson', leg1: 2, leg2: 5, avg1: 87.1, avg2: 95.6 },
];

// Vietturu saturs — abas valodas, jo tas ir brīvi formulēts teksts, nevis UI uzraksts.
const activityByLocale = {
    lv: [
        { text: 'Anna uzvarēja Tomu 3–1 spēlē X01 501', time: 'pirms 4 min' },
        { text: 'Kārlis trāpīja 180', time: 'pirms 12 min' },
        { text: 'Jānis sāka Cricket maču', time: 'pirms 25 min' },
        { text: 'Atjauninātas nedēļas turnīra iekavas', time: 'pirms 1 h' },
    ],
    en: [
        { text: 'Anna beat Toms 3–1 in X01 501', time: '4 min ago' },
        { text: 'Kārlis hit a 180', time: '12 min ago' },
        { text: 'Jānis started a Cricket match', time: '25 min ago' },
        { text: 'Weekly tournament brackets updated', time: '1 h ago' },
    ],
};
const activityFeed = computed(() => activityByLocale[locale.value]);

const friends = [
    { name: 'Anna B.', initials: 'AB', online: true, statusKey: 'online' as const },
    { name: 'Toms K.', initials: 'TK', online: true, statusKey: 'inMatch' as const },
    { name: 'Jānis P.', initials: 'JP', online: false, statusKey: 'offline' as const },
];

const leaderboard = computed(() => [
    { rank: 1, name: 'G. Anderson', avg: '96.2' },
    { rank: 2, name: 'J. Price', avg: '94.8' },
    { rank: 3, name: 'A. Bērziņa', avg: '88.1' },
    { rank: 4, name: firstName.value || 'You', avg: '74.2' },
    { rank: 5, name: 'T. Klāvs', avg: '71.5' },
]);
</script>

<template>
    <Head :title="pageTitle" />

    <!-- ══════════ IELOGOTS: dashboard ══════════ -->
    <div v-if="user" class="td-dash">
        <!-- Kreisā sānjosla (darbvirsma) -->
        <aside class="td-side td-side--left">
            <div class="td-side-logo"><BrandLogo :width="157" /></div>
            <nav class="td-nav">
                <button v-for="item in nav" :key="item.key" type="button" class="td-nav-item" :class="{ 'td-nav-item--on': item.active }">
                    <NavIcon :name="item.key" class="td-nav-ico" />
                    <span>{{ t(`nav.${item.key}`) }}</span>
                </button>
            </nav>
            <div ref="menuDesktopRef" class="td-usercard-wrap">
                <button type="button" class="td-usercard" :class="{ 'td-usercard--open': menuOpen }" @click="toggleMenu">
                    <div class="td-usercard-av">{{ initials || '·' }}</div>
                    <div class="td-usercard-info">
                        <div class="td-usercard-name">{{ user.name }}</div>
                        <div class="td-usercard-sub">{{ t('usercard.rank') }}</div>
                    </div>
                    <svg class="td-usercard-caret" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6 15l6-6 6 6" />
                    </svg>
                </button>

                <div v-if="menuOpen" class="td-menu" role="menu">
                    <Link :href="route('profile.edit')" class="td-menu-item" @click="menuOpen = false">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 20a8 8 0 0116 0" /></svg>
                        {{ t('menu.profile') }}
                    </Link>
                    <Link :href="route('password.edit')" class="td-menu-item" @click="menuOpen = false">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></svg>
                        {{ t('menu.password') }}
                    </Link>
                    <Link :href="route('appearance')" class="td-menu-item" @click="menuOpen = false">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" /></svg>
                        {{ t('menu.appearance') }}
                    </Link>
                    <div class="td-menu-sep" />
                    <button type="button" class="td-menu-item td-menu-item--danger" @click="logout">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                        {{ t('menu.logout') }}
                    </button>
                </div>
            </div>
        </aside>

        <!-- Mobilais aizkara fons + aizvelkamā izvēlne (hamburgeris) -->
        <Transition name="td-fade">
            <div v-if="mobileDrawerOpen" class="td-drawer-backdrop" @click="closeDrawer" />
        </Transition>
        <Transition name="td-slide">
            <aside v-if="mobileDrawerOpen" class="td-drawer">
                <div class="td-drawer-head">
                    <BrandLogo :width="140" />
                    <button type="button" class="td-icon-btn" :aria-label="t('header.closeMenu')" @click="closeDrawer">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                    </button>
                </div>
                <nav class="td-nav">
                    <button v-for="item in nav" :key="item.key" type="button" class="td-nav-item" :class="{ 'td-nav-item--on': item.active }" @click="closeDrawer">
                        <NavIcon :name="item.key" class="td-nav-ico" />
                        <span>{{ t(`nav.${item.key}`) }}</span>
                    </button>
                </nav>
                <div class="td-drawer-foot">
                    <LanguageSwitcher />
                </div>
            </aside>
        </Transition>

        <!-- Galvenais saturs -->
        <main class="td-main">
            <header class="td-main-head">
                <div class="td-main-head-left">
                    <button type="button" class="td-hamburger" :aria-label="t('header.openMenu')" @click="toggleDrawer">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e5e7eb" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
                    </button>
                    <div>
                        <h1 class="td-main-title">{{ t('header.title') }}</h1>
                        <p class="td-main-sub">{{ t('header.welcome', { name: firstName }) }}</p>
                    </div>
                </div>
                <div class="td-main-head-right">
                    <LanguageSwitcher class="td-lang-desktop" />
                    <button type="button" class="td-icon-btn" :aria-label="t('header.search')">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
                    </button>
                    <button type="button" class="td-icon-btn td-icon-btn--dot" :aria-label="t('header.notifications')">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"><path d="M6 8a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z" /><path d="M9 21a3 3 0 006 0" /></svg>
                        <span class="td-icon-dot" />
                    </button>
                </div>
            </header>

            <!-- Mode kartītes -->
            <section class="td-cards">
                <div class="td-card">
                    <div class="td-card-head">
                        <span class="td-card-ico" style="background: rgba(57, 255, 20, 0.1); color: #39ff14">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5.5" /><circle cx="12" cy="12" r="2" /></svg>
                        </span>
                        <span class="td-card-title">{{ t('cards.x01.title') }}</span>
                    </div>
                    <p class="td-card-desc">{{ t('cards.x01.desc') }}</p>
                    <div class="td-chips">
                        <span class="td-chip">301</span><span class="td-chip">501</span>
                    </div>
                    <button class="td-btn td-btn--green">{{ t('cards.x01.start') }}</button>
                </div>

                <div class="td-card">
                    <div class="td-card-head">
                        <span class="td-card-ico" style="background: rgba(34, 211, 238, 0.1); color: #22d3ee">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12h4l3 8 4-16 3 8h4" /></svg>
                        </span>
                        <span class="td-card-title">{{ t('cards.solo.title') }}</span>
                    </div>
                    <p class="td-card-desc">{{ t('cards.solo.desc') }}</p>
                    <div class="td-chips">
                        <span class="td-chip">101</span><span class="td-chip">201</span><span class="td-chip">301</span><span class="td-chip">501</span>
                    </div>
                    <button class="td-btn td-btn--cyan">{{ t('cards.solo.start') }}</button>
                </div>

                <div class="td-card">
                    <div class="td-card-head">
                        <span class="td-card-ico" style="background: rgba(251, 44, 95, 0.1); color: #fb2c5f">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M9 9l6 6M15 9l-6 6" /></svg>
                        </span>
                        <span class="td-card-title">{{ t('cards.cricket.title') }}</span>
                    </div>
                    <p class="td-card-desc">{{ t('cards.cricket.desc') }}</p>
                    <div class="td-card-spacer" />
                    <button class="td-btn td-btn--pink">{{ t('cards.cricket.start') }}</button>
                </div>

                <div class="td-card td-card--muted">
                    <div class="td-card-head">
                        <span class="td-card-ico" style="background: rgba(148, 163, 184, 0.1); color: #94a3b8">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 19V5a2 2 0 012-2h9l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2z" /><path d="M14 3v5h5" /></svg>
                        </span>
                        <span class="td-card-title">{{ t('cards.drills.title') }}</span>
                    </div>
                    <p class="td-card-desc">{{ t('cards.drills.desc') }}</p>
                    <span class="td-badge">{{ t('cards.drills.badge') }}</span>
                    <button class="td-btn td-btn--ghost">{{ t('cards.drills.browse') }}</button>
                </div>
            </section>

            <!-- Statistika -->
            <section class="td-panel">
                <div class="td-panel-head">
                    <span class="td-panel-title">{{ t('panel.stats.title') }}</span>
                    <span class="td-panel-meta">{{ t('panel.stats.period') }}</span>
                </div>
                <div class="td-stats">
                    <div v-for="s in statsRaw" :key="s.key" class="td-stat">
                        <div class="td-stat-label">{{ t(`stat.${s.key}`) }}</div>
                        <div class="td-stat-value">{{ s.value }}</div>
                        <div class="td-stat-trend" :style="{ color: s.up ? '#39ff14' : '#fb2c5f' }">{{ s.trend }}</div>
                    </div>
                </div>
                <div class="td-form-label">{{ t('panel.form') }}</div>
                <div class="td-form-dots">
                    <span v-for="(r, i) in formGuide" :key="i" class="td-form-dot" :class="r === 'W' ? 'td-form-dot--w' : 'td-form-dot--l'">{{ r }}</span>
                </div>
            </section>

            <!-- Live Now -->
            <section class="td-panel">
                <div class="td-live-head">
                    <span class="td-live-pulse" />
                    <span class="td-panel-title">{{ t('panel.live.title') }}</span>
                </div>
                <div class="td-live-list">
                    <div v-for="(m, i) in liveMatches" :key="i" class="td-live-row">
                        <div class="td-live-players">
                            <span class="td-live-name">{{ m.p1 }}</span>
                            <span class="td-live-score">{{ m.score1 }} – {{ m.score2 }}</span>
                            <span class="td-live-name">{{ m.p2 }}</span>
                        </div>
                        <div class="td-live-meta">
                            <span>{{ t('live.leg') }} {{ m.leg1 }}–{{ m.leg2 }}</span>
                            <span>{{ t('live.avg') }} {{ m.avg1 }} / {{ m.avg2 }}</span>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Aktivitāte / Draugi / Līderi — main bloka beigās, kartītes pašas sakārtojas kolonnās -->
            <aside class="td-panels">
                <div class="td-right-section">
                    <div class="td-right-title">{{ t('side.activity') }}</div>
                    <div class="td-activity">
                        <div v-for="(a, i) in activityFeed" :key="i" class="td-activity-row">
                            <span class="td-activity-dot" />
                            <div>
                                <div class="td-activity-text">{{ a.text }}</div>
                                <div class="td-activity-time">{{ a.time }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="td-right-section">
                    <div class="td-right-title">{{ t('side.friends') }}</div>
                    <div v-for="fr in friends" :key="fr.name" class="td-friend">
                        <div class="td-friend-av">
                            {{ fr.initials }}<span class="td-friend-status" :style="{ background: fr.online ? '#39ff14' : '#64748b' }" />
                        </div>
                        <div class="td-friend-info">
                            <div class="td-friend-name">{{ fr.name }}</div>
                            <div class="td-friend-sub" :style="{ color: fr.online ? '#39ff14' : '#64748b' }">{{ t(`friend.${fr.statusKey}`) }}</div>
                        </div>
                    </div>
                </div>

                <div class="td-right-section">
                    <div class="td-right-title">{{ t('side.leaderboard') }}</div>
                    <div v-for="lb in leaderboard" :key="lb.rank" class="td-lb-row">
                        <span class="td-lb-rank" :class="{ 'td-lb-rank--top': lb.rank <= 3 }">{{ lb.rank }}</span>
                        <span class="td-lb-name">{{ lb.name }}</span>
                        <span class="td-lb-avg">{{ lb.avg }}</span>
                    </div>
                </div>
            </aside>
        </main>

        <!-- Mobilā apakšējā navigācija (footeris) -->
        <nav class="td-bottom-nav">
            <button v-for="item in mobileNav" :key="item.key" type="button" class="td-bnav-item" :class="{ 'td-bnav-item--on': item.active }">
                <svg v-if="item.key === 'home'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-7 8 7M6 10v9a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1v-9" /></svg>
                <svg v-else-if="item.key === 'play'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5.5" /><circle cx="12" cy="12" r="2" /></svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="12" width="4" height="8" /><rect x="10" y="6" width="4" height="14" /><rect x="16" y="9" width="4" height="11" /></svg>
                <span>{{ t(`mobile.${item.key}`) }}</span>
            </button>

            <div ref="menuMobileRef" class="td-bnav-profile-wrap">
                <button type="button" class="td-bnav-item" :class="{ 'td-bnav-item--on': menuOpen }" @click="toggleMenu">
                    <div class="td-bnav-av">{{ initials || '·' }}</div>
                    <span>{{ t('mobile.profile') }}</span>
                </button>

                <div v-if="menuOpen" class="td-menu td-menu--mobile" role="menu">
                    <Link :href="route('profile.edit')" class="td-menu-item" @click="menuOpen = false">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 20a8 8 0 0116 0" /></svg>
                        {{ t('menu.profile') }}
                    </Link>
                    <Link :href="route('password.edit')" class="td-menu-item" @click="menuOpen = false">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></svg>
                        {{ t('menu.password') }}
                    </Link>
                    <Link :href="route('appearance')" class="td-menu-item" @click="menuOpen = false">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" /></svg>
                        {{ t('menu.appearance') }}
                    </Link>
                    <div class="td-menu-sep" />
                    <button type="button" class="td-menu-item td-menu-item--danger" @click="logout">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                        {{ t('menu.logout') }}
                    </button>
                </div>
            </div>
        </nav>
    </div>

    <!-- ══════════ VIESIS: aicinājums ══════════ -->
    <div v-else class="td-guest">
        <div class="td-guest-lang"><LanguageSwitcher /></div>
        <BrandLogo :width="180" />
        <h1 class="td-guest-h">{{ t('guest.h1Line1') }}<br />{{ t('guest.h1Line2') }}</h1>
        <p class="td-guest-lead">{{ t('guest.lead') }}</p>
        <div class="td-guest-actions">
            <Link :href="route('register')" class="td-btn td-btn--green" style="text-decoration: none">{{ t('guest.register') }}</Link>
            <Link :href="route('login')" class="td-btn td-btn--outline" style="text-decoration: none">{{ t('guest.login') }}</Link>
        </div>
    </div>
</template>

<style scoped>
/* ── Dashboard grid ── */
.td-dash {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 280px 1fr;
    background: #0b0f19;
    color: #f4f4f5;
    font-family: Inter, sans-serif;
}

/* ── Sānjoslas ── */
.td-side {
    background: #0d1220;
    border-right: 1px solid #1f2937;
    display: flex;
    flex-direction: column;
}
.td-side-logo {
    padding: 28px 20px 20px;
}
.td-nav {
    flex: 1;
    padding: 8px 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.td-nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 12px;
    border-radius: 10px;
    border: none;
    background: transparent;
    color: #94a3b8;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    text-align: left;
}
.td-nav-item:hover {
    background: #131a26;
    color: #f4f4f5;
}
.td-nav-item--on {
    background: rgba(57, 255, 20, 0.1);
    color: #39ff14;
}
.td-nav-ico {
    flex-shrink: 0;
    opacity: 0.85;
}
.td-nav-item--on .td-nav-ico,
.td-nav-item:hover .td-nav-ico {
    opacity: 1;
}
.td-usercard-wrap {
    position: relative;
    margin: 16px;
}
.td-usercard {
    width: 100%;
    padding: 14px;
    background: #131a26;
    border: 1px solid #1f2937;
    border-radius: 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    text-align: left;
    transition: border-color 0.15s;
}
.td-usercard:hover,
.td-usercard--open {
    border-color: #39ff14;
}
.td-usercard-caret {
    flex-shrink: 0;
    transition: transform 0.15s;
}
.td-usercard--open .td-usercard-caret {
    transform: rotate(180deg);
}
.td-menu {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 0;
    right: 0;
    background: #131a26;
    border: 1px solid #1f2937;
    border-radius: 12px;
    padding: 6px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    gap: 2px;
    z-index: 60;
}
.td-menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: #cbd5e1;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    text-align: left;
    text-decoration: none;
    width: 100%;
}
.td-menu-item:hover {
    background: #0d1220;
    color: #f4f4f5;
}
.td-menu-item--danger {
    color: #fb2c5f;
}
.td-menu-item--danger:hover {
    background: rgba(251, 44, 95, 0.1);
    color: #fb2c5f;
}
.td-menu-sep {
    height: 1px;
    background: #1f2937;
    margin: 4px 0;
}
.td-usercard-av {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #39ff14, #0ea5e9);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    color: #0b0f19;
    font-family: 'Barlow Condensed', sans-serif;
    flex-shrink: 0;
}
.td-usercard-info {
    min-width: 0;
}
.td-usercard-name {
    font-size: 14px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.td-usercard-sub {
    font-size: 12px;
    color: #64748b;
}

/* ── Mobilā aizvelkamā izvēlne ── */
.td-drawer-backdrop {
    display: none;
}
.td-drawer {
    display: none;
}

/* ── Galvenais ── */
.td-main {
    padding: 28px;
    min-width: 0;
}
.td-main-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
    gap: 16px;
    flex-wrap: wrap;
}
.td-main-head-left {
    display: flex;
    align-items: center;
    gap: 14px;
}
.td-main-head-right {
    display: flex;
    align-items: center;
    gap: 10px;
}
.td-hamburger {
    display: none;
}
.td-icon-btn {
    position: relative;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: #131a26;
    border: 1px solid #1f2937;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
}
.td-icon-btn:hover {
    border-color: #334155;
}
.td-icon-dot {
    position: absolute;
    top: 8px;
    right: 9px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #fb2c5f;
}
.td-main-title {
    margin: 0;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 32px;
    line-height: 1;
}
.td-main-sub {
    color: #64748b;
    font-size: 14px;
    margin: 6px 0 0;
}

/* ── Mode kartītes ── */
.td-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
}
.td-card {
    background: #131a26;
    border: 1px solid #1f2937;
    border-radius: 16px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
}
.td-card--muted {
    opacity: 0.85;
}
.td-card-head {
    display: flex;
    align-items: center;
    gap: 8px;
}
.td-card-ico {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
}
.td-card-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 17px;
}
.td-card-desc {
    color: #64748b;
    font-size: 13px;
    line-height: 1.5;
    margin: 0;
}
.td-card-spacer {
    flex: 1;
}
.td-chips {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}
.td-chip {
    padding: 6px 12px;
    border-radius: 8px;
    background: #0d1220;
    border: 1px solid #1f2937;
    font-size: 13px;
    font-weight: 700;
    color: #cbd5e1;
}
.td-badge {
    align-self: flex-start;
    padding: 4px 10px;
    border-radius: 999px;
    background: rgba(148, 163, 184, 0.12);
    color: #94a3b8;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.td-btn {
    margin-top: auto;
    padding: 12px;
    text-align: center;
    border-radius: 10px;
    font-weight: 800;
    font-family: 'Barlow Condensed', sans-serif;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    font-size: 15px;
    cursor: pointer;
    border: none;
    transition: all 0.3s;
}
.td-btn--green {
    background: #39ff14;
    color: #0b0f19;
    box-shadow: 0 0 20px rgba(57, 255, 20, 0.2);
}
.td-btn--cyan {
    background: transparent;
    border: 1.5px solid #22d3ee;
    color: #22d3ee;
}
.td-btn--pink {
    background: transparent;
    border: 1.5px solid #fb2c5f;
    color: #fb2c5f;
}
.td-btn--ghost {
    background: #0d1220;
    border: 1px solid #1f2937;
    color: #64748b;
}
.td-btn--outline {
    background: transparent;
    border: 1.5px solid #334155;
    color: #f4f4f5;
}

/* ── Paneļi ── */
.td-panel {
    background: #131a26;
    border: 1px solid #1f2937;
    border-radius: 16px;
    padding: 22px;
    margin-bottom: 24px;
}
.td-panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
    flex-wrap: wrap;
    gap: 10px;
}
.td-panel-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 20px;
}
.td-panel-meta {
    color: #64748b;
    font-size: 13px;
}
.td-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 14px;
    margin-bottom: 20px;
}
.td-stat {
    background: #0d1220;
    border: 1px solid #1f2937;
    border-radius: 14px;
    padding: 16px;
}
.td-stat-label {
    color: #64748b;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
}
.td-stat-value {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: 32px;
    line-height: 1;
}
.td-stat-trend {
    font-size: 12px;
    margin-top: 6px;
}
.td-form-label {
    color: #64748b;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 10px;
}
.td-form-dots {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}
.td-form-dot {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 800;
}
.td-form-dot--w {
    background: rgba(57, 255, 20, 0.15);
    color: #39ff14;
}
.td-form-dot--l {
    background: rgba(251, 44, 95, 0.12);
    color: #fb2c5f;
}

/* ── Live ── */
.td-live-head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 18px;
}
.td-live-pulse {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #fb2c5f;
    animation: tdLivePulse 1.4s infinite;
}
@keyframes tdLivePulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.35;
    }
}
.td-live-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.td-live-row {
    background: #0d1220;
    border: 1px solid #1f2937;
    border-radius: 12px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
}
.td-live-players {
    display: flex;
    align-items: center;
    gap: 10px;
}
.td-live-name {
    font-weight: 700;
    font-size: 14px;
}
.td-live-score {
    color: #39ff14;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800;
    font-size: 16px;
}
.td-live-meta {
    display: flex;
    gap: 16px;
    color: #64748b;
    font-size: 12px;
}

/* ── Aktivitāte / Draugi / Līderi — main bloka beigās, kartītes ── */
.td-panels {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    align-items: stretch;
    gap: 16px;
    margin-top: 24px;
}
.td-panels .td-right-section {
    display: flex;
    flex-direction: column;
}
.td-right-section {
    background: #131a26;
    border: 1px solid #1f2937;
    border-radius: 16px;
    padding: 20px;
}
.td-right-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 15px;
    color: #64748b;
    margin: 0 0 14px;
}
.td-activity {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.td-activity-row {
    display: flex;
    gap: 10px;
    align-items: flex-start;
}
.td-activity-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #39ff14;
    margin-top: 7px;
    flex-shrink: 0;
}
.td-activity-text {
    font-size: 13px;
    line-height: 1.4;
}
.td-activity-time {
    font-size: 11px;
    color: #64748b;
    margin-top: 2px;
}
.td-friend {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
}
.td-friend-av {
    position: relative;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: #1f2937;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
}
.td-friend-status {
    position: absolute;
    right: -1px;
    bottom: -1px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid #0d1220;
}
.td-friend-info {
    min-width: 0;
}
.td-friend-name {
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.td-friend-sub {
    font-size: 12px;
}
.td-lb-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}
.td-lb-rank {
    width: 20px;
    text-align: center;
    font-size: 12px;
    font-weight: 800;
    color: #64748b;
}
.td-lb-rank--top {
    color: #39ff14;
}
.td-lb-name {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.td-lb-avg {
    font-size: 13px;
    font-weight: 700;
}

/* ── Mobilā apakšējā navigācija (footeris) ── */
.td-bottom-nav {
    display: none;
}

/* ── Guest ── */
.td-guest {
    position: relative;
    min-height: 100vh;
    background: #0b0f19;
    color: #f4f4f5;
    font-family: Inter, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 32px;
    gap: 20px;
    background-image: radial-gradient(circle at 50% 20%, rgba(57, 255, 20, 0.06), transparent 45%);
}
.td-guest-lang {
    position: absolute;
    top: 20px;
    right: 20px;
}
.td-guest-h {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 44px;
    line-height: 1.05;
    margin: 8px 0 0;
}
.td-guest-lead {
    color: #94a3b8;
    font-size: 15px;
    max-width: 460px;
    margin: 0;
}
.td-guest-actions {
    display: flex;
    gap: 12px;
    margin-top: 8px;
}
.td-guest-actions .td-btn {
    margin-top: 0;
    padding: 12px 28px;
}

/* ── Pārejas animācijas (mobilā izvēlne) ── */
.td-fade-enter-active,
.td-fade-leave-active {
    transition: opacity 0.2s ease;
}
.td-fade-enter-from,
.td-fade-leave-to {
    opacity: 0;
}
.td-slide-enter-active,
.td-slide-leave-active {
    transition: transform 0.25s ease;
}
.td-slide-enter-from,
.td-slide-leave-to {
    transform: translateX(-100%);
}

/* ── Responsīvi (darbvirsma ≥1280px: labā sānjosla kā šaura kolonna ar dalītājlīnijām) ── */
/* ── Mobilais izkārtojums (≤860px) ── */
@media (max-width: 860px) {
    .td-dash {
        grid-template-columns: 1fr;
    }
    .td-side--left {
        display: none;
    }
    .td-lang-desktop {
        display: none;
    }

    /* Header: kompaktāks, hamburgeris redzams, meklēšana/paziņojumi paliek labajā pusē vienā rindā */
    .td-hamburger {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: #131a26;
        border: 1px solid #1f2937;
        cursor: pointer;
        flex-shrink: 0;
    }
    .td-main-head {
        flex-wrap: nowrap;
        margin-bottom: 16px;
        gap: 10px;
    }
    .td-main-head-left {
        min-width: 0;
        flex: 1 1 auto;
        gap: 10px;
    }
    .td-main-head-left > div {
        min-width: 0;
    }
    .td-main-title {
        font-size: 19px;
        letter-spacing: 0.3px;
    }
    .td-main-sub {
        font-size: 12px;
        margin-top: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .td-main-head-right {
        flex-shrink: 0;
        gap: 6px;
    }
    .td-icon-btn {
        width: 36px;
        height: 36px;
    }
    .td-main {
        padding: 14px 14px calc(84px + env(safe-area-inset-bottom, 0px));
    }
    .td-panels {
        gap: 12px;
    }

    /* Aizvelkamā izvēlne */
    .td-drawer-backdrop {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        z-index: 70;
    }
    .td-drawer {
        display: flex;
        flex-direction: column;
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        width: 280px;
        max-width: 82vw;
        background: #0d1220;
        border-right: 1px solid #1f2937;
        z-index: 80;
        padding: 20px;
    }
    .td-drawer-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24px;
    }
    .td-drawer-foot {
        padding-top: 16px;
        border-top: 1px solid #1f2937;
    }

    /* Apakšējā navigācija */
    .td-bottom-nav {
        display: flex;
        align-items: stretch;
        justify-content: space-around;
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        background: #0d1220;
        border-top: 1px solid #1f2937;
        padding: 6px 6px calc(6px + env(safe-area-inset-bottom, 0px));
        z-index: 50;
    }
    .td-bnav-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 8px 4px;
        border: none;
        background: transparent;
        color: #64748b;
        cursor: pointer;
        font-size: 11px;
        font-weight: 600;
    }
    .td-bnav-item--on {
        color: #39ff14;
    }
    .td-bnav-profile-wrap {
        position: relative;
        flex: 1;
        display: flex;
    }
    .td-bnav-av {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: linear-gradient(135deg, #39ff14, #0ea5e9);
        color: #0b0f19;
        font-size: 10px;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Barlow Condensed', sans-serif;
    }
    .td-menu--mobile {
        position: absolute;
        bottom: calc(100% + 10px);
        left: auto;
        right: 6px;
        width: 220px;
    }
}
</style>
