import { useAuthStore, useLocaleStore } from '../../store/index.js';
/** Apakšējā navigācija — ielogots lietotājs */
import * as Vue from 'vue';
export default {
  name: 'ShellBottomNavLoggedIn',
  setup() {
    const auth = useAuthStore();
    const locale = useLocaleStore();
    const needsEmailVerify = Vue.computed(
      () => auth.hydrated && !!auth.user && !auth.user.email_verified_at,
    );
    const t = (k) => locale.t(k);
    return { auth, needsEmailVerify, t };
  },
  template: `
    <nav v-if="auth.hydrated && auth.user" class="dt-shell-mobile-bnav"
         style="flex-shrink:0;height:60px;background:#0a1120;border-top:1px solid #162540;display:flex;overflow-x:auto">
      <shell-bottom-nav-item href="#/" icon="🏠" :label="t('nav.home')" />
      <shell-bottom-nav-item href="#/lobby" icon="🎮" :label="t('nav.lobby')" :disabled="needsEmailVerify" />
      <shell-bottom-nav-item href="#/friends" icon="👥" :label="t('nav.friends')" :disabled="needsEmailVerify" />
      <shell-bottom-nav-item href="#/training/x01" icon="🎯" :label="t('nav.x01solo')" :disabled="needsEmailVerify" />
      <shell-bottom-nav-item href="#/stats" icon="📊" :label="t('nav.stats')" :disabled="needsEmailVerify" />
      <shell-bottom-nav-item v-if="auth.user?.is_admin" href="#/admin" icon="⚙️" :label="t('nav.admin')"
                             :disabled="needsEmailVerify" emphasis />
    </nav>
  `,
};
