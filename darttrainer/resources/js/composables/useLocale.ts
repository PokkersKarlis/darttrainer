/**
 * Tievs wrapper virs vue-i18n. Valodas avota patiesība ir Inertia shared `locale`
 * (session/cookie/user caur SetLocale middleware). setLocale() optimistiski
 * atjaunina UI un POST uz /locale, lai saglabātu izvēli serverī.
 */
import { applyLocale, i18n, isLocale, type Locale } from '@/i18n';
import { router, usePage } from '@inertiajs/vue3';
import { computed, watch } from 'vue';

export type { Locale };

/**
 * @param key Tulkojuma atslēga, piem. 'nav.dashboard'
 * @param params Vērtības aizvietošanai, piem. { name: 'Kārlis' } priekš '{name}'
 */
export function useLocale() {
    const page = usePage();

    watch(
        () => page.props.locale,
        (locale) => {
            if (isLocale(locale) && i18n.global.locale.value !== locale) {
                applyLocale(locale);
            }
        },
        { immediate: true },
    );

    const t = (key: string, params?: Record<string, string | number>): string =>
        i18n.global.t(key, params ?? {});

    const setLocale = (locale: Locale) => {
        if (i18n.global.locale.value === locale) {
            return;
        }

        applyLocale(locale);

        router.post(
            route('locale.update'),
            { locale },
            {
                preserveScroll: true,
                preserveState: true,
                only: ['locale'],
            },
        );
    };

    return {
        locale: computed(() => i18n.global.locale.value as Locale),
        setLocale,
        t,
    };
}
