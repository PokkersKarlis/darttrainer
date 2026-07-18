<script setup>
/**
 * Draugi (Inertia). Saraksts, ienākošie/izejošie uzaicinājumi, lietotāju meklēšana.
 *
 * Dati nāk kā props no FriendController@index. Meklēšana izmanto Inertia daļējo pārlādi
 * (tikai `searchResults`), mutācijas (sūtīt/pieņemt/noraidīt/noņemt) — redirect-back,
 * pēc kura Inertia automātiski atsvaidzina sarakstus.
 *
 * @typedef {{ id:number, name:string, isOnline:boolean }} Friend
 * @typedef {{ id:number, user:{ id:number, name:string } }} IncomingRequest
 * @typedef {{ id:number, status:string, updatedAt:?string, user:{ id:number, name:string } }} OutgoingRequest
 * @typedef {{ id:number, name:string, email:string, relationship:string }} SearchHit
 */
import { ref, computed } from 'vue';
import { router } from '@inertiajs/vue3';
import AppLayout from '@/layouts/AppLayout.vue';
import { useI18n } from '@/composables/useI18n.js';

const props = defineProps({
    friends: { type: Array, default: () => [] },
    incoming: { type: Array, default: () => [] },
    outgoing: { type: Array, default: () => [] },
    searchResults: { type: Array, default: () => [] },
    query: { type: String, default: '' },
});

const { t } = useI18n();

const tab = ref('list');
const searchQ = ref(props.query);
const searching = ref(false);
const sendingIds = ref(new Set());
const removeTarget = ref(/** @type {Friend|null} */ (null));
const removing = ref(false);

const incomingCount = computed(() => props.incoming.length);

const removeConfirmText = computed(() =>
    t('friends.removeConfirm').replace(/\{name\}/g, removeTarget.value?.name || '…'),
);

// ── Meklēšana (debounced Inertia daļējā pārlāde) ──
let searchTimer = null;
function onSearchInput() {
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(runSearch, 280);
}

function runSearch() {
    searching.value = true;
    router.get(
        '/friends',
        { q: searchQ.value.trim() },
        {
            only: ['searchResults', 'query'],
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => {
                searching.value = false;
            },
        },
    );
}

// ── Mutācijas ──
function sendRequest(userId) {
    if (sendingIds.value.has(userId)) return;
    sendingIds.value.add(userId);
    router.post(
        '/friends/requests',
        { userId },
        {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => sendingIds.value.delete(userId),
        },
    );
}

function accept(id) {
    router.post(`/friends/requests/${id}/accept`, {}, { preserveScroll: true, preserveState: true });
}

function reject(id) {
    router.post(`/friends/requests/${id}/reject`, {}, { preserveScroll: true, preserveState: true });
}

function openRemove(friend) {
    removeTarget.value = { id: friend.id, name: friend.name };
}
function closeRemove() {
    removeTarget.value = null;
}
function confirmRemove() {
    if (!removeTarget.value) return;
    removing.value = true;
    router.delete(`/friends/${removeTarget.value.id}`, {
        preserveScroll: true,
        preserveState: true,
        onFinish: () => {
            removing.value = false;
            closeRemove();
        },
    });
}

function friendInitial(friend) {
    return friend?.name?.[0] ? friend.name[0].toUpperCase() : '?';
}
</script>

