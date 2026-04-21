/** Augšējā aploksnes josla */
const AppShellHeader = {
  name: 'AppShellHeader',
  setup() {
    const auth = useAuthStore();
    const needsEmailVerify = Vue.computed(
      () => auth.hydrated && !!auth.user && !auth.user.email_verified_at,
    );
    return { auth, needsEmailVerify };
  },
  template: `
    <header class="app-shell-header" style="min-height:56px;height:56px;flex-shrink:0;background:#0a1120;border-bottom:1px solid #162540;display:flex;align-items:center;padding:0 12px;gap:12px;z-index:30">
      <shell-brand-logo />
      <div style="flex:1"></div>
      <shell-friend-incoming-button />
      <shell-locale-switch />
      <div class="dt-header-auth" style="display:flex;align-items:center;gap:8px;min-width:0;flex-shrink:1">
        <template v-if="auth.hydrated && auth.user">
          <shell-header-admin-link v-if="auth.user?.is_admin" :disabled="needsEmailVerify" />
          <shell-user-summary />
          <shell-logout-button />
        </template>
        <shell-header-guest-links v-else-if="auth.hydrated && !auth.user" />
        <shell-auth-pending-indicator v-else />
      </div>
    </header>
  `,
};
