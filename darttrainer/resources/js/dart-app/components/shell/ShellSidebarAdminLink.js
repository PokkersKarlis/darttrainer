import { useLocaleStore } from '../../store/index.js';
/** Admin saite sānjoslā (lielā gradienta bloks) */
export default {
  name: 'ShellSidebarAdminLink',
  props: {
    disabled: { type: Boolean, default: false },
  },
  setup(props) {
    const locale = useLocaleStore();
    const t = (k) => locale.t(k);
    return { t, props };
  },
  template: `
    <router-link
      v-if="!props.disabled"
      to="/admin"
      style="display:flex;align-items:center;justify-content:center;gap:8px;margin:10px 4px 0;padding:11px 12px;
             border-radius:12px;text-decoration:none;font-weight:800;font-size:13px;color:#0a1120;
             background:linear-gradient(135deg,#fbbf24,#f59e0b);border:1px solid #d97706;
             box-shadow:0 4px 14px rgba(245,158,11,.25);letter-spacing:.02em"
    >
      <span style="font-size:16px">⚙️</span>{{ t('shell.adminBtn') }}
    </router-link>
    <span
      v-else
      class="nav-link--disabled"
      style="display:flex;align-items:center;justify-content:center;gap:8px;margin:10px 4px 0;padding:11px 12px;
             border-radius:12px;text-decoration:none;font-weight:800;font-size:13px;color:#0a1120;
             background:linear-gradient(135deg,#fbbf24,#f59e0b);border:1px solid #d97706;
             box-shadow:0 4px 14px rgba(245,158,11,.25);letter-spacing:.02em;opacity:.45;pointer-events:none"
      aria-disabled="true"
    >
      <span style="font-size:16px">⚙️</span>{{ t('shell.adminBtn') }}
    </span>
  `,
};
