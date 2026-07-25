<script setup lang="ts">
import GameLayout from '@/layouts/GameLayout.vue';
import GameCheckbox from '@/components/darts/GameCheckbox.vue';
import LocalLobbyPanel from '@/components/darts/LocalLobbyPanel.vue';
import { getInitials } from '@/composables/useInitials';
import { useActiveLobby } from '@/composables/useActiveLobby';
import { sanitizeLobbyCodeInput } from '@/lib/lobbyCode';
import { useGameResponsive } from '@/composables/useGameResponsive';
import { GameViewportRemeasureKey } from '@/composables/useGameViewportFit';
import { useLocale } from '@/composables/useLocale';
import { useDartsLobbyStore, type FriendEntry, type LobbyPlayer, type LobbySnapshot } from '@/stores/dartsLobby';
import { Head, router, usePage } from '@inertiajs/vue3';
import { friendActivityClass } from '@/lib/friendActivity';
import { Globe, Target, Users, Wifi, Copy, Check, ArrowLeft, Monitor, ChevronUp, ChevronDown } from 'lucide-vue-next';
import { storeToRefs } from 'pinia';
import { computed, inject, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

interface Props {
    lobby?: {
        uuid: string;
        host_user_id: number;
        lobby_code: string | null;
        can_proceed: boolean;
        pending_invitee_ids?: number[];
        players: LobbyPlayer[];
        config: {
            mode: 'online' | 'local';
            format: 'best_of' | 'first_to';
            legs_target: number;
            sets_target: number;
            starting_points: 301 | 501;
            in_rule: 'straight' | 'double';
            out_rule: 'straight' | 'double';
            track_checkout_rate: boolean;
            is_public: boolean;
        };
        match_type: 'solo' | 'team';
    };
    friends: FriendEntry[];
    savedGuests: Array<{ id: number; name: string }>;
    user: { id: number; name: string; is_premium: boolean };
    isHost?: boolean;
}

const props = defineProps<Props>();

const { t } = useLocale();
const { frame } = useGameResponsive();
const remeasureViewport = inject<( () => void ) | undefined>(GameViewportRemeasureKey, undefined);
const store = useDartsLobbyStore();
const { players: storePlayers, lobbyUuid: storeLobbyUuid, lobbyCode: storeLobbyCode, canProceed: storeCanProceed, mode: storeMode, pendingInviteeIds: storePendingInviteeIds } =
    storeToRefs(store);
const { activeLobby, goToActiveLobby } = useActiveLobby();

const showExitConfirm = ref(false);
const copiedCode = ref(false);
const setupOrder = ref<number[]>([]);
const customScores = ref<Record<number, string>>({});
const useCustomScore = ref<Record<number, boolean>>({});
const firstThrowerId = ref<number | null>(null);
const menuView = ref<'pick' | 'online'>('pick');
const isLeaving = ref(false);
let lobbyListener: { cancel: () => void; pollNow: () => void } | null = null;
let lobbyReloadPending = false;

const isLiveLobby = computed(() => !!props.lobby?.uuid && storeLobbyUuid.value === props.lobby.uuid);

const lobbyUuid = computed(() => props.lobby?.uuid ?? storeLobbyUuid.value);
const lobbyCode = computed(() =>
    isLiveLobby.value ? storeLobbyCode.value : (props.lobby?.lobby_code ?? storeLobbyCode.value),
);
const players = computed(() =>
    isLiveLobby.value ? storePlayers.value : (props.lobby?.players ?? storePlayers.value),
);
const canProceed = computed(() =>
    isLiveLobby.value ? storeCanProceed.value : (props.lobby?.can_proceed ?? storeCanProceed.value),
);
const activeMode = computed(() =>
    isLiveLobby.value ? storeMode.value : (props.lobby?.config.mode ?? storeMode.value),
);
const hasRemoteActiveLobby = computed(() => !lobbyUuid.value && !!activeLobby.value);
const isRemoteActiveMatch = computed(() => hasRemoteActiveLobby.value && activeLobby.value?.status === 'active');
const canCreateNewLobby = computed(() => !lobbyUuid.value && !activeLobby.value);
const isLobbyHost = computed(() => {
    if (props.isHost !== undefined) {
        return props.isHost;
    }

    if (props.lobby?.host_user_id) {
        return props.lobby.host_user_id === props.user.id;
    }

    return !props.lobby;
});

const nextDisabled = computed(() => {
    if (store.step === 1) {
        if (!lobbyUuid.value) {
            return true;
        }

        if (activeMode.value === 'local') {
            return players.value.length < 2;
        }

        return !canProceed.value;
    }

    if (store.step === 3 && players.value.length === 2) {
        return store.loading || firstThrowerId.value === null;
    }

    return store.loading;
});

const nextLabel = computed(() => {
    if (store.step === 3) {
        return t('games.lobby.start');
    }

    return t('games.lobby.next');
});

const isTwoPlayerSetup = computed(() => players.value.length === 2);

const myPlayer = computed(() => players.value.find((player) => player.user_id === props.user.id) ?? null);

const formatHint = computed(() =>
    store.config.format === 'best_of' ? t('games.lobby.formatBestOfHint') : t('games.lobby.formatFirstToHint'),
);

const startingPointsHint = computed(() =>
    store.config.starting_points === 301 ? t('games.lobby.points301Hint') : t('games.lobby.points501Hint'),
);

const startRuleHint = computed(() =>
    store.config.in_rule === 'double' ? t('games.lobby.startDoubleHint') : t('games.lobby.startStraightHint'),
);

const finishRuleHint = computed(() =>
    store.config.out_rule === 'double' ? t('games.lobby.finishDoubleHint') : t('games.lobby.finishStraightHint'),
);

const scoringPreset = computed(() => {
    const inCode = store.config.in_rule === 'double' ? 'DI' : 'SI';
    const outCode = store.config.out_rule === 'double' ? 'DO' : 'SO';

    return `${inCode}${outCode}`;
});

function clampCount(value: number, min = 1, max = 21): number {
    return Math.min(max, Math.max(min, Math.round(value)));
}

function adjustLegs(delta: number) {
    store.config.legs_target = clampCount(store.config.legs_target + delta);
}

function adjustSets(delta: number) {
    store.config.sets_target = clampCount(store.config.sets_target + delta);
}

function playerById(id: number) {
    return players.value.find((player) => player.id === id);
}

function initSetupStep() {
    const ordered = [...players.value].sort((left, right) => left.slot - right.slot);
    setupOrder.value = ordered.map((player) => player.id);
    firstThrowerId.value = ordered[0]?.id ?? null;

    const nextCustom: Record<number, string> = {};
    const nextUseCustom: Record<number, boolean> = {};

    for (const player of ordered) {
        if (player.starting_points != null) {
            nextCustom[player.id] = String(player.starting_points);
            nextUseCustom[player.id] = true;
        }
    }

    customScores.value = nextCustom;
    useCustomScore.value = nextUseCustom;
}

function moveSetupPlayer(index: number, delta: number) {
    const next = [...setupOrder.value];
    const target = index + delta;

    if (target < 0 || target >= next.length) {
        return;
    }

    [next[index], next[target]] = [next[target], next[index]];
    setupOrder.value = next;
}

function toggleCustomScore(playerId: number) {
    useCustomScore.value[playerId] = !useCustomScore.value[playerId];

    if (!useCustomScore.value[playerId]) {
        delete customScores.value[playerId];
        return;
    }

    customScores.value[playerId] = String(store.config.starting_points);
}

async function saveSetupAndStart() {
    if (!lobbyUuid.value) {
        return;
    }

    store.loading = true;
    store.error = null;

    try {
        for (const playerId of setupOrder.value) {
            const player = playerById(playerId);

            if (!player) {
                continue;
            }

            let desired: number | null = null;

            if (useCustomScore.value[playerId]) {
                const raw = customScores.value[playerId]?.trim();

                if (!raw) {
                    store.error = 'lobby-setup-invalid-score';
                    return;
                }

                const parsed = Number.parseInt(raw, 10);

                if (Number.isNaN(parsed) || parsed < 2 || parsed > 999) {
                    store.error = 'lobby-setup-invalid-score';
                    return;
                }

                desired = parsed;
            }

            const current = player.starting_points ?? null;

            if (current !== desired) {
                await store.updatePlayerStartingPoints(lobbyUuid.value, playerId, desired);
            }
        }

        if (isTwoPlayerSetup.value && firstThrowerId.value) {
            const currentFirst = [...players.value].sort((left, right) => left.slot - right.slot)[0];

            if (currentFirst?.id !== firstThrowerId.value) {
                await store.setFirstThrower(lobbyUuid.value, firstThrowerId.value);
            }
        } else if (setupOrder.value.length > 2) {
            const currentOrder = [...players.value]
                .sort((left, right) => left.slot - right.slot)
                .map((player) => player.id);

            if (JSON.stringify(currentOrder) !== JSON.stringify(setupOrder.value)) {
                await store.updateThrowOrder(lobbyUuid.value, setupOrder.value);
            }
        }

        await store.startGame(lobbyUuid.value);
    } catch {
        if (!store.error) {
            store.error = 'lobby-setup-failed';
        }
    } finally {
        store.loading = false;
    }
}

function setInRule(rule: 'straight' | 'double') {
    store.config.in_rule = rule;
}

function setOutRule(rule: 'straight' | 'double') {
    store.config.out_rule = rule;
}

function canTogglePlayer(player: LobbyPlayer): boolean {
    if (activeMode.value === 'local') {
        return false;
    }

    if (player.user_id === props.user.id) {
        return true;
    }

    return isLobbyHost.value && player.user_id === null;
}

function togglePlayerReady(player: LobbyPlayer) {
    if (!lobbyUuid.value || !canTogglePlayer(player)) {
        return;
    }

    void store.toggleReady(lobbyUuid.value, player.id, player.status !== 'ready');
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

const errorMessage = computed(() => {
    if (!store.error) {
        return '';
    }

    const key = `games.lobby.errors.${store.error}`;
    const translated = t(key);

    return translated === key ? '' : translated;
});

const infoMessage = computed(() => {
    const status = (usePage().props.flash as { status?: string } | undefined)?.status;

    if (status === 'already-in-lobby') {
        return t('games.lobby.errors.already-in-lobby');
    }

    return '';
});

function redirectToLobbyIndex() {
    if (isLeaving.value) {
        return;
    }

    lobbyListener?.cancel();
    lobbyListener = null;
    store.reset();
    menuView.value = 'pick';
    router.visit(route('darts.x01.lobby.index'));
}

function toLobbySnapshot(lobby: NonNullable<Props['lobby']>): LobbySnapshot {
    return {
        uuid: lobby.uuid,
        host_user_id: lobby.host_user_id,
        lobby_code: lobby.lobby_code,
        status: 'lobby',
        match_type: lobby.match_type,
        can_proceed: lobby.can_proceed,
        pending_invitee_ids: lobby.pending_invitee_ids ?? [],
        players: lobby.players,
        config: lobby.config,
    };
}

function scheduleLobbyPropsReload() {
    if (lobbyReloadPending || isLeaving.value) {
        return;
    }

    lobbyReloadPending = true;

    router.reload({
        only: ['lobby', 'friends'],
        preserveScroll: true,
        onFinish: () => {
            lobbyReloadPending = false;
            remeasureViewport?.();
        },
    });
}

function handleLobbySnapshot(snapshot: LobbySnapshot) {
    if (isLeaving.value) {
        return;
    }

    if (snapshot.status === 'active') {
        router.visit(route('darts.x01.play', snapshot.uuid));
        return;
    }

    store.applyLobbySnapshot(snapshot);
    scheduleLobbyPropsReload();
}

function syncLobbyListener() {
    const lobby = props.lobby;

    if (!lobby?.uuid || isLeaving.value) {
        lobbyListener?.cancel();
        lobbyListener = null;
        return;
    }

    store.hydrateFromProps({ lobby });

    lobbyListener?.cancel();
    lobbyListener = null;

    if (lobby.config.mode !== 'online') {
        return;
    }

    lobbyListener = store.listenToLobby(
        lobby.uuid,
        handleLobbySnapshot,
        () => {
            redirectToLobbyIndex();
        },
        toLobbySnapshot(lobby),
    );
}

function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
        lobbyListener?.pollNow();
    }
}

