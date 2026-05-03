import '../../css/app.css';
import '../../css/dart-spa.css';
import '../../css/home-design.css';
import '../../css/lobby-design-tokens.css';
import './i18n/messages.js';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './app/App.vue';
import router from './router/index.js';
import { installApiInterceptors } from './api/interceptors.js';
import { useAuthStore } from './store/auth.js';
import { initVisualViewportSize } from './composables/useVisualViewportSize.js';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
installApiInterceptors(() => useAuthStore());
app.use(router);

/**
 * Vue globālais kļūdu handlers — notver neapstrādātas kļūdas komponentos.
 * Bez šī neapstrādāta kļūda vienā komponentā var klusi "norīt" stack trace.
 */
app.config.errorHandler = (err, instance, info) => {
  console.error(`[DartTrainer] Vue kļūda (${info}):`, err);
  if (typeof window._dartToast === 'function') {
    window._dartToast('Kļūda. Mēģini vēlreiz.', 'error');
  }
};

async function dartBootstrap() {
  const el = document.getElementById('app');
  try {
    initVisualViewportSize();
    app.mount('#app');
  } catch (e) {
    console.error('DartTrainer: app mount failed', e);
  } finally {
    el?.setAttribute('data-app-mounted', '');
  }
}

dartBootstrap();
