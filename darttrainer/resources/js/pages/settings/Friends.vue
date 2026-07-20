<script setup lang="ts">
import SettingsShell from '@/layouts/SettingsShell.vue';
import { getInitials } from '@/composables/useInitials';
import { useLocale } from '@/composables/useLocale';
import { Head, router, useForm } from '@inertiajs/vue3';
import { useDebounceFn } from '@vueuse/core';
import { computed, ref, watch } from 'vue';

interface FriendUser {
    id: number;
    name: string;
    email: string;
}

interface FriendEntry {
    id: number;
    user: FriendUser;
    created_at: string;
}

type FriendshipStatus = 'none' | 'pending_outgoing' | 'pending_incoming' | 'friends';

interface SearchResult {
    id: number;
    name: string;
    email: string;
    friendship_status: FriendshipStatus;
    friendship_id: number | null;
}

interface Props {
    friends: FriendEntry[];
    incoming: FriendEntry[];
    outgoing: FriendEntry[];
    searchQuery?: string;
    searchResults?: SearchResult[];
    status?: string;
}

const props = withDefaults(defineProps<Props>(), {
    searchQuery: '',
    searchResults: () => [],
});

const { t } = useLocale();

const searchInput = ref(props.searchQuery);
const searching = ref(false);
const invitingUserId = ref<number | null>(null);

const inviteForm = useForm({
    user_id: null as number | null,
    email: '',
});

const statusMessage = computed(() => {
    if (!props.status) {
        return '';
    }

    const key = `settings.friends.status.${props.status}`;
    const translated = t(key);

    return translated === key ? '' : translated;
});

const showSearchHint = computed(() => searchInput.value.trim().length > 0 && searchInput.value.trim().length < 2);

const showSearchEmpty = computed(
    () => !searching.value && searchInput.value.trim().length >= 2 && props.searchResults.length === 0,
);

const runSearch = useDebounceFn((query: string) => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
        router.get(
            route('friends.edit'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['searchQuery', 'searchResults'],
            },
        );

        return;
    }

    searching.value = true;

    router.get(
        route('friends.edit'),
        { q: trimmed },
        {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['searchQuery', 'searchResults'],
            onFinish: () => {
                searching.value = false;
            },
        },
    );
}, 350);

watch(searchInput, (value) => {
    runSearch(value);
});

watch(
    () => props.searchQuery,
    (value) => {
        if (value !== searchInput.value) {
            searchInput.value = value;
        }
    },
);

function inviteUser(userId: number) {
    invitingUserId.value = userId;

    inviteForm
        .transform(() => ({ user_id: userId }))
        .post(route('friends.store'), {
            preserveScroll: true,
            onFinish: () => {
                invitingUserId.value = null;
            },
        });
}

function acceptRequest(id: number) {
    router.post(route('friends.accept', id), {}, { preserveScroll: true });
}

function declineRequest(id: number) {
    router.post(route('friends.decline', id), {}, { preserveScroll: true });
}

function cancelRequest(id: number) {
    router.delete(route('friends.destroy', id), { preserveScroll: true });
}

function removeFriend(id: number) {
    router.delete(route('friends.destroy', id), { preserveScroll: true });
}
</script>

