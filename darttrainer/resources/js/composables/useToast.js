import { ref, watch } from 'vue';
import { usePage } from '@inertiajs/vue3';

/**
 * @typedef {Object} Toast
 * @property {number} id
 * @property {string} message
 * @property {'success'|'error'} type
 */

/** Kopīgs (modulis-līmeņa) toast saraksts — viena instance visai lietotnei. */
const toasts = ref(/** @type {Toast[]} */ ([]));

const TOAST_TTL_MS = 3500;

/**
 * @param {string} message
 * @param {'success'|'error'} [type]
 */
function push(message, type = 'success') {
    const text = String(message ?? '').trim();
    if (!text) return;

    const id = Date.now() + Math.random();
    toasts.value.push({ id, message: text, type });

    setTimeout(() => {
        toasts.value = toasts.value.filter((toast) => toast.id !== id);
    }, TOAST_TTL_MS);
}

let flashWatcherInstalled = false;

/**
 * Toast paziņojumi. Automātiski parāda servera flash ziņas (session()->flash('success'|'error'))
 * un ļauj manuāli izsaukt `toast(msg, type)` no komponentiem.
 */
export function useToast() {
    const page = usePage();

    // Flash → toast: uzstādām vienreiz (modulis-līmeņa karogs), lai nedublējas.
    if (!flashWatcherInstalled) {
        flashWatcherInstalled = true;
        watch(
            () => page.props.flash,
            (flash) => {
                if (flash?.success) push(flash.success, 'success');
                if (flash?.error) push(flash.error, 'error');
            },
            { deep: true, immediate: true },
        );
    }

    return { toasts, toast: push };
}
