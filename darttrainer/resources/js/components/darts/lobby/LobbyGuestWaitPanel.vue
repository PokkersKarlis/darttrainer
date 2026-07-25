<script setup lang="ts">
import { useLocale } from '@/composables/useLocale';
import type { LobbyPlayer } from '@/stores/dartsLobby';

/** Shown to non-host players on step 1: "waiting for host to start" + their own ready toggle. */
defineProps<{
    player: LobbyPlayer | null;
    loading: boolean;
}>();

const emit = defineEmits<{
    'toggle-ready': [];
}>();

const { t } = useLocale();
</script>

<template>
    <div class="lgw-wait">
        <p class="lgw-title">{{ t('games.lobby.guestWaitingTitle') }}</p>
        <p class="lgw-desc">{{ t('games.lobby.guestWaitingDesc') }}</p>
        <button v-if="player" type="button" class="lgw-btn" :disabled="loading" @click="emit('toggle-ready')">
            {{ player.status === 'ready' ? t('games.lobby.markUnready') : t('games.lobby.markReady') }}
        </button>
    </div>
</template>

<style scoped src="./LobbyGuestWaitPanel.css"></style>
