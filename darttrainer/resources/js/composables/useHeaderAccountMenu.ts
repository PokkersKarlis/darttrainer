import { useLocale } from '@/composables/useLocale';
import type { HeaderMenuItem } from '@/types/header';
import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/vue3';
import { computed } from 'vue';

export function useHeaderAccountMenu() {
    const { t } = useLocale();
    const page = usePage<SharedData>();

    const user = computed(() => page.props.auth.user);

    const hasNotification = computed(() => !!user.value && !user.value.email_verified_at);

    const notificationMessage = computed(() => t('header.verifyEmail'));

    const items = computed<HeaderMenuItem[]>(() => [
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
    ]);

    return {
        user,
        hasNotification,
        notificationMessage,
        items,
    };
}
