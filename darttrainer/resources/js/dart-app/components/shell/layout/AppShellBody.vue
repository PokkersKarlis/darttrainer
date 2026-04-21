<script setup>
/** Vidus: sānjosla + saturs + labās reklāmas */
import ShellSidebar from '../ShellSidebar.vue';
import ShellMainContent from './MainContent.vue';
import ShellRightAds from '../ShellRightAds.vue';

defineProps({
  /** Aktīvā spēle: tikai galvenā kolonna, bez sānjoslas un reklāmām */
  gameFocus: { type: Boolean, default: false },
});
</script>

<template>
  <div style="flex: 1; display: flex; overflow: hidden; min-height: 0">
    <ShellSidebar v-if="!gameFocus" />
    <ShellMainContent />
    <ShellRightAds v-if="!gameFocus" />
  </div>
</template>
