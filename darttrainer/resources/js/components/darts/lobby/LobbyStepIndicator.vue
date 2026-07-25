<script setup lang="ts">
import { useLocale } from '@/composables/useLocale';

/**
 * Top 1/2/3 progress indicator for the lobby flow. Guests only ever see
 * step 1 highlighted (they never get their own config/setup steps), hosts
 * see all three.
 */
defineProps<{
    step: 1 | 2 | 3;
    isHost: boolean;
    hasLobby: boolean;
}>();

const { t } = useLocale();
</script>

<template>
    <div class="lsi-steps">
        <div class="lsi-step" :class="{ 'lsi-step--on': step === 1 || (!isHost && hasLobby) }">
            <span class="lsi-step-num">1</span>
            <span class="lsi-step-label">{{ t('games.lobby.stepPlayers') }}</span>
        </div>

        <template v-if="isHost">
            <div class="lsi-step-line" />
            <div class="lsi-step" :class="{ 'lsi-step--on': step === 2 }">
                <span class="lsi-step-num">2</span>
                <span class="lsi-step-label">{{ t('games.lobby.stepConfig') }}</span>
            </div>
            <div class="lsi-step-line" />
            <div class="lsi-step" :class="{ 'lsi-step--on': step === 3 }">
                <span class="lsi-step-num">3</span>
                <span class="lsi-step-label">{{ t('games.lobby.stepSetup') }}</span>
            </div>
        </template>
    </div>
</template>

<style scoped src="./LobbyStepIndicator.css"></style>
