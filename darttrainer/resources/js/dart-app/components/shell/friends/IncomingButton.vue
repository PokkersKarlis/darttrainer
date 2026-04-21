<script setup>
import { computed } from 'vue';
import { useAuthStore, useLocaleStore, useFriendsStore } from '../../../store/index.js';

const auth = useAuthStore();
const friends = useFriendsStore();
const locale = useLocaleStore();

const needsEmailVerify = computed(
  () => auth.hydrated && !!auth.user && !auth.user.email_verified_at,
);
const t = (k) => locale.t(k);
</script>

<template>
  <button
    v-if="auth.hydrated && auth.user"
    type="button"
    :disabled="needsEmailVerify"
    :style="
      needsEmailVerify
        ? 'position:relative;flex-shrink:0;width:36px;height:36px;border-radius:10px;border:1px solid #334155;background:#0f1c30;color:#f59e0b;font-weight:900;font-size:18px;line-height:1;cursor:not-allowed;display:flex;align-items:center;justify-content:center;opacity:0.45'
        : 'position:relative;flex-shrink:0;width:36px;height:36px;border-radius:10px;border:1px solid #334155;background:#0f1c30;color:#f59e0b;font-weight:900;font-size:18px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center'
    "
    :title="t('friends.incomingModalTitle')"
    @click="friends.openModal()"
  >
    !
    <span
      v-if="friends.incomingCount"
      style="
        position: absolute;
        top: -4px;
        right: -4px;
        min-width: 16px;
        height: 16px;
        padding: 0 4px;
        border-radius: 9999px;
        background: #ef4444;
        color: #fff;
        font-size: 10px;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
      "
    >
      {{ friends.incomingCount }}
    </span>
  </button>
</template>
