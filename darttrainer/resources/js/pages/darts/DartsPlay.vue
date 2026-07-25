<script setup lang="ts">
import BigScoreOverlay from '@/components/darts/BigScoreOverlay.vue';
import CalcQuickScores from '@/components/darts/CalcQuickScores.vue';
import CalculatorModeModal from '@/components/darts/CalculatorModeModal.vue';
import DartCalculatorPad from '@/components/darts/DartCalculatorPad.vue';
import DartInputPad from '@/components/darts/DartInputPad.vue';
import MatchChatPanel from '@/components/darts/MatchChatPanel.vue';
import Scoreboard from '@/components/darts/Scoreboard.vue';
import TurnEditModal from '@/components/darts/TurnEditModal.vue';
import TurnHistory from '@/components/darts/TurnHistory.vue';
import TurnTimeoutModal from '@/components/darts/TurnTimeoutModal.vue';
import { useMatchChat } from '@/composables/useMatchChat';
import InputModeInfoTip from '@/components/darts/InputModeInfoTip.vue';
import GameLayout from '@/layouts/GameLayout.vue';
import { GameViewportRemeasureKey } from '@/composables/useGameViewportFit';
import { useGameResponsive } from '@/composables/useGameResponsive';
import { useLocale } from '@/composables/useLocale';
import type { RecentTurn } from '@/stores/dartsPlay';
import type { CalculatorVisitPayload } from '@/components/darts/DartCalculatorPad.vue';
import { useDartsPlayStore } from '@/stores/dartsPlay';
import type { ScoreCelebrationTier } from '@/lib/scoreCelebration';
import { resolveScoreCelebration } from '@/lib/scoreCelebration';
import { Head, router } from '@inertiajs/vue3';
import { computed, inject, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

const props = defineProps<{
    matchUuid: string;
    role: 'player' | 'spectator';
    user: { id: number; name: string; is_premium: boolean; default_scoring_mode?: 'board' | 'calculator' };
    playerId: number | null;
    isHost: boolean;
    isLocal: boolean;
}>();

const { t } = useLocale();
const { frame } = useGameResponsive();
const store = useDartsPlayStore();
const remeasureViewport = inject<( () => void ) | undefined>(GameViewportRemeasureKey, undefined);

const inputMode = ref<'sector' | 'calculator'>('sector');
type CalcFlowStep = 'score' | 'dartCount' | 'checkoutDart' | 'doubleDarts';
const calcFlowStep = ref<CalcFlowStep>('score');
const calculatorPadRef = ref<InstanceType<typeof DartCalculatorPad> | null>(null);
const showCalculatorModeModal = ref(false);
const calculatorModeLoading = ref(false);
const showChatDrawer = ref(false);
const showTimeoutModal = ref(false);
const timeoutDismissed = ref(false);
const editingTurn = ref<RecentTurn | null>(null);
const bigScore = ref<{ playerName: string; points: number; tier: ScoreCelebrationTier } | null>(null);

let matchListener: { cancel: () => void; pollNow: () => void } | null = null;
let leaving = false;
let lastCelebratedTurnId = 0;
const celebrationQueue: Array<{ playerName: string; points: number; tier: ScoreCelebrationTier }> = [];

const isSpectator = computed(() => props.role === 'spectator');
const matchState = computed(() => store.state);
const turnTimer = computed(() => matchState.value?.current_state.turn_timer ?? null);
const recentTurns = computed(() => matchState.value?.current_state.recent_turns ?? []);

const canPostChat = computed(() => !isSpectator.value && matchState.value?.status === 'active');

const {
    messages: chatMessages,
    loading: chatLoading,
    sending: chatSending,
    sendMessage,
} = useMatchChat(props.matchUuid, () => canPostChat.value);

const isActiveSide = computed(() => {
    const timer = turnTimer.value;
    if (!timer) {
        return false;
    }

    if (props.isLocal && props.isHost) {
        return true;
    }

    if (props.playerId !== null && timer.player_id === props.playerId) {
        return true;
    }

    const timedRow = matchState.value?.scoreboard.find((row) => row.player_id === timer.player_id);

    return props.isHost && timedRow?.user_id === null;
});

const canRespondToTimeout = computed(() => {
    if (!showTurnTimer.value || isSpectator.value || !turnTimer.value || turnTimer.value.status !== 'expired') {
        return false;
    }

    return !isActiveSide.value;
});

const canThrow = computed(() => {
    if (isSpectator.value || !matchState.value || matchState.value.status !== 'active') {
        return false;
    }

    const activeId = matchState.value.current_state.active_player_id;
    if (activeId === null) {
        return false;
    }

    if (props.isLocal && props.isHost) {
        return true;
    }

    if (props.playerId !== null && activeId === props.playerId) {
        return true;
    }

    const activeRow = matchState.value.scoreboard.find((row) => row.player_id === activeId);

    return props.isHost && activeRow?.user_id === null;
});

const canEditTurns = computed(() => !isSpectator.value && matchState.value?.status === 'active');
const canEditAllTurns = computed(() => props.isLocal && props.isHost);

const showTurnTimer = computed(() => {
    const mode = matchState.value?.config.mode;

    return !props.isLocal && mode !== 'local';
});

const errorMessage = computed(() => {
    if (!store.error) {
        return '';
    }

    const key = `games.play.errors.${store.error}`;
    const translated = t(key);

    return translated === key ? '' : translated;
});

const showInlineChat = computed(() => frame.value === 'landscape');
const showChatToggle = computed(() => !showInlineChat.value);
// Īstais cēlonis, kāpēc landscape telefonā nekad nestrādāja proporcionāls
// scale (nevis pārkārtošana): game-frame.css bija bezsnacījuma
// `.game-page.play-page { height:100%; max-height:100%; overflow:hidden; }`,
// kas neļāva stage.scrollHeight jebkad ziņot par īsto (pārpildīto) satura
// izmēru — JS tāpēc vienmēr aprēķināja scale≈1. Salaboju to game-frame.css
// (klambars tagad tikai --fill/portrait režīmā), tāpēc landscape (arī
// telefonā) tagad var izmantot īsto proporcionālo scale-to-fit, tieši kā PC.
// Portrait paliek uz fillViewport (height-chain ar min-height aizsardzībām).
const fillViewport = computed(() => frame.value === 'portrait');
const calcSidebarLayout = computed(() => showInlineChat.value);
const calcSidebarActive = computed(
    () =>
        calcSidebarLayout.value
        && ownScoringMode.value === 'calculator'
        && !isSpectator.value
        && matchState.value?.status === 'active',
);
const showSidebarQuickScores = computed(() => calcSidebarActive.value && calcFlowStep.value === 'score');
watch(inputMode, (mode) => {
    if (mode !== 'calculator') {
        calcFlowStep.value = 'score';
    }
});

const activeRow = computed(() => {
    const activeId = matchState.value?.current_state.active_player_id;
    if (activeId === null || !matchState.value) {
        return null;
    }

    return matchState.value.scoreboard.find((row) => row.player_id === activeId) ?? null;
});

const activeRemainingPoints = computed(() => activeRow.value?.remaining_points ?? matchState.value?.config.starting_points ?? 501);
const outRule = computed(() => matchState.value?.config.out_rule ?? 'double');
const trackCheckoutRate = computed(() => matchState.value?.config.track_checkout_rate ?? false);

const ownScoringMode = computed(() => {
    if (props.playerId === null || !matchState.value) {
        return 'board' as const;
    }

    const row = matchState.value.scoreboard.find((entry) => entry.player_id === props.playerId);

    return row?.scoring_mode ?? 'board';
});

const ownStatsTier = computed(() => {
    if (props.playerId === null || !matchState.value) {
        return 'full' as const;
    }

    const row = matchState.value.scoreboard.find((entry) => entry.player_id === props.playerId);

    return row?.stats_tier ?? 'full';
});

const statsTierBasic = computed(() => ownStatsTier.value === 'basic');

function syncInputModeFromServer() {
    inputMode.value = ownScoringMode.value === 'calculator' ? 'calculator' : 'sector';
}

watch(ownScoringMode, () => {
    syncInputModeFromServer();
});

function closeChatDrawer() {
    showChatDrawer.value = false;
    void nextTick(() => remeasureViewport?.());
}

function triggerBigScore(playerName: string, points: number, tier: ScoreCelebrationTier) {
    if (bigScore.value !== null) {
        celebrationQueue.push({ playerName, points, tier });
        return;
    }

    bigScore.value = { playerName, points, tier };
}

function onBigScoreFinished() {
    bigScore.value = null;

    const next = celebrationQueue.shift();
    if (next) {
        bigScore.value = next;
    }
}

function inspectScoreCelebration(state: typeof store.state) {
    if (!state || state.status !== 'active') {
        return;
    }

    const latest = state.current_state.recent_turns.at(-1);
    if (
        !latest
        || !latest.is_complete
        || latest.is_bust
        || latest.turn_id === lastCelebratedTurnId
    ) {
        return;
    }

    lastCelebratedTurnId = latest.turn_id;

    const celebration = resolveScoreCelebration(
        latest.points_scored,
        latest.throws,
        latest.is_checkout ?? false,
    );

    if (celebration) {
        triggerBigScore(latest.player_name, celebration.points, celebration.tier);
    }
}

function goMatchGone(reason = 'gone') {
    router.visit(route('darts.x01.match-gone', { reason }));
}

async function handleExit() {
    if (!isSpectator.value && matchState.value?.status === 'active' && !leaving) {
        leaving = true;
        await store.leaveMatch(props.matchUuid);
    }

    router.visit(route('home'));
}

function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
        matchListener?.pollNow();
    }
}

