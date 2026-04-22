import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store/auth.js';
import { useLocaleStore } from '../store/locale.js';
import { X01_LOBBY_AND_TRAINING_ENABLED } from '../composables/useCanPlayX01.js';

const load = (importer) => () => importer().then((m) => m.default);

const routes = [
  { path: '/', component: load(() => import('../pages/Home.vue')), meta: { titleKey: 'nav.home' } },
  { path: '/login', component: load(() => import('../pages/Login.vue')), meta: { titleKey: 'shell.login' } },
  { path: '/register', component: load(() => import('../pages/Register.vue')), meta: { titleKey: 'shell.register' } },
  {
    path: '/lobby',
    redirect: () => ({ path: X01_LOBBY_AND_TRAINING_ENABLED ? '/lobby/x01' : '/lobby/cricket' }),
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
  { path: '/friends', component: load(() => import('../pages/Friends.js')), meta: { titleKey: 'nav.friends' } },
  { path: '/stats', component: load(() => import('../pages/Statistics.js')), meta: { titleKey: 'stats.title' } },
  { path: '/admin', component: load(() => import('../pages/Admin.js')), meta: { titleKey: 'nav.admin' } },
  {
    path: '/game/:matchId',
    component: load(() => import('../pages/Game.js')),
    props: true,
    meta: { titleKey: 'nav.lobby', gameFocus: true },
  },
  { path: '/training/x01', component: load(() => import('../pages/X01Training.js')), meta: { titleKey: 'nav.x01solo' } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const GUEST_ALLOWED_PATHS = new Set(['/', '/login', '/register']);

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.path === '/admin' && auth.hydrated && !auth.user?.is_admin) {
    return '/';
  }
  if (
    !X01_LOBBY_AND_TRAINING_ENABLED &&
    (to.path === '/lobby/x01' || to.path === '/training/x01')
  ) {
    return '/';
  }
  if (auth.hydrated && !auth.user && !GUEST_ALLOWED_PATHS.has(to.path)) {
    return '/login';
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
});

export default router;
