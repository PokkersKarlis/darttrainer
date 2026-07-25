<script setup lang="ts">
import { useLocale } from '@/composables/useLocale';

/** Host-only back/next footer. Rendering (isLobbyHost) is decided by the parent. */
defineProps<{
    showBack: boolean;
    nextDisabled: boolean;
    loading: boolean;
    nextLabel: string;
}>();

const emit = defineEmits<{
    back: [];
    next: [];
}>();

const { t } = useLocale();
</script>

<template>
    <footer class="lft-footer game-page__footer">
        <button v-if="showBack" type="button" class="lft-btn lft-btn--ghost" @click="emit('back')">
            {{ t('games.lobby.back') }}
        </button>
        <button type="button" class="lft-start" :disabled="nextDisabled || loading" @click="emit('next')">
            <span v-if="loading" class="lft-start-spinner" />
            {{ nextLabel }}
        </button>
    </footer>
</template>

<style scoped src="./LobbyFooter.css"></style>
