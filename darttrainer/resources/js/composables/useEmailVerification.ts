import { useLocale } from '@/composables/useLocale';
import type { SharedData } from '@/types';
import { useForm, usePage } from '@inertiajs/vue3';
import { useIntervalFn } from '@vueuse/core';
import { computed, ref } from 'vue';

const RESEND_COOLDOWN_MINUTES = 3;

function parseTimestamp(value: string | null | undefined): Date | null {
    if (!value) {
        return null;
    }

    const parsed = new Date(value);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function useEmailVerification(status?: string | null) {
    const { locale } = useLocale();
    const page = usePage<SharedData>();
    const now = ref(Date.now());

    useIntervalFn(() => {
        now.value = Date.now();
    }, 10_000);

    const isVerified = computed(() => page.props.emailVerified);

    const sentAt = computed(() => {
        const explicit = parseTimestamp(page.props.emailVerificationSentAt);

        if (explicit) {
            return explicit;
        }

        if (isVerified.value) {
            return null;
        }

        return parseTimestamp(page.props.auth.user?.created_at ?? null);
    });

    const minutesSinceSent = computed(() => {
        if (!sentAt.value) {
            return 0;
        }

        return Math.max(0, Math.floor((now.value - sentAt.value.getTime()) / 60_000));
    });

    const canResend = computed(() => !isVerified.value && minutesSinceSent.value >= RESEND_COOLDOWN_MINUTES);

    const minutesUntilResend = computed(() =>
        Math.max(0, RESEND_COOLDOWN_MINUTES - minutesSinceSent.value),
    );

    const resendForm = useForm({ locale: locale.value });

    const resend = () => {
        if (!canResend.value || resendForm.processing) {
            return;
        }

        resendForm.locale = locale.value;
        resendForm.post(route('verification.send'), { preserveScroll: true });
    };

    const flashStatus = computed(() => status ?? null);

    return {
        isVerified,
        sentAt,
        minutesSinceSent,
        canResend,
        minutesUntilResend,
        resendForm,
        resend,
        flashStatus,
        userEmail: computed(() => page.props.auth.user?.email ?? ''),
    };
}