watch(
    () => props.lobby?.uuid,
    () => {
        syncLobbyListener();
    },
    { immediate: true },
);

onMounted(() => {
    if (!props.lobby) {
        store.reset();
        menuView.value = 'pick';
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
});

onUnmounted(() => {
    lobbyListener?.cancel();
    lobbyListener = null;
    document.removeEventListener('visibilitychange', handleVisibilityChange);
});

watch(
    () => props.lobby,
    (lobby) => {
        if (!lobby?.uuid) {
            return;
        }

        if (storeLobbyUuid.value === lobby.uuid) {
            store.hydrateFromProps({ lobby });
        }

        if (!isLobbyHost.value) {
            store.step = 1;
        }

        void nextTick(() => remeasureViewport?.());
    },
);

watch(
    () => [store.step, menuView.value, lobbyUuid.value, players.value.length, errorMessage.value, infoMessage.value],
    () => {
        void nextTick(() => remeasureViewport?.());
    },
);

async function handleCopyCode() {
    const ok = await store.copyLobbyCode(lobbyCode.value);
    copiedCode.value = ok;
    window.setTimeout(() => {
        copiedCode.value = false;
    }, 1800);
}

async function handleNext() {
    if (!isLobbyHost.value) {
        return;
    }

    if (store.step === 1) {
        if (canProceed.value) {
            store.step = 2;
        }

        return;
    }

    if (store.step === 2) {
        if (lobbyUuid.value) {
            await store.saveConfig(lobbyUuid.value);

            if (!store.error) {
                initSetupStep();
                store.step = 3;
            }
        }

        return;
    }

    if (store.step === 3) {
        await saveSetupAndStart();
    }
}

function handleBack() {
    if (store.step === 3) {
        store.step = 2;
        return;
    }

    if (store.step === 2) {
        store.step = 1;
    }
}

async function selectMode(mode: 'online' | 'local') {
    if (!canCreateNewLobby.value) {
        return;
    }

    if (lobbyUuid.value) {
        store.mode = mode;
        return;
    }

    if (mode === 'online') {
        menuView.value = 'online';
        store.mode = 'online';
        return;
    }

    await store.createLobby(mode);
}

function backToModePick() {
    menuView.value = 'pick';
    store.mode = null;
    store.error = null;
}

async function createOnlineLobby() {
    await store.createLobby('online');
}

function handleJoinCodeInput(event: Event) {
    const target = event.target as HTMLInputElement;
    store.joinCode = sanitizeLobbyCodeInput(target.value);
}

function isFriendPendingInvite(friendId: number) {
    return storePendingInviteeIds.value.includes(friendId);
}

function isFriendInLobby(friendId: number) {
    return players.value.some((player) => player.user_id === friendId);
}

function isFriendUnavailable(friend: FriendEntry) {
    return friend.activity === 'in_game';
}

function canInviteOnlineFriend(friend: FriendEntry) {
    return friend.activity === 'online' || friend.activity === 'in_lobby';
}

function friendInviteLabel(friend: FriendEntry) {
    if (isFriendInLobby(friend.id)) {
        return t('games.lobby.added');
    }

    if (isFriendPendingInvite(friend.id)) {
        return t('games.lobby.inviteSent');
    }

    if (friend.activity === 'in_game') {
        return t('games.lobby.inGame');
    }

    if (activeMode.value !== 'online' && friend.activity === 'in_lobby') {
        return t('games.lobby.inLobby');
    }

    if (activeMode.value === 'online' && friend.activity === 'away') {
        return t('games.lobby.away');
    }

    return t('games.lobby.invite');
}

function isFriendInviteDisabled(friend: FriendEntry) {
    if (store.loading || isFriendInLobby(friend.id) || isFriendPendingInvite(friend.id)) {
        return true;
    }

    if (activeMode.value === 'online') {
        return !canInviteOnlineFriend(friend);
    }

    return friend.activity === 'in_lobby' || friend.activity === 'in_game';
}

async function inviteFriend(friend: FriendEntry) {
    if (!lobbyUuid.value || isFriendInviteDisabled(friend)) {
        return;
    }

    if (activeMode.value === 'online') {
        await store.sendInvite(friend.id, lobbyUuid.value);
        return;
    }

    await store.addFriend(friend.id, lobbyUuid.value);
}

async function confirmExit() {
    isLeaving.value = true;
    showExitConfirm.value = false;
    lobbyListener?.cancel();
    lobbyListener = null;

    if (lobbyUuid.value) {
        await store.abandonLobby(lobbyUuid.value);
        return;
    }

    store.reset();
    menuView.value = 'pick';
    router.visit(route('home'));
}
</script>

<template>
    <Head :title="t('games.lobby.title')" />

    <GameLayout
        :player-name="user.name"
        :is-premium="user.is_premium"
        :lobby-code="lobbyCode"
        :show-lobby-code="isLobbyHost && activeMode === 'online'"
        @exit="showExitConfirm = true"
        @copy-code="handleCopyCode"
    >
        <div class="xl game-page" :class="`xl--${frame}`">
            <div class="xl-steps">
                <div class="xl-step" :class="{ 'xl-step--on': store.step === 1 || (!isLobbyHost && lobbyUuid) }">
                    <span class="xl-step-num">1</span>
                    <span class="xl-step-label">{{ t('games.lobby.stepPlayers') }}</span>
                </div>
                <div v-if="isLobbyHost" class="xl-step-line" />
                <div v-if="isLobbyHost" class="xl-step" :class="{ 'xl-step--on': store.step === 2 }">
                    <span class="xl-step-num">2</span>
                    <span class="xl-step-label">{{ t('games.lobby.stepConfig') }}</span>
                </div>
                <div v-if="isLobbyHost" class="xl-step-line" />
                <div v-if="isLobbyHost" class="xl-step" :class="{ 'xl-step--on': store.step === 3 }">
                    <span class="xl-step-num">3</span>
                    <span class="xl-step-label">{{ t('games.lobby.stepSetup') }}</span>
                </div>
            </div>

            <p v-if="infoMessage" class="xl-toast xl-toast--info">{{ infoMessage }}</p>
            <p v-if="errorMessage" class="xl-toast xl-toast--error">{{ errorMessage }}</p>

            <!-- STEP 1 -->
            <section v-if="store.step === 1 || !isLobbyHost" class="xl-body xl-rise xl-body--step1 game-page__body">
                <div class="xl-intro">
                    <h1 class="xl-title">
                        {{
                            hasRemoteActiveLobby
                                ? isRemoteActiveMatch
                                    ? t('games.lobby.activeMatchTitle')
                                    : t('games.lobby.activeLobbyTitle')
                                : lobbyUuid && !isLobbyHost
                                  ? t('games.lobby.guestTitle')
                                  : menuView === 'online' && canCreateNewLobby
                                    ? t('games.lobby.onlineMenuTitle')
                                    : t('games.lobby.step1Title')
                        }}
                    </h1>
                    <p class="xl-lead">
                        {{
                            hasRemoteActiveLobby
                                ? isRemoteActiveMatch
                                    ? t('games.lobby.activeMatchDesc', {
                                          mode: activeLobby?.mode === 'online'
                                              ? t('games.lobby.online')
                                              : t('games.lobby.local'),
                                      })
                                    : t('games.lobby.activeLobbyDesc', {
                                          mode: activeLobby?.mode === 'online'
                                              ? t('games.lobby.online')
                                              : t('games.lobby.local'),
                                      })
                                : lobbyUuid && !isLobbyHost
                                  ? t('games.lobby.guestLead')
                                  : menuView === 'online' && canCreateNewLobby
                                    ? t('games.lobby.onlineMenuLead')
                                    : t('games.lobby.step1Lead')
                        }}
                    </p>
                </div>

                <div class="xl-stack">
                    <div v-if="hasRemoteActiveLobby" class="xl-active-lobby-panel">
                        <span class="xl-active-lobby-badge">
                            <Monitor :size="14" :stroke-width="2.4" />
                            {{
                                isRemoteActiveMatch
                                    ? t('games.lobby.activeMatchElsewhere')
                                    : t('games.lobby.activeLobbyElsewhere')
                            }}
                        </span>

                        <span
                            class="xl-icon-well"
                            :class="activeLobby?.mode === 'online' ? 'xl-icon-well--cyan' : ''"
                        >
                            <Globe v-if="activeLobby?.mode === 'online'" :size="22" />
                            <Target v-else :size="22" />
                        </span>

                        <p class="xl-active-lobby-kicker">
                            {{
                                activeLobby?.is_host
                                    ? t('games.lobby.activeLobbyHost')
                                    : t('games.lobby.activeLobbyGuest')
                            }}
                        </p>

                        <p class="xl-active-lobby-mode">
                            {{
                                activeLobby?.mode === 'online'
                                    ? t('games.lobby.online')
                                    : t('games.lobby.local')
                            }}
                        </p>

                        <p v-if="activeLobby?.lobby_code && !isRemoteActiveMatch" class="xl-active-lobby-code">
                            {{ t('games.lobby.activeLobbyCode', { code: activeLobby.lobby_code }) }}
                        </p>

                        <p v-if="activeLobby?.player_count" class="xl-active-lobby-players">
                            <Users :size="14" />
                            {{
                                isRemoteActiveMatch
                                    ? t('games.lobby.activeMatchPlayers', { count: activeLobby.player_count })
                                    : t('games.lobby.activeLobbyPlayers', { count: activeLobby.player_count })
                            }}
                        </p>

                        <p class="xl-active-lobby-hint">
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

                        <button type="button" class="xl-create-lobby" @click="goToActiveLobby">
                            {{ isRemoteActiveMatch ? t('games.lobby.returnToMatch') : t('games.lobby.returnToLobby') }}
                        </button>
                    </div>

                    <!-- Mode pick -->
                    <div v-if="canCreateNewLobby && menuView === 'pick'" class="xl-mode-grid xl-mode-grid--full">
                        <button
                            type="button"
                            class="xl-mode-card"
                            :disabled="store.creating"
                            @click="selectMode('online')"
                        >
                            <span class="xl-icon-well xl-icon-well--cyan">
                                <Globe :size="22" :stroke-width="2.2" />
                            </span>
                            <span class="xl-mode-label">{{ t('games.lobby.online') }}</span>
                            <span class="xl-mode-desc">{{ t('games.lobby.onlineDesc') }}</span>
                        </button>

                        <button
                            type="button"
                            class="xl-mode-card"
                            :class="{ 'xl-mode-card--on': store.creating && store.mode === 'local' }"
                            :disabled="store.creating"
                            @click="selectMode('local')"
                        >
                            <span class="xl-icon-well">
                                <Target :size="22" :stroke-width="2.2" />
                            </span>
                            <span class="xl-mode-label">{{ t('games.lobby.local') }}</span>
                            <span class="xl-mode-desc">{{ t('games.lobby.localDesc') }}</span>
                        </button>
                    </div>

                    <!-- Online menu: join or create -->
                    <div v-if="canCreateNewLobby && menuView === 'online'" class="xl-online-menu">
                        <button type="button" class="xl-back-link" @click="backToModePick">
                            <ArrowLeft :size="16" />
                            {{ t('games.lobby.backToModes') }}
                        </button>

                        <div class="xl-join-panel xl-join-panel--prominent">
                            <div class="xl-join-head">
                                <span class="xl-icon-well xl-icon-well--cyan"><Wifi :size="18" /></span>
                                <div>
                                    <p class="xl-join-title">{{ t('games.lobby.joinTitle') }}</p>
                                    <p class="xl-join-desc">{{ t('games.lobby.joinDesc') }}</p>
                                </div>
                            </div>
                            <div class="xl-join-row">
                                <input
                                    :value="store.joinCode"
                                    type="text"
                                    inputmode="numeric"
                                    maxlength="9"
                                    class="xl-input xl-input--code"
                                    :placeholder="t('games.lobby.joinPlaceholder')"
                                    autocomplete="off"
                                    spellcheck="false"
                                    @input="handleJoinCodeInput"
                                    @keyup.enter="store.joinLobby()"
                                />
                                <button type="button" class="xl-btn xl-btn--green" :disabled="store.loading" @click="store.joinLobby()">
                                    {{ t('games.lobby.joinAction') }}
                                </button>
                            </div>
                        </div>

                        <div class="xl-or-divider">
                            <span>{{ t('games.lobby.orDivider') }}</span>
                        </div>

                        <button
                            type="button"
                            class="xl-create-lobby"
                            :disabled="store.creating"
                            @click="createOnlineLobby"
                        >
                            <Globe :size="20" />
                            {{ t('games.lobby.createLobby') }}
                        </button>
                    </div>

                    <div v-if="isLobbyHost && activeMode === 'online' && lobbyCode" class="xl-code-panel">
                            <p class="xl-code-kicker">{{ t('games.lobby.shareCode') }}</p>
                            <div class="xl-code-row">
                                <p class="xl-code-value">{{ lobbyCode }}</p>
                                <button type="button" class="xl-code-copy" @click="handleCopyCode">
                                    <Check v-if="copiedCode" :size="16" />
                                    <Copy v-else :size="16" />
                                </button>
                            </div>
                            <p class="xl-code-hint">{{ t('games.lobby.waitingPlayers', { count: players.length }) }}</p>
                        </div>

                    <div v-if="lobbyUuid && isLobbyHost && activeMode === 'online'" class="xl-block xl-online-friends">
                        <p class="xl-block-title">{{ t('games.lobby.friends') }}</p>
                        <p class="xl-block-hint">{{ t('games.lobby.inviteFriendsHint') }}</p>
                        <div v-if="!friends.length" class="xl-empty">{{ t('games.lobby.noOnlineFriends') }}</div>
                        <ul v-else class="xl-friend-list">
                            <li v-for="friend in friends" :key="friend.id" class="xl-friend-item">
                                <span class="xl-dot" :class="friendActivityClass(friend.activity)" />
                                <div class="xl-friend-copy">
                                    <p class="xl-friend-name">
                                        {{ friend.name }}
                                        <span v-if="friend.is_premium" class="xl-pro">PRO</span>
                                    </p>
                                    <p class="xl-friend-email">{{ friend.email }}</p>
                                </div>
                                <button
                                    type="button"
                                    class="xl-btn xl-btn--sm"
                                    :class="{
                                        'xl-btn--done': isFriendInLobby(friend.id) || isFriendPendingInvite(friend.id),
                                        'xl-btn--busy': isFriendInviteDisabled(friend) && !isFriendPendingInvite(friend.id) && !isFriendInLobby(friend.id),
                                    }"
                                    :disabled="isFriendInviteDisabled(friend)"
                                    @click="inviteFriend(friend)"
                                >
                                    {{ friendInviteLabel(friend) }}
                                </button>
                            </li>
                        </ul>
                    </div>

                        <div v-if="lobbyUuid" class="xl-roster">
                            <div class="xl-roster-head">
                                <span class="xl-icon-well"><Users :size="18" /></span>
                                <div>
                                    <p class="xl-roster-title">{{ t('games.lobby.rosterTitle') }}</p>
                                    <p class="xl-roster-desc">{{ t('games.lobby.rosterDesc', { count: players.length }) }}</p>
                                </div>
                            </div>
                            <ul class="xl-roster-list">
                                <li v-for="player in players" :key="player.id" class="xl-roster-item">
                                    <span class="xl-avatar">{{ getInitials(player.display_name) }}</span>
                                    <div class="xl-roster-copy">
                                        <p class="xl-roster-name">
                                            {{ player.display_name }}
                                            <span
                                                v-if="player.user_id && player.is_online === false"
                                                class="xl-roster-away"
                                            >
                                                {{ t('games.lobby.offline') }}
                                            </span>
                                        </p>
                                        <p class="xl-roster-meta">
                                            {{
                                                player.user_id
                                                    ? t('games.lobby.registered')
                                                    : t('games.lobby.guestPlayer')
                                            }}
                                            · {{ playerStatusLabel(player.status) }}
                                        </p>
                                    </div>
                                    <button
                                        v-if="canTogglePlayer(player)"
                                        type="button"
                                        class="xl-btn xl-btn--sm"
                                        :class="player.status === 'ready' ? 'xl-btn--green' : ''"
                                        :disabled="store.loading"
                                        @click="togglePlayerReady(player)"
                                    >
                                        {{
                                            player.status === 'ready'
                                                ? t('games.lobby.markUnready')
                                                : t('games.lobby.markReady')
                                        }}
                                    </button>
                                    <span v-else class="xl-ready-pill" :class="`xl-ready-pill--${player.status}`">
                                        {{ playerStatusLabel(player.status) }}
                                    </span>
                                    <span class="xl-slot">#{{ player.slot }}</span>
                                </li>
                            </ul>
                            <p v-if="players.length < 2" class="xl-roster-warn">{{ t('games.lobby.needMore') }}</p>
                            <p v-else-if="activeMode !== 'local' && !canProceed" class="xl-roster-warn">{{ t('games.lobby.needAllReady') }}</p>
                        </div>

                    <div v-if="lobbyUuid && !isLobbyHost" class="xl-guest-wait">
                        <p class="xl-guest-wait-title">{{ t('games.lobby.guestWaitingTitle') }}</p>
                        <p class="xl-guest-wait-desc">{{ t('games.lobby.guestWaitingDesc') }}</p>
                        <button
                            v-if="myPlayer"
                            type="button"
                            class="xl-btn xl-btn--green"
                            :disabled="store.loading"
                            @click="togglePlayerReady(myPlayer)"
                        >
                            {{
                                myPlayer.status === 'ready'
                                    ? t('games.lobby.markUnready')
                                    : t('games.lobby.markReady')
                            }}
                        </button>
                    </div>

                    <div v-if="lobbyUuid && isLobbyHost && activeMode === 'local'" class="xl-local-panel">
                        <LocalLobbyPanel
                            :friends="friends"
                            :saved-guests="savedGuests"
                            :lobby-uuid="lobbyUuid"
                            :players="players"
                            @invite-friend="inviteFriend"
                        />
                    </div>
                </div>
            </section>

            <!-- STEP 2 (host only) -->
            <section v-else-if="isLobbyHost && store.step === 2" class="xl-body xl-rise game-page__body xl-body--step2">
                <div class="xl-intro">
                    <h1 class="xl-title">{{ t('games.lobby.step2Title') }}</h1>
                    <p class="xl-lead">{{ t('games.lobby.step2Lead') }}</p>
                </div>

                <div class="xl-config-grid">
                    <div class="xl-config-card">
                        <p class="xl-config-label">{{ t('games.lobby.format') }}</p>
                        <p class="xl-config-hint">{{ formatHint }}</p>
                        <div class="xl-toggle-row">
                            <button
                                type="button"
                                class="xl-segment"
                                :class="{ 'xl-segment--on': store.config.format === 'best_of' }"
                                @click="store.config.format = 'best_of'"
                            >
                                {{ t('games.lobby.formatBestOf') }}
                            </button>
                            <button
                                type="button"
                                class="xl-segment"
                                :class="{ 'xl-segment--on': store.config.format === 'first_to' }"
                                @click="store.config.format = 'first_to'"
                            >
                                {{ t('games.lobby.formatFirstTo') }}
                            </button>
                        </div>

                        <div class="xl-stepper-block">
                            <div class="xl-stepper-head">
                                <span class="xl-stepper-label">{{ t('games.lobby.legs') }}</span>
                                <span class="xl-stepper-hint">{{ t('games.lobby.legsHint') }}</span>
                            </div>
                            <div class="xl-stepper">
                                <button
                                    type="button"
                                    class="xl-stepper-btn"
                                    :disabled="store.config.legs_target <= 1"
                                    aria-label="-"
                                    @click="adjustLegs(-1)"
                                >
                                    −
                                </button>
                                <span class="xl-stepper-value">{{ store.config.legs_target }}</span>
                                <button type="button" class="xl-stepper-btn" aria-label="+" @click="adjustLegs(1)">+</button>
                            </div>
                        </div>

                        <div class="xl-stepper-block">
                            <div class="xl-stepper-head">
                                <span class="xl-stepper-label">{{ t('games.lobby.sets') }}</span>
                                <span class="xl-stepper-hint">{{ t('games.lobby.setsHint') }}</span>
                            </div>
                            <div class="xl-stepper">
                                <button
                                    type="button"
                                    class="xl-stepper-btn"
                                    :disabled="store.config.sets_target <= 1"
                                    aria-label="-"
                                    @click="adjustSets(-1)"
                                >
                                    −
                                </button>
                                <span class="xl-stepper-value">{{ store.config.sets_target }}</span>
                                <button type="button" class="xl-stepper-btn" aria-label="+" @click="adjustSets(1)">+</button>
                            </div>
                        </div>
                    </div>

                    <div class="xl-config-card">
                        <p class="xl-config-label">{{ t('games.lobby.gameType') }}</p>

                        <p class="xl-config-sublabel">{{ t('games.lobby.startingPoints') }}</p>
                        <p class="xl-config-hint">{{ startingPointsHint }}</p>
                        <div class="xl-toggle-row">
                            <button
                                type="button"
                                class="xl-segment"
                                :class="{ 'xl-segment--on': store.config.starting_points === 301 }"
                                @click="store.applyStartingPoints(301)"
                            >
                                301
                            </button>
                            <button
                                type="button"
                                class="xl-segment"
                                :class="{ 'xl-segment--on': store.config.starting_points === 501 }"
                                @click="store.applyStartingPoints(501)"
                            >
                                501
                            </button>
                        </div>
                        <span class="xl-preset-badge">{{ t('games.lobby.scoringPreset', { preset: scoringPreset }) }}</span>

                        <p class="xl-config-sublabel">{{ t('games.lobby.startRule') }}</p>
                        <p class="xl-config-hint">{{ startRuleHint }}</p>
                        <div class="xl-toggle-row">
                            <button
                                type="button"
                                class="xl-segment"
                                :class="{ 'xl-segment--on': store.config.in_rule === 'straight' }"
                                @click="setInRule('straight')"
                            >
                                SI
                            </button>
                            <button
                                type="button"
                                class="xl-segment"
                                :class="{ 'xl-segment--on': store.config.in_rule === 'double' }"
                                @click="setInRule('double')"
                            >
                                DI
                            </button>
                        </div>

                        <p class="xl-config-sublabel">{{ t('games.lobby.finishRule') }}</p>
                        <p class="xl-config-hint">{{ finishRuleHint }}</p>
                        <div class="xl-toggle-row">
                            <button
                                type="button"
                                class="xl-segment"
                                :class="{ 'xl-segment--on': store.config.out_rule === 'straight' }"
                                @click="setOutRule('straight')"
                            >
                                SO
                            </button>
                            <button
                                type="button"
                                class="xl-segment"
                                :class="{ 'xl-segment--on': store.config.out_rule === 'double' }"
                                @click="setOutRule('double')"
                            >
                                DO
                            </button>
                        </div>

                        <div class="xl-check-block">
                            <GameCheckbox v-model="store.config.track_checkout_rate">
                                {{ t('games.lobby.checkoutRate') }}
                            </GameCheckbox>
                            <p class="xl-config-hint">{{ t('games.lobby.checkoutRateHint') }}</p>
                        </div>

                        <div class="xl-check-block">
                            <GameCheckbox v-model="store.config.is_public">
                                {{ t('games.lobby.publicMatch') }}
                            </GameCheckbox>
                            <p class="xl-config-hint">{{ t('games.lobby.publicMatchHint') }}</p>
                        </div>
                    </div>
                </div>

                <LocalLobbyPanel
                    v-if="activeMode === 'local' && lobbyUuid"
                    compact
                    :friends="friends"
                    :saved-guests="savedGuests"
                    :lobby-uuid="lobbyUuid"
                    :players="players"
                    @invite-friend="inviteFriend"
                />
            </section>

            <!-- STEP 3 (host only) -->
            <section v-else-if="isLobbyHost && store.step === 3" class="xl-body xl-rise game-page__body xl-body--step3">
                <div class="xl-intro">
                    <h1 class="xl-title">{{ t('games.lobby.step3Title') }}</h1>
                    <p class="xl-lead">{{ t('games.lobby.step3Lead') }}</p>
                </div>

                <div v-if="isTwoPlayerSetup" class="xl-setup-card">
                    <p class="xl-setup-kicker">{{ t('games.lobby.firstThrowerTitle') }}</p>
                    <p class="xl-setup-hint">{{ t('games.lobby.firstThrowerHint') }}</p>
                    <div class="xl-setup-first-row">
                        <button
                            v-for="playerId in setupOrder"
                            :key="playerId"
                            type="button"
                            class="xl-setup-first-btn"
                            :class="{ 'xl-setup-first-btn--on': firstThrowerId === playerId }"
                            @click="firstThrowerId = playerId"
                        >
                            <span class="xl-avatar">{{ getInitials(playerById(playerId)?.display_name ?? '?') }}</span>
                            <span>{{ playerById(playerId)?.display_name }}</span>
                        </button>
                    </div>
                </div>

                <div v-else class="xl-setup-card">
                    <p class="xl-setup-kicker">{{ t('games.lobby.throwOrderTitle') }}</p>
                    <p class="xl-setup-hint">{{ t('games.lobby.throwOrderHint') }}</p>
                    <ul class="xl-setup-order">
                        <li v-for="(playerId, index) in setupOrder" :key="playerId" class="xl-setup-order-item">
                            <span class="xl-setup-slot">{{ index + 1 }}</span>
                            <span class="xl-setup-name">{{ playerById(playerId)?.display_name }}</span>
                            <div class="xl-setup-order-actions">
                                <button
                                    type="button"
                                    class="xl-setup-arrow"
                                    :disabled="index === 0"
                                    :aria-label="t('games.lobby.moveUp')"
                                    @click="moveSetupPlayer(index, -1)"
                                >
                                    <ChevronUp :size="16" />
                                </button>
                                <button
                                    type="button"
                                    class="xl-setup-arrow"
                                    :disabled="index === setupOrder.length - 1"
                                    :aria-label="t('games.lobby.moveDown')"
                                    @click="moveSetupPlayer(index, 1)"
                                >
                                    <ChevronDown :size="16" />
                                </button>
                            </div>
                        </li>
                    </ul>
                </div>

                <div class="xl-setup-card">
                    <p class="xl-setup-kicker">{{ t('games.lobby.customStartingPoints') }}</p>
                    <p class="xl-setup-hint">{{ t('games.lobby.customStartingPointsHint', { points: store.config.starting_points }) }}</p>
                    <ul class="xl-setup-scores">
                        <li v-for="playerId in setupOrder" :key="`score-${playerId}`" class="xl-setup-score-item">
                            <span class="xl-setup-name">{{ playerById(playerId)?.display_name }}</span>
                            <div class="xl-setup-score-controls">
                                <button
                                    type="button"
                                    class="xl-setup-score-toggle"
                                    :class="{ 'xl-setup-score-toggle--on': useCustomScore[playerId] }"
                                    @click="toggleCustomScore(playerId)"
                                >
                                    {{ useCustomScore[playerId] ? t('games.lobby.customScoreOn') : t('games.lobby.customScoreOff') }}
                                </button>
                                <input
                                    v-if="useCustomScore[playerId]"
                                    v-model="customScores[playerId]"
                                    type="number"
                                    min="2"
                                    max="999"
                                    class="xl-input xl-input--score"
                                    :placeholder="String(store.config.starting_points)"
                                />
                            </div>
                        </li>
                    </ul>
                </div>

                <LocalLobbyPanel
                    v-if="activeMode === 'local' && lobbyUuid"
                    compact
                    :friends="friends"
                    :saved-guests="savedGuests"
                    :lobby-uuid="lobbyUuid"
                    :players="players"
                    @invite-friend="inviteFriend"
                />
            </section>

            <footer v-if="isLobbyHost" class="xl-footer game-page__footer">
                <button v-if="store.step === 2 || store.step === 3" type="button" class="xl-btn xl-btn--ghost" @click="handleBack">
                    {{ t('games.lobby.back') }}
                </button>
                <button type="button" class="xl-start" :disabled="nextDisabled || store.loading" @click="handleNext">
                    <span v-if="store.loading" class="xl-start-spinner" />
                    {{ nextLabel }}
                </button>
            </footer>
        </div>

        <div v-if="showExitConfirm" class="xl-modal-bg" @click.self="showExitConfirm = false">
            <div class="xl-modal">
                <h3 class="xl-modal-title">{{ t('games.lobby.exitTitle') }}</h3>
                <p class="xl-modal-desc">{{ t('games.lobby.exitDesc') }}</p>
                <div class="xl-modal-actions">
                    <button type="button" class="xl-btn xl-btn--ghost" @click="showExitConfirm = false">{{ t('games.lobby.cancel') }}</button>
                    <button type="button" class="xl-btn xl-btn--danger" :disabled="store.loading" @click="confirmExit">{{ t('games.lobby.confirmExit') }}</button>
                </div>
            </div>
        </div>
    </GameLayout>
