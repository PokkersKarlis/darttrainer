<script setup lang="ts">
import type { ScoreboardRow, TurnTimerState } from '@/stores/dartsPlay';
import TurnTimer from '@/components/darts/TurnTimer.vue';
import { DISPLAY_NAME_MAX_LENGTH } from '@/lib/displayName';
import { useLocale } from '@/composables/useLocale';
import { computed } from 'vue';

const props = defineProps<{
    rows: ScoreboardRow[];
    currentLeg: number;
    legsTarget: number;
    currentSet: number;
    setsTarget: number;
    format: 'best_of' | 'first_to';
    startingPoints: number;
    status: string;
    winnerName?: string | null;
    showTimer?: boolean;
    turnTimer?: TurnTimerState | null;
    isActiveSide?: boolean;
}>();

const { t } = useLocale();

const useDualLane = computed(() => props.rows.length > 2);

const activeRow = computed(() => props.rows.find((row) => row.is_turn) ?? props.rows[0] ?? null);

const queueRows = computed(() => {
    if (!useDualLane.value || activeRow.value === null) {
        return [];
    }

    return props.rows.filter((row) => row.player_id !== activeRow.value?.player_id);
});

const formatLabel = computed(() => {
    if (showSets.value) {
        return props.format === 'best_of'
            ? t('games.play.bestOfSets', { count: props.setsTarget })
            : t('games.play.firstToSets', { count: props.setsTarget });
    }

    return props.format === 'best_of'
        ? t('games.play.bestOfLegs', { count: props.legsTarget })
        : t('games.play.firstToLegs', { count: props.legsTarget });
});

const showSets = computed(() => props.setsTarget > 1);

const shouldShowTimer = computed(
    () => props.showTimer !== false && props.status === 'active' && props.turnTimer != null,
);

function formatAverage(value: number | undefined): string {
    const avg = value ?? 0;
    return Number.isInteger(avg) ? String(avg) : avg.toFixed(1);
}

const headerLabel = computed(() => {
    const leg = t('games.play.legLabel', { current: props.currentLeg, target: props.legsTarget });

    if (!showSets.value) {
        return leg;
    }

    const set = t('games.play.setLabel', { current: props.currentSet, target: props.setsTarget });
    return `${set} · ${leg}`;
});
</script>

