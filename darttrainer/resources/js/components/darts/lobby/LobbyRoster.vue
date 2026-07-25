<script setup lang="ts">
import { getInitials } from '@/composables/useInitials';
import { useLocale } from '@/composables/useLocale';
import type { LobbyMode, LobbyPlayer } from '@/stores/dartsLobby';
import { Users } from 'lucide-vue-next';

/** Step 1 player roster: everyone in the lobby, with ready-toggle where allowed. */
const props = defineProps<{
    players: LobbyPlayer[];
    isLobbyHost: boolean;
    activeMode: LobbyMode;
    canProceed: boolean;
    loading: boolean;
    currentUserId: number;
}>();

const emit = defineEmits<{
    'toggle-ready': [player: LobbyPlayer];
}>();

const { t } = useLocale();

function canTogglePlayer(player: LobbyPlayer): boolean {
    if (props.activeMode === 'local') {
        return false;
    }

    if (player.user_id === props.currentUserId) {
        return true;
    }

    return props.isLobbyHost && player.user_id === null;
}

function playerStatusLabel(status: LobbyPlayer['status']): string {
    if (status === 'ready') {
        return t('games.lobby.playerReady');
    }

    if (status === 'playing') {
        return t('games.lobby.playerPlaying');
    }

    return t('games.lobby.playerWaiting');
}
</script>

<template>
    <div class="lro-roster">
        <div class="lro-head">
            <span class="lro-icon-well">
                <Users :size="18" />
            </span>
            <div>
                <p class="lro-title">{{ t('games.lobby.rosterTitle') }}</p>
                <p class="lro-desc">{{ t('games.lobby.rosterDesc', { count: players.length }) }}</p>
            </div>
        </div>

        <ul class="lro-list">
            <li v-for="player in players" :key="player.id" class="lro-item">
                <span class="lro-avatar">{{ getInitials(player.display_name) }}</span>
                <div class="lro-copy">
                    <p class="lro-name">
                        {{ player.display_name }}
                        <span v-if="player.user_id && player.is_online === false" class="lro-away">
                            {{ t('games.lobby.offline') }}
                        </span>
                    </p>
                    <p class="lro-meta">
                        {{ player.user_id ? t('games.lobby.registered') : t('games.lobby.guestPlayer') }}
                        · {{ playerStatusLabel(player.status) }}
                    </p>
                </div>
                <button
                    v-if="canTogglePlayer(player)"
                    type="button"
                    class="lro-btn lro-btn--sm"
                    :class="player.status === 'ready' ? 'lro-btn--green' : ''"
                    :disabled="loading"
                    @click="emit('toggle-ready', player)"
                >
                    {{ player.status === 'ready' ? t('games.lobby.markUnready') : t('games.lobby.markReady') }}
                </button>
                <span v-else class="lro-ready-pill" :class="`lro-ready-pill--${player.status}`">
                    {{ playerStatusLabel(player.status) }}
                </span>
                <span class="lro-slot">#{{ player.slot }}</span>
            </li>
        </ul>

        <p v-if="players.length < 2" class="lro-warn">{{ t('games.lobby.needMore') }}</p>
        <p v-else-if="activeMode !== 'local' && !canProceed" class="lro-warn">{{ t('games.lobby.needAllReady') }}</p>
    </div>
</template>

<style scoped src="./LobbyRoster.css"></style>
