<script setup>
/**
 * Lietotāja izvēlne augšējā joslā.
 * Ielogotam: segvārds + Iziet (+ admin saite, ja isAdmin).
 * Viesim: Pieteikties / Reģistrēties.
 *
 * Tīra Inertia versija (aizstāj veco dart-app HeaderUserMenu.vue) — bez vue-router,
 * bez Pinia auth store; dati nāk no Inertia kopīgajiem props.
 */
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import { useAuth } from '@/composables/useAuth.js';
import { useI18n } from '@/composables/useI18n.js';
import { go } from '@/lib/spaBridge.js';

const { user, isLoggedIn, isAdmin, needsEmailVerify } = useAuth();
const { t } = useI18n();

const open = ref(false);
const rootRef = ref(null);

const displayNick = computed(() => user.value?.name?.trim() || '—');

function close() {
    open.value = false;
}

function toggle(event) {
    event?.stopPropagation?.();
    open.value = !open.value;
}

function onLogout() {
    close();
    router.post('/logout');
}

function goFriends() {
    close();
    go('/friends');
}

function onDocumentClick(event) {
    if (open.value && rootRef.value && !rootRef.value.contains(event.target)) close();
}

function onKeydown(event) {
    if (event.key === 'Escape') close();
}

onMounted(() => {
    document.addEventListener('click', onDocumentClick, true);
    document.addEventListener('keydown', onKeydown);
});
onUnmounted(() => {
    document.removeEventListener('click', onDocumentClick, true);
    document.removeEventListener('keydown', onKeydown);
});
</script>

<template>
    <div ref="rootRef" class="header-user-menu flex min-w-0 items-center" style="flex: 0 1 auto">
        <!-- Ielogots -->
        <template v-if="isLoggedIn">
            <div class="dth-logged-strip">
                <div class="dth-nick-dd">
                    <button
                        type="button"
                        class="dth-nick-pill"
                        :class="{ 'dth-nick-pill--open': open }"
                        :aria-expanded="open"
                        @click="toggle"
                    >
                        <span class="dth-nick-status" aria-hidden="true" />
                        <span class="dth-nick-text">{{ displayNick }}</span>
                    </button>

                    <div v-show="open" class="dth-um-menu dth-account-flyout" role="menu">
                        <div class="dth-account-flyout-inner">
                            <button
                                v-if="isAdmin"
                                type="button"
                                role="menuitem"
                                class="dth-btn dth-btn--sm dth-btn--ghost dth-btn--full"
                                :disabled="needsEmailVerify"
                                @click="() => { close(); go('/admin'); }"
                            >
                                {{ t('nav.admin') }}
                            </button>
                            <button
                                type="button"
                                role="menuitem"
                                class="dth-btn dth-btn--sm dth-btn--ghost dth-btn--full"
                                :disabled="needsEmailVerify"
                                @click="goFriends"
                            >
                                {{ t('shell.accountMenuFriendsLink') }}
                            </button>
                        </div>
                    </div>
                </div>

                <button type="button" class="dth-logout-header" @click="onLogout">
                    {{ t('shell.logoutHeader') }}
                </button>
            </div>
        </template>

        <!-- Viesis -->
        <div v-else class="dth-tb-auth">
            <Link href="/login" class="dth-btn dth-btn--ghost dth-btn--sm">
                {{ t('shell.login') }}
            </Link>
            <Link href="/register" class="dth-btn dth-btn--accent dth-btn--sm">
                {{ t('shell.register') }}
            </Link>
        </div>
    </div>
</template>
