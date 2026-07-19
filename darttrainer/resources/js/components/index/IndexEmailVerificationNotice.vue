<script setup lang="ts">
import { useEmailVerification } from '@/composables/useEmailVerification';
import { useLocale } from '@/composables/useLocale';
import { MailWarning } from 'lucide-vue-next';
import { computed } from 'vue';

const props = defineProps<{
    status?: string | null;
}>();

const { t } = useLocale();
const { isVerified, canResend, resendForm, resend, flashStatus, userEmail } = useEmailVerification(props.status);

const showResendSuccess = computed(
    () => flashStatus.value === 'verification-link-sent' || props.status === 'verification-link-sent',
);

const showResendFailed = computed(
    () => flashStatus.value === 'verification-link-failed' || props.status === 'verification-link-failed',
);

const showWaiting = computed(() => !canResend.value && !resendForm.processing);
</script>

<template>
    <section v-if="!isVerified" class="ix-email-notice ix-rise" role="alert">
        <div class="ix-email-notice-icon" aria-hidden="true">
            <MailWarning :size="22" :stroke-width="2.2" />
        </div>

        <div class="ix-email-notice-body">
            <p class="ix-email-notice-title">{{ t('index.emailNotice.title') }}</p>
            <p class="ix-email-notice-text">
                {{ t('index.emailNotice.body', { email: userEmail }) }}
            </p>

            <p v-if="showResendSuccess" class="ix-email-notice-flash ix-email-notice-flash--ok">
                {{ t('index.emailNotice.resendSent') }}
            </p>
            <p v-else-if="showResendFailed" class="ix-email-notice-flash ix-email-notice-flash--error">
                {{ t('index.emailNotice.resendFailed') }}
            </p>

            <div v-if="canResend" class="ix-email-notice-actions">
                <button
                    type="button"
                    class="ix-email-notice-btn"
                    :disabled="resendForm.processing"
                    @click="resend"
                >
                    {{
                        resendForm.processing
                            ? t('index.emailNotice.resending')
                            : t('index.emailNotice.resend')
                    }}
                </button>
            </div>
            <div
                v-else-if="showWaiting"
                class="ix-email-notice-loading"
                role="status"
                :aria-label="t('index.emailNotice.waiting')"
            >
                <span class="ix-email-notice-spinner" aria-hidden="true" />
            </div>
        </div>
    </section>
</template>

<style scoped>
.ix-email-notice {
    display: flex;
    gap: calc(14px * var(--ix-scale, 1));
    margin-bottom: calc(18px * var(--ix-scale, 1));
    padding: calc(18px * var(--ix-scale, 1)) calc(20px * var(--ix-scale, 1));
    border-radius: calc(16px * var(--ix-scale, 1));
    border: 1px solid color-mix(in srgb, #fb2c5f 42%, var(--ix-line, #1f2937));
    background:
        radial-gradient(circle at top right, rgba(251, 44, 95, 0.12), transparent 55%),
        color-mix(in srgb, var(--ix-panel, #0d1220) 92%, transparent);
    box-shadow: 0 0 28px rgba(251, 44, 95, 0.12);
}

.ix-email-notice-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: calc(44px * var(--ix-scale, 1));
    height: calc(44px * var(--ix-scale, 1));
    border-radius: calc(12px * var(--ix-scale, 1));
    border: 1px solid color-mix(in srgb, #fb2c5f 35%, var(--ix-line, #1f2937));
    background: color-mix(in srgb, #fb2c5f 12%, var(--ix-panel, #0d1220));
    color: #fb2c5f;
}

.ix-email-notice-body {
    min-width: 0;
}

.ix-email-notice-title {
    margin: 0 0 6px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: calc(20px * var(--ix-scale, 1));
    font-weight: 900;
    letter-spacing: 0.04em;
    text-transform: uppercase;
}

.ix-email-notice-text {
    margin: 0 0 calc(14px * var(--ix-scale, 1));
    font-size: calc(14px * var(--ix-scale, 1));
    line-height: 1.5;
    color: color-mix(in srgb, var(--ix-text, #f4f4f5) 88%, var(--ix-muted, #64748b));
}

.ix-email-notice-flash {
    margin: 0 0 calc(12px * var(--ix-scale, 1));
    font-size: calc(13px * var(--ix-scale, 1));
    font-weight: 600;
}

.ix-email-notice-flash--ok {
    color: var(--ix-green, #39ff14);
}

.ix-email-notice-flash--error {
    color: #fb2c5f;
}

.ix-email-notice-actions {
    margin-top: calc(2px * var(--ix-scale, 1));
}

.ix-email-notice-btn {
    padding: calc(10px * var(--ix-scale, 1)) calc(16px * var(--ix-scale, 1));
    border: 1px solid color-mix(in srgb, var(--ix-green, #39ff14) 35%, var(--ix-line, #1f2937));
    border-radius: calc(10px * var(--ix-scale, 1));
    background: color-mix(in srgb, var(--ix-green, #39ff14) 88%, #0b0f19);
    color: #0b0f19;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: calc(14px * var(--ix-scale, 1));
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    cursor: pointer;
    box-shadow: 0 0 18px rgba(57, 255, 20, 0.2);
}

.ix-email-notice-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.ix-email-notice-loading {
    display: inline-flex;
    align-items: center;
    min-height: calc(38px * var(--ix-scale, 1));
}

.ix-email-notice-spinner {
    width: calc(22px * var(--ix-scale, 1));
    height: calc(22px * var(--ix-scale, 1));
    border-radius: 50%;
    border: 2px solid color-mix(in srgb, #fb2c5f 20%, var(--ix-line, #1f2937));
    border-top-color: #fb2c5f;
    animation: ix-email-spin 0.85s linear infinite;
}

@keyframes ix-email-spin {
    to {
        transform: rotate(360deg);
    }
}

.ix-rise {
    animation: ix-rise 0.55s ease both;
}

@keyframes ix-rise {
    from {
        opacity: 0;
        transform: translateY(calc(14px * var(--ix-scale, 1)));
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (prefers-reduced-motion: reduce) {
    .ix-rise,
    .ix-email-notice-spinner {
        animation: none;
    }

    .ix-email-notice-spinner {
        border-top-color: #fb2c5f;
        opacity: 0.75;
    }
}
</style>
