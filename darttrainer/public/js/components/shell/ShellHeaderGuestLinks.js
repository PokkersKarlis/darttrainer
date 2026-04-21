/** Ieejas / īsās reģistrācijas saites headerī */
const ShellHeaderGuestLinks = {
  name: 'ShellHeaderGuestLinks',
  setup() {
    const locale = useLocaleStore();
    const t = (k) => locale.t(k);
    return { t };
  },
  template: `
    <a href="#/login" class="dt-header-login"
       style="font-size:13px;color:#94a3b8;text-decoration:none;padding:5px 8px;border-radius:6px;transition:color .15s;white-space:nowrap;flex-shrink:0"
       onmouseover="this.style.color='#f1f5f9'"
       onmouseout="this.style.color='#94a3b8'">{{ t('shell.login') }}</a>
    <a href="#/register" class="dt-header-register"
       style="font-size:13px;background:#f59e0b;color:#000;font-weight:700;padding:6px 10px;border-radius:8px;text-decoration:none;transition:background .15s;white-space:nowrap;flex-shrink:0"
       onmouseover="this.style.background='#fbbf24'"
       onmouseout="this.style.background='#f59e0b'">{{ t('shell.registerShort') }}</a>
  `,
};
