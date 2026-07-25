<script setup lang="ts">
import { useLocale } from '@/composables/useLocale';
import { friendActivityClass } from '@/lib/friendActivity';
import type { FriendEntry, LobbyPlayer } from '@/stores/dartsLobby';

/**
 * Online-mode friend invite list on step 1. Only ever rendered when
 * activeMode === 'online' (local mode uses LocalLobbyPanel instead).
 */
const props = defineProps<{
    friends: FriendEntry[];
    players: LobbyPlayer[];
    pendingInviteeIds: number[];
    loading: boolean;
}>();

const emit = defineEmits<{
    invite: [friend: FriendEntry];
}>();

const { t } = useLocale();

function isFriendPendingInvite(friendId: number): boolean {
    return props.pendingInviteeIds.includes(friendId);
}

function isFriendInLobby(friendId: number): boolean {
    return props.players.some((player) => player.user_id === friendId);
}

function canInviteFriend(friend: FriendEntry): boolean {
    return friend.activity === 'online' || friend.activity === 'in_lobby';
}

function friendInviteLabel(friend: FriendEntry): string {
    if (isFriendInLobby(friend.id)) {
        return t('games.lobby.added');
    }

    if (isFriendPendingInvite(friend.id)) {
        return t('games.lobby.inviteSent');
    }

    if (friend.activity === 'in_game') {
        return t('games.lobby.inGame');
    }

    if (friend.activity === 'away') {
        return t('games.lobby.away');
    }

    return t('games.lobby.invite');
}

function isFriendInviteDisabled(friend: FriendEntry): boolean {
    if (props.loading || isFriendInLobby(friend.id) || isFriendPendingInvite(friend.id)) {
        return true;
    }

    return !canInviteFriend(friend);
}
</script>

<template>
    <div class="lfi-block">
        <p class="lfi-title">{{ t('games.lobby.friends') }}</p>
        <p class="lfi-hint">{{ t('games.lobby.inviteFriendsHint') }}</p>
        <div v-if="!friends.length" class="lfi-empty">{{ t('games.lobby.noOnlineFriends') }}</div>
        <ul v-else class="lfi-list">
            <li v-for="friend in friends" :key="friend.id" class="lfi-item">
                <span class="xl-dot" :class="friendActivityClass(friend.activity)" />
                <div class="lfi-copy">
                    <p class="lfi-name">
                        {{ friend.name }}
                        <span v-if="friend.is_premium" class="lfi-pro">PRO</span>
                    </p>
                    <p class="lfi-email">{{ friend.email }}</p>
                </div>
                <button
                    type="button"
                    class="lfi-btn lfi-btn--sm"
                    :class="{
                        'lfi-btn--done': isFriendInLobby(friend.id) || isFriendPendingInvite(friend.id),
                        'lfi-btn--busy': isFriendInviteDisabled(friend) && !isFriendPendingInvite(friend.id) && !isFriendInLobby(friend.id),
                    }"
                    :disabled="isFriendInviteDisabled(friend)"
                    @click="emit('invite', friend)"
                >
                    {{ friendInviteLabel(friend) }}
                </button>
            </li>
        </ul>
    </div>
</template>

<style scoped src="./LobbyFriendInvites.css"></style>
