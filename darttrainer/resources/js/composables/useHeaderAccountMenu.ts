import { useLocale } from '@/composables/useLocale';
import type { HeaderMenuItem } from '@/types/header';
import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/vue3';
import { computed } from 'vue';

export function useHeaderAccountMenu() {
    const { t } = useLocale();
    const page = usePage<SharedData>();

    const user = computed(() => page.props.auth.user);

    const pendingFriendRequestsCount = computed(() => page.props.pendingFriendRequestsCount ?? 0);

    const hasNotification = computed(() => {
        if (!user.value) {
            return false;
        }

        if (pendingFriendRequestsCount.value > 0) {
            return true;
        }

        return !user.value.email_verified_at;
    });

    const notificationMessage = computed(() => {
        if (pendingFriendRequestsCount.value > 0) {
            return t('header.friendRequests', { count: pendingFriendRequestsCount.value });
        }

        if (user.value && !user.value.email_verified_at) {
            return t('header.verifyEmail');
        }

        return '';
    });

    const notificationTitle = computed(() => notificationMessage.value);

    const items = computed<HeaderMenuItem[]>(() => {
        const menuItems: HeaderMenuItem[] = [];

        if (pendingFriendRequestsCount.value > 0) {
            menuItems.push({
                key: 'friends',
                label: t('menu.friends'),
                href: route('friends.edit'),
            });
        }

        menuItems.push(
            {
                key: 'settings',
                label: t('menu.settings'),
                href: route('profile.edit'),
            },
            {
                key: 'logout',
                label: t('menu.logout'),
                href: route('logout'),
                method: 'post',
                variant: 'danger',
            },
        );

        return menuItems;
    });

    return {
        user,
        hasNotification,
        notificationMessage,
        notificationTitle,
        items,
    };
}
