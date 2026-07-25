<script setup lang="ts">
import { useLocale } from '@/composables/useLocale';
import { isMissDart, shortBoardDartLabel } from '@/lib/turnDisplay';
import type { RecentTurn } from '@/stores/dartsPlay';
import { computed, nextTick, ref, watch } from 'vue';

const props = defineProps<{
    turns: RecentTurn[];
    editable: boolean;
    playerId: number | null;
    /** Local pass-and-play: host may edit every completed visit. */
    canEditAllTurns?: boolean;
}>();

defineEmits<{
    edit: [turn: RecentTurn];
}>();

const { t } = useLocale();
const listRef = ref<HTMLElement | null>(null);

/** Chronological order (oldest → newest, matches API). */
const displayTurns = computed(() => props.turns);

function orderedThrows(turn: RecentTurn) {
    return [...turn.throws].sort((a, b) => (a.throw_number ?? 0) - (b.throw_number ?? 0));
}

watch(
    () => props.turns.map((turn) => `${turn.turn_id}-${turn.throws.length}-${turn.points_scored}`).join('|'),
    async () => {
        await nextTick();
        const el = listRef.value;
        if (el) {
            el.scrollLeft = el.scrollWidth;
        }
    },
);

function canEditTurn(turn: RecentTurn): boolean {
    if (!props.editable || !turn.is_complete) {
        return false;
    }

    if (props.canEditAllTurns) {
        return true;
    }

    return props.playerId !== null && turn.player_id === props.playerId;
}

function editTurnTitle(turn: RecentTurn): string {
    if (!canEditTurn(turn)) {
        return t('games.play.turnHistory.viewOnly');
    }

    if (props.canEditAllTurns && !isOwnTurn(turn)) {
        return t('games.play.turnHistory.editAny');
    }

    return t('games.play.turnHistory.editOwn');
}

function isOwnTurn(turn: RecentTurn): boolean {
    return props.playerId !== null && turn.player_id === props.playerId;
}

function isCalculatorTurn(turn: RecentTurn): boolean {
    return turn.input_source === 'calculator';
}
</script>

<template>
    <section v-if="turns.length > 0" class="turn-hist">
        <div ref="listRef" class="turn-hist__list">
            <button
                v-for="turn in displayTurns"
                :key="turn.turn_id"
                type="button"
                class="turn-hist__item"
                :class="{
                    'turn-hist__item--bust': turn.is_bust,
                    'turn-hist__item--mine': isOwnTurn(turn),
                    'turn-hist__item--readonly': editable && turn.is_complete && !canEditTurn(turn),
                    'turn-hist__item--editable': canEditTurn(turn),
                    'turn-hist__item--calc': isCalculatorTurn(turn),
                }"
                :disabled="!canEditTurn(turn)"
                :title="editTurnTitle(turn)"
                @click="$emit('edit', turn)"
            >
                <div class="turn-hist__top">
                    <span class="turn-hist__head">
                        <span class="turn-hist__visit">{{ t('games.play.turnHistory.visitShort', { n: turn.turn_number }) }}</span>
                        <span class="turn-hist__name">{{ turn.player_name }}</span>
                    </span>
                    <span class="turn-hist__score" :class="{ 'turn-hist__score--hot': !turn.is_bust && turn.points_scored > 95 }">
                        {{ turn.is_bust ? '0' : turn.points_scored }}
                    </span>
                </div>

                <div class="turn-hist__detail">
                    <span v-if="turn.is_bust" class="turn-hist__bust-mark" aria-label="Bust">X</span>

                    <span v-else-if="isCalculatorTurn(turn)" class="turn-hist__calc-total">{{ turn.points_scored }}</span>

                    <span v-else class="turn-hist__darts">
                        <span
                            v-for="(dart, index) in orderedThrows(turn)"
                            :key="`${turn.turn_id}-${dart.throw_number ?? index}`"
                            class="turn-hist__dart"
                            :class="{ 'turn-hist__dart--miss': isMissDart(dart.sector, dart.multiplier) }"
                        >
                            {{ shortBoardDartLabel(dart.sector, dart.multiplier) }}
                        </span>
                    </span>
                </div>
            </button>
        </div>
    </section>
