<script setup lang="ts">
import BrandLogo from '@/components/BrandLogo.vue';
import { Head, Link, router, usePage } from '@inertiajs/vue3';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { SharedData } from '@/types';

const page = usePage<SharedData>();
const user = computed(() => page.props.auth.user);

// ── Lietotāja dropdown izvēlne ──
const menuOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);

function toggleMenu() {
    menuOpen.value = !menuOpen.value;
}
function logout() {
    menuOpen.value = false;
    router.post(route('logout'));
}
function onDocClick(e: MouseEvent) {
    if (menuOpen.value && menuRef.value && !menuRef.value.contains(e.target as Node)) {
        menuOpen.value = false;
    }
}
onMounted(() => document.addEventListener('click', onDocClick, true));
onUnmounted(() => document.removeEventListener('click', onDocClick, true));

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
    { key: 'dashboard', label: 'Dashboard', active: true },
    { key: 'play', label: 'Play', active: false },
    { key: 'training', label: 'Training', active: false },
    { key: 'tournaments', label: 'Tournaments', active: false },
    { key: 'live', label: 'Live Feed', active: false },
    { key: 'friends', label: 'Friends', active: false },
];

const stats = [
    { label: '3-Dart Avg', value: '74.2', trend: '+2.1', up: true },
    { label: 'Checkout %', value: '38%', trend: '+4%', up: true },
    { label: '180s', value: '12', trend: '+3', up: true },
    { label: 'Legs Won', value: '58%', trend: '−1%', up: false },
];

const formGuide = ['W', 'W', 'L', 'W', 'W', 'W', 'L', 'W', 'L', 'W'];

const liveMatches = [
    { p1: 'J. Price', score1: 4, score2: 3, p2: 'M. Suljović', leg1: 4, leg2: 3, avg1: 98.4, avg2: 91.2 },
    { p1: 'D. Cross', score1: 2, score2: 5, p2: 'G. Anderson', leg1: 2, leg2: 5, avg1: 87.1, avg2: 95.6 },
];

const activityFeed = [
    { text: 'Anna beat Toms 3–1 in X01 501', time: 'pirms 4 min' },
    { text: 'Kārlis hit a 180', time: 'pirms 12 min' },
    { text: 'Jānis started a Cricket match', time: 'pirms 25 min' },
    { text: 'Weekly tournament brackets updated', time: 'pirms 1 h' },
];

const friends = [
    { name: 'Anna B.', sub: 'Online', initials: 'AB', online: true },
    { name: 'Toms K.', sub: 'In a match', initials: 'TK', online: true },
    { name: 'Jānis P.', sub: 'Offline', initials: 'JP', online: false },
];

const leaderboard = [
    { rank: 1, name: 'G. Anderson', avg: '96.2' },
    { rank: 2, name: 'J. Price', avg: '94.8' },
    { rank: 3, name: 'A. Berzina', avg: '88.1' },
    { rank: 4, name: firstName.value || 'You', avg: '74.2' },
    { rank: 5, name: 'T. Klavs', avg: '71.5' },
];
</script>

