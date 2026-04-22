<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
/** Vidus: sānjosla + saturs + labās reklāmas */
import ShellSidebar from '../ShellSidebar.vue';
import ShellMainContent from './MainContent.vue';
import ShellRightAds from '../ShellRightAds.vue';

const props = defineProps({
  /** Aktīvā spēle: tikai galvenā kolonna, bez sānjoslas un reklāmām */
  gameFocus: { type: Boolean, default: false },
});

const route = useRoute();
/** Pilnekrāna canvas: sākumlapa (mock 3 kolonnas) un Cricket — globālo sāni/reklāmu paslēpt */
const hideDefaultChrome = computed(
  () => !props.gameFocus && (route.path === '/lobby/cricket' || route.path === '/'),
);
</script>

<template>
  <div
    class="dt-app-body-layout"
    :class="{ 'dt-app-body--full-bleed': hideDefaultChrome }"
    style="flex: 1; display: flex; overflow: hidden; min-height: 0"
  >
    <ShellSidebar v-if="!gameFocus && !hideDefaultChrome" />
    <ShellMainContent />
    <ShellRightAds v-if="!gameFocus && !hideDefaultChrome" />
  </div>
</template>
