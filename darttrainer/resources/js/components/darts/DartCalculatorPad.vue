<script setup lang="ts">
import CalcQuickScores from '@/components/darts/CalcQuickScores.vue';
import { canAppendVisitDigit, evaluateVisitExpression, VISIT_POINTS_MIN } from '@/lib/calcExpression';
import {
    achievableCheckoutDarts,
    achievableDoubleDartCounts,
} from '@/lib/calculatorVisit';
import {
    requiresCheckoutDart,
    requiresCheckoutDartCount,
    requiresDoubleDartCount,
} from '@/lib/checkoutZone';
import { achievableDartCounts, isValidVisitPoints } from '@/lib/dartPoints';
import { useLocale } from '@/composables/useLocale';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

export interface CalculatorVisitPayload {
    points: number;
    dartCount?: number;
    checkoutDart?: number;
    doubleDarts?: number;
}

const props = defineProps<{
    disabled?: boolean;
    loading?: boolean;
    remainingPoints: number;
    outRule: 'straight' | 'double';
    trackCheckoutRate?: boolean;
    externalQuickScores?: boolean;
}>();

const emit = defineEmits<{
    throwPoints: [payload: CalculatorVisitPayload];
    closeChat: [];
    flowStepChange: [step: FlowStep];
}>();

type FlowStep = 'score' | 'dartCount' | 'checkoutDart' | 'doubleDarts';

const { t } = useLocale();
const display = ref('');
const flowStep = ref<FlowStep>('score');

watch(flowStep, (step) => {
    emit('flowStepChange', step);
}, { immediate: true });
const lockedPoints = ref<number | null>(null);
const dartCount = ref<number | null>(null);
const checkoutDart = ref<number | null>(null);
const doubleDarts = ref<number | null>(null);

const inputLocked = computed(() => props.disabled || props.loading);

const pendingValue = computed(() => evaluateVisitExpression(display.value));

const activePoints = computed(() =>
    flowStep.value === 'score' ? pendingValue.value : lockedPoints.value,
);

const wouldBust = computed(() => {
    const value = activePoints.value;
    if (value === null) {
        return false;
    }

    const remainingAfter = props.remainingPoints - value;

    if (remainingAfter < 0) {
        return true;
    }

    if (remainingAfter === 1 && props.outRule === 'double') {
        return true;
    }

    return false;
});

const isOverMax = computed(() => {
    const raw = display.value.trim();
    if (raw === '') {
        return false;
    }

    const value = pendingValue.value;
    return value === null && /^[\d+\-*]+$/.test(raw.replace(/\s/g, ''));
});

const isInvalidTotal = computed(() => {
    const value = activePoints.value;
    return value !== null && !isValidVisitPoints(value);
});

const inCheckoutZone = computed(() => props.remainingPoints <= 180);

const canSubmitScore = computed(() => {
    if (inputLocked.value || flowStep.value !== 'score') {
        return false;
    }

    const value = pendingValue.value;
    if (value === null || value < VISIT_POINTS_MIN || !isValidVisitPoints(value)) {
        return false;
    }

    return !wouldBust.value;
});

const canSubmitBust = computed(() => {
    if (inputLocked.value || flowStep.value !== 'score' || !inCheckoutZone.value) {
        return false;
    }

    const value = pendingValue.value;
    if (value === null || !isValidVisitPoints(value)) {
        return false;
    }

    return wouldBust.value;
});

const allowedDartCounts = computed(() => {
    const points = activePoints.value;
    if (points === null) {
        return [];
    }

    return achievableDartCounts(points);
});

const dartCountsForVisit = computed(() => {
    const points = lockedPoints.value;
    if (points === null) {
        return [];
    }

    if (dartCount.value !== null) {
        return [dartCount.value];
    }

    if (checkoutDart.value !== null) {
        return achievableDartCounts(points).filter((count) => count >= checkoutDart.value!);
    }

    return achievableDartCounts(points);
});

const visitBuildConstraints = computed(() => ({
    remainingBefore: props.remainingPoints,
    checkoutDart: checkoutDart.value ?? undefined,
    requireDoubleOut: props.outRule === 'double',
}));