function submitThrow(sector: number, multiplier: number) {
    if (!canThrow.value || store.throwing) {
        return;
    }

    void store.submitThrow(props.matchUuid, sector, multiplier);
}

function submitPoints(payload: CalculatorVisitPayload) {
    void store.submitPointsThrow(props.matchUuid, payload);
}

function onCalcFlowStepChange(step: CalcFlowStep) {
    calcFlowStep.value = step;
}

function sidebarQuickAllowed(score: number): boolean {
    return calculatorPadRef.value?.quickScoreAllowed(score) ?? false;
}

function onSidebarQuickScore(score: number) {
    calculatorPadRef.value?.quickScore(score);
}

function toggleChatDrawer() {
    showChatDrawer.value = !showChatDrawer.value;
    void nextTick(() => remeasureViewport?.());
}

function setInputMode(mode: 'sector' | 'calculator') {
    closeChatDrawer();

    if (mode === 'calculator') {
        if (statsTierBasic.value) {
            void activateCalculatorMode(false);
            return;
        }

        showCalculatorModeModal.value = true;
        return;
    }

    if (statsTierBasic.value) {
        void activateBoardMode();
        return;
    }

    inputMode.value = 'sector';
}

async function activateCalculatorMode(fromModal: boolean) {
    calculatorModeLoading.value = true;

    try {
        await store.lockCalculatorMode(props.matchUuid);
        inputMode.value = 'calculator';
        if (fromModal) {
            showCalculatorModeModal.value = false;
        }
    } catch {
        // error surfaced via store.error
    } finally {
        calculatorModeLoading.value = false;
    }
}

