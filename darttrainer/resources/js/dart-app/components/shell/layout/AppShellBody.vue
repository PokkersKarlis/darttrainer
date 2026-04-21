<script setup>
/** Vidus: sānjosla + saturs + labās reklāmas */
import ShellSidebar from '../ShellSidebar.vue';
import ShellMainContent from './MainContent.vue';
import ShellRightAds from '../ShellRightAds.vue';
</script>

<template>
  <div style="flex: 1; display: flex; overflow: hidden; min-height: 0">
    <ShellSidebar />
    <ShellMainContent />
    <ShellRightAds />
  </div>
</template>
