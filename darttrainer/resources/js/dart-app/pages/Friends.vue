<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Friends } from '../api/client.js';
import { useAuthStore, useLocaleStore, useFriendsStore } from '../store/index.js';
import { useCanvasBnav } from '../composables/useCanvasBnav.js';
import HomeStrokeIcon from '../components/home/HomeStrokeIcon.vue';

defineOptions({ name: 'FriendsPage' });

const auth = useAuthStore();
const locale = useLocaleStore();
const friendsStore = useFriendsStore();
const router = useRouter();
const t = (k) => locale.t(k);

const { bnav, bnavOn, bnavClick, bnavDisabled } = useCanvasBnav();

const searchQ = ref('');
const searchHits = ref([]);
const searching = ref(false);
const friendList = ref([]);
const loading = ref(true);
const tab = ref('list');
const removingId = ref(null);
const removeModalOpen = ref(false);
const removeTarget = ref(null);

const removeConfirmText = computed(() => {
  const raw = t('friends.removeConfirm');
  const name = removeTarget.value?.name || '…';
  return raw.replace(/\{name\}/g, name);
});

async function loadLists() {
  if (!auth.user) {
    loading.value = false;
    return;
  }
  loading.value = true;
  try {
    const { data } = await Friends.list();
    friendList.value = data.items || [];
    await friendsStore.refresh();
  } catch (_) {
    friendList.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(loadLists);

let searchTimer = null;
function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(runSearch, 280);
}

async function runSearch() {
  const q = searchQ.value.trim();
  if (q.length < 1) {
    searchHits.value = [];
    return;
  }
  searching.value = true;
  try {
    const { data } = await Friends.search(q);
    searchHits.value = data.items || [];
  } catch (_) {
    searchHits.value = [];
  } finally {
    searching.value = false;
  }
}

async function sendRequest(userId) {
  try {
    await Friends.sendRequest(userId);
    window._dartToast?.(t('friends.requestSent'), 'success');
    await runSearch();
    friendsStore.refresh();
  } catch (e) {
    const msg = e.response?.data?.error || t('common.error');
    window._dartToast?.(msg, 'error');
  }
}

async function accept(id) {
  await friendsStore.acceptRequest(id);
  await loadLists();
}

async function reject(id) {
  await friendsStore.rejectRequest(id);
  await loadLists();
}

function openRemoveModal(f) {
  removeTarget.value = { id: f.id, name: f.name || '' };
  removeModalOpen.value = true;
}

function closeRemoveModal() {
  removeModalOpen.value = false;
  removeTarget.value = null;
}

async function confirmRemoveFriend() {
  const tgt = removeTarget.value;
  if (!tgt) return;
  removingId.value = tgt.id;
  try {
    await Friends.remove(tgt.id);
    window._dartToast?.(t('friends.removedToast'), 'success');
    closeRemoveModal();
    await loadLists();
    await runSearch();
  } catch (e) {
    const msg = e.response?.data?.error || t('common.error');
    window._dartToast?.(msg, 'error');
  } finally {
    removingId.value = null;
  }
}

function friendInitial(f) {
  const n = f?.name;
  return n && n[0] ? String(n[0]).toUpperCase() : '?';
}
</script>

<template>
  <div class="dh-fr-view">
    <div class="dh-fr-page">
      <div class="dh-fr-head">
        <h1 class="dh-fr-title">{{ t('friends.title') }}</h1>
        <p v-if="!auth.user" class="dh-fr-sub">{{ t('friends.subtitle') }}</p>
      </div>

      <template v-if="!auth.user"> 
        <p class="dh-fr-muted">{{ t('friends.loginHint') }}</p>
        <button type="button" class="dth-btn dth-btn--accent dth-btn--md dth-btn--full" @click="router.push('/login')">
          {{ t('friends.loginLink') }}
        </button>
      </template>

      <template v-else>
        <div class="dh-fr-tabs" role="tablist">
          <button type="button" role="tab" class="dh-fr-tab" :class="{ 'dh-fr-tab--on': tab === 'list' }" @click="tab = 'list'">
            {{ t('friends.tabList') }}
          </button>
          <button type="button" role="tab" class="dh-fr-tab" :class="{ 'dh-fr-tab--on': tab === 'incoming' }" @click="tab = 'incoming'">
            {{ t('friends.tabIncoming') }}
            <span v-if="friendsStore.incomingCount"> ({{ friendsStore.incomingCount }})</span>
          </button>
          <button type="button" role="tab" class="dh-fr-tab" :class="{ 'dh-fr-tab--on': tab === 'outgoing' }" @click="tab = 'outgoing'">
            {{ t('friends.tabOutgoing') }}
          </button>
        </div>

        <div v-if="loading" class="dh-fr-muted">{{ t('friends.loading') }}</div>

        <template v-else-if="tab === 'list'">
          <div v-if="!friendList.length" class="dh-fr-muted dh-fr-muted--tight">
            <p class="dh-fr-muted-p">{{ t('friends.noFriends') }}</p>
            <p class="dh-fr-muted-hint">{{ t('friends.emptyListHint') }}</p>
            <button type="button" class="dh-fr-link" @click="loadLists()">{{ t('friends.refreshList') }}</button>
          </div>
          <div v-for="f in friendList" :key="f.id" class="dh-fr-row">
            <div class="dh-fr-av">
              {{ friendInitial(f) }}
              <span v-if="f.is_online" class="dh-fr-online" aria-hidden="true"></span>
            </div>
            <span class="dh-fr-name">{{ f.name }}</span>
            <div class="dh-fr-actions">
              <button type="button" class="dth-btn dth-btn--sm dth-btn--ghost" :disabled="removingId === f.id" @click="openRemoveModal(f)">
                {{ t('friends.removeFriend') }}
              </button>
            </div>
          </div>
        </template>

        <template v-else-if="tab === 'incoming'">
          <div v-if="!friendsStore.incoming.length" class="dh-fr-muted">{{ t('friends.noIncoming') }}</div>
          <div v-for="r in friendsStore.incoming" :key="r.id" class="dh-fr-row dh-fr-row--wrap">
            <div class="dh-fr-incoming-txt">
              <div class="dh-fr-name dh-fr-name--wrap">{{ r.user.name }}</div>
              <div class="dh-fr-email dh-fr-email--mt">{{ t('friends.wantsFriend') }}</div>
            </div>
            <div class="dh-fr-actions">
              <button type="button" class="dth-btn dth-btn--sm dth-btn--accent" :disabled="friendsStore.busyId === r.id" @click="accept(r.id)">
                {{ t('friends.accept') }}
              </button>
              <button type="button" class="dth-btn dth-btn--sm dth-btn--ghost" :disabled="friendsStore.busyId === r.id" @click="reject(r.id)">
                {{ t('friends.reject') }}
              </button>
            </div>
          </div>
        </template>

        <template v-else-if="tab === 'outgoing'">
          <div v-if="!friendsStore.outgoing.length" class="dh-fr-muted">{{ t('friends.noOutgoing') }}</div>
          <div v-for="row in friendsStore.outgoing" :key="row.id" class="dh-fr-row">
            <span class="dh-fr-name">{{ row.user.name }}</span>
            <span
              class="dh-fr-pill"
              :class="
                row.status === 'pending' ? 'dh-fr-pill--amber' : row.status === 'accepted' ? 'dh-fr-pill--em' : 'dh-fr-pill--muted'
              "
            >
              {{
                row.status === 'pending'
                  ? t('friends.stPending')
                  : row.status === 'accepted'
                    ? t('friends.stAccepted')
                    : t('friends.stRejected')
              }}
            </span>
          </div>
          <button type="button" class="dh-fr-link" @click="friendsStore.refresh(); loadLists()">{{ t('friends.refresh') }}</button>
        </template>

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
          <div v-else-if="searchQ.trim().length >= 1 && !searchHits.length" class="dh-fr-muted dh-fr-muted--flat">{{ t('friends.noHits') }}</div>
          <div v-for="u in searchHits" :key="u.id" class="dh-fr-hit">
            <div class="dh-fr-hit-main">
              <div class="dh-fr-name">{{ u.name }}</div>
              <div v-if="u.email" class="dh-fr-email">{{ u.email }}</div>
            </div>
            <button v-if="u.relationship === 'none'" type="button" class="dth-btn dth-btn--sm dth-btn--accent" @click="sendRequest(u.id)">
              {{ t('friends.sendRequest') }}
            </button>
            <span v-else-if="u.relationship === 'outgoing_pending'" class="dh-fr-pill dh-fr-pill--muted">{{ t('friends.pendingOut') }}</span>
            <span v-else-if="u.relationship === 'incoming_pending'" class="dh-fr-pill dh-fr-pill--amber">{{ t('friends.pendingIn') }}</span>
          </div>
        </div>
      </template>
    </div>

    <div class="dth-bnav dth-bnav--mob-only" role="navigation" :aria-label="t('nav.bnavAria')">
      <button
        v-for="b in bnav"
        :key="b.id"
        type="button"
        :class="['dth-bnav-b', { 'dth-bnav-b--on': bnavOn(b) }]"
        :aria-disabled="bnavDisabled(b)"
        :aria-current="bnavOn(b) ? 'page' : undefined"
        @click="bnavClick(b)"
      >
        <HomeStrokeIcon :name="b.icon" :size="20" color="currentColor" />
        <span class="dh-bn-lb">{{ b.label }}</span>
      </button>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="removeModalOpen && removeTarget" class="dh-fr-modal-bg" @click.self="closeRemoveModal()">
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
              <button type="button" class="dth-btn dth-btn--md dth-btn--ghost dth-btn--full" @click="closeRemoveModal()">
                {{ t('friends.removeModalCancel') }}
              </button>
              <button
                type="button"
                class="dth-btn dth-btn--md dth-btn--remove dth-btn--full"
                :disabled="removingId === removeTarget.id"
                @click="confirmRemoveFriend()"
              >
                {{ removingId === removeTarget.id ? t('friends.removeModalWorking') : t('friends.removeModalConfirmBtn') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
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