<template>
    <Head :title="t('settings.friends.head')" />

    <SettingsShell>
        <p v-if="statusMessage" class="fr-toast">{{ statusMessage }}</p>

        <section class="fr-section">
            <div class="fr-section-head">
                <span class="fr-icon-well" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M19 8v6M22 11h-6" />
                    </svg>
                </span>
                <div>
                    <h2 class="fr-h">{{ t('settings.friends.inviteTitle') }}</h2>
                    <p class="fr-desc">{{ t('settings.friends.inviteDesc') }}</p>
                </div>
            </div>

            <div class="fr-search">
                <label class="fr-label" for="friend-search">{{ t('settings.friends.searchLabel') }}</label>
                <div class="fr-search-row">
                    <span class="fr-search-ico" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                            <circle cx="11" cy="11" r="7" />
                            <path d="M20 20l-3-3" />
                        </svg>
                    </span>
                    <input
                        id="friend-search"
                        v-model="searchInput"
                        type="search"
                        class="fr-input fr-input--search"
                        autocomplete="off"
                        :placeholder="t('settings.friends.searchPlaceholder')"
                    />
                    <span v-if="searching" class="fr-search-spinner" aria-hidden="true" />
                </div>
                <p v-if="showSearchHint" class="fr-search-hint">{{ t('settings.friends.searchHint') }}</p>
            </div>

            <ul v-if="searchResults.length" class="fr-list fr-list--search">
                <li v-for="result in searchResults" :key="result.id" class="fr-card fr-card--search">
                    <div class="fr-card-user">
                        <span class="fr-avatar" aria-hidden="true">{{ getInitials(result.name) }}</span>
                        <div>
                            <p class="fr-name">{{ result.name }}</p>
                            <p class="fr-email">{{ result.email }}</p>
                        </div>
                    </div>
                    <div class="fr-card-actions">
                        <button
                            v-if="result.friendship_status === 'none'"
                            type="button"
                            class="fr-btn fr-btn--green fr-btn--sm"
                            :disabled="inviteForm.processing && invitingUserId === result.id"
                            @click="inviteUser(result.id)"
                        >
                            {{ t('settings.friends.sendInvite') }}
                        </button>
                        <template v-else-if="result.friendship_status === 'pending_incoming' && result.friendship_id">
                            <button type="button" class="fr-btn fr-btn--green fr-btn--sm" @click="acceptRequest(result.friendship_id)">
                                {{ t('settings.friends.accept') }}
                            </button>
                            <button type="button" class="fr-btn fr-btn--ghost fr-btn--sm" @click="declineRequest(result.friendship_id)">
                                {{ t('settings.friends.decline') }}
                            </button>
                        </template>
                        <template v-else-if="result.friendship_status === 'pending_outgoing' && result.friendship_id">
                            <span class="fr-pill">{{ t('settings.friends.pending') }}</span>
                            <button type="button" class="fr-btn fr-btn--ghost fr-btn--sm" @click="cancelRequest(result.friendship_id)">
                                {{ t('settings.friends.cancel') }}
                            </button>
                        </template>
                        <span v-else class="fr-pill fr-pill--green">{{ t('settings.friends.alreadyFriends') }}</span>
                    </div>
                </li>
            </ul>

            <div v-else-if="showSearchEmpty" class="fr-search-empty">
                <p class="fr-search-empty-title">{{ t('settings.friends.searchEmptyTitle') }}</p>
                <p class="fr-search-empty-desc">{{ t('settings.friends.searchEmptyDesc') }}</p>
            </div>
        </section>

        <section v-if="incoming.length" class="fr-section fr-section--highlight">
            <div class="fr-section-head">
                <span class="fr-icon-well fr-icon-well--cyan" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                </span>
                <div>
                    <h2 class="fr-h">{{ t('settings.friends.incomingTitle') }}</h2>
                    <p class="fr-desc">{{ t('settings.friends.incomingDesc', { count: incoming.length }) }}</p>
                </div>
            </div>

            <ul class="fr-list">
                <li v-for="entry in incoming" :key="entry.id" class="fr-card fr-card--incoming">
                    <div class="fr-card-user">
                        <span class="fr-avatar" aria-hidden="true">{{ getInitials(entry.user.name) }}</span>
                        <div>
                            <p class="fr-name">{{ entry.user.name }}</p>
                            <p class="fr-email">{{ entry.user.email }}</p>
                        </div>
                    </div>
                    <div class="fr-card-actions">
                        <button type="button" class="fr-btn fr-btn--green fr-btn--sm" @click="acceptRequest(entry.id)">
                            {{ t('settings.friends.accept') }}
                        </button>
                        <button type="button" class="fr-btn fr-btn--ghost fr-btn--sm" @click="declineRequest(entry.id)">
                            {{ t('settings.friends.decline') }}
                        </button>
                    </div>
                </li>
            </ul>
        </section>

        <section v-if="outgoing.length" class="fr-section">
            <div class="fr-section-head">
                <span class="fr-icon-well fr-icon-well--amber" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                    </svg>
                </span>
                <div>
                    <h2 class="fr-h">{{ t('settings.friends.outgoingTitle') }}</h2>
                    <p class="fr-desc">{{ t('settings.friends.outgoingDesc') }}</p>
                </div>
            </div>

            <ul class="fr-list">
                <li v-for="entry in outgoing" :key="entry.id" class="fr-card">
                    <div class="fr-card-user">
                        <span class="fr-avatar fr-avatar--muted" aria-hidden="true">{{ getInitials(entry.user.name) }}</span>
                        <div>
                            <p class="fr-name">{{ entry.user.name }}</p>
                            <p class="fr-email">{{ entry.user.email }}</p>
                        </div>
                    </div>
                    <div class="fr-card-actions">
                        <span class="fr-pill">{{ t('settings.friends.pending') }}</span>
                        <button type="button" class="fr-btn fr-btn--ghost fr-btn--sm" @click="cancelRequest(entry.id)">
                            {{ t('settings.friends.cancel') }}
                        </button>
                    </div>
                </li>
            </ul>
        </section>

        <section class="fr-section">
            <div class="fr-section-head">
                <span class="fr-icon-well" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                    </svg>
                </span>
                <div>
                    <h2 class="fr-h">{{ t('settings.friends.listTitle') }}</h2>
                    <p class="fr-desc">{{ t('settings.friends.listDesc') }}</p>
                </div>
            </div>

            <div v-if="!friends.length" class="fr-empty">
                <span class="fr-empty-ico" aria-hidden="true">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                    </svg>
                </span>
                <p class="fr-empty-title">{{ t('settings.friends.emptyTitle') }}</p>
                <p class="fr-empty-desc">{{ t('settings.friends.emptyDesc') }}</p>
            </div>

            <ul v-else class="fr-list">
                <li v-for="entry in friends" :key="entry.id" class="fr-card fr-card--friend">
                    <div class="fr-card-user">
                        <span class="fr-avatar fr-avatar--friend" aria-hidden="true">{{ getInitials(entry.user.name) }}</span>
                        <div>
                            <p class="fr-name">{{ entry.user.name }}</p>
                            <p class="fr-email">{{ entry.user.email }}</p>
                        </div>
                    </div>
                    <button type="button" class="fr-btn fr-btn--danger-ghost fr-btn--sm" @click="removeFriend(entry.id)">
                        {{ t('settings.friends.remove') }}
                    </button>
                </li>
            </ul>
        </section>
    </SettingsShell>
