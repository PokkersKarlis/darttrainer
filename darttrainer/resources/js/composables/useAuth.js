import { computed } from 'vue';
import { usePage } from '@inertiajs/vue3';

/**
 * @typedef {Object} AuthUser
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {'player'|'club'} accountType
 * @property {string|null} clubName
 * @property {string|null} emailVerifiedAt
 * @property {boolean} isAdmin
 * @property {boolean} isBanned
 * @property {string|null} banReason
 */

/**
 * Autentificētais lietotājs un no tā atvasinātās atļaujas.
 *
 * Atšķirībā no vecā Pinia `auth` store, dati nāk no Inertia kopīgajiem props
 * (serveris tos zina renderēšanas brīdī) — nav vajadzīgs atsevišķs /auth/me pieprasījums.
 */
export function useAuth() {
    const page = usePage();

    /** @type {import('vue').ComputedRef<AuthUser|null>} */
    const user = computed(() => page.props.auth?.user ?? null);

    const isLoggedIn = computed(() => user.value !== null);

    /** Ielogots, bet e-pasts vēl nav apstiprināts. */
    const needsEmailVerify = computed(
        () => !!user.value && !user.value.emailVerifiedAt,
    );

    /** Multiplayer / pilnas spēles funkcijas — ielogots, apstiprināts e-pasts, nav ban. */
    const canPlayGames = computed(
        () =>
            !!user.value &&
            !!user.value.emailVerifiedAt &&
            !user.value.isBanned,
    );

    const isAdmin = computed(() => !!user.value?.isAdmin);

    return { user, isLoggedIn, needsEmailVerify, canPlayGames, isAdmin };
}