async function activateBoardMode() {
    calculatorModeLoading.value = true;

    try {
        await store.switchToBoardMode(props.matchUuid);
        inputMode.value = 'sector';
    } catch {
        // error surfaced via store.error
    } finally {
        calculatorModeLoading.value = false;
    }
}

async function confirmCalculatorMode() {
    await activateCalculatorMode(true);
}

function cancelCalculatorMode() {
    showCalculatorModeModal.value = false;
}

async function handleExtendTimer() {
    await store.extendTurnTimer(props.matchUuid);
    showTimeoutModal.value = false;
    timeoutDismissed.value = false;
}

async function handleEndMatch() {
    await store.abandonMatch(props.matchUuid, (reason) => goMatchGone(reason ?? 'turn_timeout'));
}

function openTurnEdit(turn: RecentTurn) {
    const isOwnTurn = props.playerId !== null && turn.player_id === props.playerId;

    if (!isOwnTurn && !canEditAllTurns.value) {
        return;
    }

    editingTurn.value = turn;
}

async function saveTurnEdit(payload: { throws?: Array<{ sector: number; multiplier: number }>; points?: number }) {
    if (!editingTurn.value) {
        return;
    }

    await store.editTurn(props.matchUuid, editingTurn.value.turn_id, payload);
    editingTurn.value = null;
}

watch(
    () => store.state,
    (state) => {
        inspectScoreCelebration(state);
    },
    { deep: true },
);

