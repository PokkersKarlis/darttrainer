import type { FriendEntry } from '@/stores/dartsLobby';

export function friendActivityClass(activity: FriendEntry['activity']): string {
    if (activity === 'in_game') {
        return 'xl-dot--red';
    }

    if (activity === 'in_lobby') {
        return 'xl-dot--cyan';
    }

    if (activity === 'away') {
        return 'xl-dot--amber';
    }

    return 'xl-dot--green';
}
