import { usePage } from '@inertiajs/vue3';
import { computed } from 'vue';
import type { SharedData } from '@/types';

export function useAppVersion() {
    const page = usePage<SharedData>();
    const version = computed(() => page.props.appVersion ?? '');

    return { version };
}
