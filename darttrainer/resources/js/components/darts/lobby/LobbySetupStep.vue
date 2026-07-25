<script setup lang="ts">
import { getInitials } from '@/composables/useInitials';
import { useLocale } from '@/composables/useLocale';
import { useDartsLobbyStore, type LobbyPlayer } from '@/stores/dartsLobby';
import { ChevronDown, ChevronUp } from 'lucide-vue-next';
import { computed } from 'vue';

/**
 * Step 3 body: first-thrower pick (2p) or throw-order reordering (3-4p),
 * plus per-player custom starting points. The four v-models are draft
 * state owned by the parent (DartsLobby.vue) — it initializes them when
 * entering step 3 (initSetupStep) and reads them back on submit
 * (saveSetupAndStart), this component only mutates them.
 */
const props = defineProps<{
    players: LobbyPlayer[];
}>();

const setupOrder = defineModel<number[]>('setupOrder', { required: true });
const firstThrowerId = defineModel<number | null>('firstThrowerId', { required: true });
const customScores = defineModel<Record<number, string>>('customScores', { required: true });
const useCustomScore = defineModel<Record<number, boolean>>('useCustomScore', { required: true });

const { t } = useLocale();
const store = useDartsLobbyStore();

const isTwoPlayerSetup = computed(() => props.players.length === 2);

function playerById(id: number) {
    return props.players.find((player) => player.id === id);
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
</script>

<template>
    <div v-if="isTwoPlayerSetup" class="lst-card">
        <p class="lst-kicker">{{ t('games.lobby.firstThrowerTitle') }}</p>
        <p class="lst-hint">{{ t('games.lobby.firstThrowerHint') }}</p>
        <div class="lst-first-row">
            <button
                v-for="playerId in setupOrder"
                :key="playerId"
                type="button"
                class="lst-first-btn"
                :class="{ 'lst-first-btn--on': firstThrowerId === playerId }"
                @click="firstThrowerId = playerId"
            >
                <span class="lst-avatar">{{ getInitials(playerById(playerId)?.display_name ?? '?') }}</span>
                <span>{{ playerById(playerId)?.display_name }}</span>
            </button>
        </div>
    </div>

    <div v-else class="lst-card">
        <p class="lst-kicker">{{ t('games.lobby.throwOrderTitle') }}</p>
        <p class="lst-hint">{{ t('games.lobby.throwOrderHint') }}</p>
        <ul class="lst-order">
            <li v-for="(playerId, index) in setupOrder" :key="playerId" class="lst-order-item">
                <span class="lst-slot">{{ index + 1 }}</span>
                <span class="lst-name">{{ playerById(playerId)?.display_name }}</span>
                <div class="lst-order-actions">
                    <button
                        type="button"
                        class="lst-arrow"
                        :disabled="index === 0"
                        :aria-label="t('games.lobby.moveUp')"
                        @click="moveSetupPlayer(index, -1)"
                    >
                        <ChevronUp :size="16" />
                    </button>
                    <button
                        type="button"
                        class="lst-arrow"
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

    <div class="lst-card">
        <p class="lst-kicker">{{ t('games.lobby.customStartingPoints') }}</p>
        <p class="lst-hint">{{ t('games.lobby.customStartingPointsHint', { points: store.config.starting_points }) }}</p>
        <ul class="lst-scores">
            <li v-for="playerId in setupOrder" :key="`score-${playerId}`" class="lst-score-item">
                <span class="lst-name">{{ playerById(playerId)?.display_name }}</span>
                <div class="lst-score-controls">
                    <button
                        type="button"
                        class="lst-score-toggle"
                        :class="{ 'lst-score-toggle--on': useCustomScore[playerId] }"
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
                        class="lst-input lst-input--score"
                        :placeholder="String(store.config.starting_points)"
                    />
                </div>
            </li>
        </ul>
    </div>
</template>

<style scoped src="./LobbySetupStep.css"></style>