<template>
    <Head title="Dashboard" />

    <!-- ══════════ IELOGOTS: dashboard ══════════ -->
    <div v-if="user" class="td-dash">
        <!-- Kreisā sānjosla -->
        <aside class="td-side td-side--left">
            <div class="td-side-logo"><BrandLogo :width="157" /></div>
            <nav class="td-nav">
                <button v-for="item in nav" :key="item.key" type="button" class="td-nav-item" :class="{ 'td-nav-item--on': item.active }">
                    <span class="td-nav-dot" />
                    <span>{{ item.label }}</span>
                </button>
            </nav>
            <div ref="menuRef" class="td-usercard-wrap">
                <button type="button" class="td-usercard" :class="{ 'td-usercard--open': menuOpen }" @click="toggleMenu">
                    <div class="td-usercard-av">{{ initials || '·' }}</div>
                    <div class="td-usercard-info">
                        <div class="td-usercard-name">{{ user.name }}</div>
                        <div class="td-usercard-sub">Rank #4 · Avg 74.2</div>
                    </div>
                    <svg class="td-usercard-caret" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6 15l6-6 6 6" />
                    </svg>
                </button>

                <div v-if="menuOpen" class="td-menu" role="menu">
                    <Link :href="route('profile.edit')" class="td-menu-item" @click="menuOpen = false">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 20a8 8 0 0116 0" /></svg>
                        Profils
                    </Link>
                    <Link :href="route('password.edit')" class="td-menu-item" @click="menuOpen = false">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></svg>
                        Parole
                    </Link>
                    <Link :href="route('appearance')" class="td-menu-item" @click="menuOpen = false">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" /></svg>
                        Izskats
                    </Link>
                    <div class="td-menu-sep" />
                    <button type="button" class="td-menu-item td-menu-item--danger" @click="logout">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                        Iziet
                    </button>
                </div>
            </div>
        </aside>

        <!-- Galvenais saturs -->
        <main class="td-main">
            <header class="td-main-head">
                <div>
                    <h1 class="td-main-title">Dashboard</h1>
                    <p class="td-main-sub">Sveiks atpakaļ, {{ firstName }}. Ķersim dubultniekus.</p>
                </div>
            </header>

            <!-- Mode kartītes -->
            <section class="td-cards">
                <div class="td-card">
                    <div class="td-card-head">
                        <span class="td-card-ico" style="background: rgba(57, 255, 20, 0.1); color: #39ff14">◎</span>
                        <span class="td-card-title">X01 Multiplayer</span>
                    </div>
                    <p class="td-card-desc">Izaicini draugu vai atrodi pretinieku tiešsaistē.</p>
                    <div class="td-chips">
                        <span class="td-chip">301</span><span class="td-chip">501</span>
                    </div>
                    <button class="td-btn td-btn--green">Start Match</button>
                </div>

                <div class="td-card">
                    <div class="td-card-head">
                        <span class="td-card-ico" style="background: rgba(34, 211, 238, 0.1); color: #22d3ee">⚡</span>
                        <span class="td-card-title">Solo Practice</span>
                    </div>
                    <p class="td-card-desc">Trenējies viens. Izvēlies sākuma punktus.</p>
                    <div class="td-chips">
                        <span class="td-chip">101</span><span class="td-chip">201</span><span class="td-chip">301</span><span class="td-chip">501</span>
                    </div>
                    <button class="td-btn td-btn--cyan">Practice Now</button>
                </div>

                <div class="td-card">
                    <div class="td-card-head">
                        <span class="td-card-ico" style="background: rgba(251, 44, 95, 0.1); color: #fb2c5f">✕</span>
                        <span class="td-card-title">Cricket Mode</span>
                    </div>
                    <p class="td-card-desc">Aizver 15–20 un bull ātrāk par pretinieku.</p>
                    <div class="td-card-spacer" />
                    <button class="td-btn td-btn--pink">Play Cricket</button>
                </div>

                <div class="td-card td-card--muted">
                    <div class="td-card-head">
                        <span class="td-card-ico" style="background: rgba(148, 163, 184, 0.1); color: #94a3b8">▤</span>
                        <span class="td-card-title">Training Drills</span>
                    </div>
                    <p class="td-card-desc">Strukturētas rutīnas dubultniekiem un finišiem.</p>
                    <span class="td-badge">Drīzumā vairāk</span>
                    <button class="td-btn td-btn--ghost">Browse Drills</button>
                </div>
            </section>

            <!-- Statistika -->
            <section class="td-panel">
                <div class="td-panel-head">
                    <span class="td-panel-title">Performance Stats</span>
                    <span class="td-panel-meta">Last 7 days</span>
                </div>
                <div class="td-stats">
                    <div v-for="s in stats" :key="s.label" class="td-stat">
                        <div class="td-stat-label">{{ s.label }}</div>
                        <div class="td-stat-value">{{ s.value }}</div>
                        <div class="td-stat-trend" :style="{ color: s.up ? '#39ff14' : '#fb2c5f' }">{{ s.trend }}</div>
                    </div>
                </div>
                <div class="td-form-label">Form Guide — Last 10</div>
                <div class="td-form-dots">
                    <span v-for="(r, i) in formGuide" :key="i" class="td-form-dot" :class="r === 'W' ? 'td-form-dot--w' : 'td-form-dot--l'">{{ r }}</span>
                </div>
            </section>

            <!-- Live Now -->
            <section class="td-panel">
                <div class="td-live-head">
                    <span class="td-live-pulse" />
                    <span class="td-panel-title">Live Now</span>
                </div>
                <div class="td-live-list">
                    <div v-for="(m, i) in liveMatches" :key="i" class="td-live-row">
                        <div class="td-live-players">
                            <span class="td-live-name">{{ m.p1 }}</span>
                            <span class="td-live-score">{{ m.score1 }} – {{ m.score2 }}</span>
                            <span class="td-live-name">{{ m.p2 }}</span>
                        </div>
                        <div class="td-live-meta">
                            <span>Leg {{ m.leg1 }}–{{ m.leg2 }}</span>
                            <span>Avg {{ m.avg1 }} / {{ m.avg2 }}</span>
                        </div>
                    </div>
                </div>
            </section>
        </main>

        <!-- Labā sānjosla -->
        <aside class="td-side td-side--right">
            <div class="td-right-title">Live Activity</div>
            <div class="td-activity">
                <div v-for="(a, i) in activityFeed" :key="i" class="td-activity-row">
                    <span class="td-activity-dot" />
                    <div>
                        <div class="td-activity-text">{{ a.text }}</div>
                        <div class="td-activity-time">{{ a.time }}</div>
                    </div>
                </div>
            </div>

            <div class="td-right-section">
                <div class="td-right-title">Friends</div>
                <div v-for="fr in friends" :key="fr.name" class="td-friend">
                    <div class="td-friend-av">
                        {{ fr.initials }}<span class="td-friend-status" :style="{ background: fr.online ? '#39ff14' : '#64748b' }" />
                    </div>
                    <div class="td-friend-info">
                        <div class="td-friend-name">{{ fr.name }}</div>
                        <div class="td-friend-sub" :style="{ color: fr.online ? '#39ff14' : '#64748b' }">{{ fr.sub }}</div>
                    </div>
                </div>
            </div>

            <div class="td-right-section">
                <div class="td-right-title">Weekly Leaderboard</div>
                <div v-for="lb in leaderboard" :key="lb.rank" class="td-lb-row">
                    <span class="td-lb-rank" :class="{ 'td-lb-rank--top': lb.rank <= 3 }">{{ lb.rank }}</span>
                    <span class="td-lb-name">{{ lb.name }}</span>
                    <span class="td-lb-avg">{{ lb.avg }}</span>
                </div>
            </div>
        </aside>
    </div>

    <!-- ══════════ VIESIS: aicinājums ══════════ -->
    <div v-else class="td-guest">
        <BrandLogo :width="180" />
        <h1 class="td-guest-h">Track every dart.<br />Sharpen every leg.</h1>
        <p class="td-guest-lead">Piesakies vai izveido kontu, lai piekļūtu savai statistikai, tiešsaistes mačiem un treniņiem.</p>
        <div class="td-guest-actions">
            <Link :href="route('register')" class="td-btn td-btn--green" style="text-decoration: none">Reģistrēties</Link>
            <Link :href="route('login')" class="td-btn td-btn--outline" style="text-decoration: none">Pieteikties</Link>
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
.td-side--right {
    display: none;
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
.td-nav-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.85;
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
    z-index: 40;
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

/* ── Galvenais ── */
.td-main {
    padding: 28px;
    min-width: 0;
}
.td-main-head {
    margin-bottom: 28px;
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

/* ── Labā sānjosla ── */
.td-side--right {
    border-right: none;
    border-left: 1px solid #1f2937;
    padding-bottom: 20px;
}
.td-right-title {
    padding: 24px 20px 14px;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 15px;
    color: #64748b;
}
.td-right-section {
    padding: 20px;
    border-top: 1px solid #1f2937;
}
.td-right-section .td-right-title {
    padding: 0 0 14px;
}
.td-activity {
    padding: 0 20px;
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

/* ── Guest ── */
.td-guest {
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

/* ── Responsīvi ── */
@media (min-width: 1280px) {
    .td-dash {
        grid-template-columns: 280px 1fr 300px;
    }
    .td-side--right {
        display: flex;
        flex-direction: column;
    }
}
@media (max-width: 860px) {
    .td-dash {
        grid-template-columns: 1fr;
    }
    .td-side--left {
        display: none;
    }
}
</style>
