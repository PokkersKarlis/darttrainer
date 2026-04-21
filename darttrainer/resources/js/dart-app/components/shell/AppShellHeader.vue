<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../../store/index.js';
import ShellBrandLogo from './ShellBrandLogo.vue';
import ShellFriendIncomingButton from './ShellFriendIncomingButton.vue';
import ShellLocaleSwitch from './ShellLocaleSwitch.vue';
import ShellHeaderAdminLink from './ShellHeaderAdminLink.vue';
import ShellUserSummary from './ShellUserSummary.vue';
import ShellLogoutButton from './ShellLogoutButton.vue';
import ShellHeaderGuestLinks from './ShellHeaderGuestLinks.vue';
import ShellAuthPendingIndicator from './ShellAuthPendingIndicator.vue';

const auth = useAuthStore();

const needsEmailVerify = computed(
  () => auth.hydrated && !!auth.user && !auth.user.email_verified_at,
);
</script>

<template>
  <header
    class="app-shell-header"
    style="
      min-height: 56px;
      height: 56px;
      flex-shrink: 0;
      background: #0a1120;
      border-bottom: 1px solid #162540;
      display: flex;
      align-items: center;
      padding: 0 12px;
      gap: 12px;
      z-index: 30;
    "
  >
    <ShellBrandLogo />
    <div style="flex: 1" />
    <ShellFriendIncomingButton />
    <ShellLocaleSwitch />
    <div
      class="dt-header-auth"
      style="
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
        flex-shrink: 1;
      "
    >
      <template v-if="auth.hydrated && auth.user">
        <ShellHeaderAdminLink v-if="auth.user?.is_admin" :disabled="needsEmailVerify" />
        <ShellUserSummary />
        <ShellLogoutButton />
      </template>
      <ShellHeaderGuestLinks v-else-if="auth.hydrated && !auth.user" />
      <ShellAuthPendingIndicator v-else />
    </div>
  </header>
</template>