watch(
    () => [turnTimer.value?.status, canRespondToTimeout.value],
    () => {
        if (canRespondToTimeout.value && !timeoutDismissed.value) {
            showTimeoutModal.value = true;
        }

        if (turnTimer.value?.status !== 'expired') {
            showTimeoutModal.value = false;
            timeoutDismissed.value = false;
        }
    },
);

onMounted(async () => {
    await store.fetchState(props.matchUuid, goMatchGone);

    if (store.matchEnded) {
        return;
    }

    if (store.state) {
        const latestComplete = [...store.state.current_state.recent_turns]
            .reverse()
            .find((turn) => turn.is_complete && !turn.is_bust);

        if (latestComplete) {
            lastCelebratedTurnId = latestComplete.turn_id;
        }

        if (store.state.scoreboard.find((row) => row.player_id === props.playerId)?.scoring_mode === 'calculator') {
            inputMode.value = 'calculator';
        } else if (
            props.user.default_scoring_mode === 'calculator'
            && store.state.scoreboard.find((row) => row.player_id === props.playerId)?.stats_tier !== 'basic'
        ) {
            inputMode.value = 'calculator';
        } else {
            syncInputModeFromServer();
        }

        matchListener = store.listenToMatch(
            props.matchUuid,
            () => {
                void nextTick(() => remeasureViewport?.());
            },
            store.state,
            goMatchGone,
        );
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
});

onUnmounted(() => {
    matchListener?.cancel();
    matchListener = null;
    store.reset();
    document.removeEventListener('visibilitychange', handleVisibilityChange);
});

watch(
    () => [store.state?.status, store.state?.current_state.active_player_id, frame.value, showChatDrawer.value, inputMode.value],
    () => {
        void nextTick(() => remeasureViewport?.());
    },
);
</script>

<template>
    <Head :title="t('games.play.title')" />

    <GameLayout
        :player-name="user.name"
        :is-premium="user.is_premium"
        :fill-viewport="fillViewport"
        @exit="handleExit"
    >
        <template #header-actions>
            <div class="play-header-tools">
                <div v-if="!isSpectator && matchState?.status === 'active'" class="play-input-mode">
                    <span v-if="statsTierBasic" class="play-calc-badge">{{ t('games.play.inputMode.reducedStats') }}</span>
                    <button
                        type="button"
                        class="play-mode-btn"
                        :class="{ 'play-mode-btn--on': ownScoringMode === 'board' }"
                        :disabled="calculatorModeLoading"
                        @click="setInputMode('sector')"
                    >
                        {{ t('games.play.inputMode.sector') }}
                    </button>
                    <button
                        type="button"
                        class="play-mode-btn"
                        :class="{ 'play-mode-btn--on': ownScoringMode === 'calculator' }"
                        :disabled="calculatorModeLoading"
                        @click="setInputMode('calculator')"
                    >
                        {{ t('games.play.inputMode.calculator') }}
                    </button>
                    <InputModeInfoTip />
                </div>
                <button
                    v-if="showChatToggle"
                    type="button"
                    class="play-chat-toggle"
                    :aria-expanded="showChatDrawer"
                    @click="toggleChatDrawer"
                >
                    {{ t('games.play.chat.toggle') }}
                </button>
            </div>
        </template>

        <div
            class="play-page game-page"
            :class="[
                `play-page--${frame}`,
                { 'play-page--chat-open': showChatDrawer },
            ]"
        >
            <div v-if="store.loading && !matchState" class="play-page__body game-page__body">
                <p class="play-loading">{{ t('games.play.loading') }}</p>
            </div>

            <template v-else-if="matchState">
                <div class="play-page__body game-page__body play-layout">
                    <div class="play-main">
                        <div class="play-score-panel">
                            <div class="play-score-top">
                                <p v-if="isSpectator" class="play-badge">{{ t('games.play.spectatorBadge') }}</p>
                                <p v-if="errorMessage" class="play-error">{{ errorMessage }}</p>

                                <Scoreboard
                                    class="play-scoreboard"
                                    :rows="matchState.scoreboard"
                                    :current-leg="matchState.current_state.current_leg"
                                    :legs-target="matchState.config.legs_target"
                                    :current-set="matchState.current_state.current_set ?? 1"
                                    :sets-target="matchState.config.sets_target"
                                    :format="matchState.config.format"
                                    :starting-points="matchState.config.starting_points"
                                    :status="matchState.status"
                                    :winner-name="matchState.winner?.name"
                                    :show-timer="showTurnTimer"
                                    :turn-timer="turnTimer"
                                    :is-active-side="isActiveSide"
                                />
                            </div>

                            <TurnHistory
                                class="play-turn-history"
                                :turns="recentTurns"
                                :editable="canEditTurns"
                                :can-edit-all-turns="canEditAllTurns"
                                :player-id="playerId"
                                @edit="openTurnEdit"
                            />
                        </div>

                        <div class="play-input-panel">
                            <DartInputPad
                                v-if="!isSpectator && matchState.status === 'active' && ownScoringMode === 'board'"
                                :disabled="!canThrow"
                                :loading="store.throwing"
                                :turn-throws="matchState.current_state.turn_throws"
                                :darts-this-turn="matchState.current_state.darts_thrown_this_turn"
                                @throw="submitThrow"
                                @close-chat="closeChatDrawer"
                            />

                            <DartCalculatorPad
                                v-else-if="!isSpectator && matchState.status === 'active' && ownScoringMode === 'calculator'"
                                ref="calculatorPadRef"
                                :disabled="!canThrow"
                                :loading="store.throwing"
                                :remaining-points="activeRemainingPoints"
                                :out-rule="outRule"
                                :track-checkout-rate="trackCheckoutRate"
                                :external-quick-scores="calcSidebarLayout"
                                @throw-points="submitPoints"
                                @close-chat="closeChatDrawer"
                                @flow-step-change="onCalcFlowStepChange"
                            />

                            <p v-else-if="isSpectator" class="play-hint">{{ t('games.play.spectatorHint') }}</p>
                            <p v-else-if="matchState.status === 'finished'" class="play-finished">{{ t('games.play.matchFinished') }}</p>
                            <p v-else-if="!canThrow" class="play-wait">{{ t('games.play.waitTurn') }}</p>
                        </div>
                    </div>

                    <aside
                        v-if="showInlineChat"
                        class="play-chat-column"
                        :class="{ 'play-chat-column--calc': calcSidebarActive }"
                    >
                        <MatchChatPanel
                            class="play-chat-panel"
                            :messages="chatMessages"
                            :loading="chatLoading"
                            :sending="chatSending"
                            :can-post="canPostChat"
                            :current-user-id="user.id"
                            @send="sendMessage"
                        />
                        <div v-if="calcSidebarActive" class="play-calc-quick-anchor">
                            <CalcQuickScores
                                v-if="showSidebarQuickScores"
                                sidebar
                                :disabled="!canThrow || store.throwing"
                                :is-allowed="sidebarQuickAllowed"
                                @select="onSidebarQuickScore"
                            />
                        </div>
                    </aside>
                </div>

                <div v-if="showChatDrawer && showChatToggle" class="play-chat-drawer">
                    <div class="play-chat-drawer__backdrop" @click="closeChatDrawer" />
                    <div class="play-chat-drawer__panel">
                        <div class="play-chat-drawer__head">
                            <p class="play-chat-drawer__title">{{ t('games.play.chat.title') }}</p>
                            <button type="button" class="play-chat-drawer__close" @click="closeChatDrawer">×</button>
                        </div>
                        <MatchChatPanel
                            compact
                            :messages="chatMessages"
                            :loading="chatLoading"
                            :sending="chatSending"
                            :can-post="canPostChat"
                            :current-user-id="user.id"
                            @send="sendMessage"
                        />
                    </div>
                </div>
            </template>
        </div>
    </GameLayout>

    <BigScoreOverlay
        v-if="bigScore"
        :key="`${bigScore.playerName}-${bigScore.points}-${bigScore.tier}`"
        :player-name="bigScore.playerName"
        :points="bigScore.points"
        :tier="bigScore.tier"
        @finished="onBigScoreFinished"
    />

    <CalculatorModeModal
        v-if="showCalculatorModeModal"
        :loading="calculatorModeLoading"
        @confirm="confirmCalculatorMode"
        @cancel="cancelCalculatorMode"
    />

    <TurnTimeoutModal
        v-if="showTurnTimer && showTimeoutModal && turnTimer"
        :player-name="turnTimer.player_name"
        :loading="store.timerLoading"
        @extend="handleExtendTimer"
        @end="handleEndMatch"
        @dismiss="() => { showTimeoutModal = false; timeoutDismissed = true; }"
    />

    <TurnEditModal
        :turn="editingTurn"
        :loading="store.editing"
        @close="editingTurn = null"
        @save="saveTurnEdit"
    />
