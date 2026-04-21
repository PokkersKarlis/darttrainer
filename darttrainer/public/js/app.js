const app   = Vue.createApp({
  setup() {
    const auth   = useAuthStore();
    const locale = useLocaleStore();
    const friends = useFriendsStore();
    const toasts = Vue.ref([]);

    // Global toast function
    window._dartToast = (message, type = 'success') => {
      const id = Date.now();
      let text =
        typeof dartSafeDisplayMessage === 'function' ? dartSafeDisplayMessage(message) : '';
      if (!text && message != null && typeof message !== 'object') {
        text = String(message).replace(/\0/g, '').trim().slice(0, 4000);
      }
      if (!text) text = type === 'error' ? 'Kļūda' : 'OK';
      toasts.value.push({ id, message: text, type });
      setTimeout(() => {
        toasts.value = toasts.value.filter(t => t.id !== id);
      }, 3500);
    };

    Vue.onMounted(() => {
      try {
        locale.initFromStorage();
      } finally {
        document.getElementById('app')?.setAttribute('data-app-mounted', '');
      }
    });

    Vue.watch(
      () => auth.user,
      (u) => {
        if (u) friends.start();
        else friends.stop();
      },
      { immediate: true }
    );

    return {
      auth,
      locale,
      friends,
      toasts,
      t: (key) => locale.t(key),
    };
  },
});

const pinia = Pinia.createPinia();
app.use(pinia);
app.use(router);
app.component('DtButton', DtButton);
app.component('FriendsIncomingModal', FriendsIncomingModal);
app.component('DartboardInput', DartboardInput);
app.component('X01ThrowInput', X01ThrowInput);
app.component('CricketClosedCheck', CricketClosedCheck);
app.component('CricketBoard', CricketBoard);
app.component('CricketMarkCell', CricketMarkCell);
app.component('MatchReport', MatchReport);
app.component('X01SoloProtocol', X01SoloProtocol);

(async function dartBootstrap() {
  try {
    await api.get('/csrf-cookie', { skipErrorToast: true });
  } catch (_) {}
  useAuthStore().init();
  app.mount('#app');
})();