</template>

<style scoped>
.xl-steps {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--game-gap);
}

.xl-step {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #64748b;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
}

.xl-step--on {
    color: #39ff14;
}

.xl-step-num {
    width: 26px;
    height: 26px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    border: 1px solid #334155;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 13px;
}

.xl-step--on .xl-step-num {
    color: #0b0f19;
    background: #39ff14;
    border-color: #39ff14;
    box-shadow: 0 0 14px rgba(57, 255, 20, 0.4);
}

.xl-step-line {
    width: 48px;
    height: 2px;
    background: linear-gradient(90deg, rgba(57, 255, 20, 0.45), rgba(34, 211, 238, 0.3));
}

.xl-toast {
    flex: 0 0 auto;
    margin: 0;
    padding: 8px 12px;
    border-radius: 10px;
    font-size: var(--game-body);
    font-weight: 600;
    text-align: center;
}

.xl-toast--error {
    border: 1px solid rgba(251, 44, 95, 0.35);
    background: rgba(251, 44, 95, 0.1);
    color: #fb2c5f;
}

.xl-toast--info {
    border: 1px solid rgba(34, 211, 238, 0.35);
    background: rgba(34, 211, 238, 0.08);
    color: #22d3ee;
}

.xl-body {
    min-height: 0;
    overflow: hidden;
}