</template>

<style scoped>
/*
 * FROZEN LAYOUT (Jul 2026) — HP Omen landscape baseline; do not tweak proportions lightly.
 * All landscape viewports use this same layout, scaled via useGameViewportFit on smaller screens.
 *
 * play-main: 9fr score panel / 11fr input (~45/55)
 * score panel: scoreboard (timer in header when online) → turn history
 */
/* ── Play shell: strict height chain, no overflow ── */
.play-page.game-page {
    box-sizing: border-box;
}

.play-page__body.play-layout {
    flex: 1 1 auto;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
}

.play-page--landscape .play-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(200px, 24vw);
    grid-template-rows: minmax(0, 1fr);
    align-items: stretch;
    gap: var(--game-gap-sm);
    height: 100%;
    width: 100%;
    min-height: 0;
    min-width: 0;
}

.play-page--portrait .play-layout {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
    min-width: 0;
    height: 100%;
    width: 100%;
}

.play-page--portrait .play-main {
    /* Portrait: pogas ir galvenais elements — dod ievades panelim krietni
       vairāk vietas nekā "frozen" 9fr/11fr (~45/55). 3fr/9fr (~25/75) atbilst
       mockup proporcijai. */
    grid-template-rows: minmax(0, 3fr) minmax(0, 9fr);
    gap: 3px;
    flex: 1 1 auto;
    min-height: 0;
    min-width: 0;
    height: 100%;
    width: 100%;
}