const allowedCheckoutDarts = computed(() => {
    const points = lockedPoints.value;
    if (points === null) {
        return [];
    }

    return achievableCheckoutDarts(
        points,
        props.remainingPoints,
        dartCount.value,
        props.outRule === 'double',
    );
});

const allowedDoubleDartCounts = computed(() => {
    const points = lockedPoints.value;
    if (points === null) {
        return [];
    }

    return achievableDoubleDartCounts(points, dartCountsForVisit.value, visitBuildConstraints.value);
});

const statusHint = computed(() => {
    if (flowStep.value === 'dartCount') {
        return t('games.play.calculator.hintDartCount');
    }

    if (flowStep.value === 'checkoutDart') {
        return t('games.play.calculator.hintCheckoutDart');
    }

    if (flowStep.value === 'doubleDarts') {
        return t('games.play.calculator.hintDoubleDarts');
    }

    if (inputLocked.value) {
        return t('games.play.waitTurn');
    }

    if (isOverMax.value) {
        return t('games.play.calculator.hintOverMax');
    }

    if (pendingValue.value !== null && pendingValue.value > 180) {
        return t('games.play.calculator.hintOverMax');
    }

    if (isInvalidTotal.value) {
        return t('games.play.calculator.hintInvalidTotal');
    }

    if (wouldBust.value) {
        return t('games.play.calculator.hintBust');
    }

    if (
        pendingValue.value !== null
        && requiresCheckoutDart(pendingValue.value, props.remainingPoints, false)
    ) {
        return t('games.play.calculator.hintCheckout');
    }

    if (
        pendingValue.value !== null
        && requiresCheckoutDartCount(props.remainingPoints, props.trackCheckoutRate ?? false)
    ) {
        return t('games.play.calculator.hintCheckoutZone');
    }

    return t('games.play.calculator.hintScore');
});

function interact() {
    emit('closeChat');
}

function resetFlow() {
    flowStep.value = 'score';
    lockedPoints.value = null;
    dartCount.value = null;
    checkoutDart.value = null;
    doubleDarts.value = null;
    display.value = '';
}

watch(
    () => props.remainingPoints,
    () => {
        if (flowStep.value !== 'score') {
            resetFlow();
        }
    },
);

function quickScoreAllowed(score: number): boolean {
    if (inputLocked.value || !isValidVisitPoints(score)) {
        return false;
    }

    const remainingAfter = props.remainingPoints - score;

    if (remainingAfter < 0) {
        return false;
    }

    if (remainingAfter === 1 && props.outRule === 'double') {
        return false;
    }

    return true;
}

function visitWouldBust(points: number): boolean {
    const remainingAfter = props.remainingPoints - points;

    if (remainingAfter < 0) {
        return true;
    }

    if (remainingAfter === 1 && props.outRule === 'double') {
        return true;
    }

    return false;
}

function nextStepAfterScore(points: number): FlowStep | 'submit' {
    const bust = visitWouldBust(points);

    if (requiresCheckoutDartCount(props.remainingPoints, props.trackCheckoutRate ?? false)) {
        return 'dartCount';
    }

    if (requiresCheckoutDart(points, props.remainingPoints, bust)) {
        return 'checkoutDart';
    }

    if (requiresDoubleDartCount(points, props.remainingPoints, bust)) {
        return 'doubleDarts';
    }

    return 'submit';
}

function beginFlow(points: number) {
    lockedPoints.value = points;
    const next = nextStepAfterScore(points);

    if (next === 'submit') {
        emitPayload(points);
        resetFlow();
        return;
    }

    flowStep.value = next;

    if (next === 'dartCount' && allowedDartCounts.value.length === 1) {
        selectDartCount(allowedDartCounts.value[0]);
        return;
    }

    if (next === 'checkoutDart') {
        enterCheckoutDartStep();
        return;
    }

    if (next === 'doubleDarts') {
        enterDoubleDartsStep();
    }
}

function enterDoubleDartsStep() {
    flowStep.value = 'doubleDarts';

    if (allowedDoubleDartCounts.value.length === 1) {
        selectDoubleDarts(allowedDoubleDartCounts.value[0]);
    }
}

