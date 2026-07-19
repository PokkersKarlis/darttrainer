<script setup lang="ts">
/** TrainDart sānjoslas navigācijas ikonas — precīzi no dizaina mockup faila. */
defineProps<{
    name: 'dashboard' | 'play' | 'training' | 'tournaments' | 'live' | 'friends';
}>();
</script>

<template>
    <svg v-if="name === 'dashboard'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 11l8-7 8 7M6 10v9a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1v-9" />
    </svg>
    <svg v-else-if="name === 'play'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5.5" /><circle cx="12" cy="12" r="2" />
    </svg>
    <svg v-else-if="name === 'training'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 12h4l3 8 4-16 3 8h4" />
    </svg>
    <svg v-else-if="name === 'tournaments'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 4h12v2a6 6 0 01-6 6 6 6 0 01-6-6V4z" /><path d="M9 20h6M12 12v4" /><path d="M6 6H3a3 3 0 003 3M18 6h3a3 3 0 01-3 3" />
    </svg>
    <svg v-else-if="name === 'live'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <circle cx="12" cy="12" r="2" fill="currentColor" /><path d="M8.5 15.5a5 5 0 010-7M15.5 15.5a5 5 0 000-7M5.5 18.5a9 9 0 010-13M18.5 18.5a9 9 0 000-13" />
    </svg>
    <svg v-else-if="name === 'friends'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0112 0" /><circle cx="17" cy="8" r="2.5" /><path d="M15 13.5c2.8.3 5 2.5 5 6.5" />
    </svg>
</template>