</template>

<style scoped>
.fr-toast {
    margin: 0 0 24px;
    padding: 12px 14px;
    border-radius: 10px;
    border: 1px solid rgba(57, 255, 20, 0.35);
    background: rgba(57, 255, 20, 0.08);
    color: #39ff14;
    font-size: 13px;
    font-weight: 600;
}

.fr-section {
    margin-bottom: 36px;
}

.fr-section:last-child {
    margin-bottom: 0;
}

.fr-section--highlight {
    padding: 20px;
    margin-left: -20px;
    margin-right: -20px;
    border-radius: 14px;
    border: 1px solid rgba(34, 211, 238, 0.22);
    background: linear-gradient(165deg, rgba(34, 211, 238, 0.06), rgba(57, 255, 20, 0.04));
}

.fr-section-head {
    display: flex;
    gap: 14px;
    align-items: flex-start;
    margin-bottom: 18px;
}

.fr-icon-well {
    display: inline-flex;
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    border: 1px solid rgba(57, 255, 20, 0.25);
    background: rgba(57, 255, 20, 0.1);
    color: #39ff14;
}

.fr-icon-well--cyan {
    border-color: rgba(34, 211, 238, 0.3);
    background: rgba(34, 211, 238, 0.1);
    color: #22d3ee;
}

.fr-icon-well--amber {
    border-color: rgba(251, 191, 36, 0.3);
    background: rgba(251, 191, 36, 0.1);
    color: #fbbf24;
}

.fr-h {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 20px;
    margin: 0 0 4px;
}

.fr-desc {
    color: #64748b;
    font-size: 14px;
    margin: 0;
}

.fr-invite {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: flex-end;
}

.fr-search {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.fr-search-row {
    position: relative;
    display: flex;
    align-items: center;
}

.fr-search-ico {
    position: absolute;
    left: 14px;
    display: inline-flex;
    color: #64748b;
    pointer-events: none;
}

.fr-input--search {
    padding-left: 42px;
    padding-right: 42px;
}

.fr-search-spinner {
    position: absolute;
    right: 14px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid rgba(57, 255, 20, 0.2);
    border-top-color: #39ff14;
    animation: fr-spin 0.7s linear infinite;
}

.fr-search-hint,
.fr-search-empty-desc {
    margin: 0;
    font-size: 13px;
    color: #64748b;
}

.fr-search-empty {
    margin-top: 14px;
    padding: 18px 16px;
    border-radius: 12px;
    border: 1px dashed #334155;
    background: rgba(19, 26, 38, 0.35);
    text-align: center;
}

.fr-search-empty-title {
    margin: 0 0 4px;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    font-size: 14px;
    color: #94a3b8;
}

.fr-list--search {
    margin-top: 16px;
}

.fr-card--search {
    border-color: rgba(57, 255, 20, 0.12);
}

.fr-pill--green {
    color: #39ff14;
    background: rgba(57, 255, 20, 0.1);
    border-color: rgba(57, 255, 20, 0.25);
}

@keyframes fr-spin {
    to {
        transform: rotate(360deg);
    }
}

.fr-invite-field {
    flex: 1 1 240px;
}

.fr-label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #94a3b8;
    margin-bottom: 8px;
}