<template>
    <section class="sb" :class="{ 'sb--dual': useDualLane }">
        <header class="sb-head">
            <div class="sb-head__info">
                <p class="sb-kicker">{{ headerLabel }}</p>
                <p class="sb-meta">{{ formatLabel }} · {{ startingPoints }}</p>
            </div>
            <TurnTimer
                v-if="shouldShowTimer"
                header
                class="sb-head__timer"
                :timer="turnTimer!"
                :is-active-side="isActiveSide ?? false"
            />
            <p v-else-if="status === 'finished' && winnerName" class="sb-winner">
                {{ t('games.play.winner', { name: winnerName }) }}
            </p>
        </header>

        <template v-if="useDualLane && activeRow">
            <div class="sb-lanes">
                <article class="sb-row sb-row--turn sb-row--active-lane">
                    <div class="sb-active-main">
                        <p class="sb-active-meta">
                            <span class="sb-visit">{{ t('games.play.visitNumber', { count: activeRow.turn_number || 1 }) }}</span>
                            <span class="sb-turn-badge">{{ t('games.play.yourTurn') }}</span>
                        </p>
                        <div class="sb-active-foot">
                            <p class="sb-player-name sb-player-name--active" :title="activeRow.name">{{ activeRow.name }}</p>
                            <span class="sb-stats sb-stats--active">
                                <span class="sb-stat sb-stat--avg-leg">
                                    <span class="sb-stat__num">{{ formatAverage(activeRow.average_3pad_leg ?? activeRow.average_3pad) }}</span>
                                    <span class="sb-stat__lbl">{{ t('games.play.avgLegShort') }}</span>
                                </span>
                                <span class="sb-stat sb-stat--avg-match">
                                    <span class="sb-stat__num">{{ formatAverage(activeRow.average_3pad_match ?? activeRow.average_3pad) }}</span>
                                    <span class="sb-stat__lbl">{{ t('games.play.avgMatchShort') }}</span>
                                </span>
                                <span class="sb-stat sb-stat--win" :class="{ 'sb-stat--won': activeRow.legs_won > 0 }">
                                    <span class="sb-stat__num">{{ activeRow.legs_won }}</span>
                                    <span class="sb-stat__lbl">{{ t('games.play.legRecord') }}</span>
                                </span>
                                <span
                                    v-if="showSets"
                                    class="sb-stat sb-stat--win"
                                    :class="{ 'sb-stat--won': (activeRow.sets_won ?? 0) > 0 }"
                                >
                                    <span class="sb-stat__num">{{ activeRow.sets_won ?? 0 }}</span>
                                    <span class="sb-stat__lbl">{{ t('games.play.setRecord') }}</span>
                                </span>
                            </span>
                            <div class="sb-score-wrap sb-score-wrap--active">
                                <p class="sb-score">{{ activeRow.remaining_points }}</p>
                                <p class="sb-score-sub">{{ t('games.play.remaining') }}</p>
                            </div>
                        </div>
                    </div>
                </article>

                <ul class="sb-queue">
                    <li v-for="row in queueRows" :key="row.player_id" class="sb-queue-card">
                        <p class="sb-player-name sb-player-name--queue" :title="row.name">{{ row.name }}</p>
                        <p class="sb-queue-meta">
                            {{ t('games.play.visitNumber', { count: row.turn_number || 1 }) }}
                            · {{ row.remaining_points }}
                        </p>
                        <div class="sb-queue-bottom">
                            <span class="sb-queue-stat sb-queue-stat--avg-leg">
                                <span class="sb-queue-stat__num">{{ formatAverage(row.average_3pad_leg ?? row.average_3pad) }}</span>
                                <span class="sb-queue-stat__lbl">{{ t('games.play.avgLegShort') }}</span>
                            </span>
                            <span class="sb-queue-stat sb-queue-stat--avg-match">
                                <span class="sb-queue-stat__num">{{ formatAverage(row.average_3pad_match ?? row.average_3pad) }}</span>
                                <span class="sb-queue-stat__lbl">{{ t('games.play.avgMatchShort') }}</span>
                            </span>
                        </div>
                    </li>
                </ul>
            </div>
        </template>

        <ul v-else class="sb-list">
            <li v-for="row in rows" :key="row.player_id" class="sb-row" :class="{ 'sb-row--turn': row.is_turn }">
                <div class="sb-name-wrap">
                    <p class="sb-name">
                        {{ row.name }}
                        <span v-if="row.is_turn" class="sb-turn-badge">{{ t('games.play.yourTurn') }}</span>
                    </p>
                    <p class="sb-sub">
                        <span class="sb-visit">{{ t('games.play.visitNumber', { count: row.turn_number || 1 }) }}</span>
                    </p>
                    <span class="sb-stats">
                        <span class="sb-stat sb-stat--avg-leg">
                            <span class="sb-stat__num">{{ formatAverage(row.average_3pad_leg ?? row.average_3pad) }}</span>
                            <span class="sb-stat__lbl">{{ t('games.play.avgLegShort') }}</span>
                        </span>
                        <span class="sb-stat sb-stat--avg-match">
                            <span class="sb-stat__num">{{ formatAverage(row.average_3pad_match ?? row.average_3pad) }}</span>
                            <span class="sb-stat__lbl">{{ t('games.play.avgMatchShort') }}</span>
                        </span>
                        <span class="sb-stat sb-stat--win" :class="{ 'sb-stat--won': row.legs_won > 0 }">
                            <span class="sb-stat__num">{{ row.legs_won }}</span>
                            <span class="sb-stat__lbl">{{ t('games.play.legRecord') }}</span>
                        </span>
                        <span
                            v-if="showSets"
                            class="sb-stat sb-stat--win"
                            :class="{ 'sb-stat--won': (row.sets_won ?? 0) > 0 }"
                        >
                            <span class="sb-stat__num">{{ row.sets_won ?? 0 }}</span>
                            <span class="sb-stat__lbl">{{ t('games.play.setRecord') }}</span>
                        </span>
                    </span>
                </div>
                <div class="sb-score-wrap">
                    <p class="sb-score">{{ row.remaining_points }}</p>
                    <p class="sb-score-sub">{{ t('games.play.remaining') }}</p>
                </div>
            </li>
        </ul>
    </section>
</template>

<style scoped>
.sb {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: var(--game-radius);
    border: 1px solid #1f2937;
    background: linear-gradient(165deg, rgba(19, 26, 38, 0.92), rgba(13, 18, 32, 0.96));
    padding: clamp(3px, 1.6vh, 11px) clamp(4px, 2vw, 12px);
    box-sizing: border-box;
    container-type: size;
}

