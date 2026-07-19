/**
 * vue-i18n konfigurācija. Aizstāj iepriekšējo pašrakstīto composable ar
 * nozares standarta bibliotēku — tulkojumu saturs dzīvo resources/js/lang/
 * sadalīts pa moduļiem (auth, guest, dashboard, common), skat. lang/index.ts.
 */
import { createI18n } from 'vue-i18n';
import { messages } from './lang';

export type Locale = 'lv' | 'en';

export const STORAGE_KEY = 'td_locale';

export function detectInitialLocale(): Locale {
    if (typeof window === 'undefined') return 'lv';
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === 'lv' || saved === 'en' ? saved : 'lv';
}

export const i18n = createI18n({
    legacy: false, // Composition API režīms (useI18n() / i18n.global ir Composer, ne VueI18n)
    locale: detectInitialLocale(),
    // LV ir avota valoda — ja kādā atslēgā trūkst EN tulkojuma, labāk parādīt
    // latviešu tekstu nekā atslēgas nosaukumu vai tukšumu.
    fallbackLocale: 'lv',
    messages,
});

if (typeof document !== 'undefined') {
    document.documentElement.lang = i18n.global.locale.value;
}