.fr-input {
    width: 100%;
    padding: 12px 14px;
    border-radius: 10px;
    background: #131a26;
    border: 1px solid #1f2937;
    color: #f4f4f5;
    font-size: 14px;
    font-family: Inter, sans-serif;
    outline: none;
}

.fr-input:focus {
    border-color: #39ff14;
}

.fr-error {
    margin-top: 6px;
    font-size: 12px;
    color: #fb2c5f;
}

.fr-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.fr-card {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 14px 16px;
    border-radius: 12px;
    border: 1px solid #1f2937;
    background: rgba(19, 26, 38, 0.65);
    transition: border-color 0.2s ease, transform 0.2s ease;
}

.fr-card:hover {
    border-color: color-mix(in srgb, #39ff14 25%, #1f2937);
    transform: translateY(-1px);
}

.fr-card--incoming {
    border-color: rgba(34, 211, 238, 0.28);
}

.fr-card--friend {
    border-color: rgba(57, 255, 20, 0.15);
}

.fr-card-user {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
}

.fr-avatar {
    display: inline-flex;
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800;
    font-size: 14px;
    letter-spacing: 0.04em;
    color: #0b0f19;
    background: #39ff14;
    box-shadow: 0 0 16px rgba(57, 255, 20, 0.25);
}

.fr-avatar--muted {
    background: #334155;
    color: #e2e8f0;
    box-shadow: none;
}

.fr-avatar--friend {
    background: linear-gradient(135deg, #39ff14, #22d3ee);
}

.fr-name {
    margin: 0;
    font-weight: 700;
    font-size: 15px;
    color: #f4f4f5;
}

.fr-email {
    margin: 2px 0 0;
    font-size: 13px;
    color: #64748b;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.fr-card-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
}

.fr-pill {
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    color: #fbbf24;
    background: rgba(251, 191, 36, 0.12);
    border: 1px solid rgba(251, 191, 36, 0.25);
}

.fr-btn {
    padding: 11px 20px;
    border-radius: 10px;
    font-weight: 800;
    font-family: 'Barlow Condensed', sans-serif;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    font-size: 14px;
    cursor: pointer;
    border: none;
    transition: transform 0.2s ease, filter 0.2s ease, opacity 0.2s ease;
}

.fr-btn--sm {
    padding: 8px 14px;
    font-size: 12px;
}

.fr-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.fr-btn--green {
    background: #39ff14;
    color: #0b0f19;
    box-shadow: 0 0 20px rgba(57, 255, 20, 0.2);
}

.fr-btn--green:hover:not(:disabled) {
    filter: brightness(1.05);
    transform: translateY(-1px);
}

.fr-btn--ghost {
    background: transparent;
    border: 1px solid #334155;
    color: #cbd5e1;
}

.fr-btn--ghost:hover:not(:disabled) {
    border-color: #64748b;
    color: #f4f4f5;
}

.fr-btn--danger-ghost {
    background: transparent;
    border: 1px solid rgba(251, 44, 95, 0.35);
    color: #fb2c5f;
}

.fr-btn--danger-ghost:hover:not(:disabled) {
    background: rgba(251, 44, 95, 0.08);
}

.fr-empty {
    text-align: center;
    padding: 32px 20px;
    border-radius: 14px;
    border: 1px dashed #334155;
    background: rgba(19, 26, 38, 0.4);
}

.fr-empty-ico {
    display: inline-flex;
    width: 56px;
    height: 56px;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
    border-radius: 14px;
    border: 1px solid #1f2937;
    background: #131a26;
    color: #64748b;
}

.fr-empty-title {
    margin: 0 0 6px;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 16px;
    color: #94a3b8;
}

.fr-empty-desc {
    margin: 0;
    font-size: 13px;
    color: #64748b;
}

@media (max-width: 560px) {
    .fr-section--highlight {
        margin-left: 0;
        margin-right: 0;
        padding: 16px;
    }

    .fr-card {
        flex-direction: column;
        align-items: stretch;
    }

    .fr-card-actions {
        justify-content: flex-end;
    }

    .fr-invite {
        flex-direction: column;
        align-items: stretch;
    }
}

@media (prefers-reduced-motion: reduce) {
    .fr-card,
    .fr-btn {
        transition: none;
    }

    .fr-card:hover,
    .fr-btn--green:hover:not(:disabled) {
        transform: none;
    }

    .fr-search-spinner {
        animation: none;
        border-top-color: rgba(57, 255, 20, 0.5);
    }
}
</style>
