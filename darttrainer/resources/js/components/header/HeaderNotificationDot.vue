<script setup lang="ts">
defineProps<{
    title?: string;
}>();
</script>

<template>
    <span class="hdr-dot" :title="title" aria-hidden="true" />
</template>

<style scoped>
.hdr-dot {
    position: absolute;
    top: 7px;
    right: 7px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--hdr-pink);
    border: 2px solid #131a26;
    box-shadow: 0 0 8px rgba(251, 44, 95, 0.65);
}
</style>
