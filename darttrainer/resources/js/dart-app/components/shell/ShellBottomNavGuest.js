import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore, useLocaleStore } from '../../store/index.js';
/** Apakšējā navigācija — viesis (ieeja / reģistrācija); ne /login, /register — tur nav dublikātu */
import ShellBottomNavItem from './ShellBottomNavItem.js';

export default {
  name: 'ShellBottomNavGuest',
  components: { ShellBottomNavItem },
  setup() {
    const auth = useAuthStore();
    const locale = useLocaleStore();
    const route = useRoute();
    const t = (k) => locale.t(k);
    const showGuestBnav = computed(() => {
      if (!auth.hydrated || auth.user) return false;
      const p = route.path;
      if (p === '/login' || p === '/register') return false;
      return true;
    });
    return { auth, t, showGuestBnav };
  },
  template: `
    <nav v-if="showGuestBnav" class="dt-shell-mobile-bnav"
         style="flex-shrink:0;height:60px;background:#0a1120;border-top:1px solid #162540;display:flex;justify-content:center;gap:8px;padding:0 10px;overflow-x:auto">
      <shell-bottom-nav-item href="/login" icon="🔑" :label="t('shell.login')" flex-fill />
      <shell-bottom-nav-item href="/register" icon="✨" :label="t('shell.registerShort')" flex-fill guest-accent />
    </nav>
  `,
};