function enterCheckoutDartStep() {
    flowStep.value = 'checkoutDart';

    if (allowedCheckoutDarts.value.length === 1) {
        selectCheckoutDart(allowedCheckoutDarts.value[0]);
    }
}

function emitPayload(points: number) {
    const payload: CalculatorVisitPayload = { points };

    if (dartCount.value !== null) {
        payload.dartCount = dartCount.value;
    }

    if (checkoutDart.value !== null) {
        payload.checkoutDart = checkoutDart.value;
        payload.dartCount = Math.max(payload.dartCount ?? checkoutDart.value, checkoutDart.value);
    }

    if (doubleDarts.value !== null) {
        payload.doubleDarts = doubleDarts.value;
        payload.dartCount = Math.max(
            payload.dartCount ?? doubleDarts.value,
            doubleDarts.value,
            checkoutDart.value ?? 0,
        );
    }

    emit('throwPoints', payload);
}

function advanceFromDartCount() {
    const points = lockedPoints.value;
    if (points === null) {
        return;
    }

    const bust = visitWouldBust(points);

    if (requiresCheckoutDart(points, props.remainingPoints, bust)) {
        enterCheckoutDartStep();
        return;
    }

    if (requiresDoubleDartCount(points, props.remainingPoints, bust)) {
        enterDoubleDartsStep();
        return;
    }

    emitPayload(points);
    resetFlow();
}

function advanceFromCheckoutDart() {
    const points = lockedPoints.value;
    if (points === null) {
        return;
    }

    if (requiresDoubleDartCount(points, props.remainingPoints, visitWouldBust(points))) {
        enterDoubleDartsStep();
        return;
    }

    emitPayload(points);
    resetFlow();
}

function selectDartCount(count: number) {
    interact();
    if (!allowedDartCounts.value.includes(count)) {
        return;
    }

    dartCount.value = count;
    advanceFromDartCount();
}

function selectCheckoutDart(dart: number) {
    interact();
    if (!allowedCheckoutDarts.value.includes(dart)) {
        return;
    }

    checkoutDart.value = dart;
    advanceFromCheckoutDart();
}

function selectDoubleDarts(count: number) {
    interact();
    if (!allowedDoubleDartCounts.value.includes(count)) {
        return;
    }

    doubleDarts.value = count;

    if (lockedPoints.value !== null) {
        emitPayload(lockedPoints.value);
        resetFlow();
    }
}

function appendDigit(digit: string) {
    interact();
    if (inputLocked.value || flowStep.value !== 'score') {
        return;
    }

    if (!canAppendVisitDigit(display.value, digit)) {
        return;
    }

    display.value = `${display.value}${digit}`;
}

function appendOperator(operator: '+' | '-' | '*') {
    interact();
    if (inputLocked.value || flowStep.value !== 'score') {
        return;
    }

    if (display.value === '' || /[+\-*]$/.test(display.value)) {
        return;
    }

    display.value = `${display.value}${operator}`;
}

function quickScore(points: number) {
    interact();
    if (!quickScoreAllowed(points)) {
        return;
    }

    beginFlow(points);
}

function submitMiss() {
    interact();
    if (inputLocked.value || flowStep.value !== 'score') {
        return;
    }

    beginFlow(0);
}

function submitBust() {
    interact();
    const value = pendingValue.value;
    if (value === null || inputLocked.value || flowStep.value !== 'score') {
        return;
    }

    beginFlow(value);
}

function submitScore() {
    interact();
    const value = pendingValue.value;

    if (value === null || !canSubmitScore.value) {
        return;
    }

    beginFlow(value);
}

function clearDisplay() {
    interact();
    display.value = '';
}

function backspace() {
    interact();
    display.value = display.value.slice(0, -1);
}

