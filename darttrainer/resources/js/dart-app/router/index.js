import { createRouter, createWebHashHistory } from 'vue-router';
import { useAuthStore } from '../store/auth.js';

const load = (importer) => () => importer().then((m) => m.default);

const routes = [
  { path: '/', component: load(() => import('../pages/Home.js')) },
  { path: '/login', component: load(() => import('../pages/Login.js')) },
  { path: '/register', component: load(() => import('../pages/Register.js')) },
  { path: '/lobby', component: load(() => import('../pages/Lobby.js')) },
  { path: '/friends', component: load(() => import('../pages/Friends.js')) },
  { path: '/stats', component: load(() => import('../pages/Statistics.js')) },
  { path: '/admin', component: load(() => import('../pages/Admin.js')) },
  { path: '/game/:matchId', component: load(() => import('../pages/Game.js')), props: true },
  { path: '/training/x01', component: load(() => import('../pages/X01Training.js')) },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

const GUEST_ALLOWED_PATHS = new Set(['/', '/login', '/register']);

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.path === '/admin' && auth.hydrated && !auth.user?.is_admin) {
    return '/';
  }
  if (auth.hydrated && !auth.user && !GUEST_ALLOWED_PATHS.has(to.path)) {
    return '/login';
  }
  return true;
});

router.afterEach((to) => {
  const onAuth = to.path === '/login' || to.path === '/register';
  document.body.classList.toggle('dt-route-auth', onAuth);
});

export default router;
