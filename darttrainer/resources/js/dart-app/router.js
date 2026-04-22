/** Legacy hash-router bundle: keep auth rules aligned with `router/index.js`. */
const routes = [
  { path: '/', component: HomePage, meta: { public: true } },
  { path: '/login', component: LoginPage, meta: { public: true } },
  { path: '/register', component: RegisterPage, meta: { public: true } },
  { path: '/lobby', component: LobbyPage, meta: { public: true } },
  { path: '/friends', component: FriendsPage },
  { path: '/stats', component: StatisticsPage },
  { path: '/admin', component: AdminPage },
  { path: '/game/:matchId', component: GamePage, props: true },
  { path: '/training/x01', component: X01TrainingPage },
  { path: '/:pathMatch(.*)*', redirect: '/', meta: { public: true } },
];

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
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
  if (to.path === '/admin' && !auth.user?.is_admin) {
    return '/';
  }
  if (!auth.user && !routeIsPublic(to)) {
    return '/login';
  }
  return true;
});

router.afterEach((to) => {
  const onAuth = to.path === '/login' || to.path === '/register';
  document.body.classList.toggle('dt-route-auth', onAuth);
});