function goBackStep() {
    interact();

    const points = lockedPoints.value;
    const bust = points !== null ? visitWouldBust(points) : false;

    if (flowStep.value === 'doubleDarts') {
        doubleDarts.value = null;
        flowStep.value =
            points !== null && requiresCheckoutDart(points, props.remainingPoints, bust)
                ? 'checkoutDart'
                : requiresCheckoutDartCount(props.remainingPoints, props.trackCheckoutRate ?? false)
                  ? 'dartCount'
                  : 'score';
        if (flowStep.value === 'checkoutDart') {
            checkoutDart.value = null;
        }
        if (flowStep.value === 'dartCount') {
            dartCount.value = null;
        }
        if (flowStep.value === 'score') {
            resetFlow();
        }
        return;
    }

    if (flowStep.value === 'checkoutDart') {
        checkoutDart.value = null;
        flowStep.value = requiresCheckoutDartCount(props.remainingPoints, props.trackCheckoutRate ?? false)
            ? 'dartCount'
            : 'score';
        if (flowStep.value === 'dartCount') {
            dartCount.value = null;
        }
        if (flowStep.value === 'score') {
            resetFlow();
        }
        return;
    }

    if (flowStep.value === 'dartCount') {
        dartCount.value = null;
        resetFlow();
    }
}

function isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
        return false;
    }

    const tag = target.tagName;

    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

function onKeyDown(event: KeyboardEvent) {
    if (inputLocked.value || flowStep.value !== 'score' || isTypingTarget(event.target)) {
        return;
    }

    if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        appendDigit(event.key);
        return;
    }

    if (event.key === 'Backspace') {
        event.preventDefault();
        backspace();
        return;
    }

    if (event.key === 'Delete') {
        event.preventDefault();
        clearDisplay();
        return;
    }

    if (event.key === 'Enter') {
        event.preventDefault();
        if (canSubmitBust.value) {
            submitBust();
        } else if (canSubmitScore.value) {
            submitScore();
        }
    }
}

