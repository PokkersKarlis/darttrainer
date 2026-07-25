<script setup lang="ts">
import GameCheckbox from '@/components/darts/GameCheckbox.vue';
import { friendActivityClass } from '@/lib/friendActivity';
import { DISPLAY_NAME_MAX_LENGTH } from '@/lib/displayName';
import { useLocale } from '@/composables/useLocale';
import { useDartsLobbyStore, type FriendEntry } from '@/stores/dartsLobby';
import { UserPlus } from 'lucide-vue-next';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

const props = defineProps<{
    friends: FriendEntry[];
    savedGuests: Array<{ id: number; name: string; email?: string | null }>;
    lobbyUuid: string | null;
    players: Array<{ id: number; user_id: number | null; display_name: string }>;
    compact?: boolean;
}>();

const emit = defineEmits<{
    inviteFriend: [friend: FriendEntry];
}>();

const { t } = useLocale();
const store = useDartsLobbyStore();
const { guestName, guestEmail, saveGuest, loading } = storeToRefs(store);

const isFriendInLobby = (friendId: number) => props.players.some((player) => player.user_id === friendId);

const isFriendUnavailable = (friend: FriendEntry) => friend.activity === 'in_game';

function friendInviteLabel(friend: FriendEntry) {
    if (isFriendInLobby(friend.id)) {
        return t('games.lobby.added');
    }

    if (friend.activity === 'in_game') {
        return t('games.lobby.inGame');
    }

    return t('games.lobby.invite');
}

function isFriendInviteDisabled(friend: FriendEntry) {
    return loading.value || isFriendInLobby(friend.id) || isFriendUnavailable(friend);
}

async function addGuestFromInput() {
    if (!props.lobbyUuid) {
        return;
    }

    await store.addGuest(props.lobbyUuid);
}

const panelClass = computed(() => (props.compact ? 'llp llp--compact' : 'llp'));
</script>

<template>
    <div :class="panelClass">
        <p v-if="compact" class="llp-kicker">{{ t('games.lobby.localPlayersTitle') }}</p>
        <p v-if="compact" class="llp-hint">{{ t('games.lobby.localPlayersHint') }}</p>

        <div class="llp-block">
            <p class="llp-block-title">{{ t('games.lobby.friends') }}</p>
            <div v-if="!friends.length" class="llp-empty">{{ t('games.lobby.noFriends') }}</div>
            <ul v-else class="llp-friend-list">
                <li v-for="friend in friends" :key="friend.id" class="llp-friend-item">
                    <span class="llp-dot" :class="friendActivityClass(friend.activity)" />
                    <div class="llp-friend-copy">
                        <p class="llp-friend-name">
                            {{ friend.name }}
                            <span v-if="friend.is_premium" class="llp-pro">PRO</span>
                        </p>
                        <p class="llp-friend-email">{{ friend.email }}</p>
                    </div>
                    <button
                        type="button"
                        class="llp-btn llp-btn--sm"
                        :class="{ 'llp-btn--done': isFriendInLobby(friend.id), 'llp-btn--busy': isFriendUnavailable(friend) }"
                        :disabled="isFriendInviteDisabled(friend)"
                        @click="emit('inviteFriend', friend)"
                    >
                        {{ friendInviteLabel(friend) }}
                    </button>
                </li>
            </ul>
        </div>

        <div class="llp-block">
            <p class="llp-block-title">{{ t('games.lobby.guest') }}</p>
            <div class="llp-guest-row">
                <input
                    v-model="guestName"
                    type="text"
                    class="llp-input"
                    :placeholder="t('games.lobby.guestPlaceholder')"
                    :maxlength="DISPLAY_NAME_MAX_LENGTH"
                />
                <button
                    type="button"
                    class="llp-btn llp-btn--green llp-btn--sm"
                    :disabled="loading || !guestName.trim()"
                    @click="addGuestFromInput"
                >
                    <UserPlus :size="14" />
                    {{ t('games.lobby.addGuest') }}
                </button>
            </div>
            <input
                v-model="guestEmail"
                type="email"
                class="llp-input llp-input--email"
                :placeholder="t('games.lobby.guestEmailPlaceholder')"
            />
            <p class="llp-tip">{{ t('games.lobby.guestEmailHint') }}</p>
            <GameCheckbox v-model="saveGuest">
                {{ t('games.lobby.saveGuest') }}
            </GameCheckbox>
            <div v-if="savedGuests.length" class="llp-chips">
                <button
                    v-for="guest in savedGuests"
                    :key="guest.id"
                    type="button"
                    class="llp-chip"
                    @click="guestName = guest.name; guestEmail = guest.email ?? ''"
                >
                    {{ guest.name }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.llp {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.llp--compact {
    padding: 12px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(0, 0, 0, 0.18);
}

.llp-kicker {
    margin: 0;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 16px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
}

.llp-hint {
    margin: 0 0 4px;
    color: #64748b;
    font-size: 12px;
    line-height: 1.45;
}

.llp-block {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.llp-block-title {
    margin: 0;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #cbd5e1;
}

.llp-empty {
    color: #64748b;
    font-size: 13px;
}

.llp-friend-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.llp-friend-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    background: rgba(0, 0, 0, 0.12);
}

.llp-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    flex-shrink: 0;
}

.llp-friend-copy {
    flex: 1 1 auto;
    min-width: 0;
}

.llp-friend-name {
    margin: 0;
    font-weight: 700;
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.llp-friend-email {
    margin: 2px 0 0;
    color: #64748b;
    font-size: 11px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.llp-pro {
    margin-left: 5px;
    padding: 1px 5px;
    border-radius: 999px;
    background: #fbbf24;
    color: #0b0f19;
    font-size: 9px;
    font-weight: 900;
}

.llp-guest-row {
    display: flex;
    gap: 8px;
}

.llp-input {
    flex: 1 1 auto;
    min-width: 0;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(0, 0, 0, 0.25);
    color: #e2e8f0;
    font-size: 14px;
}

.llp-input--email {
    width: 100%;
}

.llp-tip {
    margin: 0;
    color: #64748b;
    font-size: 11px;
    line-height: 1.4;
}

.llp-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.llp-chip {
    padding: 5px 10px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.04);
    color: #cbd5e1;
    font-size: 12px;
    cursor: pointer;
}

.llp-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.04);
    color: #e2e8f0;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
}

.llp-btn--sm {
    padding: 6px 10px;
}

.llp-btn--green {
    border-color: rgba(57, 255, 20, 0.35);
    background: rgba(57, 255, 20, 0.08);
    color: #39ff14;
}

.llp-btn--done {
    border-color: rgba(57, 255, 20, 0.35);
    color: #86efac;
}

.llp-btn--busy {
    opacity: 0.55;
}

.llp-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}
</style>
