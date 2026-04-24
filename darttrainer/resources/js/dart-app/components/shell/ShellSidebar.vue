<script setup>
import { computed } from 'vue';
import { useAuthStore, useLocaleStore } from '../../store/index.js';
import { useCookieConsent } from '../../composables/useCookieConsent.js';
import ShellNavLink from './ShellNavLink.js';
import ShellSidebarSectionLabel from './ShellSidebarSectionLabel.js';
import ShellSidebarAdminLink from './ShellSidebarAdminLink.js';
import ShellSidebarGameTeasers from './ShellSidebarGameTeasers.vue';
import { useCanPlayX01 } from '../../composables/useCanPlayX01.js';
import { DARTTRAINER_DISCORD_URL } from '../../constants/discord.js';
import DiscordIcon from './DiscordIcon.vue';

defineOptions({ name: 'ShellSidebar' });

const auth = useAuthStore();
const locale = useLocaleStore();
const t = (k) => locale.t(k);
const canPlayX01 = useCanPlayX01();
const needsEmailVerify = computed(
  () => auth.hydrated && !!auth.user && !auth.user.email_verified_at,
);
const x01NavDisabled = computed(() => needsEmailVerify.value || !canPlayX01.value);
const x01NavTitle = computed(() => {
  if (!x01NavDisabled.value) return '';
  if (needsEmailVerify.value) return t('nav.gamesTeaserHint');
  return t('nav.x01UnavailableHint');
});
const discordUrl = DARTTRAINER_DISCORD_URL;

const consent = useCookieConsent();
const canLoadPaypal = computed(() => consent.canFunctional.value || consent.canMarketing.value);
</script>

<template>
  <aside
    class="hidden lg:flex"
    style="
      width: 200px;
      flex-shrink: 0;
      background: #0f1520;
      border-right: 1px solid #1e2738;
      flex-direction: column;
      padding: 8px 0;
    "
  >
    <div v-if="auth.user" style="flex: 1; display: flex; flex-direction: column; gap: 2px; padding: 0 10px">
      <ShellNavLink href="/" icon="🏠" :label="t('nav.home')" />

      <ShellSidebarSectionLabel text="Multiplayer" />
      <ShellNavLink
        href="/lobby/x01"
        icon="🎮"
        :label="t('nav.lobby')"
        :disabled="x01NavDisabled"
        :title="x01NavTitle"
      />
      <ShellNavLink
        href="/friends"
        icon="👥"
        :label="t('nav.friends')"
        :disabled="needsEmailVerify"
      />

      <ShellSidebarSectionLabel text="Treniņš" />
      <ShellNavLink
        href="/training/x01"
        icon="🎯"
        :label="t('nav.x01solo')"
        :disabled="x01NavDisabled"
        :title="x01NavTitle"
      />

      <ShellSidebarSectionLabel text="Progress" />
      <ShellNavLink
        href="/stats"
        icon="📊"
        :label="t('nav.stats')"
        :disabled="needsEmailVerify"
      />
      <ShellSidebarAdminLink v-if="auth.user?.is_admin" :disabled="needsEmailVerify" />
    </div>

    <div
      v-else-if="auth.hydrated"
      style="flex: 1; display: flex; flex-direction: column; gap: 2px"
    >
      <ShellNavLink href="/" icon="🏠" :label="t('nav.home')" />
      <ShellNavLink
        href="/friends"
        icon="👥"
        :label="t('nav.friends')"
        :disabled="true"
        :title="t('nav.gamesTeaserHint')"
      />
      <ShellNavLink
        href="/stats"
        icon="📊"
        :label="t('nav.stats')"
        :disabled="true"
        :title="t('nav.gamesTeaserHint')"
      />
      <a
        :href="discordUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="nav-link"
      >
        <DiscordIcon :size="18" />
        {{ t('nav.discord') }}
      </a>
    </div>
    <div v-else style="flex: 1" />

    <ShellSidebarGameTeasers v-if="auth.hydrated" style="flex-shrink: 0" />

    <div
      v-if="auth.hydrated"
      style="padding: 12px 10px 0; margin-top: 8px; border-top: 1px solid #1e2738; flex-shrink: 0"
    >
      <a
        :href="discordUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="nav-link"
        :style="auth.user ? { marginBottom: '6px' } : { marginBottom: 0 }"
      >
        <DiscordIcon :size="18" />
        {{ t('nav.discord') }}
      </a>
      <button
        type="button"
        class="nav-link"
        style="margin-top: 6px"
        @click="consent.openSettings()"
      >
        🍪 {{ t('consent.settingsLink') }}
      </button>
      <form
        v-if="auth.user && canLoadPaypal"
        action="https://www.paypal.com/donate"
        method="post"
        target="_blank"
        rel="noopener noreferrer"
        style="text-align: center; padding: 4px 0 0"
      >
        <input type="hidden" name="hosted_button_id" value="A3THH5ND6F4NJ" />
        <input
          type="image"
          src="https://pics.paypal.com/00/s/YTViYjhlMWYtOWZiMC00YTg0LThhYmYtZWFmMDU2NzFmNmE1/file.JPG"
          name="submit"
          title="PayPal — ziedojums"
          alt="Ziedot ar PayPal"
          style="max-width: 100%; height: auto; max-height: 36px; border-radius: 6px; cursor: pointer"
        />
        <img
          alt=""
          src="https://www.paypal.com/en_LV/i/scr/pixel.gif"
          width="1"
          height="1"
          style="display: none"
        />
      </form>
    </div>

    <div v-if="auth.user" style="padding: 8px 0 0">
      <div class="ad-slot" style="height: 200px; width: 100%">
        <span>AD HERE</span>
        <span style="font-size: 9px; opacity: 0.7">160 × 200</span>
      </div>
    </div>
  </aside>
</template>
