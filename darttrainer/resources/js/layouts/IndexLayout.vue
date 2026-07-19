<script setup lang="ts">
/**
 * Authenticated app shell — athletic surface with responsive display frame.
 * Tracks breakpoint (compact / medium / wide) and design type (portrait / landscape / square).
 */
import AppTopBar from '@/components/AppTopBar.vue';
import CookieConsent from '@/components/CookieConsent.vue';
import IndexAtmosphere from '@/components/index/IndexAtmosphere.vue';
import IndexFooter from '@/components/index/IndexFooter.vue';
import { provideDisplayFrame } from '@/composables/useDisplayFrame';
import '@/styles/index-frame.css';

const { breakpoint, designType } = provideDisplayFrame();
</script>

<template>
    <div
        class="ix ix-shell"
        :data-bp="breakpoint"
        :data-design="designType"
    >
        <IndexAtmosphere />

        <AppTopBar />

        <main class="ix-main">
            <div class="ix-main-inner">
                <slot />
            </div>
        </main>

        <IndexFooter />

        <CookieConsent />
    </div>
</template>
