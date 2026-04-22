<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore, useLocaleStore } from '../../store/index.js';
import { DARTTRAINER_DISCORD_URL } from '../../constants/discord.js';
import DiscordIcon from './DiscordIcon.vue';

defineOptions({ name: 'ShellBottomNavGuest' });

const auth = useAuthStore();
const locale = useLocaleStore();
const route = useRoute();
const t = (k) => locale.t(k);
const discordUrl = DARTTRAINER_DISCORD_URL;
const showGuestBnav = computed(() => {
  if (!auth.hydrated || auth.user) return false;
  const p = route.path;
  if (p === '/login' || p === '/register') return false;
  return true;
});
</script>

<template>
  <nav
    v-if="showGuestBnav"
    class="dt-shell-mobile-bnav"
    style="
      flex-shrink: 0;
      min-height: 60px;
      background: #0a1120;
      border-top: 1px solid #162540;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0 12px;
    "
  >
    <a
      :href="discordUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="dt-bnav-discord-link"
    >
      <DiscordIcon :size="22" />
      <span>{{ t('nav.discord') }}</span>
    </a>
  </nav>
</template>

<style scoped>
.dt-bnav-discord-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #cbd5e1;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 10px 20px;
}
.dt-bnav-discord-link:hover {
  color: #e2e8f0;
}
.dt-bnav-discord-link :deep(.dt-discord-icon) {
  color: #5865f2;
}
</style>
