import api from '@/lib/axios';
import { getEcho } from '@/lib/echo';
import { onMounted, onUnmounted, ref } from 'vue';

export interface MatchChatMessage {
    id: number;
    user_id: number;
    user_name: string;
    body: string;
    created_at: string;
}

export function useMatchChat(matchUuid: string, canPost: () => boolean) {
    const messages = ref<MatchChatMessage[]>([]);
    const loading = ref(false);
    const sending = ref(false);
    const error = ref<string | null>(null);

    let cancelled = false;
    let echoCleanup: (() => void) | undefined;
    let pollInterval: number | undefined;

    async function fetchMessages(afterId?: number) {
        try {
            const params = afterId !== undefined ? { after: afterId } : undefined;
            const { data } = await api.get<{ data: MatchChatMessage[] }>(`/v1/darts/matches/${matchUuid}/chat`, { params });

            if (cancelled) {
                return;
            }

            if (afterId !== undefined) {
                const existing = new Set(messages.value.map((m) => m.id));
                for (const message of data.data) {
                    if (!existing.has(message.id)) {
                        messages.value.push(message);
                    }
                }
            } else {
                messages.value = data.data;
            }
        } catch {
            if (!cancelled) {
                error.value = 'chat-fetch-failed';
            }
        }
    }

    async function loadInitial() {
        loading.value = true;
        error.value = null;
        await fetchMessages();
        loading.value = false;
    }

    async function sendMessage(body: string) {
        if (!canPost()) {
            return;
        }

        sending.value = true;
        error.value = null;

        try {
            const { data } = await api.post<{ data: MatchChatMessage }>(`/v1/darts/matches/${matchUuid}/chat`, { body });
            const existing = messages.value.some((m) => m.id === data.data.id);
            if (!existing) {
                messages.value.push(data.data);
            }
        } catch {
            error.value = 'chat-send-failed';
        } finally {
            sending.value = false;
        }
    }

    function handleIncoming(message: MatchChatMessage) {
        if (messages.value.some((m) => m.id === message.id)) {
            return;
        }

        messages.value.push(message);
    }

    function start() {
        cancelled = false;
        void loadInitial();

        pollInterval = window.setInterval(() => {
            const lastId = messages.value.at(-1)?.id;
            void fetchMessages(lastId);
        }, 3000);

        const echo = getEcho();
        if (echo) {
            const channel = echo.private(`match.${matchUuid}`);
            channel.listen('.MatchChatMessageSent', (payload: MatchChatMessage) => {
                handleIncoming(payload);
            });

            echoCleanup = () => {
                channel.stopListening('.MatchChatMessageSent');
            };
        }
    }

    function stop() {
        cancelled = true;
        if (pollInterval !== undefined) {
            window.clearInterval(pollInterval);
        }
        echoCleanup?.();
        messages.value = [];
        loading.value = false;
        sending.value = false;
        error.value = null;
    }

    onMounted(start);
    onUnmounted(stop);

    return {
        messages,
        loading,
        sending,
        error,
        sendMessage,
        reload: loadInitial,
    };
}
