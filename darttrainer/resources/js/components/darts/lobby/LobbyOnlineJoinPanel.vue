<script setup lang="ts">
import { useLocale } from '@/composables/useLocale';
import { ArrowLeft, Globe, Wifi } from 'lucide-vue-next';

/** Step 1 "online" sub-menu: join an existing lobby by code, or create a new one. */
defineProps<{
    joinCode: string;
    loading: boolean;
    creating: boolean;
}>();

const emit = defineEmits<{
    back: [];
    input: [event: Event];
    join: [];
    create: [];
}>();

const { t } = useLocale();
</script>

<template>
    <div class="loj-menu">
        <button type="button" class="loj-back" @click="emit('back')">
            <ArrowLeft :size="16" />
            {{ t('games.lobby.backToModes') }}
        </button>

        <div class="loj-panel">
            <div class="loj-head">
                <span class="loj-icon-well">
                    <Wifi :size="18" />
                </span>
                <div>
                    <p class="loj-title">{{ t('games.lobby.joinTitle') }}</p>
                    <p class="loj-desc">{{ t('games.lobby.joinDesc') }}</p>
                </div>
            </div>
            <div class="loj-row">
                <input
                    :value="joinCode"
                    type="text"
                    inputmode="numeric"
                    maxlength="9"
                    class="loj-input"
                    :placeholder="t('games.lobby.joinPlaceholder')"
                    autocomplete="off"
                    spellcheck="false"
                    @input="emit('input', $event)"
                    @keyup.enter="emit('join')"
                />
                <button type="button" class="loj-btn loj-btn--green" :disabled="loading" @click="emit('join')">
                    {{ t('games.lobby.joinAction') }}
                </button>
            </div>
        </div>

        <div class="loj-divider">
            <span>{{ t('games.lobby.orDivider') }}</span>
        </div>

        <button type="button" class="loj-create" :disabled="creating" @click="emit('create')">
            <Globe :size="20" />
            {{ t('games.lobby.createLobby') }}
        </button>
    </div>
</template>

<style scoped src="./LobbyOnlineJoinPanel.css"></style>
