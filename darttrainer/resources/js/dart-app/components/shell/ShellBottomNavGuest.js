import { useAuthStore, useLocaleStore } from '../../store/index.js';
/** Apakšējā navigācija — viesis (ieeja / reģistrācija) */
export default {
  name: 'ShellBottomNavGuest',
  setup() {
    const auth = useAuthStore();
    const locale = useLocaleStore();
    const t = (k) => locale.t(k);
    return { auth, t };
  },
  template: `
    <nav v-if="auth.hydrated && !auth.user" class="lg:hidden dt-shell-mobile-bnav"
         style="flex-shrink:0;height:60px;background:#0a1120;border-top:1px solid #162540;display:flex;justify-content:center;gap:8px;padding:0 10px">
      <shell-bottom-nav-item href="#/login" icon="🔑" :label="t('shell.login')" flex-fill />
      <shell-bottom-nav-item href="#/register" icon="✨" :label="t('shell.registerShort')" flex-fill guest-accent />
    </nav>
  `,
};
