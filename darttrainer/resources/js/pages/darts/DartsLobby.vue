<script setup lang="ts">
import LobbyActiveElsewherePanel from '@/components/darts/lobby/LobbyActiveElsewherePanel.vue';
import LobbyCodeShare from '@/components/darts/lobby/LobbyCodeShare.vue';
import LobbyConfigStep from '@/components/darts/lobby/LobbyConfigStep.vue';
import LobbyExitConfirmModal from '@/components/darts/lobby/LobbyExitConfirmModal.vue';
import LobbyFooter from '@/components/darts/lobby/LobbyFooter.vue';
import LobbyFriendInvites from '@/components/darts/lobby/LobbyFriendInvites.vue';
import LobbyGuestWaitPanel from '@/components/darts/lobby/LobbyGuestWaitPanel.vue';
import LobbyModePicker from '@/components/darts/lobby/LobbyModePicker.vue';
import LobbyOnlineJoinPanel from '@/components/darts/lobby/LobbyOnlineJoinPanel.vue';
import LobbyRoster from '@/components/darts/lobby/LobbyRoster.vue';
import LobbySetupStep from '@/components/darts/lobby/LobbySetupStep.vue';
import LobbyStepIndicator from '@/components/darts/lobby/LobbyStepIndicator.vue';
import LocalLobbyPanel from '@/components/darts/LocalLobbyPanel.vue';
import { useActiveLobby } from '@/composables/useActiveLobby';
import { useGameResponsive } from '@/composables/useGameResponsive';
import { GameViewportRemeasureKey } from '@/composables/useGameViewportFit';
import { useLocale } from '@/composables/useLocale';
import GameLayout from '@/layouts/GameLayout.vue';
import { sanitizeLobbyCodeInput } from '@/lib/lobbyCode';
import { useDartsLobbyStore, type FriendEntry, type LobbyPlayer, type LobbySnapshot } from '@/stores/dartsLobby';
import { Head, router, usePage } from '@inertiajs/vue3';
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
const remeasureViewport = inject<(() => void) | undefined>(GameViewportRemeasureKey, undefined);
const store = useDartsLobbyStore();
const {
    players: storePlayers,
    lobbyUuid: storeLobbyUuid,
    lobbyCode: storeLobbyCode,
    canProceed: storeCanProceed,
    mode: storeMode,
    pendingInviteeIds: storePendingInviteeIds,
} = storeToRefs(store);
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
const lobbyCode = computed(() => (isLiveLobby.value ? storeLobbyCode.value : (props.lobby?.lobby_code ?? storeLobbyCode.value)));
const players = computed(() => (isLiveLobby.value ? storePlayers.value : (props.lobby?.players ?? storePlayers.value)));
const canProceed = computed(() => (isLiveLobby.value ? storeCanProceed.value : (props.lobby?.can_proceed ?? storeCanProceed.value)));
const activeMode = computed(() => (isLiveLobby.value ? storeMode.value : (props.lobby?.config.mode ?? storeMode.value)));
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

        // canProceed nāk no servera (MatchLobbyService::canProceed) un jau
        // pareizi ietver gan spēlētāju skaita/pāra pārbaudi (solo >=2, team
        // >=4 un pāra skaits), gan "ready" prasību online režīmā (local
        // režīmā tā netiek piemērota). Iepriekš šeit bija atsevišķa,
        // vājāka pārbaude local režīmam (players.length < 2), kas ignorēja
        // team pāra/>=4 prasību — poga izskatījās aktīva pie 2-3 local
        // team spēlētājiem, bet handleNext() klusi neko nedarīja, jo tas
        // pareizi pārbauda canProceed. Tagad abas vietas izmanto vienu un
        // to pašu avotu.
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

// Step 1's heading text depends on which of several mutually-exclusive
// entry states we're in (active lobby elsewhere / guest / online sub-menu /
// default). Kept as computeds instead of an inline template ternary so the
// template itself stays readable.
const step1Title = computed(() => {
    if (hasRemoteActiveLobby.value) {
        return isRemoteActiveMatch.value ? t('games.lobby.activeMatchTitle') : t('games.lobby.activeLobbyTitle');
    }

    if (lobbyUuid.value && !isLobbyHost.value) {
        return t('games.lobby.guestTitle');
    }

    if (menuView.value === 'online' && canCreateNewLobby.value) {
        return t('games.lobby.onlineMenuTitle');
    }

    return t('games.lobby.step1Title');
});

const step1Lead = computed(() => {
    if (hasRemoteActiveLobby.value) {
        const mode = activeLobby.value?.mode === 'online' ? t('games.lobby.online') : t('games.lobby.local');

        return isRemoteActiveMatch.value ? t('games.lobby.activeMatchDesc', { mode }) : t('games.lobby.activeLobbyDesc', { mode });
    }

    if (lobbyUuid.value && !isLobbyHost.value) {
        return t('games.lobby.guestLead');
    }

    if (menuView.value === 'online' && canCreateNewLobby.value) {
        return t('games.lobby.onlineMenuLead');
    }

    return t('games.lobby.step1Lead');
});

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
            const currentOrder = [...players.value].sort((left, right) => left.slot - right.slot).map((player) => player.id);

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

