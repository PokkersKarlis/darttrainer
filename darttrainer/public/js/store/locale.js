const useLocaleStore = Pinia.defineStore('locale', {
  state: () => ({
    locale: 'lv',
  }),

  actions: {
    initFromStorage() {
      const saved = localStorage.getItem('dt_locale');
      if (saved === 'en' || saved === 'lv') {
        this.locale = saved;
      }
      this.applyDocumentLang();
    },

    setLocale(code) {
      if (code !== 'en' && code !== 'lv') return;
      this.locale = code;
      localStorage.setItem('dt_locale', code);
      this.applyDocumentLang();
    },

    applyDocumentLang() {
      if (typeof document !== 'undefined') {
        document.documentElement.lang = this.locale;
      }
    },

    t(key) {
      const messages = window.DART_I18N;
      if (!messages) return key;
      const pick = (lang) => {
        const parts = String(key).split('.');
        let cur = messages[lang];
        for (const p of parts) {
          if (cur && typeof cur === 'object' && p in cur) {
            cur = cur[p];
          } else {
            return undefined;
          }
        }
        return typeof cur === 'string' ? cur : undefined;
      };
      let out = pick(this.locale);
      if (out === undefined && this.locale !== 'en') {
        out = pick('en');
      }
      return out ?? key;
    },
  },
});
