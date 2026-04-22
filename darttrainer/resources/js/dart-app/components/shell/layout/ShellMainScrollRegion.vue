<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

defineOptions({ name: 'ShellMainScrollRegion' });

const route = useRoute();
const outletKey = computed(() => route.fullPath);
const isAuthPage = computed(
  () => route.path === '/login' || route.path === '/register',
);
</script>

<template>
  <div class="shell-main-scroll" :class="{ 'shell-main-scroll--auth': isAuthPage }">
    <div class="shell-main-scroll-inner">
      <!-- /login, /register: bez <Transition> (pat „instant” mēdz radīt 1 kadra / klases aizkavi) -->
      <router-view v-if="isAuthPage" v-slot="{ Component, route: r }">
        <div :key="r.fullPath" class="shell-router-outlet">
          <component :is="Component" />
        </div>
      </router-view>
      <transition v-else name="fade" mode="out-in">
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

.shell-main-scroll--auth {
  overflow: hidden !important;
  overflow-y: hidden !important;
  overscroll-behavior: none;
}

.shell-main-scroll-inner {
  flex: 1;
  min-height: 0;
  display: flex;
  height: fit-content;
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
