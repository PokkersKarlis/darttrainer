<script setup lang="ts">
import type { ActiveLobby } from '@/composables/useActiveLobby';
import { useLocale } from '@/composables/useLocale';
import { Globe, Monitor, Target, Users } from 'lucide-vue-next';

/**
 * Shown on step 1 when the user has a lobby/match open in another tab
 * instead of the one they're currently viewing (`useActiveLobby`).
 */
defineProps<{
    activeLobby: ActiveLobby | null;
    isRemoteActiveMatch: boolean;
}>();

const emit = defineEmits<{
    return: [];
}>();

const { t } = useLocale();
</script>

<template>
    <div class="lae-panel">
        <span class="lae-badge">
            <Monitor :size="14" :stroke-width="2.4" />
            {{ isRemoteActiveMatch ? t('games.lobby.activeMatchElsewhere') : t('games.lobby.activeLobbyElsewhere') }}
        </span>

        <span class="lae-icon-well" :class="activeLobby?.mode === 'online' ? 'lae-icon-well--cyan' : ''">
            <Globe v-if="activeLobby?.mode === 'online'" :size="22" />
            <Target v-else :size="22" />
        </span>

        <p class="lae-kicker">
            {{ activeLobby?.is_host ? t('games.lobby.activeLobbyHost') : t('games.lobby.activeLobbyGuest') }}
        </p>

        <p class="lae-mode">
            {{ activeLobby?.mode === 'online' ? t('games.lobby.online') : t('games.lobby.local') }}
        </p>

        <p v-if="activeLobby?.lobby_code && !isRemoteActiveMatch" class="lae-code">
            {{ t('games.lobby.activeLobbyCode', { code: activeLobby.lobby_code }) }}
        </p>

        <p v-if="activeLobby?.player_count" class="lae-players">
            <Users :size="14" />
            {{
                isRemoteActiveMatch
                    ? t('games.lobby.activeMatchPlayers', { count: activeLobby.player_count })
                    : t('games.lobby.activeLobbyPlayers', { count: activeLobby.player_count })
            }}
        </p>

        <p class="lae-hint">
            {{
                isRemoteActiveMatch
                    ? activeLobby?.is_host
                        ? t('games.lobby.activeMatchHintHost')
                        : t('games.lobby.activeMatchHintGuest')
                    : activeLobby?.is_host
                      ? t('games.lobby.activeLobbyHintHost')
                      : t('games.lobby.activeLobbyHintGuest')
            }}
        </p>

        <button type="button" class="lae-return" @click="emit('return')">
            {{ isRemoteActiveMatch ? t('games.lobby.returnToMatch') : t('games.lobby.returnToLobby') }}
        </button>
    </div>
</template>

<style scoped src="./LobbyActiveElsewherePanel.css"></style>
