import { useLocaleStore } from '@/dart-app/store/locale.js';

/**
 * Tulkojumu palīgs Inertia lapām.
 *
 * Pārejas periodā atkalizmanto veco Pinia `locale` store un tā ziņojumu vārdnīcu
 * (`DART_I18N`), lai tulkojumi paliek vienā vietā, kamēr vecais SPA un Inertia dzīvo blakus.
 *
 * @returns {{ locale: import('pinia').Store, t: (key: string) => string }}
 */
export function useI18n() {
    const locale = useLocaleStore();

    /** @param {string} key */
    const t = (key) => locale.t(key);

    return { locale, t };
}
