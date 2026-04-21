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

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
installApiInterceptors(() => useAuthStore());
app.use(router);

async function dartBootstrap() {
  const el = document.getElementById('app');
  try {
    await Promise.race([
      api.get('/csrf-cookie', { skipErrorToast: true }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('csrf-timeout')), 8000)),
    ]);
  } catch (_) {}
  try {
    await useAuthStore().init();
    app.mount('#app');
  } catch (e) {
    console.error('DartTrainer: app mount failed', e);
  } finally {
    el?.setAttribute('data-app-mounted', '');
  }
}

dartBootstrap();
</script>

<template>
  <span class="dt-main-entry-sentinel" style="display: none" aria-hidden="true" />
</template>
