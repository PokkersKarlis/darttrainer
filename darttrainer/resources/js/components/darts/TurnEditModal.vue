<script setup lang="ts">
import type { RecentTurn } from '@/stores/dartsPlay';
import { useLocale } from '@/composables/useLocale';
import { computed, ref, watch } from 'vue';

type MultiplierKind = 'miss' | 'single' | 'double' | 'triple';

interface DartDraft {
    kind: MultiplierKind;
    sector: number;
}

const props = defineProps<{
    turn: RecentTurn | null;
    loading: boolean;
}>();

const emit = defineEmits<{
    save: [payload: { throws?: Array<{ sector: number; multiplier: number }>; points?: number }];
    close: [];
}>();

const { t } = useLocale();
const darts = ref<DartDraft[]>([]);
const visitPoints = ref<number>(0);

const isCalculatorTurn = computed(() => props.turn?.input_source === 'calculator');

function dartToDraft(sector: number, multiplier: number): DartDraft {
    if (sector === 0 || multiplier === 0) {
        return { kind: 'miss', sector: 0 };
    }

    if (multiplier === 3) {
        return { kind: 'triple', sector };
    }

    if (multiplier === 2) {
        return { kind: 'double', sector };
    }

    return { kind: 'single', sector };
}

function draftToThrow(draft: DartDraft): { sector: number; multiplier: number } | null {
    if (draft.kind === 'miss') {
        return { sector: 0, multiplier: 0 };
    }

    if (draft.kind === 'triple') {
        if (draft.sector < 1 || draft.sector > 20) {
            return null;
        }

        return { sector: draft.sector, multiplier: 3 };
    }

    if (draft.sector === 25) {
        return { sector: 25, multiplier: draft.kind === 'double' ? 2 : 1 };
    }

    if (draft.sector < 1 || draft.sector > 20) {
        return null;
    }

    return {
        sector: draft.sector,
        multiplier: draft.kind === 'double' ? 2 : 1,
    };
}

watch(
    () => props.turn,
    (turn) => {
        if (!turn) {
            darts.value = [];
            visitPoints.value = 0;
            return;
        }

        visitPoints.value = turn.is_bust ? 0 : turn.points_scored;
        darts.value = turn.throws.map((dart) => dartToDraft(dart.sector, dart.multiplier));
    },
    { immediate: true },
);

const canSaveBoard = computed(() => darts.value.every((dart) => draftToThrow(dart) !== null));

const canSaveCalculator = computed(() => {
    const value = visitPoints.value;
    return Number.isFinite(value) && value >= 0 && value <= 180;
});

const canSave = computed(() => (isCalculatorTurn.value ? canSaveCalculator.value : canSaveBoard.value));

function sectorOptions(kind: MultiplierKind): number[] {
    if (kind === 'miss') {
        return [0];
    }

    if (kind === 'triple') {
        return Array.from({ length: 20 }, (_, index) => index + 1);
    }

    return [...Array.from({ length: 20 }, (_, index) => index + 1), 25];
}

function onKindChange(index: number, kind: MultiplierKind) {
    const dart = darts.value[index];
    if (!dart) {
        return;
    }

    dart.kind = kind;

    if (kind === 'miss') {
        dart.sector = 0;
        return;
    }

    if (kind === 'triple' && dart.sector === 25) {
        dart.sector = 20;
    }

    if (dart.sector < 1) {
        dart.sector = 20;
    }
}

function stepSector(index: number, delta: number) {
    const dart = darts.value[index];
    if (!dart || dart.kind === 'miss') {
        return;
    }

    const options = sectorOptions(dart.kind);
    const currentIndex = options.indexOf(dart.sector);
    const baseIndex = currentIndex === -1 ? 0 : currentIndex;
    const nextIndex = (baseIndex + delta + options.length) % options.length;
    dart.sector = options[nextIndex] ?? options[0] ?? 1;
}

function clampVisitPoints() {
    if (!Number.isFinite(visitPoints.value)) {
        visitPoints.value = 0;
        return;
    }

    visitPoints.value = Math.min(180, Math.max(0, Math.round(visitPoints.value)));
}

function save() {
    if (!props.turn) {
        return;
    }

    if (isCalculatorTurn.value) {
        clampVisitPoints();
        if (!canSaveCalculator.value) {
            return;
        }

        emit('save', { points: visitPoints.value });
        return;
    }

    const throws = darts.value
        .map((dart) => draftToThrow(dart))
        .filter((dart): dart is { sector: number; multiplier: number } => dart !== null);

    if (throws.length === 0) {
        return;
    }

    emit('save', { throws });
}
</script>