.xl-intro {
    flex: 0 0 auto;
    margin-bottom: var(--game-gap);
}

.xl-title {
    margin: 0 0 2px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: var(--game-title);
    font-weight: 900;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

.xl-lead {
    margin: 0;
    color: #94a3b8;
    font-size: var(--game-lead);
    line-height: 1.4;
}

.xl-body--step1 {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.xl-body--step2 {
    display: flex;
    flex-direction: column;
    gap: var(--game-gap-sm);
}

.xl-body--step3 {
    display: flex;
    flex-direction: column;
    gap: var(--game-gap-sm);
}

.xl-body--step2 .xl-config-grid {
    flex: 1 1 auto;
    min-height: 0;
    align-content: start;
}

.xl-stack {
    display: flex;
    flex-direction: column;
    gap: var(--game-gap);
    width: 100%;
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
    padding-top: 4px;
    box-sizing: border-box;
}

.xl-active-lobby-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--game-gap-sm);
    padding: var(--game-panel-pad);
    border-radius: var(--game-radius);
    border: 1px solid rgba(251, 191, 36, 0.35);
    background:
        radial-gradient(ellipse at top, rgba(251, 191, 36, 0.08), transparent 55%),
        linear-gradient(165deg, rgba(19, 26, 38, 0.92), rgba(13, 18, 32, 0.96));
    box-shadow: 0 0 32px rgba(251, 191, 36, 0.08);
    text-align: center;
}

