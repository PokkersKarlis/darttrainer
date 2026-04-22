<script>
import '../../css/app.css';
import '../../css/dart-spa.css';
import './i18n/messages.js';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './app/App.vue';
import router from './router/index.js';
import { api } from './api/client.js';
import { installApiInterceptors } from './api/interceptors.js';
import { useAuthStore } from './store/auth.js';
import { initVisualViewportSize } from './composables/useVisualViewportSize.js';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
installApiInterceptors(() => useAuthStore());
app.use(router);

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
  /** CSRF + sesija fonā — UI redzams uzreiz (īpaši pēc e-pasta verifikācijas saites). */
  void api.get('/csrf-cookie', { skipErrorToast: true }).catch(() => {});
  void useAuthStore().init();
}

dartBootstrap();
</script>

<template>
  <span class="dt-main-entry-sentinel" style="display: none" aria-hidden="true" />
</template>
