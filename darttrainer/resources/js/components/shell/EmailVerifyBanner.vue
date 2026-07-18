<script setup>
/**
 * E-pasta apstiprināšanas banneris. Rādās ielogotam lietotājam ar neapstiprinātu e-pastu.
 * Poga atkārtoti nosūta apstiprinājuma vēstuli caur Inertia (POST /email/verification-notification).
 */
import { ref } from 'vue';
import { router } from '@inertiajs/vue3';
import { useI18n } from '@/composables/useI18n.js';
import { useToast } from '@/composables/useToast.js';

const { t } = useI18n();
const { toast } = useToast();

const resendBusy = ref(false);

function resend() {
    if (resendBusy.value) return;
    resendBusy.value = true;

    router.post(
        '/email/verification-notification',
        {},
        {
            preserveScroll: true,
            onSuccess: () => toast(t('auth.resendSent'), 'success'),
            onError: () => toast(t('common.error'), 'error'),
            onFinish: () => {
                resendBusy.value = false;
            },
        },
    );
}
</script>

<template>
    <div class="dt-app-notice-verify" role="status">
        <div class="dt-app-notice-verify__title">{{ t('auth.verifyBannerTitle') }}</div>
        <p class="dt-app-notice-verify__text">{{ t('auth.verifyBanner') }}</p>
        <div class="dt-app-notice-verify__actions">
            <button
                type="button"
                class="dth-btn dth-btn--secondary dth-btn--sm"
                :disabled="resendBusy"
                @click="resend"
            >
                {{ resendBusy ? t('auth.loading') : t('auth.resendVerification') }}
            </button>
        </div>
    </div>
</template>

<style scoped>
.dt-app-notice-verify {
    margin: 10px 16px 0;
    padding: 14px 16px;
    border-radius: 14px;
    border: 1px solid rgba(245, 158, 11, 0.4);
    background: linear-gradient(145deg, rgba(245, 158, 11, 0.1) 0%, rgba(15, 28, 48, 0.95) 100%);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
    box-sizing: border-box;
}
.dt-app-notice-verify__title {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #fbbf24;
    margin-bottom: 8px;
    line-height: 1.35;
}
.dt-app-notice-verify__text {
    margin: 0 0 12px;
    font-size: 14px;
    line-height: 1.55;
    color: #e2e8f0;
    max-width: 42rem;
}
.dt-app-notice-verify__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
}
</style>
