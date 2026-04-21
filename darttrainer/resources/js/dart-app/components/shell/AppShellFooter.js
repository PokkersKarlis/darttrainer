/** Apakšā: mobilā reklāma + apakšējā navigācija */
export default {
  name: 'AppShellFooter',
  template: `
    <shell-mobile-ad-banner />
    <shell-bottom-nav-logged-in />
    <shell-bottom-nav-guest />
  `,
};
