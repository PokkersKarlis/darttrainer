import { router } from '@inertiajs/vue3';

/**
 * Migrācijas tilts (Phase 2, variants A).
 *
 * Pārejas periodā daļa lapu jau ir Inertia (šeit uzskaitītās), pārējās vēl dzīvo
 * vecajā Vue SPA. Inertia `<Link>` gaida Inertia atbildi (X-Inertia headeri) — vecās
 * SPA lapas to neatgriež, tāpēc uz tām jāiet ar PILNU pārlādi (window.location),
 * nevis Inertia navigāciju. Šis palīgs izvēlas pareizo.
 *
 * Kad lapa tiek migrēta uz Inertia, tās ceļu pievieno `INERTIA_PATHS`.
 */
const INERTIA_PATHS = ['/', '/login', '/register', '/friends'];

/** @param {string} url */
export function isInertiaPath(url) {
    const path = String(url).split('?')[0];
    return INERTIA_PATHS.includes(path);
}

/**
 * Navigē uz ceļu, izvēloties Inertia (bez pārlādes) vai pilnu pārlādi
 * atkarībā no tā, vai mērķis jau ir migrēts.
 *
 * @param {string} url
 */
export function go(url) {
    if (isInertiaPath(url)) {
        router.visit(url);
    } else {
        window.location.href = url;
    }
}
