import api from '@/lib/axios';
import { getEcho } from '@/lib/echo';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface CalculatorVisitPayload {
    points: number;
    dartCount?: number;
    checkoutDart?: number;
    doubleDarts?: number;
}

export interface TurnThrow {
    sector: number;
    multiplier: number;
    points: number;
    is_leg_winner: boolean;
}

export interface TurnTimerState {
    player_id: number;
    player_name: string;
    status: 'running' | 'expired' | 'extended';
    expires_at: string;
    seconds_remaining: number;
    timeout_seconds: number;
}

export interface RecentTurn {
    turn_id: number;
    player_id: number;
    player_name: string;
    turn_number: number;
    points_scored: number;
    remaining_points: number;
    is_bust: boolean;
    throws: Array<{ throw_number?: number; sector: number; multiplier: number; points: number; input_source?: 'board' | 'calculator' }>;
    input_source?: 'board' | 'calculator';
    dart_count: number;
    is_complete: boolean;
    is_checkout?: boolean;
}

export interface ScoreboardRow {
    player_id: number;
    user_id: number | null;
    name: string;
    remaining_points: number;
    darts_thrown_total: number;
    legs_won: number;
    sets_won?: number;
    scoring_mode?: 'board' | 'calculator';
    stats_tier?: 'full' | 'basic';
    turn_number?: number;
    average_3pad?: number;
    average_3pad_leg?: number;
    average_3pad_match?: number;
    is_turn: boolean;
}

export interface MatchState {
    match_uuid: string;
    status: 'lobby' | 'active' | 'finished' | 'cancelled';
    game_type: string;
    winner: { player_id: number; name: string } | null;
    config: {
        mode?: 'online' | 'local';
        starting_points: number;
        in_rule: 'straight' | 'double';
        out_rule: 'straight' | 'double';
        format: 'best_of' | 'first_to';
        legs_target: number;
        sets_target: number;
        track_checkout_rate: boolean;
    };
    current_state: {
        current_leg: number;
        current_set: number;
        active_player_id: number | null;
        darts_thrown_this_turn: number;
        current_turn_score: number;
        turn_throws: TurnThrow[];
        turn_is_bust: boolean;
        turn_timer: TurnTimerState | null;
        recent_turns: RecentTurn[];
    };
    scoreboard: ScoreboardRow[];
    visibility?: 'public';
}

