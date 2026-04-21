<script setup>
defineOptions({ name: 'ShellMainScrollRegion' });
</script>

<template>
  <div class="shell-main-scroll">
    <div class="shell-main-scroll-inner">
      <transition name="fade" mode="out-in">
        <router-view class="shell-router-outlet" />
      </transition>
    </div>
  </div>
</template>

<style scoped>
.shell-main-scroll {
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.shell-main-scroll-inner {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.shell-router-outlet {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
</style>
