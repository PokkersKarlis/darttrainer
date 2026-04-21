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

import DtButton from './components/ui/DtButton.js';
import FriendsIncomingModal from './components/shell/FriendsIncomingModal.js';
import ShellBottomNavItem from './components/shell/ShellBottomNavItem.js';
import ShellMobileAdBanner from './components/shell/ShellMobileAdBanner.js';
import ShellBottomNavLoggedIn from './components/shell/ShellBottomNavLoggedIn.js';
import ShellBottomNavGuest from './components/shell/ShellBottomNavGuest.js';
import AppShellFooter from './components/shell/AppShellFooter.js';
import EmailVerifyBanner from './components/shell/EmailVerifyBanner.js';
import ShellNavLink from './components/shell/ShellNavLink.js';
import ShellSidebarSectionLabel from './components/shell/ShellSidebarSectionLabel.js';
import ShellSidebarAdminLink from './components/shell/ShellSidebarAdminLink.js';
import ShellSidebar from './components/shell/ShellSidebar.js';
import ShellMainContent from './components/shell/layout/MainContent.vue';
import ShellRightAds from './components/shell/ShellRightAds.js';
import DartboardInput from './components/DartboardInput.js';
import X01ThrowInput from './components/X01ThrowInput.js';
import CricketClosedCheck from './components/CricketClosedCheck.js';
import CricketBoard from './components/CricketBoard.js';
import CricketMarkCell from './components/CricketMarkCell.js';
import MatchReport from './components/MatchReport.js';
import X01SoloProtocol from './components/X01SoloProtocol.js';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
installApiInterceptors(() => useAuthStore());
app.use(router);

app.component('DtButton', DtButton);
app.component('FriendsIncomingModal', FriendsIncomingModal);
app.component('ShellBottomNavItem', ShellBottomNavItem);
app.component('ShellMobileAdBanner', ShellMobileAdBanner);
app.component('ShellBottomNavLoggedIn', ShellBottomNavLoggedIn);
app.component('ShellBottomNavGuest', ShellBottomNavGuest);
app.component('AppShellFooter', AppShellFooter);
app.component('EmailVerifyBanner', EmailVerifyBanner);
app.component('ShellNavLink', ShellNavLink);
app.component('ShellSidebarSectionLabel', ShellSidebarSectionLabel);
app.component('ShellSidebarAdminLink', ShellSidebarAdminLink);
app.component('ShellSidebar', ShellSidebar);
app.component('ShellMainContent', ShellMainContent);
app.component('ShellRightAds', ShellRightAds);
app.component('DartboardInput', DartboardInput);
app.component('X01ThrowInput', X01ThrowInput);
app.component('CricketClosedCheck', CricketClosedCheck);
app.component('CricketBoard', CricketBoard);
app.component('CricketMarkCell', CricketMarkCell);
app.component('MatchReport', MatchReport);
app.component('X01SoloProtocol', X01SoloProtocol);

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