.xl-active-lobby-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 999px;
    border: 1px solid rgba(251, 191, 36, 0.45);
    background: rgba(251, 191, 36, 0.1);
    color: #fbbf24;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
}

.xl-active-lobby-kicker {
    margin: 0;
    color: #64748b;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.xl-active-lobby-mode {
    margin: 0;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 28px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #39ff14;
}

.xl-active-lobby-code {
    margin: 0;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 22px;
    font-weight: 800;
    letter-spacing: 0.18em;
    color: #22d3ee;
    text-transform: uppercase;
}

.xl-active-lobby-players {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin: 0;
    color: #94a3b8;
    font-size: 13px;
    font-weight: 600;
}

.xl-active-lobby-hint {
    margin: 0;
    max-width: 36ch;
    color: #94a3b8;
    font-size: 13px;
    line-height: 1.55;
}

.xl-mode-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--game-gap);
    padding-top: 2px;
}

.xl-mode-grid--full {
    width: 100%;
}

.xl-mode-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 20px 18px;
    border-radius: 16px;
    border: 1px solid #1f2937;
    background: linear-gradient(165deg, rgba(19, 26, 38, 0.92), rgba(13, 18, 32, 0.96));
    color: #f4f4f5;
    text-align: left;
    cursor: pointer;
    transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.xl-mode-card:hover:not(:disabled) {
    transform: translateY(-2px);
    border-color: rgba(57, 255, 20, 0.35);
    box-shadow:
        0 12px 32px rgba(0, 0, 0, 0.28),
        inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.xl-mode-card--on {
    border-color: rgba(57, 255, 20, 0.5);
    box-shadow: 0 0 28px rgba(57, 255, 20, 0.16);
}

.xl-mode-card:disabled {
    opacity: 0.7;
    cursor: wait;
}

.xl-icon-well {
    display: inline-flex;
    width: 42px;
    height: 42px;
    align-items: center;
    justify-content: center;
    border-radius: 11px;
    border: 1px solid rgba(57, 255, 20, 0.24);
    background: rgba(57, 255, 20, 0.08);
    color: #39ff14;
}

.xl-icon-well--cyan {
    border-color: rgba(34, 211, 238, 0.28);
    background: rgba(34, 211, 238, 0.08);
    color: #22d3ee;
}

.xl-mode-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 22px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.xl-mode-desc {
    color: #64748b;
    font-size: 13px;
    line-height: 1.45;
}

.xl-join-panel,
.xl-code-panel,
.xl-roster,
.xl-side-panel,
.xl-config-card {
    border-radius: 16px;
    border: 1px solid #1f2937;
    background: linear-gradient(165deg, rgba(19, 26, 38, 0.88), rgba(13, 18, 32, 0.94));
}

.xl-join-panel {
    padding: 16px;
}

.xl-join-panel--prominent {
    padding: 22px;
    border-color: rgba(34, 211, 238, 0.22);
    box-shadow: 0 0 32px rgba(34, 211, 238, 0.06);
}

.xl-online-menu {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
}

.xl-back-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    align-self: flex-start;
    padding: 6px 0;
    border: none;
    background: transparent;
    color: #94a3b8;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: color 0.15s ease;
}

