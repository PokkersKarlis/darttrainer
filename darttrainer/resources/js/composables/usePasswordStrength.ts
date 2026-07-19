/**
 * Kopīga paroles stipruma vērtēšanas loģika.
 * Izmanto Register.vue, ResetPassword.vue un settings/Password.vue,
 * lai nedublētu vienu un to pašu novērtējuma algoritmu vairākās vietās (DRY).
 */
import { computed, type Ref } from 'vue';

export interface PasswordStrengthMeta {
    /** CSS width procentos (piem. '80%') progresa joslai. */
    width: string;
    /** Joslas krāsa atkarībā no stipruma. */
    color: string;
    /** Lietotājam redzams paskaidrojums (jau tulkots). */
    label: string;
}

/**
 * @param password Ref uz paroles vērtību (piem. computed no useForm lauka)
 * @param t Tulkošanas funkcija no useLocale() — izmanto stipruma uzrakstu tulkošanai
 */
export function usePasswordStrength(password: Ref<string>, t: (key: string) => string) {
    const score = computed(() => {
        const p = password.value;
        let s = 0;
        if (p.length >= 8) s++;
        if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
        if (/\d/.test(p)) s++;
        if (/[^A-Za-z0-9]/.test(p)) s++;
        return s;
    });

    return computed<PasswordStrengthMeta>(() => {
        if (!password.value) return { width: '0%', color: '#1f2937', label: '' };
        if (score.value <= 1) return { width: '35%', color: '#fbbf24', label: t('pwd.strength.weak') };
        if (score.value === 2) return { width: '60%', color: '#fbbf24', label: t('pwd.strength.fair') };
        if (score.value === 3) return { width: '80%', color: '#39ff14', label: t('pwd.strength.good') };
        return { width: '100%', color: '#39ff14', label: t('pwd.strength.strong') };
    });
}
