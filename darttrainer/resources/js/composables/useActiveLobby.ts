import type { SharedData } from '@/types';
import { router, usePage } from '@inertiajs/vue3';
import { computed } from 'vue';

export interface ActiveLobby {
    uuid: string;
    mode: 'online' | 'local';
    is_host: boolean;
    status: 'lobby' | 'active';
    lobby_code: string | null;
    player_count: number;
}

type PageWithActiveLobby = SharedData & {
    activeLobby?: ActiveLobby | null;
};

function lobbyPaths(lobby: ActiveLobby): string[] {
    return [`/darts/x01/multiplayer/${lobby.uuid}`, `/darts/x01/play/${lobby.uuid}`];
}

export function useActiveLobby() {
    const page = usePage<PageWithActiveLobby>();

    const activeLobby = computed(() => page.props.activeLobby ?? null);

    const showBanner = computed(() => {
        const lobby = activeLobby.value;

        if (!lobby) {
            return false;
        }

        const path = new URL(page.url, 'http://localhost').pathname;

        if (path === '/darts/x01/multiplayer') {
            return false;
        }

        return !lobbyPaths(lobby).includes(path);
    });

    function goToActiveLobby(): void {
        const lobby = activeLobby.value;

        if (!lobby) {
            return;
        }

        if (lobby.status === 'active') {
            router.visit(route('darts.x01.play', lobby.uuid));
            return;
        }

        router.visit(route('darts.x01.lobby.show', lobby.uuid));
    }

    return {
        activeLobby,
        isActiveMatch: computed(() => activeLobby.value?.status === 'active'),
        showBanner,
        goToActiveLobby,
    };
}
