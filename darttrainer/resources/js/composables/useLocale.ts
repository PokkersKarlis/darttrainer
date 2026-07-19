/**
 * Tievs wrapper virs vue-i18n. Saglabā to pašu { locale, setLocale, t } API,
 * ko lietoja visas komponentes iepriekš (pašrakstītais i18n) — tāpēc nekas
 * komponentēs nav jāmaina. Faktiskais tulkojumu saturs tagad dzīvo
 * resources/js/lang/{locale}/*.json, sadalīts pa moduļiem (skat. lang/index.ts
 * un i18n.ts), un valodas stāvokli pārvalda vue-i18n (i18n.global.locale).
 */
import { i18n, STORAGE_KEY, type Locale } from '@/i18n';
import { computed } from 'vue';

export type { Locale };

/**
 * @param key Tulkojuma atslēga, piem. 'nav.dashboard'
 * @param params Vērtības aizvietošanai, piem. { name: 'Kārlis' } priekš '{name}'
 */
export function useLocale() {
    const t = (key: string, params?: Record<string, string | number>): string =>
        i18n.global.t(key, params ?? {});

    const setLocale = (l: Locale) => {
        i18n.global.locale.value = l;
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(STORAGE_KEY, l);
            document.documentElement.lang = l;
        }
    };

    return {
        locale: computed(() => i18n.global.locale.value as Locale),
        setLocale,
        t,
    };
}
