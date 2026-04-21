import { useLocaleStore } from '../../store/index.js';
/** E-pasta apstiprinājuma josla zem header */
import * as Vue from 'vue';
export default {
  name: 'EmailVerifyBanner',
  props: {
    resendBusy: { type: Boolean, default: false },
  },
  emits: ['resend'],
  setup(props, { emit }) {
    const locale = useLocaleStore();
    const t = (k) => locale.t(k);
    function onResend() {
      emit('resend');
    }
    return { t, onResend, resendBusy: Vue.toRef(props, 'resendBusy') };
  },
  template: `
    <div style="flex-shrink:0;background:#422006;border-bottom:1px solid #92400e;padding:10px 16px;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:12px;z-index:25">
      <p style="margin:0;font-size:13px;color:#fde68a;text-align:center;line-height:1.45;max-width:42rem">
        {{ t('auth.verifyBanner') }}
      </p>
      <dt-button variant="secondary" size="sm" :disabled="resendBusy" @click="onResend">
        {{ t('auth.resendVerification') }}
      </dt-button>
    </div>
  `,
};