<template>
    <AppLayout title-key="friends.title">
        <div class="dh-fr-view">
            <div class="dh-fr-page">
                <div class="dh-fr-head">
                    <h1 class="dh-fr-title">{{ t('friends.title') }}</h1>
                </div>

                <!-- Cilnes -->
                <div class="dh-fr-tabs" role="tablist">
                    <button type="button" role="tab" class="dh-fr-tab" :class="{ 'dh-fr-tab--on': tab === 'list' }" @click="tab = 'list'">
                        {{ t('friends.tabList') }}
                    </button>
                    <button type="button" role="tab" class="dh-fr-tab" :class="{ 'dh-fr-tab--on': tab === 'incoming' }" @click="tab = 'incoming'">
                        {{ t('friends.tabIncoming') }}<span v-if="incomingCount"> ({{ incomingCount }})</span>
                    </button>
                    <button type="button" role="tab" class="dh-fr-tab" :class="{ 'dh-fr-tab--on': tab === 'outgoing' }" @click="tab = 'outgoing'">
                        {{ t('friends.tabOutgoing') }}
                    </button>
                </div>

                <!-- Saraksts -->
                <template v-if="tab === 'list'">
                    <div v-if="!friends.length" class="dh-fr-muted dh-fr-muted--tight">
                        <p class="dh-fr-muted-p">{{ t('friends.noFriends') }}</p>
                        <p class="dh-fr-muted-hint">{{ t('friends.emptyListHint') }}</p>
                    </div>
                    <div v-for="f in friends" :key="f.id" class="dh-fr-row">
                        <div class="dh-fr-av">
                            {{ friendInitial(f) }}
                            <span v-if="f.isOnline" class="dh-fr-online" aria-hidden="true" />
                        </div>
                        <span class="dh-fr-name">{{ f.name }}</span>
                        <div class="dh-fr-actions">
                            <button type="button" class="dth-btn dth-btn--sm dth-btn--ghost" @click="openRemove(f)">
                                {{ t('friends.removeFriend') }}
                            </button>
                        </div>
                    </div>
                </template>

                <!-- Ienākošie -->
                <template v-else-if="tab === 'incoming'">
                    <div v-if="!incoming.length" class="dh-fr-muted">{{ t('friends.noIncoming') }}</div>
                    <div v-for="r in incoming" :key="r.id" class="dh-fr-row dh-fr-row--wrap">
                        <div class="dh-fr-incoming-txt">
                            <div class="dh-fr-name dh-fr-name--wrap">{{ r.user.name }}</div>
                            <div class="dh-fr-email dh-fr-email--mt">{{ t('friends.wantsFriend') }}</div>
                        </div>
                        <div class="dh-fr-actions">
                            <button type="button" class="dth-btn dth-btn--sm dth-btn--accent" @click="accept(r.id)">
                                {{ t('friends.accept') }}
                            </button>
                            <button type="button" class="dth-btn dth-btn--sm dth-btn--ghost" @click="reject(r.id)">
                                {{ t('friends.reject') }}
                            </button>
                        </div>
                    </div>
                </template>

                <!-- Izejošie -->
                <template v-else-if="tab === 'outgoing'">
                    <div v-if="!outgoing.length" class="dh-fr-muted">{{ t('friends.noOutgoing') }}</div>
                    <div v-for="row in outgoing" :key="row.id" class="dh-fr-row">
                        <span class="dh-fr-name">{{ row.user.name }}</span>
                        <span
                            class="dh-fr-pill"
                            :class="row.status === 'pending' ? 'dh-fr-pill--amber' : row.status === 'accepted' ? 'dh-fr-pill--em' : 'dh-fr-pill--muted'"
                        >
                            {{ row.status === 'pending' ? t('friends.stPending') : row.status === 'accepted' ? t('friends.stAccepted') : t('friends.stRejected') }}
                        </span>
                    </div>
                </template>

                <!-- Meklēšana -->
                <div class="dh-fr-search">
                    <div class="dh-fr-search-lab">{{ t('friends.searchSectionTitle') }}</div>
                    <input
                        v-model="searchQ"
                        type="search"
                        maxlength="80"
                        class="dh-fr-input"
                        :placeholder="t('friends.searchPlaceholder')"
                        @input="onSearchInput"
                    />
                    <div v-if="searching" class="dh-fr-muted dh-fr-muted--flat">{{ t('friends.searching') }}</div>
                    <div v-else-if="searchQ.trim().length >= 1 && !searchResults.length" class="dh-fr-muted dh-fr-muted--flat">
                        {{ t('friends.noHits') }}
                    </div>
                    <div v-for="u in searchResults" :key="u.id" class="dh-fr-hit">
                        <div class="dh-fr-hit-main">
                            <div class="dh-fr-name">{{ u.name }}</div>
                            <div v-if="u.email" class="dh-fr-email">{{ u.email }}</div>
                        </div>
                        <button
                            v-if="u.relationship === 'none'"
                            type="button"
                            class="dth-btn dth-btn--sm dth-btn--accent"
                            :disabled="sendingIds.has(u.id)"
                            @click="sendRequest(u.id)"
                        >
                            {{ t('friends.sendRequest') }}
                        </button>
                        <span v-else-if="u.relationship === 'outgoing_pending'" class="dh-fr-pill dh-fr-pill--muted">{{ t('friends.pendingOut') }}</span>
                        <span v-else-if="u.relationship === 'incoming_pending'" class="dh-fr-pill dh-fr-pill--amber">{{ t('friends.pendingIn') }}</span>
                    </div>
                </div>
            </div>

            <!-- Noņemšanas apstiprinājums -->
            <Teleport to="body">
                <Transition name="fade">
                    <div v-if="removeTarget" class="dh-fr-modal-bg" @click.self="closeRemove">
                        <div class="dh-fr-modal" role="dialog" aria-modal="true">
                            <div class="dh-fr-modal-hd">
                                <div class="dh-fr-modal-hd-in">
                                    <div class="dh-fr-modal-ico" aria-hidden="true">👋</div>
                                    <div class="dh-fr-modal-copy">
                                        <h3 class="dh-fr-modal-title">{{ t('friends.removeModalTitle') }}</h3>
                                        <p class="dh-fr-modal-txt">{{ removeConfirmText }}</p>
                                        <p class="dh-fr-modal-hint">{{ t('friends.removeModalHint') }}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="dh-fr-modal-ft">
                                <button type="button" class="dth-btn dth-btn--md dth-btn--ghost dth-btn--full" @click="closeRemove">
                                    {{ t('friends.removeModalCancel') }}
                                </button>
                                <button type="button" class="dth-btn dth-btn--md dth-btn--remove dth-btn--full" :disabled="removing" @click="confirmRemove">
                                    {{ removing ? t('friends.removeModalWorking') : t('friends.removeModalConfirmBtn') }}
                                </button>
                            </div>
                        </div>
                    </div>
                </Transition>
            </Teleport>
        </div>
    </AppLayout>