.xl-back-link:hover {
    color: #39ff14;
}

.xl-or-divider {
    display: flex;
    align-items: center;
    gap: 14px;
    color: #64748b;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.xl-or-divider::before,
.xl-or-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
}

.xl-create-lobby {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 16px 20px;
    border-radius: 14px;
    border: 1px solid rgba(57, 255, 20, 0.35);
    background: linear-gradient(135deg, rgba(57, 255, 20, 0.12), rgba(34, 211, 238, 0.08));
    color: #39ff14;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 20px;
    font-weight: 900;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.xl-create-lobby:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow:
        0 0 28px rgba(57, 255, 20, 0.18),
        inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.xl-create-lobby:disabled {
    opacity: 0.6;
    cursor: wait;
}

.xl-join-head {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    margin-bottom: 12px;
}

.xl-join-title,
.xl-roster-title,
.xl-block-title {
    margin: 0 0 2px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 17px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.xl-block-hint {
    margin: 0 0 10px;
    color: #64748b;
    font-size: 12px;
    line-height: 1.45;
}

.xl-online-friends {
    margin-top: 12px;
}

.xl-join-desc,
.xl-roster-desc {
    margin: 0;
    color: #64748b;
    font-size: 13px;
}

.xl-join-row,
.xl-guest-row {
    display: flex;
    gap: 8px;
}

.xl-input {
    flex: 1;
    min-width: 0;
    padding: 11px 13px;
    border-radius: 10px;
    border: 1px solid #1f2937;
    background: #131a26;
    color: #f4f4f5;
    font-size: 14px;
    outline: none;
}

.xl-input:focus {
    border-color: rgba(57, 255, 20, 0.45);
}

.xl-input--code {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 20px;
    font-weight: 800;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    text-align: center;
}

.xl-code-panel {
    padding: 18px;
    border-color: rgba(34, 211, 238, 0.25);
    text-align: center;
}

.xl-code-kicker {
    margin: 0 0 6px;
    color: #64748b;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
}

.xl-code-row {
    display: inline-flex;
    align-items: center;
    gap: 10px;
}

.xl-code-value {
    margin: 0;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 36px;
    font-weight: 900;
    letter-spacing: 0.22em;
    color: #39ff14;
    text-shadow: 0 0 24px rgba(57, 255, 20, 0.25);
}

.xl-code-copy {
    display: inline-flex;
    width: 36px;
    height: 36px;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    border: 1px solid #334155;
    background: rgba(255, 255, 255, 0.04);
    color: #94a3b8;
    cursor: pointer;
}

.xl-code-hint {
    margin: 10px 0 0;
    color: #94a3b8;
    font-size: 13px;
}

.xl-roster {
    padding: 16px;
}

.xl-roster-head {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    margin-bottom: 12px;
}

.xl-roster-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.xl-roster-item,
.xl-friend-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    background: rgba(0, 0, 0, 0.15);
}

.xl-avatar {
    display: inline-flex;
    width: 38px;
    height: 38px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800;
    font-size: 13px;
    color: #0b0f19;
    background: linear-gradient(135deg, #39ff14, #22d3ee);
}

.xl-roster-copy,
.xl-friend-copy {
    flex: 1;
    min-width: 0;
}

.xl-roster-name,
.xl-friend-name {
    margin: 0;
    font-weight: 700;
    font-size: 14px;
}

.xl-roster-meta,
.xl-friend-email {
    margin: 2px 0 0;
    color: #64748b;
    font-size: 12px;
}

.xl-slot {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 14px;
    font-weight: 800;
    color: #39ff14;
}

.xl-roster-warn {
    margin: 10px 0 0;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px dashed rgba(251, 191, 36, 0.35);
    background: rgba(251, 191, 36, 0.06);
    color: #fbbf24;
    font-size: 13px;
    text-align: center;
}

.xl-roster-away {
    margin-left: 8px;
    color: #64748b;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
}

.xl-ready-pill {
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #94a3b8;
}

.xl-ready-pill--ready {
    border-color: rgba(57, 255, 20, 0.35);
    color: #39ff14;
}

.xl-ready-pill--playing {
    border-color: rgba(34, 211, 238, 0.35);
    color: #22d3ee;
}

.xl-guest-wait {
    padding: 20px;
    border-radius: 16px;
    border: 1px dashed rgba(34, 211, 238, 0.28);
    background: rgba(34, 211, 238, 0.05);
    text-align: center;
}

.xl-guest-wait-title {
    margin: 0 0 6px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 20px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #22d3ee;
}

.xl-guest-wait-desc {
    margin: 0;
    color: #94a3b8;
    font-size: 14px;
    line-height: 1.45;
}

.xl-guest-wait .xl-btn {
    margin-top: 12px;
}

.xl-side-panel,
.xl-local-panel {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    border-radius: 16px;
    border: 1px solid #1f2937;
    background: linear-gradient(165deg, rgba(19, 26, 38, 0.88), rgba(13, 18, 32, 0.94));
}

.xl-local-panel {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    align-items: start;
}

.xl-local-panel > .xl-toggle-row {
    grid-column: 1 / -1;
}

.xl-block {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.xl-toggle-row {
    display: inline-flex;
    gap: 4px;
    padding: 4px;
    border-radius: 11px;
    border: 1px solid #1f2937;
    background: rgba(0, 0, 0, 0.2);
}

.xl-segment {
    padding: 8px 12px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: #94a3b8;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
}

.xl-segment--on {
    color: #0b0f19;
    background: #39ff14;
}

.xl-friend-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--game-gap-sm);
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
}

.xl-dot {
    width: 9px;
    height: 9px;
    border-radius: 999px;
    flex-shrink: 0;
}

.xl-dot--green {
    background: #39ff14;
    box-shadow: 0 0 8px rgba(57, 255, 20, 0.5);
}

.xl-dot--amber {
    background: #fbbf24;
}

.xl-dot--red {
    background: #fb2c5f;
}

.xl-pro {
    margin-left: 5px;
    padding: 1px 5px;
    border-radius: 999px;
    background: #fbbf24;
    color: #0b0f19;
    font-size: 9px;
    font-weight: 900;
}

.xl-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 9px 14px;
    border-radius: 9px;
    border: 1px solid #334155;
    background: rgba(255, 255, 255, 0.03);
    color: #e2e8f0;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease, color 0.15s ease;
}

