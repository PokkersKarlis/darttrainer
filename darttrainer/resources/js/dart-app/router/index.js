import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store/auth.js';
import { useLocaleStore } from '../store/locale.js';
import { X01_LOBBY_AND_TRAINING_ENABLED } from '../composables/useCanPlayX01.js';
import { applySocialMeta } from '../utils/socialMeta.js';

const load = (importer) => () => importer().then((m) => m.default);

/** Tikai `public: true` maršruti ir pieejami bez ielogošanās; pārējiem nepieciešama sesija (sk. beforeEach). */
const routes = [
  {
    path: '/',
    component: load(() => import('../pages/Home.vue')),
    meta: { titleKey: 'nav.home', public: true },
  },
  {
    path: '/login',
    component: load(() => import('../pages/Login.vue')),
    meta: { titleKey: 'shell.login', public: true, guestOnly: true },
  },
  {
    path: '/register',
    component: load(() => import('../pages/Register.vue')),
    meta: { titleKey: 'shell.register', public: true, guestOnly: true },
  },
  {
    path: '/lobby',
    redirect: () => ({ path: X01_LOBBY_AND_TRAINING_ENABLED ? '/lobby/x01' : '/lobby/cricket' }),
    meta: { public: true },
  },
  {
    path: '/lobby/cricket',
    component: load(() => import('../pages/lobby/LobbyApp.vue')),
    props: { gameKind: 'cricket' },
    meta: { titleKey: 'nav.lobbyCricket' },
  },
  {
    path: '/lobby/x01',
    component: load(() => import('../pages/lobby/LobbyApp.vue')),
    props: { gameKind: 'x01' },
    meta: { titleKey: 'nav.lobbyX01' },
  },
  { path: '/friends', component: load(() => import('../pages/Friends.vue')), meta: { titleKey: 'nav.friends', requiresVerified: true } },
  { path: '/stats', component: load(() => import('../pages/Statistics.vue')), meta: { titleKey: 'stats.title', requiresVerified: true } },
  { path: '/admin', component: load(() => import('../pages/Admin.vue')), meta: { titleKey: 'nav.admin' } },
  {
    path: '/game/:matchId',
    component: load(() => import('../pages/Game.vue')),
    props: true,
    meta: { titleKey: 'nav.lobby', gameFocus: true },
  },
  { path: '/privacy', component: load(() => import('../pages/Privacy.vue')), meta: { titleKey: 'privacy.title', public: true } },
  { path: '/training/x01', component: load(() => import('../pages/X01Training.vue')), meta: { titleKey: 'nav.x01solo' } },
  { path: '/404', component: load(() => import('../pages/NotFound.vue')), meta: { titleKey: 'notFound.title', public: true } },
  { path: '/:pathMatch(.*)*', redirect: '/404', meta: { public: true } },
];

const router = createRouter({
  // SPA URL bez prefiksa — Laravel servē index.html no root `/`.
  // Vite `base` ir `/dart-app/` tikai asset ceļiem (JS/CSS), nevis rūtēšanai.
  history: createWebHistory('/'),
  routes,
});

function routeIsPublic(to) {
  return to.matched.some((r) => r.meta && r.meta.public === true);
}

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (!auth.hydrated) {
    await auth.init();
  }
  // Ja lietotājs jau ir ielogojies, login/register lapas vairs nav pieejamas.
  if (auth.user && to.matched.some((r) => r.meta && r.meta.guestOnly === true)) {
    return '/';
  }
  if (to.path === '/admin' && !auth.user?.is_admin) {
    return '/';
  }
  if (!X01_LOBBY_AND_TRAINING_ENABLED && (to.path === '/lobby/x01' || to.path === '/training/x01')) {
    return '/';
  }
  if (!auth.user && !routeIsPublic(to)) {
    return '/login';
  }
  // Friends/Stats ir redzamas tikai ar apstiprinātu e-pastu.
  if (auth.user && !auth.user.email_verified_at && to.matched.some((r) => r.meta && r.meta.requiresVerified === true)) {
    return '/';
  }
  return true;
});

const APP_NAME = 'DartTrainer';

function upsertCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

router.afterEach((to) => {
  document.body.classList.toggle('dt-route-auth', to.path === '/login' || to.path === '/register');

  try {
    const locale = useLocaleStore();
    const key = to.meta.titleKey;
    document.title = key ? `${locale.t(key)} · ${APP_NAME}` : APP_NAME;
  } catch (_) {
    document.title = APP_NAME;
  }

  try {
    upsertCanonical(`${window.location.origin}${to.fullPath}`);
  } catch (_) {}

  try {
    applySocialMeta(to);
  } catch (_) {}
});

export default router;
