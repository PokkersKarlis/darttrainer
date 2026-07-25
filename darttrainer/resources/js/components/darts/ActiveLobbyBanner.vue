<script setup lang="ts">
import { useActiveLobby } from '@/composables/useActiveLobby';
import { useLocale } from '@/composables/useLocale';
import { Globe, Monitor, Target } from 'lucide-vue-next';
import { computed } from 'vue';

const { t } = useLocale();
const { activeLobby, isActiveMatch, showBanner, goToActiveLobby } = useActiveLobby();

const modeLabel = computed(() => {
    if (!activeLobby.value) {
        return '';
    }

    return activeLobby.value.mode === 'online' ? t('games.lobby.online') : t('games.lobby.local');
});
</script>

<template>
    <div v-if="showBanner && activeLobby" class="alb" role="status">
        <div class="alb-inner">
            <span class="alb-badge" aria-hidden="true">
                <Monitor :size="14" :stroke-width="2.4" />
                {{ isActiveMatch ? t('games.lobby.activeMatchElsewhere') : t('games.lobby.activeLobbyElsewhere') }}
            </span>

            <p class="alb-text">
                {{
                    isActiveMatch ? t('games.lobby.activeMatchBanner', { mode: modeLabel }) : t('games.lobby.activeLobbyBanner', { mode: modeLabel })
                }}
                <span v-if="!isActiveMatch && activeLobby.lobby_code" class="alb-code">
                    {{ t('games.lobby.activeLobbyCode', { code: activeLobby.lobby_code }) }}
                </span>
            </p>

            <button type="button" class="alb-action" @click="goToActiveLobby">
                <Globe v-if="activeLobby.mode === 'online'" :size="15" :stroke-width="2.2" />
                <Target v-else :size="15" :stroke-width="2.2" />
                {{ isActiveMatch ? t('games.lobby.returnToMatch') : t('games.lobby.returnToLobby') }}
            </button>
        </div>
    </div>
</template>

<style scoped>
.alb {
    border-bottom: 1px solid rgba(251, 191, 36, 0.28);
    background:
        radial-gradient(ellipse at left, rgba(251, 191, 36, 0.1), transparent 55%),
        linear-gradient(90deg, rgba(19, 26, 38, 0.98), rgba(13, 18, 32, 0.98));
}

.alb-inner {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: nowrap;
    padding: 10px 20px;
}

.alb-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid rgba(251, 191, 36, 0.45);
    background: rgba(251, 191, 36, 0.1);
    color: #fbbf24;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: nowrap;
    flex-shrink: 0;
}

.alb-text {
    flex: 1 1 auto;
    min-width: 0;
    margin: 0;
    color: #cbd5e1;
    font-size: 13px;
    line-height: 1.45;
}

.alb-code {
    display: inline-block;
    margin-left: 8px;
    color: #22d3ee;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}

.alb-action {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border-radius: 999px;
    border: 1px solid rgba(57, 255, 20, 0.45);
    background: rgba(57, 255, 20, 0.08);
    color: #39ff14;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: pointer;
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease,
        background 0.2s ease;
    white-space: nowrap;
    flex-shrink: 0;
}

.alb-action:hover {
    transform: translateY(-1px);
    background: rgba(57, 255, 20, 0.14);
    box-shadow: 0 8px 24px rgba(57, 255, 20, 0.12);
}

@media (max-width: 640px) {
    .alb-inner {
        padding: 10px 12px;
        gap: 8px;
    }

    .alb-badge {
        display: none;
    }

    .alb-code {
        display: block;
        margin: 4px 0 0;
    }
}

@media (prefers-reduced-motion: reduce) {
    .alb-action {
        transition: none;
    }

    .alb-action:hover {
        transform: none;
    }
}
</style>
