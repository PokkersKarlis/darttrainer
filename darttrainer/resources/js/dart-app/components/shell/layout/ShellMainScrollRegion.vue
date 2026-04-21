<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

defineOptions({ name: 'ShellMainScrollRegion' });

const route = useRoute();
/** Efektīvs flex/transition ietvars — class uz router-view ne vienmēr nonāk uz lapas sakni */
const outletKey = computed(() => route.fullPath);
</script>

<template>
  <div class="shell-main-scroll">
    <div class="shell-main-scroll-inner">
      <transition name="fade" mode="out-in">
        <div :key="outletKey" class="shell-router-outlet">
          <router-view />
        </div>
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