function togglePlayerReady(player: LobbyPlayer) {
    // Kam drīkst rādīt "ready" pogu, jau izlemj LobbyRoster/LobbyGuestWaitPanel
    // (host var pārslēgt jebkuru guest spēlētāju, katrs online spēlētājs —
    // tikai pats savu). Serveris (MatchLobbyService::updatePlayerReady)
    // joprojām autorizāciju pārbauda neatkarīgi, tāpēc šeit pietiek ar
    // lobbyUuid pārbaudi.
    if (!lobbyUuid.value) {
        return;
    }

    void store.toggleReady(lobbyUuid.value, player.id, player.status !== 'ready');
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

async function inviteFriend(friend: FriendEntry) {
    const isPending = storePendingInviteeIds.value.includes(friend.id);
    const isInLobby = players.value.some((player) => player.user_id === friend.id);

    if (!lobbyUuid.value || isPending || isInLobby) {
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
            <LobbyStepIndicator :step="store.step" :is-host="isLobbyHost" :has-lobby="!!lobbyUuid" />

            <p v-if="infoMessage" class="xl-toast xl-toast--info">{{ infoMessage }}</p>
            <p v-if="errorMessage" class="xl-toast xl-toast--error">{{ errorMessage }}</p>

            <!-- STEP 1: players / mode pick / roster -->
            <section v-if="store.step === 1 || !isLobbyHost" class="xl-body xl-rise xl-body--step1 game-page__body">
                <div class="xl-intro">
                    <h1 class="xl-title">{{ step1Title }}</h1>
                    <p class="xl-lead">{{ step1Lead }}</p>
                </div>

                <div class="xl-stack">
                    <LobbyActiveElsewherePanel
                        v-if="hasRemoteActiveLobby"
                        :active-lobby="activeLobby"
                        :is-remote-active-match="isRemoteActiveMatch"
                        @return="goToActiveLobby"
                    />

                    <LobbyModePicker
                        v-if="canCreateNewLobby && menuView === 'pick'"
                        :creating="store.creating"
                        :mode="store.mode"
                        @select="selectMode"
                    />

                    <LobbyOnlineJoinPanel
                        v-if="canCreateNewLobby && menuView === 'online'"
                        :join-code="store.joinCode"
                        :loading="store.loading"
                        :creating="store.creating"
                        @back="backToModePick"
                        @input="handleJoinCodeInput"
                        @join="store.joinLobby()"
                        @create="createOnlineLobby"
                    />

                    <LobbyCodeShare
                        v-if="isLobbyHost && activeMode === 'online' && lobbyCode"
                        :code="lobbyCode"
                        :copied="copiedCode"
                        :player-count="players.length"
                        @copy="handleCopyCode"
                    />

                    <LobbyFriendInvites
                        v-if="lobbyUuid && isLobbyHost && activeMode === 'online'"
                        :friends="friends"
                        :players="players"
                        :pending-invitee-ids="storePendingInviteeIds"
                        :loading="store.loading"
                        @invite="inviteFriend"
                    />

                    <LobbyRoster
                        v-if="lobbyUuid"
                        :players="players"
                        :is-lobby-host="isLobbyHost"
                        :active-mode="activeMode"
                        :can-proceed="canProceed"
                        :loading="store.loading"
                        :current-user-id="user.id"
                        @toggle-ready="togglePlayerReady"
                    />

                    <LobbyGuestWaitPanel
                        v-if="lobbyUuid && !isLobbyHost"
                        :player="myPlayer"
                        :loading="store.loading"
                        @toggle-ready="myPlayer && togglePlayerReady(myPlayer)"
                    />

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

            <!-- STEP 2 (host only): config -->
            <section v-else-if="isLobbyHost && store.step === 2" class="xl-body xl-rise game-page__body xl-body--step2">
                <div class="xl-intro">
                    <h1 class="xl-title">{{ t('games.lobby.step2Title') }}</h1>
                    <p class="xl-lead">{{ t('games.lobby.step2Lead') }}</p>
                </div>

                <LobbyConfigStep />

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

            <!-- STEP 3 (host only): throw order / starting points -->
            <section v-else-if="isLobbyHost && store.step === 3" class="xl-body xl-rise game-page__body xl-body--step3">
                <div class="xl-intro">
                    <h1 class="xl-title">{{ t('games.lobby.step3Title') }}</h1>
                    <p class="xl-lead">{{ t('games.lobby.step3Lead') }}</p>
                </div>

                <LobbySetupStep
                    v-model:setup-order="setupOrder"
                    v-model:first-thrower-id="firstThrowerId"
                    v-model:custom-scores="customScores"
                    v-model:use-custom-score="useCustomScore"
                    :players="players"
                />

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

            <LobbyFooter
                v-if="isLobbyHost"
                :show-back="store.step === 2 || store.step === 3"
                :next-disabled="nextDisabled"
                :loading="store.loading"
                :next-label="nextLabel"
                @back="handleBack"
                @next="handleNext"
            />
        </div>

        <LobbyExitConfirmModal :show="showExitConfirm" :loading="store.loading" @cancel="showExitConfirm = false" @confirm="confirmExit" />
    </GameLayout>
</template>

<style scoped src="./DartsLobby.css"></style>