</template>

<style scoped>
.dh-fr-view {
    display: flex;
    flex-direction: column;
    min-height: 100%;
    box-sizing: border-box;
}
.dh-fr-page {
    flex: 1 1 auto;
    min-height: 0;
    max-width: 640px;
    margin: 0 auto;
    width: 100%;
    padding: 24px 20px;
}
.dh-fr-muted--tight {
    padding-top: 0;
}
.dh-fr-muted-p {
    margin: 0 0 8px;
}
.dh-fr-muted-hint {
    margin: 0 0 12px;
    font-size: 12px;
    max-width: 28rem;
    margin-left: auto;
    margin-right: auto;
}
.dh-fr-muted--flat {
    padding: 0;
    text-align: left;
}
.dh-fr-row--wrap {
    flex-wrap: wrap;
}
.dh-fr-online {
    position: absolute;
    right: -2px;
    bottom: -2px;
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: #3ecf8e;
    border: 2px solid #0a1120;
}
.dh-fr-incoming-txt {
    min-width: 0;
    flex: 1 1 140px;
}
.dh-fr-name--wrap {
    white-space: normal;
}
.dh-fr-email--mt {
    margin-top: 4px;
}
.dh-fr-hit-main {
    min-width: 0;
    flex: 1 1 auto;
}
.dh-fr-modal-copy {
    min-width: 0;
}
</style>
