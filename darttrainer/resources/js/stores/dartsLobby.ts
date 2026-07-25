import api from '@/lib/axios';
import { getEcho } from '@/lib/echo';
import { isValidLobbyCode, normalizeLobbyCode } from '@/lib/lobbyCode';
import { applyStartingPoints as applyStartingPointRules, copyLobbyCode as copyLobbyCodeToClipboard } from '@/stores/dartsLobbyActions';
import axios from 'axios';
import { router } from '@inertiajs/vue3';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export type LobbyMode = 'online' | 'local' | null;
export type MatchType = 'solo' | 'team';
export type LobbyStep = 1 | 2 | 3;

export interface LobbyPlayer {
    id: number;
    user_id: number | null;
    guest_id: number | null;
    display_name: string;
    starting_points?: number | null;
    slot: number;
    team_id: number | null;
    status: 'waiting' | 'ready' | 'playing';
    is_online: boolean | null;
}

export interface LobbyConfig {
    mode: LobbyMode;
    format: 'best_of' | 'first_to';
    legs_target: number;
    sets_target: number;
    starting_points: 301 | 501;
    in_rule: 'straight' | 'double';
    out_rule: 'straight' | 'double';
    track_checkout_rate: boolean;
    is_public: boolean;
}

export interface FriendEntry {
    id: number;
    name: string;
    email: string;
    is_premium: boolean;
    activity: 'online' | 'away' | 'in_lobby' | 'in_game';
}

export interface LobbySnapshot {
    uuid: string;
    host_user_id: number;
    lobby_code: string | null;
    status: string;
    match_type: MatchType;
    can_proceed: boolean;
    pending_invitee_ids?: number[];
    players: LobbyPlayer[];
    config: LobbyConfig;
}