.play-page--landscape .play-main {
    height: 100%;
    min-height: 0;
    min-width: 0;
}

.play-main {
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    display: grid;
    grid-template-rows: minmax(0, 9fr) minmax(0, 11fr);
    gap: 6px;
}

.play-score-panel {
    min-height: 0;
    overflow: hidden;
    display: grid;
    grid-template-rows: minmax(0, 1fr) minmax(72px, 92px);
    gap: 6px;
}

.play-score-top {
    min-height: 0;
    min-width: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1 1 auto;
}

.play-score-top .play-badge,
.play-score-top .play-error {
    flex: 0 0 auto;
    margin: 0;
}

.play-scoreboard {
    flex: 1 1 auto;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.play-turn-history {
    min-height: 0;
    min-width: 0;
    height: 100%;
    overflow: hidden;
}

.play-page--portrait .play-score-panel {
    /* Brutāli samazināta pēdējo gājienu joslas minimālā rezervācija
       (96px→64px) un gap — atbrīvotā vieta iet uz pogām zemāk. */
    grid-template-rows: minmax(0, 1fr) minmax(52px, 64px);
    gap: 3px;
}

.play-page--portrait .play-score-top {
    gap: 2px;
}

.play-page--landscape .play-score-panel {
    grid-template-rows: minmax(0, 1fr) minmax(68px, 84px);
}

.play-input-panel {
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.play-input-panel :deep(.pad),
.play-input-panel :deep(.calc) {
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
}

.play-input-panel .play-hint,
.play-input-panel .play-wait,
.play-input-panel .play-finished {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
}

/* Only turn history scrolls — horizontal list of past visits. */
.play-page :deep(.turn-hist__list) {
    overflow-x: auto;
    overflow-y: hidden;
}

.play-page :deep(.sb-list),
.play-page :deep(.pad-grid),
.play-page :deep(.calc-main) {
    overflow: hidden;
}

.play-page--landscape :deep(.sb-stat) {
    min-width: clamp(34px, 9cqw, 54px);
    padding: clamp(3px, 3cqh, 6px) clamp(6px, 1.2vw, 12px);
}

.play-page--landscape :deep(.sb-stat__num) {
    font-size: clamp(18px, 7.5cqh, 28px);
}

.play-page--landscape :deep(.sb-stat__lbl) {
    font-size: clamp(8px, 3.2cqh, 11px);
}

.play-page--landscape :deep(.sb-visit) {
    font-size: clamp(11px, 5cqh, 16px);
}

.play-chat-column {
    min-height: 0;
    min-width: 0;
    overflow: hidden;
    display: grid;
    grid-template-rows: minmax(0, 1fr);
    gap: 6px;
}

/* Match play-main 9/11 split so quick scores align with the calculator row. */
.play-chat-column--calc {
    grid-template-rows: minmax(0, 9fr) minmax(0, 11fr);
}

.play-chat-column--calc .play-chat-panel {
    min-height: 0;
}

.play-chat-column--calc .play-calc-quick-anchor {
    min-height: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex: 1 1 auto;
}

.play-chat-column--calc .play-calc-quick-anchor :deep(.calc-quick) {
    flex: 1 1 auto;
    min-height: 0;
}

.play-chat-panel,
.play-chat-column :deep(.match-chat) {
    min-height: 0;
    overflow: hidden;
    height: 100%;
}

.play-header-tools {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: nowrap;
    justify-content: flex-end;
    min-width: 0;
}

:global(.game-frame--portrait) .play-header-tools {
    gap: 4px;
}

:global(.game-frame--portrait) .play-input-mode {
    flex-shrink: 1;
    min-width: 0;
}

:global(.game-frame--portrait) .play-calc-badge {
    display: none;
}

:global(.game-frame--portrait) .play-mode-btn,
:global(.game-frame--portrait) .play-chat-toggle {
    padding: 5px 7px;
    font-size: 9px;
}

.play-input-mode {
    display: inline-flex;
    gap: 4px;
    align-items: center;
}

.play-calc-badge {
    padding: 4px 6px;
    border-radius: 6px;
    border: 1px solid rgba(34, 211, 238, 0.35);
    background: rgba(34, 211, 238, 0.1);
    color: #22d3ee;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    white-space: nowrap;
}

.play-mode-btn {
    padding: 6px 8px;
    border-radius: 8px;
    border: 1px solid #334155;
    background: rgba(255, 255, 255, 0.03);
    color: #94a3b8;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    cursor: pointer;
    white-space: nowrap;
}

.play-mode-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.play-mode-btn--on {
    color: #0b0f19;
    background: #39ff14;
    border-color: #39ff14;
}

.play-chat-toggle {
    flex: 0 0 auto;
    padding: 6px 8px;
    border-radius: 8px;
    border: 1px solid rgba(34, 211, 238, 0.3);
    background: rgba(34, 211, 238, 0.08);
    color: #22d3ee;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    white-space: nowrap;
}

.play-chat-drawer {
    position: fixed;
    inset: 0;
    z-index: 40;
    pointer-events: none;
}

.play-chat-drawer__backdrop {
    position: absolute;
    inset: 0;
    background: rgba(2, 6, 23, 0.55);
    pointer-events: auto;
}

.play-chat-drawer__panel {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    max-height: min(55vh, 360px);
    display: flex;
    flex-direction: column;
    pointer-events: auto;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    background: #0d1220;
}

.play-chat-drawer__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.play-chat-drawer__title {
    margin: 0;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 16px;
    font-weight: 900;
    letter-spacing: 0.06em;
    text-transform: uppercase;
}

.play-chat-drawer__close {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid #1f2937;
    background: rgba(255, 255, 255, 0.03);
    color: #94a3b8;
    font-size: 20px;
    cursor: pointer;
}

.play-loading,
.play-hint,
.play-wait,
.play-finished {
    margin: 0;
    text-align: center;
    color: #94a3b8;
    font-size: var(--game-body);
}

.play-finished {
    color: #39ff14;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 18px;
    font-weight: 900;
    letter-spacing: 0.06em;
    text-transform: uppercase;
}

.play-badge {
    margin: 0;
    align-self: center;
    padding: 3px 8px;
    border-radius: 999px;
    border: 1px solid rgba(34, 211, 238, 0.35);
    background: rgba(34, 211, 238, 0.08);
    color: #22d3ee;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.play-error {
    margin: 0;
    padding: 6px 10px;
    border-radius: 8px;
    border: 1px solid rgba(251, 44, 95, 0.35);
    background: rgba(251, 44, 95, 0.1);
    color: #fb2c5f;
    font-size: var(--game-body);
    font-weight: 600;
    text-align: center;
}
</style>