.xl-btn:hover:not(:disabled) {
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.xl-btn--sm {
    padding: 7px 10px;
    font-size: 11px;
}

.xl-btn--green {
    border-color: rgba(57, 255, 20, 0.35);
    background: rgba(57, 255, 20, 0.1);
    color: #39ff14;
}

.xl-btn--ghost {
    color: #94a3b8;
}

.xl-btn--danger {
    border-color: rgba(251, 44, 95, 0.35);
    color: #fb2c5f;
}

.xl-btn--done {
    border-color: rgba(57, 255, 20, 0.25);
    color: #39ff14;
    opacity: 0.75;
}

.xl-btn--busy {
    border-color: rgba(34, 211, 238, 0.25);
    color: #64748b;
    opacity: 0.7;
}

.xl-dot--cyan {
    background: #22d3ee;
    box-shadow: 0 0 8px rgba(34, 211, 238, 0.45);
}

.xl-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

.xl-config-hint {
    margin: 0;
    color: #64748b;
    font-size: 12px;
    line-height: 1.5;
}

.xl-config-sublabel {
    margin: 6px 0 0;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #94a3b8;
}

.xl-preset-badge {
    display: inline-flex;
    align-self: flex-start;
    padding: 5px 12px;
    border-radius: 999px;
    border: 1px solid rgba(34, 211, 238, 0.35);
    background: rgba(34, 211, 238, 0.08);
    color: #22d3ee;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 0.12em;
}

.xl-stepper-block {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(0, 0, 0, 0.18);
}

.xl-stepper-head {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.xl-stepper-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 20px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #e2e8f0;
}

.xl-stepper-hint {
    color: #64748b;
    font-size: 12px;
    line-height: 1.45;
}

.xl-stepper {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    align-self: center;
}

.xl-stepper-btn {
    display: inline-flex;
    width: var(--game-stepper-btn);
    height: var(--game-stepper-btn);
    align-items: center;
    justify-content: center;
    border: 1px solid #334155;
    background: rgba(255, 255, 255, 0.04);
    color: #39ff14;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 26px;
    font-weight: 800;
    line-height: 1;
    cursor: pointer;
    transition: border-color 0.15s ease, background 0.15s ease, transform 0.15s ease;
}

.xl-stepper-btn:first-child {
    border-radius: 12px 0 0 12px;
}

.xl-stepper-btn:last-child {
    border-radius: 0 12px 12px 0;
}

.xl-stepper-btn:hover:not(:disabled) {
    border-color: rgba(57, 255, 20, 0.4);
    background: rgba(57, 255, 20, 0.08);
}

.xl-stepper-btn:active:not(:disabled) {
    transform: scale(0.96);
}

.xl-stepper-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
}

