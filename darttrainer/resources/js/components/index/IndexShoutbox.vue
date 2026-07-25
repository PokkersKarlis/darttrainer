<script setup lang="ts">
import api from '@/lib/axios';
import { getEcho } from '@/lib/echo';
import { useLocale } from '@/composables/useLocale';
import { onMounted, onUnmounted, ref } from 'vue';

export interface ShoutboxMessage {
    id: number;
    user_id: number;
    user_name: string;
    body: string;
    created_at: string;
}

const props = defineProps<{
    userId: number;
}>();

const { t } = useLocale();
const messages = ref<ShoutboxMessage[]>([]);
const loading = ref(false);
const sending = ref(false);
const draft = ref('');

async function load() {
    loading.value = true;
    try {
        const { data } = await api.get<{ data: ShoutboxMessage[] }>('/v1/shoutbox');
        messages.value = data.data;
    } finally {
        loading.value = false;
    }
}

async function send() {
    const body = draft.value.trim();
    if (!body || sending.value) {
        return;
    }

    sending.value = true;
    try {
        const { data } = await api.post<{ data: ShoutboxMessage }>('/v1/shoutbox', { body });
        if (!messages.value.some((m) => m.id === data.data.id)) {
            messages.value.push(data.data);
        }
        draft.value = '';
    } finally {
        sending.value = false;
    }
}

onMounted(() => {
    void load();

    const echo = getEcho();
    if (echo) {
        echo.channel('shoutbox').listen('.ShoutboxMessageSent', (payload: ShoutboxMessage) => {
            if (!messages.value.some((m) => m.id === payload.id)) {
                messages.value.push(payload);
            }
        });
    }
});

onUnmounted(() => {
    const echo = getEcho();
    echo?.leave('shoutbox');
});
</script>

<template>
    <section class="shoutbox">
        <header class="shoutbox__head">
            <p class="shoutbox__title">{{ t('index.shoutbox.title') }}</p>
            <p class="shoutbox__sub">{{ t('index.shoutbox.retention') }}</p>
        </header>

        <div class="shoutbox__list">
            <p v-if="loading" class="shoutbox__empty">{{ t('index.shoutbox.loading') }}</p>
            <p v-else-if="messages.length === 0" class="shoutbox__empty">{{ t('index.shoutbox.empty') }}</p>
            <article
                v-for="message in messages"
                :key="message.id"
                class="shoutbox__msg"
                :class="message.user_id === userId ? 'shoutbox__msg--mine' : 'shoutbox__msg--theirs'"
            >
                <p class="shoutbox__author">{{ message.user_id === userId ? t('index.shoutbox.you') : message.user_name }}</p>
                <p class="shoutbox__body">{{ message.body }}</p>
            </article>
        </div>

        <form class="shoutbox__form" @submit.prevent="send">
            <input v-model="draft" type="text" maxlength="500" class="shoutbox__input" :placeholder="t('index.shoutbox.placeholder')" />
            <button type="submit" class="shoutbox__send" :disabled="sending || !draft.trim()">{{ t('index.shoutbox.send') }}</button>
        </form>
    </section>
</template>

<style scoped>
.shoutbox {
    border-radius: 16px;
    border: 1px solid rgba(57, 255, 20, 0.18);
    background: linear-gradient(165deg, rgba(19, 26, 38, 0.92), rgba(13, 18, 32, 0.96));
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 220px;
}

.shoutbox__title {
    margin: 0;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 20px;
    font-weight: 900;
    letter-spacing: 0.06em;
    text-transform: uppercase;
}

.shoutbox__sub {
    margin: 4px 0 0;
    font-size: 11px;
    color: #64748b;
}

.shoutbox__list {
    flex: 1;
    min-height: 120px;
    max-height: 280px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.shoutbox__empty {
    margin: auto 0;
    text-align: center;
    color: #64748b;
    font-size: 13px;
}

.shoutbox__msg {
    max-width: 90%;
    padding: 8px 10px;
    border-radius: 10px;
}

.shoutbox__msg--mine {
    align-self: flex-end;
    background: rgba(57, 255, 20, 0.1);
    border: 1px solid rgba(57, 255, 20, 0.25);
}

.shoutbox__msg--theirs {
    align-self: flex-start;
    background: rgba(34, 211, 238, 0.08);
    border: 1px solid rgba(34, 211, 238, 0.2);
}

.shoutbox__author {
    margin: 0 0 4px;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    color: #94a3b8;
}

.shoutbox__body {
    margin: 0;
    font-size: 13px;
    color: #e2e8f0;
}

.shoutbox__form {
    display: flex;
    gap: 8px;
}

.shoutbox__input {
    flex: 1;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid #1f2937;
    background: rgba(255, 255, 255, 0.03);
    color: #f8fafc;
}

.shoutbox__send {
    padding: 10px 14px;
    border-radius: 10px;
    border: 1px solid rgba(57, 255, 20, 0.35);
    background: rgba(57, 255, 20, 0.12);
    color: #39ff14;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    cursor: pointer;
}
</style>
