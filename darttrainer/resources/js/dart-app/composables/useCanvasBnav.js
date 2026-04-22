import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore, useLocaleStore } from '../store/index.js';
import { useCanPlayGames } from './useCanPlayGames.js';
import { useCanPlayX01 } from './useCanPlayX01.js';

/**
 * Apakšējā mobilā navigācija (`dth-bnav`) — tā pati loģika kā `Home.vue`.
 */
export function useCanvasBnav() {
  const auth = useAuthStore();
  const locale = useLocaleStore();
  const route = useRoute();
  const router = useRouter();
  const canPlayGames = useCanPlayGames();
  const canPlayX01 = useCanPlayX01();
  const t = (k) => locale.t(k);
  const needsEmailVerify = computed(() => auth.needsEmailVerification);

  const bnav = computed(() => [
    { id: 'home', icon: 'home', label: t('nav.home'), to: '/', needAuth: false, needX01: false },
    { id: 'lob', icon: 'target', label: t('nav.lobbyCricket'), to: '/lobby/cricket', needAuth: true, needX01: false },
    { id: 'fr', icon: 'users', label: t('nav.friends'), to: '/friends', needAuth: true, needX01: false },
    { id: 'xo', icon: 'zap', label: t('nav.x01solo'), to: '/training/x01', needAuth: true, needX01: true },
    { id: 'st', icon: 'bar', label: t('nav.stats'), to: '/stats', needAuth: true, needX01: false },
  ]);

  function bnavOn(item) {
    if (item.id === 'home') return route.path === '/';
    if (item.id === 'lob') return route.path === '/lobby/cricket' || route.path === '/lobby/x01';
    if (item.id === 'fr') return route.path.startsWith('/friends');
    if (item.id === 'xo') return route.path === '/training/x01';
    if (item.id === 'st') return route.path === '/stats';
    return false;
  }

  function bnavClick(item) {
    if (item.needAuth && !canPlayGames.value) {
      window._dartToast?.(t('nav.gamesTeaserHint'), 'error');
      return;
    }
    if (item.needX01 && !canPlayX01.value) {
      window._dartToast?.(t('nav.x01UnavailableHint'), 'error');
      return;
    }
    if (needsEmailVerify.value && item.to !== '/') {
      window._dartToast?.(t('auth.verifyEmailToContinue'), 'error');
      return;
    }
    router.push(item.to);
  }

  function bnavDisabled(item) {
    if (item.to === '/') return false;
    if (needsEmailVerify.value) return true;
    if (item.needAuth && !canPlayGames.value) return true;
    if (item.needX01 && !canPlayX01.value) return true;
    return false;
  }

  return { bnav, bnavOn, bnavClick, bnavDisabled };
}