</template>

<style scoped>
.turn-hist {
    border-radius: var(--game-radius);
    border: 1px solid #1f2937;
    background: rgba(0, 0, 0, 0.12);
    padding: 3px 5px;
    height: 100%;
    min-height: 0;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.turn-hist__list {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 2px;
    scroll-snap-type: x proximity;
    -webkit-overflow-scrolling: touch;
    flex: 1 1 auto;
    min-height: 0;
    align-items: stretch;
}

.turn-hist__list::-webkit-scrollbar {
    height: 4px;
}

.turn-hist__list::-webkit-scrollbar-thumb {
    background: rgba(57, 255, 20, 0.35);
    border-radius: 999px;
}

.turn-hist__item {
    flex: 0 0 auto;
    width: clamp(100px, 26vw, 148px);
    min-width: 100px;
    max-width: 148px;
    height: 100%;
    min-height: 40px;
    scroll-snap-align: start;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 2px;
    padding: 3px 5px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(255, 255, 255, 0.02);
    color: inherit;
    text-align: left;
    cursor: default;
    opacity: 0.82;
    box-sizing: border-box;
}

.turn-hist__item--calc {
    width: clamp(80px, 18vw, 108px);
    min-width: 80px;
    max-width: 108px;
}

.turn-hist__item--mine {
    border-color: rgba(34, 211, 238, 0.2);
    background: rgba(34, 211, 238, 0.05);
    opacity: 1;
}

.turn-hist__item--editable {
    cursor: pointer;
    border-color: rgba(57, 255, 20, 0.28);
    box-shadow: inset 0 0 0 1px rgba(57, 255, 20, 0.08);
    opacity: 1;
}

.turn-hist__item--editable:hover {
    border-color: rgba(57, 255, 20, 0.45);
    background: rgba(57, 255, 20, 0.06);
}

.turn-hist__item--readonly {
    opacity: 0.55;
    cursor: not-allowed;
}

.turn-hist__item--bust .turn-hist__score {
    color: #fb2c5f;
}

.turn-hist__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 6px;
    min-width: 0;
}

.turn-hist__head {
    display: flex;
    align-items: baseline;
    gap: 4px;
    min-width: 0;
    flex: 1 1 auto;
}

.turn-hist__visit {
    flex-shrink: 0;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #64748b;
}

.turn-hist__name {
    min-width: 0;
    font-size: 10px;
    font-weight: 700;
    color: #94a3b8;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.turn-hist__item--mine .turn-hist__name {
    color: #22d3ee;
}

.turn-hist__item--mine .turn-hist__visit {
    color: #22d3ee;
}

.turn-hist__score {
    flex-shrink: 0;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: clamp(15px, 2.8vh, 20px);
    font-weight: 900;
    color: #e2e8f0;
    line-height: 1;
}

.turn-hist__score--hot {
    color: #39ff14;
    text-shadow: 0 0 10px rgba(57, 255, 20, 0.45);
}

.turn-hist__detail {
    flex: 0 0 auto;
    min-height: 20px;
    display: flex;
    align-items: center;
}

.turn-hist__darts {
    display: flex;
    flex-wrap: nowrap;
    gap: 3px;
    align-items: center;
    overflow: hidden;
}

.turn-hist__dart {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    padding: 2px 4px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(0, 0, 0, 0.2);
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.02em;
    color: #f8fafc;
    white-space: nowrap;
    flex-shrink: 0;
}

.turn-hist__dart--miss {
    min-width: 18px;
    color: #fbbf24;
    border-color: rgba(251, 191, 36, 0.35);
}

.turn-hist__bust-mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 999px;
    border: 1px solid rgba(251, 44, 95, 0.45);
    background: rgba(251, 44, 95, 0.12);
    color: #fb2c5f;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 14px;
    font-weight: 900;
    line-height: 1;
}

.turn-hist__calc-total {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.04em;
    color: #22d3ee;
}
</style>