onMounted(() => {
    window.addEventListener('keydown', onKeyDown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', onKeyDown);
});

defineExpose({
    quickScore,
    quickScoreAllowed,
});
</script>

<template>
    <section class="calc" :class="{ 'calc--expanded': externalQuickScores }" @click="interact">
        <div class="calc-display">
            <div class="calc-display-main">
                <span class="calc-value">{{ flowStep === 'score' ? (display || '0') : lockedPoints }}</span>
                <span v-if="flowStep !== 'score'" class="calc-step-badge">{{ t('games.play.calculator.stepDetail') }}</span>
            </div>
            <span class="calc-meta">{{ t('games.play.calculator.remaining', { count: remainingPoints }) }}</span>
        </div>

        <p class="calc-hint" :class="{ 'calc-hint--warn': wouldBust || isInvalidTotal || isOverMax, 'calc-hint--ok': canSubmitScore }">
            {{ statusHint }}
        </p>

        <template v-if="flowStep === 'score'">
            <CalcQuickScores
                v-if="!externalQuickScores"
                :disabled="inputLocked"
                :is-allowed="quickScoreAllowed"
                @select="quickScore"
            />

            <div class="calc-main">
                <div class="calc-grid">
                    <button
                        v-for="digit in ['7', '8', '9', '4', '5', '6', '1', '2', '3']"
                        :key="digit"
                        type="button"
                        class="calc-key"
                        :disabled="inputLocked"
                        @click="appendDigit(digit)"
                    >
                        {{ digit }}
                    </button>
                    <button
                        type="button"
                        class="calc-key calc-key--clear"
                        :disabled="inputLocked || display === ''"
                        @click="clearDisplay"
                    >
                        C
                    </button>
                    <button type="button" class="calc-key" :disabled="inputLocked" @click="appendDigit('0')">
                        0
                    </button>
                    <button
                        type="button"
                        class="calc-key calc-key--delete"
                        :disabled="inputLocked || display === ''"
                        :aria-label="t('games.play.calculator.delete')"
                        @click="backspace"
                    >
                        ⌫
                    </button>
                </div>

                <div class="calc-side">
                    <button type="button" class="calc-op" :disabled="inputLocked" @click="appendOperator('+')">+</button>
                    <button type="button" class="calc-op" :disabled="inputLocked" @click="appendOperator('-')">−</button>
                    <button type="button" class="calc-op" :disabled="inputLocked" @click="appendOperator('*')">×</button>
                </div>
            </div>

            <div class="calc-actions" :class="{ 'calc-actions--checkout': inCheckoutZone }">
                <button type="button" class="calc-action calc-action--miss" :disabled="inputLocked" @click="submitMiss">
                    {{ t('games.play.miss') }}
                </button>
                <button
                    v-if="inCheckoutZone"
                    type="button"
                    class="calc-action calc-action--bust"
                    :disabled="!canSubmitBust"
                    @click="submitBust"
                >
                    {{ t('games.play.calculator.bust') }}
                </button>
                <button
                    type="button"
                    class="calc-action calc-action--enter"
                    :disabled="inputLocked || !canSubmitScore"
                    @click="submitScore"
                >
                    {{ t('games.play.calculator.enter') }}
                </button>
            </div>
        </template>

        <template v-else>
            <div class="calc-flow">
                <button type="button" class="calc-flow-back" @click="goBackStep">
                    {{ t('games.play.calculator.back') }}
                </button>

                <div v-if="flowStep === 'dartCount'" class="calc-flow-choices">
                    <button
                        v-for="n in 3"
                        :key="`dc-${n}`"
                        type="button"
                        class="calc-flow-btn"
                        :disabled="!allowedDartCounts.includes(n)"
                        @click="selectDartCount(n)"
                    >
                        {{ n }}
                    </button>
                </div>

                <div v-else-if="flowStep === 'checkoutDart'" class="calc-flow-choices">
                    <button
                        v-for="n in allowedCheckoutDarts"
                        :key="`co-${n}`"
                        type="button"
                        class="calc-flow-btn"
                        @click="selectCheckoutDart(n)"
                    >
                        {{ t('games.play.calculatorVisit.dartNumber', { n }) }}
                    </button>
                </div>

                <div v-else-if="flowStep === 'doubleDarts'" class="calc-flow-choices calc-flow-choices--wrap">
                    <button
                        v-for="n in allowedDoubleDartCounts"
                        :key="`db-${n}`"
                        type="button"
                        class="calc-flow-btn"
                        @click="selectDoubleDarts(n)"
                    >
                        {{ n }}
                    </button>
                </div>
            </div>
        </template>
    </section>
</template>

<style scoped>
.calc {
    display: flex;
    flex-direction: column;
    gap: clamp(2px, 0.5vh, 4px);
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
    box-sizing: border-box;
    border-radius: var(--game-radius);
    border: 1px solid #1f2937;
    background: linear-gradient(165deg, rgba(19, 26, 38, 0.88), rgba(13, 18, 32, 0.94));
    padding: clamp(2px, 1vh, var(--game-panel-pad));
}

.calc-display {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 5px;
    padding: 3px 6px;
    border-radius: 10px;
    border: 1px solid rgba(57, 255, 20, 0.22);
    background: rgba(0, 0, 0, 0.25);
    flex-shrink: 0;
}

.calc-display-main {
    display: flex;
    align-items: baseline;
    gap: 8px;
    min-width: 0;
}

.calc-value {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: clamp(22px, 4.5vw, 30px);
    font-weight: 900;
    color: #39ff14;
    word-break: break-all;
}

.calc-step-badge {
    padding: 2px 6px;
    border-radius: 999px;
    border: 1px solid rgba(34, 211, 238, 0.35);
    background: rgba(34, 211, 238, 0.1);
    color: #22d3ee;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    white-space: nowrap;
}

.calc-meta {
    font-size: 10px;
    color: #64748b;
    font-weight: 700;
    text-transform: uppercase;
    flex-shrink: 0;
}

.calc-hint {
    margin: 0;
    flex-shrink: 0;
    color: #64748b;
    font-size: clamp(9px, 1.5vh, 12px);
    line-height: 1.15;
}

.calc-hint--warn {
    color: #fb2c5f;
}

.calc-hint--ok {
    color: #39ff14;
}

.calc--expanded .calc-main {
    flex: 1 1 auto;
}

.calc--expanded .calc-key,
.calc--expanded .calc-op {
    font-size: clamp(18px, 2.4vh, 24px);
}

.calc--expanded .calc-op {
    font-size: clamp(20px, 2.6vh, 26px);
}

.calc--expanded .calc-action {
    min-height: clamp(48px, 7vh, 58px);
    font-size: clamp(14px, 1.8vh, 18px);
}

.calc--expanded .calc-key--delete {
    font-size: clamp(18px, 2.2vh, 22px);
}

.calc-main {
    display: grid;
    grid-template-columns: minmax(0, 1fr) clamp(52px, 12vw, 64px);
    grid-template-rows: minmax(0, 1fr);
    align-items: stretch;
    gap: clamp(2px, 0.6vh, 5px);
    flex: 1 1 auto;
    min-height: 0;
}

.calc-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-template-rows: repeat(4, minmax(0, 1fr));
    gap: clamp(2px, 0.6vh, 5px);
    min-height: 0;
    height: 100%;
}