<template>
    <div v-if="turn" class="edit-modal-bg" @click.self="$emit('close')">
        <div class="edit-modal">
            <h3 class="edit-modal__title">{{ t('games.play.turnEdit.title', { name: turn.player_name }) }}</h3>
            <p class="edit-modal__desc">
                {{ isCalculatorTurn ? t('games.play.turnEdit.calcDesc') : t('games.play.turnEdit.desc') }}
            </p>

            <div v-if="isCalculatorTurn" class="edit-modal__calc">
                <label class="edit-modal__calc-label" for="visit-points">{{ t('games.play.turnEdit.visitTotal') }}</label>
                <input
                    id="visit-points"
                    v-model.number="visitPoints"
                    type="number"
                    min="0"
                    max="180"
                    class="edit-modal__calc-input"
                    @blur="clampVisitPoints"
                />
                <p class="edit-modal__calc-hint">{{ t('games.play.turnEdit.maxVisit') }}</p>
            </div>

            <div v-else class="edit-modal__darts">
                <div v-for="(dart, index) in darts" :key="index" class="edit-modal__dart">
                    <p class="edit-modal__dart-label">{{ t('games.play.turnEdit.dart', { n: index + 1 }) }}</p>
                    <div class="edit-modal__dart-controls">
                        <select
                            class="edit-modal__select"
                            :value="dart.kind"
                            @change="onKindChange(index, ($event.target as HTMLSelectElement).value as MultiplierKind)"
                        >
                            <option value="miss">{{ t('games.play.miss') }}</option>
                            <option value="single">{{ t('games.play.single') }}</option>
                            <option value="double">{{ t('games.play.double') }}</option>
                            <option value="triple">{{ t('games.play.triple') }}</option>
                        </select>

                        <div v-if="dart.kind !== 'miss'" class="edit-modal__sector">
                            <button type="button" class="edit-modal__step" @click="stepSector(index, -1)">−</button>
                            <input
                                v-model.number="dart.sector"
                                type="number"
                                class="edit-modal__sector-input"
                                :min="dart.kind === 'triple' ? 1 : 1"
                                :max="dart.kind === 'triple' ? 20 : 25"
                            />
                            <button type="button" class="edit-modal__step" @click="stepSector(index, 1)">+</button>
                        </div>
                        <span v-else class="edit-modal__miss-tag">{{ t('games.play.miss') }}</span>
                    </div>
                </div>
            </div>

            <div class="edit-modal__actions">
                <button type="button" class="edit-btn edit-btn--ghost" :disabled="loading" @click="$emit('close')">
                    {{ t('games.play.turnEdit.cancel') }}
                </button>
                <button type="button" class="edit-btn edit-btn--save" :disabled="loading || !canSave" @click="save">
                    {{ t('games.play.turnEdit.save') }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.edit-modal-bg {
    position: fixed;
    inset: 0;
    z-index: 55;
    display: grid;
    place-items: center;
    padding: 16px;
    background: rgba(2, 6, 23, 0.78);
}

.edit-modal {
    width: min(100%, 420px);
    padding: 18px;
    border-radius: 16px;
    border: 1px solid rgba(57, 255, 20, 0.25);
    background: #0d1220;
}

.edit-modal__title {
    margin: 0 0 8px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 22px;
    font-weight: 900;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #f4f4f5;
}

.edit-modal__desc {
    margin: 0 0 14px;
    color: #94a3b8;
    font-size: 13px;
}

.edit-modal__calc {
    margin-bottom: 16px;
    padding: 12px;
    border-radius: 12px;
    border: 1px solid rgba(34, 211, 238, 0.25);
    background: rgba(34, 211, 238, 0.06);
}

.edit-modal__calc-label {
    display: block;
    margin-bottom: 8px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #64748b;
}

.edit-modal__calc-input {
    width: 100%;
    box-sizing: border-box;
    padding: 12px 14px;
    border-radius: 10px;
    border: 1px solid rgba(34, 211, 238, 0.35);
    background: #131a26;
    color: #22d3ee;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 32px;
    font-weight: 900;
    text-align: center;
}

.edit-modal__calc-input:focus {
    outline: none;
    border-color: rgba(34, 211, 238, 0.55);
    box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.15);
}

.edit-modal__calc-hint {
    margin: 8px 0 0;
    font-size: 11px;
    color: #64748b;
    text-align: center;
}

.edit-modal__darts {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 16px;
}

.edit-modal__dart {
    padding: 10px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(0, 0, 0, 0.18);
}

.edit-modal__dart-label {
    margin: 0 0 8px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #64748b;
}

.edit-modal__dart-controls {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
    align-items: center;
}

.edit-modal__select {
    width: 100%;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid #334155;
    background-color: #131a26;
    color: #f4f4f5;
    font-size: 12px;
    font-weight: 700;
    color-scheme: dark;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    padding-right: 32px;
}

.edit-modal__select:focus {
    outline: none;
    border-color: rgba(57, 255, 20, 0.45);
    box-shadow: 0 0 0 2px rgba(57, 255, 20, 0.12);
}

.edit-modal__select option {
    background-color: #0d1220;
    color: #f4f4f5;
}

.edit-modal__sector {
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.edit-modal__step {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    border: 1px solid rgba(57, 255, 20, 0.25);
    background: rgba(57, 255, 20, 0.08);
    color: #39ff14;
    font-size: 18px;
    font-weight: 800;
    cursor: pointer;
}

.edit-modal__sector-input {
    width: 52px;
    padding: 8px 6px;
    border-radius: 8px;
    border: 1px solid #334155;
    background: rgba(255, 255, 255, 0.04);
    color: #39ff14;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 20px;
    font-weight: 900;
    text-align: center;
}

.edit-modal__miss-tag {
    padding: 8px 12px;
    border-radius: 8px;
    background: rgba(148, 163, 184, 0.12);
    color: #94a3b8;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-decoration: line-through;
}

.edit-modal__actions {
    display: flex;
    gap: 8px;
}

.edit-btn {
    flex: 1;
    padding: 10px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    cursor: pointer;
}

.edit-btn--ghost {
    border: 1px solid #1f2937;
    background: transparent;
    color: #94a3b8;
}

.edit-btn--save {
    border: 1px solid rgba(57, 255, 20, 0.35);
    background: rgba(57, 255, 20, 0.12);
    color: #39ff14;
}
</style>
