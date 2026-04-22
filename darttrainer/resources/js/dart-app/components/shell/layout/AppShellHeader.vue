<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../../../store/index.js';
import BrandLogo from '../header/BrandLogo.vue';
import FriendIncomingButton from '../friends/IncomingButton.vue';
import LocaleSwitch from '../header/LocaleSwitch.vue';
import HeaderUserMenu from '../header/HeaderUserMenu.vue';
import GuestLinks from '../header/GuestLinks.vue';
import AuthPendingIndicator from '../auth/AuthPendingIndicator.vue';

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
    <BrandLogo />
    <div style="flex: 1" />
    <FriendIncomingButton />
    <LocaleSwitch />
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
        <HeaderUserMenu :needs-email-verify="needsEmailVerify" />
      </template>
      <GuestLinks v-else-if="auth.hydrated && !auth.user" />
      <AuthPendingIndicator v-else />
    </div>
  </header>
</template>
