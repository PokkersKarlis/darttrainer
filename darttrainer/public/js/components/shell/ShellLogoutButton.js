/** Izrakstīšanās poga */
const ShellLogoutButton = {
  name: 'ShellLogoutButton',
  setup() {
    const auth = useAuthStore();
    const locale = useLocaleStore();
    const t = (k) => locale.t(k);
    return { auth, t };
  },
  template: `
    <button type="button" @click="auth.logout()"
            style="font-size:12px;color:#ef4444;background:rgba(239,68,68,.12);border:none;padding:5px 10px;border-radius:6px;cursor:pointer;font-weight:600;transition:background .15s"
            onmouseover="this.style.background='rgba(239,68,68,.22)'"
            onmouseout="this.style.background='rgba(239,68,68,.12)'">
      {{ t('shell.logout') }}
    </button>
  `,
};
