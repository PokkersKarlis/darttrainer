<script setup lang="ts">
import { useLocale } from '@/composables/useLocale';
import type { LobbyMode } from '@/stores/dartsLobby';
import { Globe, Target } from 'lucide-vue-next';

/** Step 1 "online vs local" mode choice, shown before a lobby exists. */
defineProps<{
    creating: boolean;
    mode: LobbyMode;
}>();

const emit = defineEmits<{
    select: [mode: 'online' | 'local'];
}>();

const { t } = useLocale();
</script>

<template>
    <div class="lmp-grid">
        <button type="button" class="lmp-card" :disabled="creating" @click="emit('select', 'online')">
            <span class="lmp-icon-well lmp-icon-well--cyan">
                <Globe :size="22" :stroke-width="2.2" />
            </span>
            <span class="lmp-label">{{ t('games.lobby.online') }}</span>
            <span class="lmp-desc">{{ t('games.lobby.onlineDesc') }}</span>
        </button>

        <button
            type="button"
            class="lmp-card"
            :class="{ 'lmp-card--on': creating && mode === 'local' }"
            :disabled="creating"
            @click="emit('select', 'local')"
        >
            <span class="lmp-icon-well">
                <Target :size="22" :stroke-width="2.2" />
            </span>
            <span class="lmp-label">{{ t('games.lobby.local') }}</span>
            <span class="lmp-desc">{{ t('games.lobby.localDesc') }}</span>
        </button>
    </div>
</template>

<style scoped src="./LobbyModePicker.css"></style>
