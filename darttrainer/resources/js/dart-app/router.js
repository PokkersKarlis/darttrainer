/** Legacy hash-router bundle: keep auth rules aligned with `router/index.js`. */
const NotFoundPage = {
  template: `
    <div style="min-height: 70vh; display:flex; align-items:center; justify-content:center; padding: 40px 16px;">
      <div style="width: 100%; max-width: 520px; border: 1px solid #252d3d; background: #131720; border-radius: 16px; padding: 20px; text-align:center;">
        <div style="width: 56px; height: 56px; border-radius: 16px; display:flex; align-items:center; justify-content:center; margin: 0 auto; border: 1px solid #1e2738; background: #0b0e14; color: #f5a623; font-weight: 900;">
          404
        </div>
        <h1 style="margin: 16px 0 0; color:#e8eaf0; font-size: 18px; font-weight: 900;">Not found</h1>
        <p style="margin: 10px 0 0; color:#7b8ba8; font-size: 14px;">Page not found.</p>
        <div style="display:flex; gap: 10px; margin-top: 16px;">
          <button type="button" style="flex:1; border: 1px solid #252d3d; background: #0b0e14; color:#e8eaf0; border-radius: 12px; padding: 10px 12px; font-weight: 800;" onclick="window.location.hash = '#/'">← Sākums</button>
          <button type="button" style="flex:1; border: none; background: linear-gradient(135deg,#f5a623,#f5c842); color:#0b0e14; border-radius: 12px; padding: 10px 12px; font-weight: 900;" onclick="window.location.hash = '#/lobby'">Spēles telpa</button>
        </div>
      </div>
    </div>
  `,
};

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
  { path: '/404', component: NotFoundPage, meta: { public: true } },
  { path: '/:pathMatch(.*)*', redirect: '/404', meta: { public: true } },
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
