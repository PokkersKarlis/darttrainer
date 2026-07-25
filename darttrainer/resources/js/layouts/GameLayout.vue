<script setup lang="ts">
import LobbyInviteBanner from '@/components/darts/LobbyInviteBanner.vue';
import { useGameResponsive } from '@/composables/useGameResponsive';
import { GameViewportRemeasureKey, useGameViewportFit } from '@/composables/useGameViewportFit';
import { useLocale } from '@/composables/useLocale';
import '@/styles/game-frame.css';
import { computed, provide, ref, toRef } from 'vue';

const props = defineProps<{
    playerName: string;
    isPremium?: boolean;
    lobbyCode?: string | null;
    showLobbyCode?: boolean;
    fillViewport?: boolean;
}>();

defineEmits<{
    exit: [];
    copyCode: [];
}>();

const { t } = useLocale();
const { frame } = useGameResponsive();
const viewportRef = ref<HTMLElement | null>(null);
const stageRef = ref<HTMLElement | null>(null);
const { remeasure } = useGameViewportFit(viewportRef, stageRef, frame, toRef(() => props.fillViewport ?? false));

provide(GameViewportRemeasureKey, remeasure);

const frameClass = computed(() => ({
    'game-frame--landscape': frame.value === 'landscape',
    'game-frame--portrait': frame.value === 'portrait',
    'game-frame--square': frame.value === 'square',
}));
</script>

<template>
    <div class="game-shell" :class="frameClass" :data-frame="frame">
        <div class="game-atmosphere" aria-hidden="true">
            <div class="game-glow game-glow--a" />
            <div class="game-glow game-glow--b" />
            <div class="game-grid" />
        </div>

        <header class="game-header backdrop-blur-md">
            <button type="button" class="game-exit" @click="$emit('exit')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
                    <path d="M15 18l-6-6 6-6" />
                </svg>
                {{ t('games.header.exit') }}
            </button>

            <div class="game-player">
                <span class="game-player-name">{{ playerName }}</span>
                <span v-if="isPremium" class="game-premium">{{ t('games.header.premium') }}</span>
            </div>

            <button
                v-if="showLobbyCode && lobbyCode"
                type="button"
                class="game-code backdrop-blur-md bg-white/10"
                @click="$emit('copyCode')"
            >
                <span class="game-code-label">{{ t('games.header.lobbyCode') }}</span>
                <span class="game-code-value">{{ lobbyCode }}</span>
            </button>
            <div v-else class="game-header-actions">
                <slot name="header-actions" />
            </div>
        </header>

        <LobbyInviteBanner />

        <main class="game-main">
            <div ref="viewportRef" class="game-viewport" :class="{ 'game-viewport--fill': fillViewport }">
                <div ref="stageRef" class="game-stage" :class="{ 'game-stage--fill': fillViewport }">
                    <slot />
                </div>
            </div>
        </main>
    </div>
</template>

<style scoped>
.game-shell {
    --game-bg: #0b0f19;
    --game-green: #39ff14;
    --game-cyan: #22d3ee;
    --game-line: #1f2937;
    --game-text: #f4f4f5;

    position: fixed;
    inset: 0;
    display: grid;
    grid-template-rows: auto 1fr;
    overflow: hidden;
    background: var(--game-bg);
    color: var(--game-text);
    font-family: Inter, sans-serif;
}

.game-atmosphere {
    pointer-events: none;
    position: absolute;
    inset: 0;
    z-index: 0;
}

.game-glow {
    position: absolute;
    border-radius: 50%;
}

.game-glow--a {
    top: -18%;
    left: -12%;
    width: 520px;
    height: 520px;
    background: radial-gradient(circle, rgba(57, 255, 20, 0.12), transparent 68%);
}

.game-glow--b {
    bottom: -20%;
    right: -10%;
    width: 480px;
    height: 480px;
    background: radial-gradient(circle, rgba(34, 211, 238, 0.08), transparent 70%);
}

.game-grid {
    position: absolute;
    inset: 0;
    opacity: 0.24;
    background-image:
        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 48px 48px;
}

.game-header {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: nowrap;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(13, 18, 32, 0.72);
}

.game-exit {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 10px;
    border-radius: 10px;
    border: 1px solid var(--game-line);
    background: rgba(255, 255, 255, 0.03);
    color: #94a3b8;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.2s ease;
}

.game-exit:hover {
    color: var(--game-green);
    border-color: rgba(57, 255, 20, 0.35);
}

.game-player {
    flex: 1 1 auto;
    min-width: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
}

.game-player-name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: clamp(14px, 2.4vw, 18px);
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
}

.game-premium {
    flex-shrink: 0;
    padding: 3px 8px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #0b0f19;
    background: linear-gradient(135deg, #fbbf24, #39ff14);
}

.game-code {
    flex: 0 0 auto;
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    padding: 7px 10px;
    border-radius: 10px;
    border: 1px solid rgba(57, 255, 20, 0.25);
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
}

.game-code:hover {
    border-color: rgba(57, 255, 20, 0.45);
    box-shadow: 0 0 18px rgba(57, 255, 20, 0.12);
}

.game-code-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #64748b;
}

.game-code-value {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: clamp(13px, 2.2vw, 16px);
    font-weight: 900;
    letter-spacing: 0.12em;
    color: var(--game-green);
}

.game-code-spacer,
.game-header-actions {
    flex: 0 1 auto;
    min-width: 0;
    display: flex;
    justify-content: flex-end;
}

.game-frame--portrait .game-header-actions,
.game-frame--square .game-header-actions {
    flex: 1 1 auto;
    overflow: hidden;
}

.game-main {
    position: relative;
    z-index: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.game-viewport--fill {
    align-items: stretch;
}

.game-stage--fill {
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.game-frame--square .game-header {
    padding: 10px 12px;
    gap: 8px;
}

.game-frame--portrait .game-header {
    /* Brutāli minimizēts — katrs px header augstumā ir px, kas nav
       pieejams kalkulatora pogām zemāk. */
    padding: 4px 6px;
    gap: 5px;
}

.game-frame--square .game-exit {
    padding: 7px 8px;
    gap: 4px;
}

.game-frame--portrait .game-exit {
    padding: 4px 5px;
    gap: 3px;
}

.game-frame--square .game-code {
    gap: 6px;
    padding: 6px 8px;
}

.game-frame--portrait .game-code {
    gap: 3px;
    padding: 3px 5px;
}

.game-frame--portrait .game-code-label,
.game-frame--square .game-code-label {
    display: none;
}
</style>
