<script setup lang="ts">
import GameCheckbox from '@/components/darts/GameCheckbox.vue';
import { useLocale } from '@/composables/useLocale';
import { useDartsLobbyStore } from '@/stores/dartsLobby';
import { computed } from 'vue';

/**
 * Step 2 body: format/legs/sets + game type/rules. Binds straight to
 * store.config (Pinia), same pattern as LocalLobbyPanel using the store
 * directly rather than prop-drilling every field.
 */
const { t } = useLocale();
const store = useDartsLobbyStore();

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

function setInRule(rule: 'straight' | 'double') {
    store.config.in_rule = rule;
}

function setOutRule(rule: 'straight' | 'double') {
    store.config.out_rule = rule;
}
</script>

<template>
    <div class="lcf-grid">
        <div class="lcf-card">
            <p class="lcf-label">{{ t('games.lobby.format') }}</p>
            <p class="lcf-hint">{{ formatHint }}</p>
            <div class="lcf-toggle-row">
                <button
                    type="button"
                    class="lcf-segment"
                    :class="{ 'lcf-segment--on': store.config.format === 'best_of' }"
                    @click="store.config.format = 'best_of'"
                >
                    {{ t('games.lobby.formatBestOf') }}
                </button>
                <button
                    type="button"
                    class="lcf-segment"
                    :class="{ 'lcf-segment--on': store.config.format === 'first_to' }"
                    @click="store.config.format = 'first_to'"
                >
                    {{ t('games.lobby.formatFirstTo') }}
                </button>
            </div>

            <div class="lcf-stepper-block">
                <div class="lcf-stepper-head">
                    <span class="lcf-stepper-label">{{ t('games.lobby.legs') }}</span>
                    <span class="lcf-stepper-hint">{{ t('games.lobby.legsHint') }}</span>
                </div>
                <div class="lcf-stepper">
                    <button
                        type="button"
                        class="lcf-stepper-btn"
                        :disabled="store.config.legs_target <= 1"
                        aria-label="-"
                        @click="adjustLegs(-1)"
                    >
                        −
                    </button>
                    <span class="lcf-stepper-value">{{ store.config.legs_target }}</span>
                    <button type="button" class="lcf-stepper-btn" aria-label="+" @click="adjustLegs(1)">+</button>
                </div>
            </div>

            <div class="lcf-stepper-block">
                <div class="lcf-stepper-head">
                    <span class="lcf-stepper-label">{{ t('games.lobby.sets') }}</span>
                    <span class="lcf-stepper-hint">{{ t('games.lobby.setsHint') }}</span>
                </div>
                <div class="lcf-stepper">
                    <button
                        type="button"
                        class="lcf-stepper-btn"
                        :disabled="store.config.sets_target <= 1"
                        aria-label="-"
                        @click="adjustSets(-1)"
                    >
                        −
                    </button>
                    <span class="lcf-stepper-value">{{ store.config.sets_target }}</span>
                    <button type="button" class="lcf-stepper-btn" aria-label="+" @click="adjustSets(1)">+</button>
                </div>
            </div>
        </div>

        <div class="lcf-card">
            <p class="lcf-label">{{ t('games.lobby.gameType') }}</p>

            <p class="lcf-sublabel">{{ t('games.lobby.startingPoints') }}</p>
            <p class="lcf-hint">{{ startingPointsHint }}</p>
            <div class="lcf-toggle-row">
                <button
                    type="button"
                    class="lcf-segment"
                    :class="{ 'lcf-segment--on': store.config.starting_points === 301 }"
                    @click="store.applyStartingPoints(301)"
                >
                    301
                </button>
                <button
                    type="button"
                    class="lcf-segment"
                    :class="{ 'lcf-segment--on': store.config.starting_points === 501 }"
                    @click="store.applyStartingPoints(501)"
                >
                    501
                </button>
            </div>
            <span class="lcf-preset-badge">{{ t('games.lobby.scoringPreset', { preset: scoringPreset }) }}</span>

            <p class="lcf-sublabel">{{ t('games.lobby.startRule') }}</p>
            <p class="lcf-hint">{{ startRuleHint }}</p>
            <div class="lcf-toggle-row">
                <button
                    type="button"
                    class="lcf-segment"
                    :class="{ 'lcf-segment--on': store.config.in_rule === 'straight' }"
                    @click="setInRule('straight')"
                >
                    SI
                </button>
                <button
                    type="button"
                    class="lcf-segment"
                    :class="{ 'lcf-segment--on': store.config.in_rule === 'double' }"
                    @click="setInRule('double')"
                >
                    DI
                </button>
            </div>

            <p class="lcf-sublabel">{{ t('games.lobby.finishRule') }}</p>
            <p class="lcf-hint">{{ finishRuleHint }}</p>
            <div class="lcf-toggle-row">
                <button
                    type="button"
                    class="lcf-segment"
                    :class="{ 'lcf-segment--on': store.config.out_rule === 'straight' }"
                    @click="setOutRule('straight')"
                >
                    SO
                </button>
                <button
                    type="button"
                    class="lcf-segment"
                    :class="{ 'lcf-segment--on': store.config.out_rule === 'double' }"
                    @click="setOutRule('double')"
                >
                    DO
                </button>
            </div>

            <div class="lcf-check-block">
                <GameCheckbox v-model="store.config.track_checkout_rate">
                    {{ t('games.lobby.checkoutRate') }}
                </GameCheckbox>
                <p class="lcf-hint">{{ t('games.lobby.checkoutRateHint') }}</p>
            </div>

            <div class="lcf-check-block">
                <GameCheckbox v-model="store.config.is_public">
                    {{ t('games.lobby.publicMatch') }}
                </GameCheckbox>
                <p class="lcf-hint">{{ t('games.lobby.publicMatchHint') }}</p>
            </div>
        </div>
    </div>
</template>

<style scoped src="./LobbyConfigStep.css"></style>