.sb-head {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: clamp(8px, 2vw, 12px);
    margin-bottom: clamp(3px, 1.5cqh, 5px);
    min-width: 0;
    overflow: visible;
}

.sb-head__info {
    flex: 1 1 auto;
    min-width: 0;
}

.sb-head__timer {
    flex: 0 0 auto;
    flex-shrink: 0;
    min-width: max(108px, 34%);
}

.sb-kicker {
    margin: 0;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: clamp(16px, 8cqh, 26px);
    font-weight: 900;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    line-height: 1.1;
}

.sb-meta {
    margin: 2px 0 0;
    color: #64748b;
    font-size: clamp(11px, 2vw, 13px);
    line-height: 1.2;
}

.sb-winner {
    margin: 0;
    padding: 5px 8px;
    border-radius: 999px;
    border: 1px solid rgba(57, 255, 20, 0.35);
    background: rgba(57, 255, 20, 0.08);
    color: #39ff14;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
}

.sb-lanes {
    flex: 1 1 auto;
    min-height: 0;
    container-type: size;
    display: flex;
    flex-direction: column;
    gap: clamp(4px, 2cqh, 6px);
    overflow: hidden;
}

.sb-list {
    list-style: none;
    margin: 0;
    padding: 0;
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: clamp(2px, 4cqh, 6px);
    overflow: hidden;
}

.sb-list .sb-row {
    /* Grīda (name+turn / stats) nesarūk zem satura minimuma — bez šīs
       grīdas rinda varētu tikt saspiesta zem teksta dabīgā augstuma, un
       "Gājiens N" rinda vizuāli pārklātos ar stat pillām. Ja tiešām
       nepietiek vietas, .sb-list savs overflow:hidden nogriezīs sarakstu,
       nevis salauzīs vienas rindas iekšējo izkārtojumu. */
    min-height: 32px;
}

.sb--dual .sb-row--active-lane {
    flex: 1 1 0;
    min-height: 44cqh;
    container-type: size;
    padding: max(14px, 8cqh) max(18px, 6cqw);
    align-items: stretch;
}

.sb-active-main {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: max(6px, 4cqh);
}

.sb-active-meta {
    margin: 0;
    display: flex;
    align-items: center;
    gap: clamp(4px, 0.8vw, 8px);
    min-width: 0;
}

.sb-active-foot {
    display: flex;
    align-items: center;
    gap: clamp(4px, 0.8vw, 8px);
    min-width: 0;
}

.sb-player-name {
    /* Nekad nepārsniedz konteinera platumu, bet arī necenšas būt platāks par
       DISPLAY_NAME_MAX_LENGTH rakstzīmēm — tā abas rindas (platā augšējā un
       šaurie 3 apakšējie bloki) drošai, ellipsis strādā pret reālo platumu. */
    margin: 0;
    min-width: 0;
    max-width: min(100%, calc(v-bind('DISPLAY_NAME_MAX_LENGTH') * 1ch));
    font-weight: 700;
    line-height: 1.1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.sb-player-name--active {
    flex: 0 0 auto;
    font-size: clamp(13px, 24cqh, 19px);
    color: #e2e8f0;
}

.sb-player-name--queue {
    flex: 0 0 auto;
    width: 100%;
    font-size: clamp(9px, 22cqh, 13px);
    color: #cbd5e1;
}

.sb-stats--active {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: nowrap;
    gap: clamp(2px, 0.5vw, 4px);
}

.sb--dual .sb-row--active-lane .sb-stat {
    min-width: max(24px, 14cqw);
    padding: max(3px, 2.5cqh) max(4px, 2cqw);
    border-radius: max(5px, 2cqmin);
}

.sb--dual .sb-row--active-lane .sb-stat__num {
    font-size: clamp(13px, 22cqh, 20px);
}

.sb--dual .sb-row--active-lane .sb-stat__lbl {
    margin-top: max(1px, 1cqh);
    font-size: clamp(7px, 12cqh, 9px);
}

.sb--dual .sb-row--active-lane .sb-turn-badge {
    margin-left: 0;
    flex-shrink: 0;
    padding: max(1px, 1cqh) max(4px, 2.5cqw);
    border-radius: 999px;
    border: 1px solid rgba(57, 255, 20, 0.35);
    background: rgba(57, 255, 20, 0.1);
    font-size: clamp(8px, 14cqh, 10px);
    line-height: 1.2;
}

.sb--dual .sb-row--active-lane .sb-visit {
    font-size: clamp(9px, 16cqh, 12px);
}

/* Kombinēts selektors ar lielāku specifiskumu — .sb-score-wrap (definēts
   zemāk failā) citādi ar vienādu specifiskumu uzvarētu pēc avota secības
   un pārrakstītu align-items/justify-content/gap zemāk. */
.sb-score-wrap.sb-score-wrap--active {
    /* Tāda pati "pill" kastīte kā pārējiem sb-stat elementiem, lai ATLIKUMS
       izskatās pozicionēts vienā rindā/stilā ar LEG VID./MAČS/LEGI, tikai
       nedaudz lielāks, jo tas ir galvenais skaitlis. */
    flex-shrink: 0;
    align-self: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: max(1px, 1cqh);
    padding: max(4px, 3cqh) max(10px, 4cqw);
    border-radius: max(6px, 2.5cqmin);
    border: 1px solid rgba(57, 255, 20, 0.4);
    background: rgba(57, 255, 20, 0.1);
}

.sb--dual .sb-row--active-lane .sb-score {
    font-size: clamp(20px, 34cqh, 38px);
}

.sb-row {
    flex: 1 1 0;
    min-height: 0;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--game-gap-sm);
    padding: clamp(2px, 5cqh, 10px) clamp(3px, 1.4vw, 12px);
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    background: rgba(0, 0, 0, 0.15);
}

