<script setup lang="ts">
import IndexSidebar from '@/components/index/IndexSidebar.vue';
import IndexSidebarToggle from '@/components/index/IndexSidebarToggle.vue';
import { useDisplayFrame } from '@/composables/useDisplayFrame';
import { useLocale } from '@/composables/useLocale';
import { computed, ref, watch } from 'vue';

const { t } = useLocale();
const { designType } = useDisplayFrame();
const isPortrait = computed(() => designType.value === 'portrait');
const sidebarOpen = ref(false);

watch(designType, () => {
    sidebarOpen.value = false;
});

const openSidebar = () => {
    sidebarOpen.value = true;
};

const closeSidebar = () => {
    sidebarOpen.value = false;
};
</script>

<template>
    <div
        class="ix-workspace"
        :class="{
            'ix-workspace--portrait': isPortrait,
            'ix-workspace--docked': !isPortrait,
        }"
    >
        <IndexSidebar v-if="!isPortrait" key="ix-sidebar-docked" mode="docked" />

        <template v-else>
            <Transition name="ix-drawer">
                <div v-if="sidebarOpen" key="ix-drawer-layer" class="ix-drawer-layer">
                    <button
                        type="button"
                        class="ix-drawer-backdrop"
                        :aria-label="t('index.sidebar.close')"
                        @click="closeSidebar"
                    />
                    <IndexSidebar key="ix-sidebar-drawer" mode="drawer" @close="closeSidebar" />
                </div>
            </Transition>
        </template>

        <div class="ix-workspace-main">
            <IndexSidebarToggle v-if="isPortrait && !sidebarOpen" @open="openSidebar" />
            <slot />
        </div>
    </div>
</template>

<style scoped>
.ix-workspace {
    flex: 1;
    width: 100%;
    min-height: 0;
}

.ix-workspace--docked {
    display: flex;
    align-items: stretch;
    gap: var(--ix-workspace-gap, 20px);
    min-height: var(--ix-workspace-min-h, 420px);
}

.ix-workspace--portrait {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.ix-workspace-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--ix-hero-gap, 16px);
    min-width: 0;
    min-height: 0;
    width: 100%;
}

.ix-drawer-layer {
    position: fixed;
    inset: 0;
    z-index: 60;
    display: flex;
    align-items: stretch;
}

.ix-drawer-backdrop {
    position: absolute;
    inset: 0;
    border: none;
    background: rgba(2, 6, 16, 0.78);
    backdrop-filter: blur(4px);
    cursor: pointer;
}

.ix-drawer-enter-active,
.ix-drawer-leave-active {
    transition: opacity 0.28s ease;
}

.ix-drawer-enter-active :deep(.ix-sidebar--drawer),
.ix-drawer-leave-active :deep(.ix-sidebar--drawer) {
    transition: transform 0.28s ease;
}

.ix-drawer-enter-from,
.ix-drawer-leave-to {
    opacity: 0;
}

.ix-drawer-enter-from :deep(.ix-sidebar--drawer),
.ix-drawer-leave-to :deep(.ix-sidebar--drawer) {
    transform: translateX(-105%);
}

@media (prefers-reduced-motion: reduce) {
    .ix-drawer-enter-active,
    .ix-drawer-leave-active,
    .ix-drawer-enter-active :deep(.ix-sidebar--drawer),
    .ix-drawer-leave-active :deep(.ix-sidebar--drawer) {
        transition: none;
    }

    .ix-drawer-backdrop {
        backdrop-filter: none;
    }
}
</style>