export const useDartsPlayStore = defineStore('dartsPlay', () => {
    const state = ref<MatchState | null>(null);
    const loading = ref(false);
    const throwing = ref(false);
    const timerLoading = ref(false);
    const editing = ref(false);
    const error = ref<string | null>(null);
    const matchEnded = ref(false);

    function stateSignature(snapshot: MatchState): string {
        const latestTurn = snapshot.current_state.recent_turns.at(-1);

        return JSON.stringify({
            status: snapshot.status,
            leg: snapshot.current_state.current_leg,
            active: snapshot.current_state.active_player_id,
            darts: snapshot.current_state.darts_thrown_this_turn,
            score: snapshot.current_state.current_turn_score,
            timer: snapshot.current_state.turn_timer,
            latestTurn: latestTurn
                ? `${latestTurn.turn_id}:${latestTurn.dart_count}:${latestTurn.points_scored}:${latestTurn.is_complete ? 1 : 0}`
                : null,
            board: snapshot.scoreboard.map((row) => ({
                id: row.player_id,
                rem: row.remaining_points,
                legs: row.legs_won,
                turn: row.is_turn,
            })),
        });
    }

    function applyState(snapshot: MatchState) {
        state.value = snapshot;
    }

    async function fetchState(uuid: string, onAbandoned?: (reason?: string) => void) {
        loading.value = true;
        error.value = null;

        try {
            const { data } = await api.get<{ data: MatchState }>(`/v1/darts/matches/${uuid}/state`);
            applyState(data.data);
        } catch (err: unknown) {
            if (isNotFound(err)) {
                matchEnded.value = true;
                onAbandoned?.('all_left');
            } else {
                error.value = 'state-fetch-failed';
            }
        } finally {
            loading.value = false;
        }
    }

    async function lockCalculatorMode(uuid: string) {
        error.value = null;

        try {
            const { data } = await api.post<{ data: MatchState }>(`/v1/darts/matches/${uuid}/scoring-mode/calculator`);
            applyState(data.data);
        } catch {
            error.value = 'calculator-mode-failed';
            throw new Error('calculator-mode-failed');
        }
    }

    async function switchToBoardMode(uuid: string) {
        error.value = null;

        try {
            const { data } = await api.post<{ data: MatchState }>(`/v1/darts/matches/${uuid}/scoring-mode/board`);
            applyState(data.data);
        } catch {
            error.value = 'board-mode-failed';
            throw new Error('board-mode-failed');
        }
    }

    async function submitPointsThrow(uuid: string, payload: CalculatorVisitPayload | number) {
        throwing.value = true;
        error.value = null;

        const body =
            typeof payload === 'number'
                ? { points: payload }
                : {
                      points: payload.points,
                      ...(payload.dartCount !== undefined ? { dart_count: payload.dartCount } : {}),
                      ...(payload.checkoutDart !== undefined ? { checkout_dart: payload.checkoutDart } : {}),
                      ...(payload.doubleDarts !== undefined ? { double_darts: payload.doubleDarts } : {}),
                  };

        try {
            const { data } = await api.post<{ data: MatchState }>(`/v1/darts/matches/${uuid}/throws`, body);
            applyState(data.data);
        } catch (err: unknown) {
            error.value = resolveThrowError(err);

            if (error.value === 'not-your-turn' || error.value === 'calculator-mode-active') {
                await syncStateQuietly(uuid);
            }
        } finally {
            throwing.value = false;
        }
    }

    async function editTurn(uuid: string, turnId: number, payload: { throws?: Array<{ sector: number; multiplier: number }>; points?: number }) {
        editing.value = true;
        error.value = null;

        try {
            const { data } = await api.patch<{ data: MatchState }>(`/v1/darts/matches/${uuid}/turns/${turnId}`, payload);
            applyState(data.data);
        } catch {
            error.value = 'turn-edit-failed';
        } finally {
            editing.value = false;
        }
    }

    async function leaveMatch(uuid: string) {
        try {
            await api.post(`/v1/darts/matches/${uuid}/leave`);
        } catch {
            // match may already be gone
        }
    }

    async function submitThrow(uuid: string, sector: number, multiplier: number) {
        throwing.value = true;
        error.value = null;

        try {
            const { data } = await api.post<{ data: MatchState }>(`/v1/darts/matches/${uuid}/throws`, {
                sector,
                multiplier,
            });
            applyState(data.data);
        } catch (err: unknown) {
            error.value = resolveThrowError(err);

            if (error.value === 'not-your-turn' || error.value === 'calculator-mode-active') {
                await syncStateQuietly(uuid);
            }
        } finally {
            throwing.value = false;
        }
    }

    async function extendTurnTimer(uuid: string) {
        timerLoading.value = true;
        error.value = null;

        try {
            await api.post(`/v1/darts/matches/${uuid}/turn-timer/extend`);
            await fetchState(uuid);
        } catch {
            error.value = 'timer-extend-failed';
        } finally {
            timerLoading.value = false;
        }
    }

    async function abandonMatch(uuid: string, onAbandoned?: (reason?: string) => void) {
        timerLoading.value = true;
        error.value = null;

        try {
            await api.post(`/v1/darts/matches/${uuid}/turn-timer/abandon`);
            matchEnded.value = true;
            onAbandoned?.();
        } catch {
            error.value = 'timer-abandon-failed';
        } finally {
            timerLoading.value = false;
        }
    }

    function listenToMatch(
        uuid: string,
        onUpdate: (snapshot: MatchState) => void,
        initialSnapshot?: MatchState | null,
        onAbandoned?: (reason?: string) => void,
    ): { cancel: () => void; pollNow: () => void } {
        let cancelled = false;
        let lastSignature = initialSnapshot ? stateSignature(initialSnapshot) : '';

        const handleSnapshot = (snapshot: MatchState) => {
            if (cancelled) {
                return;
            }

            const signature = stateSignature(snapshot);
            if (signature === lastSignature) {
                return;
            }

            lastSignature = signature;
            applyState(snapshot);
            onUpdate(snapshot);
        };

        const poll = async () => {
            if (cancelled) {
                return;
            }

            try {
                const { data } = await api.get<{ data: MatchState }>(`/v1/darts/matches/${uuid}/state`);
                handleSnapshot(data.data);
            } catch (err: unknown) {
                if (isNotFound(err)) {
                    matchEnded.value = true;
                    onAbandoned?.('all_left');
                    return;
                }

                if (!cancelled) {
                    error.value = 'state-fetch-failed';
                }
            }
        };

        void poll();
        const interval = window.setInterval(() => {
            void poll();
        }, 1000);

        const echo = getEcho();
        let echoCleanup: (() => void) | undefined;

        if (echo) {
            const channel = echo.private(`match.${uuid}`);
            channel.listen('.MatchStateUpdated', (payload: MatchState) => {
                handleSnapshot(payload);
            });
            channel.listen('.MatchAbandoned', (payload: { reason?: string }) => {
                if (cancelled) {
                    return;
                }

                matchEnded.value = true;
                onAbandoned?.(payload.reason);
            });

            echoCleanup = () => {
                channel.stopListening('.MatchStateUpdated');
                channel.stopListening('.MatchAbandoned');
                echo.leave(`match.${uuid}`);
            };
        }

        return {
            cancel: () => {
                cancelled = true;
                window.clearInterval(interval);
                echoCleanup?.();
            },
            pollNow: () => {
                void poll();
            },
        };
    }

    function isNotFound(err: unknown): boolean {
        return apiStatus(err) === 404;
    }

    function apiStatus(err: unknown): number | null {
        if (typeof err !== 'object' || err === null || !('response' in err)) {
            return null;
        }

        const status = (err as { response?: { status?: number } }).response?.status;

        return typeof status === 'number' ? status : null;
    }

    function apiErrorMessage(err: unknown): string | null {
        if (typeof err !== 'object' || err === null || !('response' in err)) {
            return null;
        }

        const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message;

        return typeof message === 'string' && message.length > 0 ? message : null;
    }

    async function syncStateQuietly(uuid: string): Promise<void> {
        try {
            const { data } = await api.get<{ data: MatchState }>(`/v1/darts/matches/${uuid}/state`);
            applyState(data.data);
        } catch {
            // polling or a later action will recover
        }
    }

    function resolveThrowError(err: unknown): string {
        const status = apiStatus(err);
        const message = apiErrorMessage(err);

        if (status === 403) {
            if (message === 'not-your-turn') {
                return 'not-your-turn';
            }

            if (message === 'calculator-mode-active' || message === 'calculator-mode-locked') {
                return 'calculator-mode-active';
            }

            return 'throw-forbidden';
        }

        return 'throw-failed';
    }

    function reset() {
        state.value = null;
        loading.value = false;
        throwing.value = false;
        timerLoading.value = false;
        editing.value = false;
        error.value = null;
        matchEnded.value = false;
    }

    return {
        state,
        loading,
        throwing,
        timerLoading,
        editing,
        error,
        matchEnded,
        fetchState,
        submitThrow,
        submitPointsThrow,
        lockCalculatorMode,
        switchToBoardMode,
        editTurn,
        leaveMatch,
        extendTurnTimer,
        abandonMatch,
        listenToMatch,
        reset,
    };
});
