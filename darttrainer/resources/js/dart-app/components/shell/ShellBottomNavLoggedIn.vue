<script setup>
import { computed } from 'vue';
import { useAuthStore, useLocaleStore } from '../../store/index.js';
import ShellBottomNavItem from './ShellBottomNavItem.vue';
import { useCanPlayX01 } from '../../composables/useCanPlayX01.js';

/** Apakšējā navigācija — ielogots lietotājs */
const auth = useAuthStore();
const locale = useLocaleStore();
const needsEmailVerify = computed(
  () => auth.hydrated && !!auth.user && !auth.user.email_verified_at,
);
const canPlayX01 = useCanPlayX01();
const x01NavDisabled = computed(() => needsEmailVerify.value || !canPlayX01.value);
const t = (k) => locale.t(k);
</script>

<template>
  <nav v-if="auth.hydrated && auth.user" class="dt-shell-mobile-bnav"
       style="flex-shrink:0;height:60px;background:#0a1120;border-top:1px solid #162540;display:flex;overflow-x:auto">
    <ShellBottomNavItem href="/" icon="🏠" :label="t('nav.home')" />
    <ShellBottomNavItem href="/lobby/x01" icon="🎮" :label="t('nav.lobby')" :disabled="x01NavDisabled" />
    <ShellBottomNavItem href="/friends" icon="👥" :label="t('nav.friends')" :disabled="needsEmailVerify" />
    <ShellBottomNavItem href="/training/x01" icon="🎯" :label="t('nav.x01solo')" :disabled="x01NavDisabled" />
    <ShellBottomNavItem href="/stats" icon="📊" :label="t('nav.stats')" :disabled="needsEmailVerify" />
    <ShellBottomNavItem v-if="auth.user?.is_admin" href="/admin" icon="⚙️" :label="t('nav.admin')"
                        :disabled="needsEmailVerify" emphasis />
  </nav>
</template>
