<script setup>
defineOptions({ name: 'ShellMainColumn' });
</script>

<template>
  <main class="shell-main-column">
    <slot />
  </main>
</template>

<style scoped>
/* Atrodas starp sāniem un apakšas nav/foot; 1:1 pilda atvēlēto stabiņu augstumu */
.shell-main-column {
  flex: 1 1 0%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: #0b0e14;
  display: flex;
  flex-direction: column;
}
</style>
