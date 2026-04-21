const app = Vue.createApp({
  setup() {
    const auth = useAuthStore();
    const locale = useLocaleStore();
    const friends = useFriendsStore();
    const toasts = Vue.ref([]);
    const resendBusy = Vue.ref(false);

    const t = (key) => locale.t(key);

    const needsEmailVerify = Vue.computed(
      () => auth.hydrated && !!auth.user && !auth.user.email_verified_at,
    );

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
        toasts.value = toasts.value.filter((x) => x.id !== id);
      }, 3500);
    };

    async function resendVerification() {
      if (!auth.user || resendBusy.value) return;
      resendBusy.value = true;
      try {
        await auth.resendVerificationEmail();
        window._dartToast?.(t('auth.resendSent'), 'success');
      } catch (_) {
        window._dartToast?.(t('common.error'), 'error');
      } finally {
        resendBusy.value = false;
      }
    }

    function consumeVerifiedHash() {
      try {
        const hash = window.location.hash || '';
        if (!hash.includes('?')) return;
        const q = hash.split('?')[1] || '';
        const params = new URLSearchParams(q);
        if (params.get('verified') !== '1') return;
        auth.refreshMe().then(() => {
          window._dartToast?.(t('auth.emailVerifiedToast'), 'success');
        });
        window.location.hash = '#/';
      } catch (_) {}
    }

    Vue.onMounted(() => {
      locale.initFromStorage();
      consumeVerifiedHash();
    });

    Vue.watch(
      () => auth.user,
      (u) => {
        if (u && u.email_verified_at) friends.start();
        else friends.stop();
      },
      { immediate: true },
    );

    return {
      auth,
      locale,
      friends,
      toasts,
      t,
      needsEmailVerify,
      resendBusy,
      resendVerification,
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
  const el = document.getElementById('app');
  try {
    await Promise.race([
      api.get('/csrf-cookie', { skipErrorToast: true }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('csrf-timeout')), 8000)),
    ]);
  } catch (_) {}
  try {
    useAuthStore().init();
    app.mount('#app');
  } catch (e) {
    console.error('DartTrainer: app mount failed', e);
  } finally {
    el?.setAttribute('data-app-mounted', '');
  }
})();
