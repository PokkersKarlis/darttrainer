import api from '@/lib/axios';
import { getEcho } from '@/lib/echo';
import type { SharedData } from '@/types';
import { router, usePage } from '@inertiajs/vue3';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

export interface LobbyInvitePayload {
    id: number;
    match_uuid: string;
    host_name: string;
    lobby_code: string | null;
    player_count: number;
    created_at?: string | null;
}

type PageWithInvites = SharedData & {
    pendingLobbyInvites?: LobbyInvitePayload[];
    activeLobby?: { uuid: string } | null;
};

export function useLobbyInvites() {
    const page = usePage<PageWithInvites>();
    const localInvites = ref<LobbyInvitePayload[]>([]);
    const loadingInviteId = ref<number | null>(null);
    let echoChannel: ReturnType<NonNullable<ReturnType<typeof getEcho>>['private']> | null = null;

    watch(
        () => page.props.pendingLobbyInvites,
        (invites) => {
            localInvites.value = invites ? [...invites] : [];
        },
        { immediate: true, deep: true },
    );

    const visibleInvites = computed(() => {
        const activeUuid = page.props.activeLobby?.uuid;

        return localInvites.value.filter((invite) => invite.match_uuid !== activeUuid);
    });

    function upsertInvite(invite: LobbyInvitePayload) {
        const index = localInvites.value.findIndex((entry) => entry.id === invite.id);

        if (index === -1) {
            localInvites.value = [invite, ...localInvites.value];
            return;
        }

        localInvites.value[index] = invite;
    }

    function removeInvite(id: number) {
        localInvites.value = localInvites.value.filter((invite) => invite.id !== id);
    }

    function acceptInvite(invite: LobbyInvitePayload) {
        loadingInviteId.value = invite.id;

        router.post(
            route('darts.x01.lobby.invites.accept', invite.id),
            {},
            {
                onFinish: () => {
                    loadingInviteId.value = null;
                    removeInvite(invite.id);
                },
            },
        );
    }

    function declineInvite(invite: LobbyInvitePayload) {
        loadingInviteId.value = invite.id;

        void api.post(route('darts.x01.lobby.invites.decline', invite.id)).finally(() => {
            loadingInviteId.value = null;
            removeInvite(invite.id);
        });
    }

    onMounted(() => {
        const userId = page.props.auth?.user?.id;

        if (!userId) {
            return;
        }

        const echo = getEcho();

        if (!echo) {
            return;
        }

        echoChannel = echo.private(`user.${userId}`);
        echoChannel.listen('.LobbyInviteReceived', (payload: LobbyInvitePayload) => {
            upsertInvite(payload);
        });
        echoChannel.listen('.LobbyInviteDismissed', (payload: { id: number }) => {
            removeInvite(payload.id);
        });
    });

    onUnmounted(() => {
        if (echoChannel) {
            echoChannel.stopListening('.LobbyInviteReceived');
            echoChannel.stopListening('.LobbyInviteDismissed');
            echoChannel = null;
        }
    });

    return {
        visibleInvites,
        acceptInvite,
        declineInvite,
        loadingInviteId,
    };
}
