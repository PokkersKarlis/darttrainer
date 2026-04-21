<script setup>
import ShellMainColumn from './ShellMainColumn.vue';
import ShellMainScrollRegion from './ShellMainScrollRegion.vue';

defineOptions({ name: 'ShellMainContent' });
</script>

<template>
  <ShellMainColumn>
    <ShellMainScrollRegion />
  </ShellMainColumn>
</template>
