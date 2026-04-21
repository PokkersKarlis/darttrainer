const routes = [
  { path: '/',                  component: HomePage },
  { path: '/login',             component: LoginPage },
  { path: '/register',          component: RegisterPage },
  { path: '/lobby',              component: LobbyPage },
  { path: '/friends',            component: FriendsPage },
  { path: '/stats',              component: StatisticsPage },
  { path: '/admin',             component: AdminPage },
  { path: '/game/:matchId',     component: GamePage, props: true },
  { path: '/training/x01',      component: X01TrainingPage },
  { path: '/:pathMatch(.*)*',    redirect: '/' },
];

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.path === '/admin' && auth.hydrated && !auth.user?.is_admin) {
    return '/';
  }
  return true;
});
