<script setup lang="ts">
import { useLocale } from '@/composables/useLocale';
import { Check, Copy } from 'lucide-vue-next';

/** Host-only "share this code" panel, shown while an online lobby is waiting for players. */
defineProps<{
    code: string;
    copied: boolean;
    playerCount: number;
}>();

const emit = defineEmits<{
    copy: [];
}>();

const { t } = useLocale();
</script>

<template>
    <div class="lcs-panel">
        <p class="lcs-kicker">{{ t('games.lobby.shareCode') }}</p>
        <div class="lcs-row">
            <p class="lcs-value">{{ code }}</p>
            <button type="button" class="lcs-copy" @click="emit('copy')">
                <Check v-if="copied" :size="16" />
                <Copy v-else :size="16" />
            </button>
        </div>
        <p class="lcs-hint">{{ t('games.lobby.waitingPlayers', { count: playerCount }) }}</p>
    </div>
</template>

<style scoped src="./LobbyCodeShare.css"></style>
