<script setup>
import DtButton from '../ui/DtButton.js';
import { useLocaleStore } from '../../store/index.js';

defineOptions({ name: 'EmailVerifyBanner' });

const props = defineProps({
  resendBusy: { type: Boolean, default: false },
});
defineEmits(['resend']);

const locale = useLocaleStore();
const t = (k) => locale.t(k);
</script>

<template>
  <div
    class="dt-app-notice-verify"
    style="flex-shrink: 0; z-index: 25"
    role="status"
  >
    <div class="dt-app-notice-verify__title">
      {{ t('auth.verifyBannerTitle') }}
    </div>
    <p class="dt-app-notice-verify__text">
      {{ t('auth.verifyBanner') }}
    </p>
    <div class="dt-app-notice-verify__actions">
      <dt-button variant="secondary" size="sm" :disabled="resendBusy" @click="$emit('resend')">
        {{ t('auth.resendVerification') }}
      </dt-button>
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
