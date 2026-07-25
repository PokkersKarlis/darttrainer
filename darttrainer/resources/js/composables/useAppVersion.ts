import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/vue3';
import { computed } from 'vue';

export function useAppVersion() {
    const page = usePage<SharedData>();
    const version = computed(() => page.props.appVersion ?? '');

    return { version };
}