.calc-side {
    display: grid;
    grid-template-rows: repeat(3, minmax(0, 1fr));
    gap: clamp(2px, 0.6vh, 5px);
    min-height: 0;
    height: 100%;
    align-self: stretch;
}

.calc-key,
.calc-op,
.calc-flow-btn {
    min-height: 0;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(0, 0, 0, 0.18);
    color: #e2e8f0;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: clamp(16px, 3.2vw, 20px);
    font-weight: 800;
    cursor: pointer;
}

.calc-op {
    height: 100%;
    border-color: rgba(251, 191, 36, 0.25);
    background: rgba(251, 191, 36, 0.08);
    color: #fbbf24;
    font-size: clamp(18px, 3.6vw, 22px);
}

.calc-key--delete {
    border-color: rgba(148, 163, 184, 0.35);
    background: rgba(148, 163, 184, 0.12);
    color: #e2e8f0;
    font-size: clamp(16px, 3vw, 20px);
    letter-spacing: 0;
}

.calc-key--clear {
    border-color: rgba(251, 44, 95, 0.16);
    background: rgba(251, 44, 95, 0.04);
    color: rgba(251, 113, 133, 0.42);
    font-size: clamp(14px, 2.6vw, 16px);
    opacity: 1;
    cursor: not-allowed;
}

.calc-key--clear:not(:disabled) {
    border-color: rgba(251, 44, 95, 0.4);
    background: rgba(251, 44, 95, 0.14);
    color: #fb7185;
    cursor: pointer;
}

.calc-key--clear:not(:disabled):hover {
    border-color: rgba(251, 44, 95, 0.55);
    background: rgba(251, 44, 95, 0.2);
    color: #fda4af;
}

.calc-actions {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
    gap: clamp(2px, 0.6vh, 5px);
    flex-shrink: 0;
}

.calc-actions--checkout {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 2fr);
}

.calc-action {
    /* GARĀM/REĢISTRĒT ir galvenās pogas — palielinātas, vieta paņemta no
       apkārtējiem paddingiem/gapiem, ne no citiem elementiem. */
    min-height: clamp(54px, 8.5vh, 68px);
    border-radius: 10px;
    border: 1px solid transparent;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: clamp(16px, 3vw, 20px);
    font-weight: 900;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
}

.calc-action--miss {
    color: #fb7185;
    border-color: rgba(251, 44, 95, 0.35);
    background: rgba(251, 44, 95, 0.1);
}

.calc-action--enter {
    color: #39ff14;
    border-color: rgba(57, 255, 20, 0.35);
    background: rgba(57, 255, 20, 0.1);
}

.calc-action--bust {
    color: #fb7185;
    border-color: rgba(251, 44, 95, 0.35);
    background: rgba(251, 44, 95, 0.1);
}

.calc-flow {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.calc-flow-back {
    align-self: flex-start;
    padding: 6px 10px;
    border-radius: 8px;
    border: 1px solid #334155;
    background: rgba(255, 255, 255, 0.03);
    color: #94a3b8;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    cursor: pointer;
}

.calc-flow-choices {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: clamp(6px, 1vh, 10px);
    flex: 1 1 auto;
    align-content: start;
}

.calc-flow-choices--wrap {
    grid-template-columns: repeat(4, minmax(0, 1fr));
}

.calc-flow-btn {
    min-height: clamp(52px, 8vh, 64px);
    font-size: clamp(18px, 3.6vw, 24px);
}

.calc-flow-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.calc-key:disabled,
.calc-op:disabled,
.calc-action:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

.calc-key--clear:disabled {
    opacity: 1;
}
</style>
