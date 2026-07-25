<script setup lang="ts">
import { useLocale } from '@/composables/useLocale';
import type { MatchChatMessage } from '@/composables/useMatchChat';
import { computed, nextTick, ref, watch } from 'vue';

const props = defineProps<{
    messages: MatchChatMessage[];
    loading: boolean;
    sending: boolean;
    canPost: boolean;
    currentUserId: number;
    compact?: boolean;
}>();

const emit = defineEmits<{
    send: [body: string];
}>();

const { t } = useLocale();
const draft = ref('');
const listRef = ref<HTMLElement | null>(null);

const sortedMessages = computed(() => [...props.messages].sort((a, b) => a.id - b.id));

function submit() {
    const body = draft.value.trim();
    if (!body || props.sending || !props.canPost) {
        return;
    }

    emit('send', body);
    draft.value = '';
}

function scrollToBottom() {
    const el = listRef.value;
    if (!el) {
        return;
    }

    el.scrollTop = el.scrollHeight;
}

watch(
    () => props.messages.length,
    async () => {
        await nextTick();
        scrollToBottom();
    },
);
</script>

<template>
    <section class="match-chat" :class="{ 'match-chat--compact': compact }">
        <header class="match-chat__head">
            <p class="match-chat__title">{{ t('games.play.chat.title') }}</p>
        </header>

        <div ref="listRef" class="match-chat__list">
            <p v-if="loading" class="match-chat__empty">{{ t('games.play.chat.loading') }}</p>
            <p v-else-if="sortedMessages.length === 0" class="match-chat__empty">{{ t('games.play.chat.empty') }}</p>
            <article
                v-for="message in sortedMessages"
                :key="message.id"
                class="match-chat__msg"
                :class="message.user_id === currentUserId ? 'match-chat__msg--mine' : 'match-chat__msg--theirs'"
            >
                <p class="match-chat__author">
                    {{ message.user_id === currentUserId ? t('games.play.chat.you') : message.user_name }}
                </p>
                <p class="match-chat__body">{{ message.body }}</p>
            </article>
        </div>

        <form v-if="canPost" class="match-chat__form" @submit.prevent="submit">
            <input
                v-model="draft"
                type="text"
                maxlength="500"
                class="match-chat__input"
                :placeholder="t('games.play.chat.placeholder')"
                :disabled="sending"
            />
            <button type="submit" class="match-chat__send" :disabled="sending || !draft.trim()">
                {{ t('games.play.chat.send') }}
            </button>
        </form>
        <p v-else class="match-chat__readonly">{{ t('games.play.chat.readonly') }}</p>
    </section>
</template>

<style scoped>
.match-chat {
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 100%;
    border-radius: var(--game-radius);
    border: 1px solid #1f2937;
    background: linear-gradient(165deg, rgba(19, 26, 38, 0.92), rgba(13, 18, 32, 0.96));
}

.match-chat--compact {
    max-height: min(38vh, 320px);
}

.match-chat__head {
    padding: 10px 12px 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.match-chat__title {
    margin: 0;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 16px;
    font-weight: 900;
    letter-spacing: 0.06em;
    text-transform: uppercase;
}

.match-chat__list {
    flex: 1 1 auto;
    min-height: 80px;
    overflow-y: auto;
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.match-chat__empty {
    margin: auto 0;
    text-align: center;
    color: #64748b;
    font-size: 12px;
}

.match-chat__msg {
    max-width: 88%;
    padding: 8px 10px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.match-chat__msg--mine {
    align-self: flex-end;
    background: rgba(57, 255, 20, 0.1);
    border-color: rgba(57, 255, 20, 0.25);
}

.match-chat__msg--theirs {
    align-self: flex-start;
    background: rgba(34, 211, 238, 0.08);
    border-color: rgba(34, 211, 238, 0.2);
}

.match-chat__author {
    margin: 0 0 4px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #94a3b8;
}

.match-chat__msg--mine .match-chat__author {
    color: #39ff14;
}

.match-chat__msg--theirs .match-chat__author {
    color: #22d3ee;
}

.match-chat__body {
    margin: 0;
    font-size: 13px;
    line-height: 1.45;
    color: #e2e8f0;
    word-break: break-word;
}

.match-chat__form {
    display: flex;
    gap: 8px;
    padding: 8px 10px 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.match-chat__input {
    flex: 1 1 auto;
    min-width: 0;
    padding: 9px 10px;
    border-radius: 10px;
    border: 1px solid #1f2937;
    background: rgba(255, 255, 255, 0.03);
    color: #f8fafc;
    font-size: 13px;
}

.match-chat__send {
    flex: 0 0 auto;
    padding: 9px 12px;
    border-radius: 10px;
    border: 1px solid rgba(57, 255, 20, 0.35);
    background: rgba(57, 255, 20, 0.12);
    color: #39ff14;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
}

.match-chat__readonly {
    margin: 0;
    padding: 8px 10px 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    font-size: 11px;
    color: #64748b;
    text-align: center;
}
</style>
