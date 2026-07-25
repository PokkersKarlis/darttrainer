<script setup lang="ts">
import { useLocale } from '@/composables/useLocale';

defineProps<{
    show: boolean;
    loading: boolean;
}>();

const emit = defineEmits<{
    cancel: [];
    confirm: [];
}>();

const { t } = useLocale();
</script>

<template>
    <div v-if="show" class="lem-bg" @click.self="emit('cancel')">
        <div class="lem-modal">
            <h3 class="lem-title">{{ t('games.lobby.exitTitle') }}</h3>
            <p class="lem-desc">{{ t('games.lobby.exitDesc') }}</p>
            <div class="lem-actions">
                <button type="button" class="lem-btn lem-btn--ghost" @click="emit('cancel')">
                    {{ t('games.lobby.cancel') }}
                </button>
                <button type="button" class="lem-btn lem-btn--danger" :disabled="loading" @click="emit('confirm')">
                    {{ t('games.lobby.confirmExit') }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped src="./LobbyExitConfirmModal.css"></style>
