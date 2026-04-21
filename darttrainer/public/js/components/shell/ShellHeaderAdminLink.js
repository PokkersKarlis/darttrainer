/** Admin saite headera stilā (gradienta poga) */
const ShellHeaderAdminLink = {
  name: 'ShellHeaderAdminLink',
  props: {
    disabled: { type: Boolean, default: false },
  },
  setup(props) {
    const locale = useLocaleStore();
    const t = (k) => locale.t(k);
    return { t, props };
  },
  template: `
    <a href="#/admin"
       :class="{ 'nav-link--disabled': props.disabled }"
       style="display:inline-flex;align-items:center;gap:6px;flex-shrink:0;text-decoration:none;
              font-size:12px;font-weight:800;color:#0a1120;background:linear-gradient(135deg,#fbbf24,#f59e0b);
              padding:8px 14px;border-radius:10px;border:none;box-shadow:0 2px 12px rgba(245,158,11,.35);
              white-space:nowrap;transition:filter .15s,transform .1s">
      <span aria-hidden="true">⚙️</span>{{ t('shell.adminBtn') }}
    </a>
  `,
};
