/**
 * vue-i18n konfigurācija. Tulkojumu saturs dzīvo resources/js/lang/
 * sadalīts pa moduļiem; sākotnējā valoda nāk no Inertia shared `locale`
 * (serveris ir avota patiesība), localStorage ir tikai ātrais kešs.
 */
import { createI18n } from 'vue-i18n';
import { messages } from './lang';

export type Locale = 'lv' | 'en';

export const STORAGE_KEY = 'td_locale';

export function isLocale(value: unknown): value is Locale {
    return value === 'lv' || value === 'en';
}

export function detectInitialLocale(): Locale {
    if (typeof window === 'undefined') return 'lv';
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return isLocale(saved) ? saved : 'lv';
}

export function applyLocale(locale: Locale): void {
    i18n.global.locale.value = locale;
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, locale);
        document.documentElement.lang = locale;
    }
}

export const i18n = createI18n({
    legacy: false,
    locale: detectInitialLocale(),
    // LV ir avota valoda — ja kādā atslēgā trūkst EN tulkojuma, labāk parādīt
    // latviešu tekstu nekā atslēgas nosaukumu vai tukšumu.
    fallbackLocale: 'lv',
    messages,
});

if (typeof document !== 'undefined') {
    document.documentElement.lang = i18n.global.locale.value;
}