.xl-stepper-value {
    min-width: calc(var(--game-stepper-btn) + 16px);
    height: var(--game-stepper-btn);
    display: flex;
    align-items: center;
    justify-content: center;
    border-top: 1px solid #334155;
    border-bottom: 1px solid #334155;
    background: #131a26;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: var(--game-stepper-value);
    font-weight: 900;
    color: #39ff14;
    text-shadow: 0 0 16px rgba(57, 255, 20, 0.2);
}

.xl-setup-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(0, 0, 0, 0.18);
}

.xl-setup-kicker {
    margin: 0;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 18px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #e2e8f0;
}

.xl-setup-hint {
    margin: 0;
    color: #64748b;
    font-size: 12px;
    line-height: 1.45;
}

.xl-setup-first-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
}

.xl-setup-first-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 14px 10px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
    color: #e2e8f0;
    font-weight: 700;
    cursor: pointer;
    transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
}

.xl-setup-first-btn--on {
    border-color: rgba(57, 255, 20, 0.45);
    background: rgba(57, 255, 20, 0.08);
    box-shadow: 0 0 18px rgba(57, 255, 20, 0.1);
    color: #39ff14;
}

.xl-setup-order,
.xl-setup-scores {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.xl-setup-order-item,
.xl-setup-score-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    background: rgba(0, 0, 0, 0.12);
}

.xl-setup-slot {
    width: 24px;
    height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    border: 1px solid rgba(34, 211, 238, 0.35);
    background: rgba(34, 211, 238, 0.08);
    color: #22d3ee;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 13px;
    font-weight: 900;
    flex-shrink: 0;
}

.xl-setup-name {
    flex: 1 1 auto;
    min-width: 0;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.xl-setup-order-actions {
    display: inline-flex;
    gap: 4px;
    flex-shrink: 0;
}

.xl-setup-arrow {
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
    color: #94a3b8;
    cursor: pointer;
}

.xl-setup-arrow:hover:not(:disabled) {
    border-color: rgba(57, 255, 20, 0.35);
    color: #39ff14;
}

.xl-setup-arrow:disabled {
    opacity: 0.35;
    cursor: not-allowed;
}

.xl-setup-score-controls {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.xl-setup-score-toggle {
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
    color: #94a3b8;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: pointer;
    white-space: nowrap;
}

.xl-setup-score-toggle--on {
    border-color: rgba(57, 255, 20, 0.4);
    background: rgba(57, 255, 20, 0.08);
    color: #39ff14;
}

.xl-input--score {
    width: 72px;
    padding: 6px 8px;
    text-align: center;
}

.xl-check-block {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-top: 2px;
}

.xl-check-block .xl-config-hint {
    padding-left: 30px;
}

.xl-config-card :deep(.gc-row) {
    width: 100%;
}

.xl-block :deep(.gc-row) {
    margin-top: 4px;
}

.xl-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.xl-chip {
    padding: 5px 10px;
    border-radius: 999px;
    border: 1px solid #334155;
    background: transparent;
    color: #cbd5e1;
    font-size: 12px;
    cursor: pointer;
}

.xl-empty {
    padding: 16px;
    border-radius: 12px;
    border: 1px dashed #334155;
    color: #64748b;
    font-size: 13px;
    text-align: center;
}

.xl-config-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--game-gap);
    min-height: 0;
}

.xl-config-card {
    padding: var(--game-panel-pad);
    display: flex;
    flex-direction: column;
    gap: var(--game-panel-gap);
    min-height: 0;
}

.xl-config-label {
    margin: 0;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: var(--game-label);
    font-weight: 800;
    text-transform: uppercase;
}

.xl-footer {
    flex: 0 0 auto;
    display: flex;
    align-items: stretch;
    justify-content: center;
    gap: var(--game-gap-sm);
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    padding-top: calc(var(--game-gap-sm) + 4px);
}

.xl-footer .xl-btn--ghost {
    flex: 0 0 auto;
    white-space: nowrap;
}

.xl-start {
    position: relative;
    flex: 1 1 0;
    min-width: 0;
    max-width: 100%;
    padding: 12px 16px;
    border: none;
    border-radius: 14px;
    background: linear-gradient(135deg, #39ff14, #22d3ee);
    color: #0b0f19;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: clamp(16px, 4.2vw, 21px);
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    box-shadow: 0 0 32px rgba(57, 255, 20, 0.3);
    transition: transform 0.2s ease, filter 0.2s ease;
}

.xl-start:hover:not(:disabled) {
    filter: brightness(1.06);
    box-shadow:
        0 0 36px rgba(57, 255, 20, 0.38),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.xl-start:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.xl-start-spinner {
    position: absolute;
    right: 18px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid rgba(11, 15, 25, 0.2);
    border-top-color: #0b0f19;
    animation: xl-spin 0.7s linear infinite;
}

.xl-modal-bg {
    position: fixed;
    inset: 0;
    z-index: 60;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(6px);
}

.xl-modal {
    width: min(400px, 92vw);
    padding: 22px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: linear-gradient(165deg, rgba(19, 26, 38, 0.96), rgba(13, 18, 32, 0.98));
}

.xl-modal-title {
    margin: 0 0 8px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 22px;
    font-weight: 900;
    text-transform: uppercase;
}

.xl-modal-desc {
    margin: 0 0 16px;
    color: #94a3b8;
    font-size: 14px;
}

.xl-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}

.xl-rise {
    animation: xl-rise 0.5s ease both;
}

@keyframes xl-rise {
    from {
        opacity: 0;
        transform: translateY(8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes xl-spin {
    to {
        transform: rotate(360deg);
    }
}

.xl--portrait .xl-mode-grid,
.xl--portrait .xl-config-grid,
.xl--portrait .xl-local-panel,
.xl--square .xl-mode-grid,
.xl--square .xl-config-grid,
.xl--square .xl-local-panel {
    grid-template-columns: 1fr;
}

.xl--portrait .xl-footer,
.xl--square .xl-footer {
    flex-direction: column;
}

.xl--portrait .xl-footer .xl-btn--ghost,
.xl--square .xl-footer .xl-btn--ghost,
.xl--portrait .xl-footer .xl-start,
.xl--square .xl-footer .xl-start {
    width: 100%;
    flex: 1 1 auto;
}

.xl--portrait .xl-mode-card,
.xl--square .xl-mode-card {
    padding: 14px;
}

.xl--portrait .xl-code-value,
.xl--square .xl-code-value {
    font-size: clamp(24px, 7vw, 32px);
}

@media (prefers-reduced-motion: reduce) {
    .xl-rise,
    .xl-mode-card,
    .xl-start,
    .xl-start-spinner {
        animation: none;
        transition: none;
    }
}
</style>
