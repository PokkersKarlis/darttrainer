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
        (sharedLocale) => {
            if (isLocale(sharedLocale) && i18n.global.locale.value !== sharedLocale) {
                applyLocale(sharedLocale);
            }
        },
        { immediate: true },
    );

    const locale = computed(() => i18n.global.locale.value as Locale);

    const t = (key: string, params?: Record<string, string | number>): string =>
        i18n.global.t(key, params ?? {});

    const tm = (key: string) => i18n.global.tm(key);

    const setLocale = (next: Locale) => {
        if (locale.value === next) {
            return;
        }

        applyLocale(next);

        router.post(route('locale.update'), { locale: next }, {
            preserveScroll: true,
            onSuccess: () => {
                if (isLocale(page.props.locale)) {
                    applyLocale(page.props.locale);
                }
            },
            onError: () => {
                if (isLocale(page.props.locale)) {
                    applyLocale(page.props.locale);
                }
            },
        });
    };

    return {
        locale,
        setLocale,
        t,
        tm,
    };
}
