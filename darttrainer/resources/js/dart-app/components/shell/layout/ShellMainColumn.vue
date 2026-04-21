<script setup>
defineOptions({ name: 'ShellMainColumn' });
</script>

<template>
  <main class="shell-main-column">
    <slot />
  </main>
</template>

<style scoped>
.shell-main-column {
  flex: 1;
  overflow: hidden;
  min-width: 0;
  min-height: 0;
  background: #060d18;
  display: flex;
  flex-direction: column;
}
</style>