.sb-row--turn {
    border-color: rgba(57, 255, 20, 0.35);
    background: linear-gradient(
        165deg,
        rgba(34, 48, 68, 0.72),
        rgba(28, 38, 56, 0.58)
    );
    box-shadow:
        0 0 16px rgba(57, 255, 20, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.sb-name-wrap {
    flex: 1 1 auto;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-rows: auto auto;
    align-items: center;
    column-gap: clamp(6px, 1.2vw, 10px);
    row-gap: clamp(0px, 1cqh, 2px);
}

.sb-name {
    grid-column: 1;
    grid-row: 1;
    margin: 0;
    font-weight: 700;
    font-size: clamp(14px, 9cqh, 28px);
    line-height: 1.1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.sb-turn-badge {
    margin-left: 6px;
    color: #39ff14;
    font-size: clamp(14px, 2.8vw, 17px);
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
}

.sb-sub {
    grid-column: 1;
    grid-row: 2;
    margin: 0;
    min-width: 0;
    overflow: hidden;
}

.sb-visit {
    display: block;
    color: #94a3b8;
    font-size: clamp(10px, 4.5cqh, 16px);
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: 0.02em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.sb-stats {
    grid-column: 2;
    grid-row: 1 / -1;
    align-self: center;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: nowrap;
    gap: clamp(3px, 0.6vw, 6px);
    min-width: 0;
}

.sb-stat {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 0 1 auto;
    min-width: clamp(28px, 8cqw, 48px);
    min-height: 100%;
    padding: clamp(3px, 2cqh, 6px) clamp(4px, 1vw, 10px);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
    box-sizing: border-box;
}

.sb-stat--avg-leg {
    border-color: rgba(251, 191, 36, 0.35);
    background: rgba(251, 191, 36, 0.08);
}

.sb-stat--avg-match {
    border-color: rgba(34, 211, 238, 0.32);
    background: rgba(34, 211, 238, 0.07);
}

.sb-stat--win {
    border-color: rgba(148, 163, 184, 0.22);
    background: rgba(148, 163, 184, 0.06);
}

.sb-stat--won {
    border-color: rgba(57, 255, 20, 0.45);
    background: rgba(57, 255, 20, 0.1);
    box-shadow: 0 0 12px rgba(57, 255, 20, 0.08);
}

.sb-stat__num {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: clamp(16px, 6cqh, 26px);
    font-weight: 900;
    line-height: 1;
    color: #e2e8f0;
}

.sb-stat--avg-leg .sb-stat__num {
    color: #fbbf24;
    text-shadow: 0 0 10px rgba(251, 191, 36, 0.18);
}

.sb-stat--avg-match .sb-stat__num {
    color: #22d3ee;
    text-shadow: 0 0 10px rgba(34, 211, 238, 0.18);
}

.sb-stat--win .sb-stat__num {
    color: #94a3b8;
}

.sb-stat--won .sb-stat__num {
    color: #39ff14;
    text-shadow: 0 0 10px rgba(57, 255, 20, 0.2);
}

.sb-stat__lbl {
    margin-top: 2px;
    font-size: clamp(7px, 2.8cqh, 10px);
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #64748b;
    line-height: 1;
    white-space: nowrap;
    text-align: center;
}

.sb-stat--avg-leg .sb-stat__lbl {
    color: #fcd34d;
}

.sb-stat--avg-match .sb-stat__lbl {
    color: #67e8f9;
}

.sb-stat--won .sb-stat__lbl {
    color: #86efac;
}

.sb-score-wrap {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;
    text-align: right;
    gap: 1px;
}

.sb-score {
    margin: 0;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: clamp(18px, 16cqh, 38px);
    font-weight: 900;
    color: #39ff14;
    line-height: 1;
    text-shadow: 0 0 14px rgba(57, 255, 20, 0.18);
}

.sb-score-sub {
    margin: 0;
    font-size: clamp(7px, 2.5cqh, 8px);
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #64748b;
    line-height: 1;
}

.sb-queue {
    list-style: none;
    margin: 0;
    padding: 0;
    /* Fiksēts flex-basis (nevis "auto"/pēc satura) — .sb-queue-card bērniem ir
       container-type: size (satura izmērs tiek ignorēts), tāpēc "auto" augstums
       sabrūktu līdz 0. Fiksēta cqh vērtība to apiet. */
    flex: 0 1 54cqh;
    min-height: 0;
    display: flex;
    align-items: stretch;
    gap: max(6px, 1.2cqw);
    overflow: hidden;
}

.sb-queue-card {
    flex: 1 1 0;
    min-width: 0;
    container-type: size;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: max(3px, 4cqh);
    padding: max(8px, 6cqh) max(8px, 6cqw);
    border-radius: max(6px, 2.5cqmin);
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(0, 0, 0, 0.2);
    overflow: hidden;
}

.sb-queue-meta {
    /* flex-shrink: 0 — bez tā šī bija vienīgā rinda kartē bez izmēra
       aizsardzības (vārdam flex-shrink:0, statistikai min-height), tāpēc
       flexbox to saspieda līdz neredzamībai, kad vietas pietrūka. */
    flex-shrink: 0;
    margin: 0;
    color: #64748b;
    font-size: clamp(8px, 20cqh, 11px);
    font-weight: 700;
    line-height: 1.15;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.sb-queue-bottom {
    flex: 1 1 auto;
    min-height: max(20px, 28cqh);
    display: flex;
    align-items: stretch;
    gap: max(2px, 3cqw);
    min-width: 0;
}

.sb-queue-stat {
    flex: 1 1 0;
    min-width: 0;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: max(2px, 5cqh) max(2px, 3cqw);
    border-radius: max(4px, 2cqmin);
    border: 1px solid rgba(148, 163, 184, 0.22);
    background: rgba(148, 163, 184, 0.06);
}

.sb-queue-stat--avg-leg {
    border-color: rgba(251, 191, 36, 0.32);
    background: rgba(251, 191, 36, 0.07);
}

.sb-queue-stat--avg-leg .sb-queue-stat__num {
    color: #fbbf24;
}

.sb-queue-stat--avg-leg .sb-queue-stat__lbl {
    color: #fcd34d;
}

.sb-queue-stat--avg-match {
    border-color: rgba(34, 211, 238, 0.3);
    background: rgba(34, 211, 238, 0.06);
}

.sb-queue-stat--avg-match .sb-queue-stat__num {
    color: #22d3ee;
}

.sb-queue-stat--avg-match .sb-queue-stat__lbl {
    color: #67e8f9;
}

.sb-queue-stat__num {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: clamp(12px, 32cqh, 20px);
    font-weight: 900;
    line-height: 1;
    color: #94a3b8;
}

.sb-queue-stat__lbl {
    margin-top: max(1px, 2cqh);
    font-size: clamp(6px, 16cqh, 9px);
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #64748b;
    line-height: 1;
    white-space: nowrap;
    text-align: center;
}

@container (max-width: 100px) {
    .sb-player-name--queue {
        font-size: max(7px, 24cqh);
    }

    .sb-queue-stat__lbl {
        font-size: max(5px, 14cqh);
    }
}

@container (max-height: 180px) {
    .sb-head {
        margin-bottom: 3px;
    }

    .sb-kicker {
        font-size: clamp(13px, 7cqh, 18px);
    }

    .sb-meta {
        font-size: 10px;
    }

    .sb-turn-badge {
        font-size: 10px;
        margin-left: 4px;
    }

    .sb-stat {
        min-width: clamp(24px, 7cqw, 36px);
        padding: 2px 4px;
    }
}
</style>
