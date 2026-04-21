/** Sesijas ielādes indikators headerī */
const ShellAuthPendingIndicator = {
  name: 'ShellAuthPendingIndicator',
  setup() {
    const locale = useLocaleStore();
    const t = (k) => locale.t(k);
    return { t };
  },
  template: `
    <div class="flex items-center gap-1.5 px-1" role="status" :aria-label="t('shell.authPending')" :title="t('shell.authPending')">
      <span class="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style="animation-delay:0ms"></span>
      <span class="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style="animation-delay:120ms"></span>
      <span class="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style="animation-delay:240ms"></span>
      <span class="hidden sm:inline text-[11px] font-semibold text-slate-500 ml-1">{{ t('shell.authPending') }}</span>
    </div>
  `,
};
