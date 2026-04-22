import ShellMobileAdBanner from './ShellMobileAdBanner.js';
import ShellBottomNavLoggedIn from './ShellBottomNavLoggedIn.js';
import ShellBottomNavGuest from './ShellBottomNavGuest.vue';

/** Apakšā: reklāma + apakšējā navigācija (viesim — tikai Discord) */
export default {
  name: 'AppShellFooter',
  components: { ShellMobileAdBanner, ShellBottomNavLoggedIn, ShellBottomNavGuest },
  template: `
    <shell-mobile-ad-banner />
    <shell-bottom-nav-logged-in />
    <shell-bottom-nav-guest />
  `,
};