export const useDartsLobbyStore = defineStore('dartsLobby', () => {
    const step = ref<LobbyStep>(1);
    const mode = ref<LobbyMode>(null);
    const matchType = ref<MatchType>('solo');
    const lobbyUuid = ref<string | null>(null);
    const lobbyCode = ref<string | null>(null);
    const players = ref<LobbyPlayer[]>([]);
    const canProceed = ref(false);
    const loading = ref(false);
    const creating = ref(false);
    const error = ref<string | null>(null);
    const guestName = ref('');
    const guestEmail = ref('');
    const saveGuest = ref(false);
    const joinCode = ref('');
    const pendingInviteeIds = ref<number[]>([]);

    const config = ref<LobbyConfig>({
        mode: null,
        format: 'first_to',
        legs_target: 1,
        sets_target: 1,
        starting_points: 501,
        in_rule: 'straight',
        out_rule: 'double',
        track_checkout_rate: false,
        is_public: false,
    });

    const playerCount = computed(() => players.value.length);
    const hasLobby = computed(() => lobbyUuid.value !== null);

    function resolveLobbyError(errors: Record<string, string | string[]>, fallback: string): string {
        const player = errors.player;
        const invite = errors.invite;

        if (invite) {
            const message = Array.isArray(invite) ? invite[0] : invite;
            return message ?? fallback;
        }

        if (! player) {
            return fallback;
        }

        const message = Array.isArray(player) ? player[0] : player;

        if (message === 'player-unavailable') {
            return 'player-unavailable';
        }

        if (message === 'lobby-invite-required') {
            return 'lobby-invite-required';
        }

        return fallback;
    }

    function hydrateFromProps(initial?: {
        lobby?: {
            uuid: string;
            lobby_code: string | null;
            can_proceed: boolean;
            pending_invitee_ids?: number[];
            players: LobbyPlayer[];
            config: LobbyConfig;
            match_type: MatchType;
        };
    }) {
        if (!initial?.lobby) {
            return;
        }

        lobbyUuid.value = initial.lobby.uuid;
        lobbyCode.value = initial.lobby.lobby_code;
        players.value = initial.lobby.players;
        canProceed.value = initial.lobby.can_proceed;
        pendingInviteeIds.value = initial.lobby.pending_invitee_ids ?? [];
        matchType.value = initial.lobby.match_type;
        mode.value = initial.lobby.config.mode;
        config.value = { ...initial.lobby.config };
    }

    function selectMatchType(next: MatchType) {
        matchType.value = next;
    }

    async function updateMatchType(uuid: string, next: MatchType) {
        if (matchType.value === next) {
            return;
        }

        matchType.value = next;
        loading.value = true;
        error.value = null;

        try {
            await router.patch(
                route('darts.x01.lobby.match-type.update', uuid),
                { match_type: next },
                { preserveScroll: true, only: ['lobby'] },
            );
        } catch {
            error.value = 'lobby-match-type-failed';
        } finally {
            loading.value = false;
        }
    }

    function applyStartingPoints(points: 301 | 501) {
        applyStartingPointRules(config.value, points);
    }

    async function createLobby(selectedMode: LobbyMode) {
        if (!selectedMode || creating.value) {
            return;
        }

        mode.value = selectedMode;
        config.value.mode = selectedMode;
        creating.value = true;
        loading.value = true;
        error.value = null;

        await router.post(
            route('darts.x01.lobby.store'),
            { mode: selectedMode, match_type: matchType.value },
            {
                onError: (errors) => {
                    error.value = resolveLobbyError(errors, 'lobby-create-failed');
                },
                onFinish: () => {
                    creating.value = false;
                    loading.value = false;
                },
            },
        );
    }

    async function joinLobby() {
        const code = normalizeLobbyCode(joinCode.value);

        if (!isValidLobbyCode(code)) {
            error.value = 'lobby-invalid-code';
            return;
        }

        loading.value = true;
        error.value = null;

        await router.post(route('darts.x01.lobby.join'), { lobby_code: code }, {
            onError: (errors) => {
                const lobbyCodeError = errors.lobby_code;
                const message = Array.isArray(lobbyCodeError) ? lobbyCodeError[0] : lobbyCodeError;

                if (message === 'lobby-invalid-code') {
                    error.value = 'lobby-invalid-code';
                    return;
                }

                error.value = resolveLobbyError(errors, 'lobby-join-failed');
            },
            onFinish: () => {
                loading.value = false;
            },
        });
    }

    async function sendInvite(friendId: number, uuid: string) {
        loading.value = true;
        error.value = null;

        try {
            const { data } = await api.post<{ data: LobbySnapshot }>(
                route('darts.x01.lobby.invites.store', uuid),
                { user_id: friendId },
            );

            if (data.data) {
                applyLobbySnapshot(data.data);
            }
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 422) {
                const payload = err.response.data as { errors?: Record<string, string[]> };
                const flat = Object.fromEntries(
                    Object.entries(payload.errors ?? {}).map(([key, messages]) => [key, messages[0] ?? '']),
                );
                error.value = resolveLobbyError(flat, 'lobby-invite-failed');
            } else {
                error.value = 'lobby-invite-failed';
            }
        } finally {
            loading.value = false;
        }
    }

    async function addFriend(friendId: number, uuid: string) {
        loading.value = true;
        error.value = null;

        await router.post(
            route('darts.x01.lobby.players.store', uuid),
            { user_id: friendId },
            {
                preserveScroll: true,
                only: ['lobby', 'friends'],
                onError: (errors) => {
                    error.value = resolveLobbyError(errors, 'lobby-add-player-failed');
                },
                onFinish: () => {
                    loading.value = false;
                },
            },
        );
    }

    async function addGuest(uuid: string) {
        if (!guestName.value.trim()) {
            return;
        }

        loading.value = true;
        error.value = null;

        try {
            await router.post(
                route('darts.x01.lobby.players.store', uuid),
                {
                    guest_name: guestName.value.trim(),
                    guest_email: guestEmail.value.trim() || null,
                    save_guest: saveGuest.value || Boolean(guestEmail.value.trim()),
                },
                { preserveScroll: true, only: ['lobby', 'friends'] },
            );
            guestName.value = '';
            guestEmail.value = '';
        } catch {
            error.value = 'lobby-add-guest-failed';
        } finally {
            loading.value = false;
        }
    }

    function configPayload(): Omit<LobbyConfig, 'mode'> {
        const {
            format,
            legs_target,
            sets_target,
            starting_points,
            in_rule,
            out_rule,
            track_checkout_rate,
            is_public,
        } = config.value;

        return {
            format,
            legs_target,
            sets_target,
            starting_points,
            in_rule,
            out_rule,
            track_checkout_rate,
            is_public,
        };
    }

    async function saveConfig(uuid: string) {
        loading.value = true;
        error.value = null;

        try {
            await router.patch(
                route('darts.x01.lobby.config.update', uuid),
                configPayload(),
                { preserveScroll: true, only: ['lobby'] },
            );
        } catch {
            error.value = 'lobby-config-failed';
        } finally {
            loading.value = false;
        }
    }

    async function updateThrowOrder(uuid: string, playerIds: number[]) {
        error.value = null;

        try {
            const { data } = await api.patch<{ data: LobbySnapshot }>(
                route('darts.x01.lobby.throw-order.update', uuid),
                { player_ids: playerIds },
            );

            if (data.data) {
                applyLobbySnapshot(data.data);
            }
        } catch {
            error.value = 'lobby-setup-failed';
            throw new Error('lobby-setup-failed');
        }
    }

    async function setFirstThrower(uuid: string, playerId: number) {
        error.value = null;

        try {
            const { data } = await api.patch<{ data: LobbySnapshot }>(
                route('darts.x01.lobby.first-thrower.update', uuid),
                { player_id: playerId },
            );

            if (data.data) {
                applyLobbySnapshot(data.data);
            }
        } catch {
            error.value = 'lobby-setup-failed';
            throw new Error('lobby-setup-failed');
        }
    }

    async function updatePlayerStartingPoints(uuid: string, playerId: number, startingPoints: number | null) {
        const { data } = await api.patch<{ data: LobbySnapshot }>(
            route('darts.x01.lobby.players.starting-points', [uuid, playerId]),
            { starting_points: startingPoints },
        );

        if (data.data) {
            applyLobbySnapshot(data.data);
        }
    }

    async function startGame(uuid: string) {
        loading.value = true;
        error.value = null;

        try {
            await router.post(route('darts.x01.lobby.start', uuid));
        } catch {
            error.value = 'lobby-start-failed';
        } finally {
            loading.value = false;
        }
    }

    async function toggleReady(uuid: string, playerId: number, ready: boolean) {
        loading.value = true;
        error.value = null;

        try {
            await router.patch(
                route('darts.x01.lobby.players.ready', [uuid, playerId]),
                { ready },
                { preserveScroll: true, only: ['lobby'] },
            );
        } catch {
            error.value = 'lobby-ready-failed';
        } finally {
            loading.value = false;
        }
    }

    async function copyLobbyCode(code: string | null) {
        return copyLobbyCodeToClipboard(code);
    }

    function applyLobbySnapshot(snapshot: LobbySnapshot) {
        lobbyUuid.value = snapshot.uuid;
        lobbyCode.value = snapshot.lobby_code;
        players.value = snapshot.players;
        canProceed.value = snapshot.can_proceed;
        pendingInviteeIds.value = snapshot.pending_invitee_ids ?? [];
        matchType.value = snapshot.match_type;
        mode.value = snapshot.config.mode;
        config.value = { ...snapshot.config };
    }

    function lobbySignature(snapshot: LobbySnapshot): string {
        return JSON.stringify({
            status: snapshot.status,
            can_proceed: snapshot.can_proceed,
            match_type: snapshot.match_type,
            pending_invitee_ids: [...(snapshot.pending_invitee_ids ?? [])].sort((left, right) => left - right),
            players: [...snapshot.players]
                .map((player) => ({
                    id: player.id,
                    user_id: player.user_id,
                    slot: player.slot,
                    display_name: player.display_name,
                    status: player.status,
                }))
                .sort((left, right) => left.id - right.id),
        });
    }

    function listenToLobby(
        uuid: string,
        onUpdate: (snapshot: LobbySnapshot) => void,
        onClosed?: () => void,
        initialSnapshot?: LobbySnapshot | null,
    ): { cancel: () => void; pollNow: () => void } {
        let cancelled = false;
        let lastSignature = initialSnapshot ? lobbySignature(initialSnapshot) : '';

        const handleSnapshot = (snapshot: LobbySnapshot) => {
            if (cancelled) {
                return;
            }

            const signature = lobbySignature(snapshot);

            if (signature === lastSignature) {
                return;
            }

            lastSignature = signature;
            onUpdate(snapshot);
        };

        let interval = 0;
        let echoCleanup: (() => void) | undefined;

        const stop = () => {
            if (cancelled) {
                return;
            }

            cancelled = true;
            window.clearInterval(interval);
            echoCleanup?.();
        };

        const poll = async () => {
            if (cancelled) {
                return;
            }

            try {
                const { data } = await api.get<LobbySnapshot>(`/v1/darts/matches/${uuid}/lobby`);
                handleSnapshot(data);
            } catch (err) {
                if (cancelled) {
                    return;
                }

                if (axios.isAxiosError(err) && err.response?.status === 404) {
                    stop();
                    onClosed?.();
                }
            }
        };

        void poll();
        interval = window.setInterval(() => {
            void poll();
        }, 1000);

        const echo = getEcho();

        if (echo) {
            const channel = echo.private(`match.${uuid}`);
            channel.listen('.LobbyUpdated', (payload: LobbySnapshot) => {
                handleSnapshot(payload);
            });

            if (onClosed) {
                channel.listen('.LobbyClosed', () => {
                    stop();
                    onClosed();
                });
            }

            echoCleanup = () => {
                channel.stopListening('.LobbyUpdated');
                channel.stopListening('.LobbyClosed');
                echo.leave(`match.${uuid}`);
            };
        }

        return {
            cancel: () => {
                stop();
            },
            pollNow: () => {
                void poll();
            },
        };
    }

    function reset() {
        step.value = 1;
        mode.value = null;
        matchType.value = 'solo';
        lobbyUuid.value = null;
        lobbyCode.value = null;
        players.value = [];
        canProceed.value = false;
        loading.value = false;
        creating.value = false;
        error.value = null;
        guestName.value = '';
        guestEmail.value = '';
        saveGuest.value = false;
        joinCode.value = '';
        pendingInviteeIds.value = [];
        config.value = {
            mode: null,
            format: 'first_to',
            legs_target: 1,
            sets_target: 1,
            starting_points: 501,
            in_rule: 'straight',
            out_rule: 'double',
            track_checkout_rate: false,
            is_public: false,
        };
    }

    async function abandonLobby(uuid: string) {
        loading.value = true;
        error.value = null;

        try {
            await api.delete(route('darts.x01.lobby.destroy', uuid));
            reset();
            router.visit(route('darts.x01.lobby.index'));
        } catch {
            error.value = 'lobby-abandon-failed';
        } finally {
            loading.value = false;
        }
    }

    return {
        step,
        mode,
        matchType,
        lobbyUuid,
        lobbyCode,
        players,
        canProceed,
        loading,
        creating,
        error,
        guestName,
        guestEmail,
        saveGuest,
        joinCode,
        pendingInviteeIds,
        config,
        playerCount,
        hasLobby,
        hydrateFromProps,
        applyLobbySnapshot,
        selectMatchType,
        updateMatchType,
        applyStartingPoints,
        createLobby,
        joinLobby,
        sendInvite,
        addFriend,
        addGuest,
        saveConfig,
        updateThrowOrder,
        setFirstThrower,
        updatePlayerStartingPoints,
        startGame,
        toggleReady,
        copyLobbyCode,
        listenToLobby,
        reset,
        abandonLobby,
    };
});
