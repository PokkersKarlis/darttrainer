import { Friends, GuestPresets, Rooms } from '../../api/client.js';
import * as Vue from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useBodyShellClass } from '../../composables/useBodyShellClass.js';
import { useAuthStore, useLocaleStore } from '../../store/index.js';
import { onAppPause, onAppResume } from '../../composables/useAppResume.js';

/** @param {import('vue').Ref<'cricket'|'x01'>} gameKindRef */
export function useLobbyCore(gameKindRef) {
  useBodyShellClass('body--lobby-shell');
  const auth = useAuthStore();
  const locale = useLocaleStore();
  const router = useRouter();
  const route = useRoute();
  const t = (k) => locale.t(k);

  const tab = Vue.ref('create');
  const loading = Vue.ref(false);
  const checkingActive = Vue.ref(true);
  /** Īslaicīga setupa meklēšana pēc filtra maiņas (my-active). */
  const checkingSetupMatch = Vue.ref(false);
  const error = Vue.ref('');
  const room = Vue.ref(null);
  const showLobbyTip = Vue.ref(false);

  const showOrderModal = Vue.ref(false);
  const orderMethod = Vue.ref('current');
  const playerOrder = Vue.ref([]);

  const ORDER_METHOD_KEYS = ['current', 'random', 'bulloff', 'manual'];

  const ORDER_METHODS = Vue.computed(() => ({
    current: {
      label: t('lobby.order.current.label'),
      description: t('lobby.order.current.desc'),
    },
    random: {
      label: t('lobby.order.random.label'),
      description: t('lobby.order.random.desc'),
    },
    bulloff: {
      label: t('lobby.order.bulloff.label'),
      description: t('lobby.order.bulloff.desc'),
    },
    manual: {
      label: t('lobby.order.manual.label'),
      description: t('lobby.order.manual.desc'),
    },
  }));

  const createForm = Vue.reactive({
    play_mode: 'online',
    game_type: 'x01',
    variant: 501,
    in_mode: 'straight',
    out_mode: 'double',
    cricket_type: 'standard',
    max_players: 2,
    legs: 1,
    sets: 1,
  });

  function syncGameKindToForm() {
    createForm.game_type = gameKindRef.value === 'cricket' ? 'cricket' : 'x01';
  }

  syncGameKindToForm();

  const friendList = Vue.ref([]);
  const presetList = Vue.ref([]);
  const selectedFriendIds = Vue.ref([]);
  const selectedPresetIds = Vue.ref([]);
  const adHocGuests = Vue.ref([]);
  const newAdHocGuest = Vue.ref('');
  /** Lokālā atlasītāja cilnes: draugi | saglabātie | jauns viesis */
  const localPickerTab = Vue.ref('friends');
  const friendSearch = Vue.ref('');
  const presetSearch = Vue.ref('');
  const saveGuestToLibrary = Vue.ref(false);
  const guestPickerBusy = Vue.ref(false);

  const localRosterCount = Vue.computed(
    () => selectedFriendIds.value.length + selectedPresetIds.value.length + adHocGuests.value.length,
  );

  /** Rinda UI: hosts + atlasītie draugi, preset viesi, šīs spēles viesi. */
  const localRosterDisplay = Vue.computed(() => {
    const rows = [];
    const hostName = (auth.user?.name && String(auth.user.name).trim()) || 'Host';
    rows.push({ key: 'host', kind: 'host', name: hostName });

    for (const id of selectedFriendIds.value) {
      const fr = friendList.value.find((x) => x.id === id);
      rows.push({
        key: `f-${id}`,
        kind: 'friend',
        id,
        name: fr?.name ?? `#${id}`,
      });
    }
    for (const id of selectedPresetIds.value) {
      const pr = presetList.value.find((x) => x.id === id);
      rows.push({
        key: `p-${id}`,
        kind: 'preset',
        id,
        name: pr?.name ?? `#${id}`,
      });
    }
    adHocGuests.value.forEach((name, index) => {
      rows.push({ key: `g-${index}`, kind: 'guest', index, name });
    });
    return rows;
  });

  const filteredFriendList = Vue.computed(() => {
    const q = friendSearch.value.trim().toLowerCase();
    const list = friendList.value;
    if (!q) return list;
    return list.filter((fr) => String(fr.name || '').toLowerCase().includes(q));
  });

  const filteredPresetList = Vue.computed(() => {
    const q = presetSearch.value.trim().toLowerCase();
    const list = presetList.value;
    if (!q) return list;
    return list.filter((pr) => String(pr.name || '').toLowerCase().includes(q));
  });

  function removeFromLocalRoster(row) {
    if (row.kind === 'friend') toggleFriendId(row.id);
    else if (row.kind === 'preset') togglePresetId(row.id);
    else if (row.kind === 'guest') removeAdHoc(row.index);
  }

  async function loadFriendsAndPresets() {
    if (!auth.user) return;
    try {
      const [f, p] = await Promise.all([Friends.list(), GuestPresets.list()]);
      friendList.value = f.data.items || [];
      presetList.value = p.data.items || [];
    } catch (_) {
      friendList.value = [];
      presetList.value = [];
    }
  }

  function rosterAtCap() {
    return localRosterCount.value >= 3;
  }

  function toggleFriendId(id) {
    const i = selectedFriendIds.value.indexOf(id);
    if (i >= 0) selectedFriendIds.value.splice(i, 1);
    else if (!rosterAtCap()) selectedFriendIds.value.push(id);
    else window._dartToast?.(t('lobby.localRosterAtCap'), 'error');
  }

  function togglePresetId(id) {
    const i = selectedPresetIds.value.indexOf(id);
    if (i >= 0) selectedPresetIds.value.splice(i, 1);
    else if (!rosterAtCap()) selectedPresetIds.value.push(id);
    else window._dartToast?.(t('lobby.localRosterAtCap'), 'error');
  }

  function addAdHocGuest() {
    const n = newAdHocGuest.value.trim();
    if (!n) {
      window._dartToast?.(t('lobby.localGuestNameRequired'), 'error');
      return;
    }
    if (n.length > 50) {
      window._dartToast?.(t('lobby.localGuestNameTooLong'), 'error');
      return;
    }
    if (rosterAtCap()) {
      window._dartToast?.(t('lobby.localRosterAtCap'), 'error');
      return;
    }
    adHocGuests.value = [...adHocGuests.value, n];
    newAdHocGuest.value = '';
  }

  function removeAdHoc(i) {
    adHocGuests.value = adHocGuests.value.filter((_, j) => j !== i);
  }

  async function submitAddGuestFromPicker() {
    const n = newAdHocGuest.value.trim();
    if (!n) {
      window._dartToast?.(t('lobby.localGuestNameRequired'), 'error');
      return;
    }
    if (n.length > 50) {
      window._dartToast?.(t('lobby.localGuestNameTooLong'), 'error');
      return;
    }
    if (rosterAtCap()) {
      window._dartToast?.(t('lobby.localRosterAtCap'), 'error');
      return;
    }
    if (saveGuestToLibrary.value) {
      guestPickerBusy.value = true;
      try {
        const { data } = await GuestPresets.create(n);
        await loadFriendsAndPresets();
        const id = data?.id;
        if (id != null && !selectedPresetIds.value.includes(id) && !rosterAtCap()) {
          selectedPresetIds.value.push(id);
        }
        newAdHocGuest.value = '';
        saveGuestToLibrary.value = false;
        window._dartToast?.(t('lobby.presetSaved'), 'success');
      } catch (e) {
        window._dartToast?.(e.response?.data?.error || t('common.error'), 'error');
      } finally {
        guestPickerBusy.value = false;
      }
    } else {
      addAdHocGuest();
    }
  }

  async function deletePreset(id) {
    try {
      await GuestPresets.delete(id);
      selectedPresetIds.value = selectedPresetIds.value.filter((x) => x !== id);
      await loadFriendsAndPresets();
    } catch (_) {}
  }

  function buildLocalRoster() {
    const roster = [];
    for (const id of selectedFriendIds.value) roster.push({ kind: 'friend', user_id: id });
    for (const id of selectedPresetIds.value) roster.push({ kind: 'preset', preset_id: id });
    for (const name of adHocGuests.value) roster.push({ kind: 'guest', name });
    return roster;
  }

  const joinForm = Vue.reactive({ code: '' });

  /** Izveides vīzards: 1 = spēles iestatījumi, 2 = spēlētāji. */
  const createWizardStep = Vue.ref(1);

  function goWizardNext() {
    error.value = '';
    if (blockedRoomForType.value || checkingSetupMatch.value) return;
    if (createForm.play_mode === 'local') {
      loadFriendsAndPresets();
      localPickerTab.value = 'friends';
      friendSearch.value = '';
      presetSearch.value = '';
    } else {
      createForm.max_players = 4;
    }
    createWizardStep.value = 2;
  }

  function goWizardBack() {
    error.value = '';
    if (checkingSetupMatch.value) return;
    createWizardStep.value = 1;
  }

  async function openCreateTab() {
    if (checkingSetupMatch.value) return;
    error.value = '';
    createWizardStep.value = 1;
    tab.value = 'create';
    await refreshBlockedRoomForType({ immediate: true });
  }

  /** Telpa ar to pašu vīzarda setupu (my-active ar pilniem query parametriem). */
  const blockedRoomForType = Vue.ref(null);
  let refreshBlockedTimer = null;
  let myActiveLookupSeq = 0;

  function buildMyActiveParams() {
    const pm = createForm.play_mode === 'local' ? 'local' : 'online';
    const params = {
      game_type: createForm.game_type,
      play_mode: pm,
    };
    if (createForm.game_type === 'x01') {
      params.variant = createForm.variant;
      params.in_mode = createForm.in_mode;
      params.out_mode = createForm.out_mode;
    } else if (createForm.game_type === 'cricket') {
      params.cricket_type = createForm.cricket_type;
    }
    return params;
  }

  async function refreshBlockedRoomForTypeImmediate() {
    if (!auth.user || room.value) {
      blockedRoomForType.value = null;
      checkingSetupMatch.value = false;
      return;
    }
    const seq = ++myActiveLookupSeq;
    checkingSetupMatch.value = true;
    blockedRoomForType.value = null;
    try {
      const { data } = await Rooms.myActive({ params: buildMyActiveParams() });
      if (seq !== myActiveLookupSeq) return;
      blockedRoomForType.value = data.room ?? null;
    } catch (_) {
      if (seq === myActiveLookupSeq) blockedRoomForType.value = null;
    } finally {
      if (seq === myActiveLookupSeq) checkingSetupMatch.value = false;
    }
  }

  function scheduleRefreshBlockedRoomForType() {
    if (!auth.user || room.value) {
      if (refreshBlockedTimer) {
        clearTimeout(refreshBlockedTimer);
        refreshBlockedTimer = null;
      }
      blockedRoomForType.value = null;
      checkingSetupMatch.value = false;
      return;
    }
    if (refreshBlockedTimer) clearTimeout(refreshBlockedTimer);
    refreshBlockedTimer = setTimeout(() => {
      refreshBlockedTimer = null;
      refreshBlockedRoomForTypeImmediate();
    }, 200);
  }

  /** @param {{ immediate?: boolean }} [opts] @returns {Promise<void>|void} */
  function refreshBlockedRoomForType(opts = {}) {
    if (opts.immediate) {
      if (refreshBlockedTimer) {
        clearTimeout(refreshBlockedTimer);
        refreshBlockedTimer = null;
      }
      return refreshBlockedRoomForTypeImmediate();
    }
    scheduleRefreshBlockedRoomForType();
    return undefined;
  }

  /** Esošās telpas īss apraksts (variants / cricket tips) — apakšējā joslai. */
  function blockedRoomSummaryLine(br) {
    if (!br) return '';
    if (br.game_type === 'x01') {
      const v = br.game_config?.variant;
      return v != null ? `X01 ${v}` : 'X01';
    }
    if (br.game_type === 'cricket') {
      const rnd = br.game_config?.cricket_type === 'random';
      const ct = rnd ? t('lobby.cricketRandomShort') : t('lobby.cricketStandardShort');
      const local = (br.play_mode ?? 'online') === 'local';
      const pm = local ? t('lobby.playLocal') : t('lobby.playOnline');
      return `${pm} · ${ct}`;
    }
    return String(br.game_type).replace(/_/g, ' ').toUpperCase();
  }

  async function continueExistingTypeRoom() {
    const br = blockedRoomForType.value;
    if (!br) return;
    loading.value = true;
    error.value = '';
    try {
      const { data } = await Rooms.show(br.id);
      room.value = data;
      blockedRoomForType.value = null;
      if (data.match_id) {
        stopRoomPoll();
        router.push(`/game/${data.match_id}`);
        return;
      }
      startRoomPoll();
    } catch (e) {
      error.value = e.response?.data?.error || 'Kļūda.';
    } finally {
      loading.value = false;
    }
  }

  /** Atstāj telpu, kas bloķē konkrēto setupu (my-active), un pārbauda vēlreiz. */
  async function resetExistingTypeRoom() {
    const br = blockedRoomForType.value;
    if (!br || checkingSetupMatch.value) return;
    loading.value = true;
    error.value = '';
    try {
      await Rooms.leave(br.id);
      blockedRoomForType.value = null;
      await refreshBlockedRoomForType({ immediate: true });
    } catch (e) {
      error.value = e.response?.data?.error || 'Kļūda.';
    } finally {
      loading.value = false;
    }
  }

  const BO_LEG_OPTIONS = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21];
  const SET_COUNT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const isHost = Vue.computed(() => {
    if (!room.value || !auth.user) return false;
    return room.value.host_user_id === auth.user.id;
  });

  const hostPlayer = Vue.computed(() => room.value?.players?.find((p) => p.is_host) ?? null);

  /** Kamēr meklē my-active setupu — lobija izveide/pievienošanās un filtri „iesaldēti”. */
  const lobbyShellLocked = Vue.computed(() => checkingSetupMatch.value && !room.value);

  let roomPoll = null;
  let roomPollWasActive = false;

  function startRoomPoll() {
    if (roomPoll) return;
    roomPollWasActive = true;
    roomPoll = setInterval(async () => {
      if (!room.value) return;
      try {
        const { data } = await Rooms.show(room.value.id);
        room.value = data;
        if (data.match_id) {
          stopRoomPoll();
          router.push(`/game/${data.match_id}`);
        }
      } catch (_) {}
    }, 2000);
  }
  function stopRoomPoll() {
    if (roomPoll) {
      clearInterval(roomPoll);
      roomPoll = null;
    }
    roomPollWasActive = false;
  }

  // Pauze/atsākšana, kad ekrāns aizmieg / atbloķējas.
  onAppPause(() => {
    if (roomPoll) {
      clearInterval(roomPoll);
      roomPoll = null;
      // roomPollWasActive paliek true.
    }
  });
  onAppResume(() => {
    if (roomPollWasActive && !roomPoll && room.value) {
      startRoomPoll();
    }
  });

  Vue.onUnmounted(() => {
    stopRoomPoll();
    if (refreshBlockedTimer) {
      clearTimeout(refreshBlockedTimer);
      refreshBlockedTimer = null;
    }
  });

  Vue.watch(() => createForm.play_mode, (m) => {
    if (m === 'local') {
      loadFriendsAndPresets();
      if (tab.value === 'join') tab.value = 'create';
    }
  });

  Vue.watch(
    () => [
      createForm.play_mode,
      createForm.variant,
      createForm.in_mode,
      createForm.out_mode,
      createForm.cricket_type,
      gameKindRef.value,
    ],
    () => {
      syncGameKindToForm();
      /** Cricket: standarts un nejauši ir atšķirīgi setupi — pārbaudīt uzreiz pēc pārslēgšanas. */
      refreshBlockedRoomForType(gameKindRef.value === 'cricket' ? { immediate: true } : {});
    },
  );

  Vue.watch(gameKindRef, () => {
    syncGameKindToForm();
    applyLobbyQueryFromRoute();
    createWizardStep.value = 1;
    error.value = '';
    tab.value = 'create';
    refreshBlockedRoomForType({ immediate: true });
  });

  Vue.watch(() => tab.value, (v) => {
    if (v === 'create') refreshBlockedRoomForType();
    if (v === 'join') createWizardStep.value = 1;
  });

  Vue.watch(() => room.value, (r) => {
    if (r) blockedRoomForType.value = null;
    else {
      refreshBlockedRoomForType({ immediate: true });
      if (gameKindRef.value === 'cricket') createWizardStep.value = 1;
    }
  });

  /** Atgriežoties uz Cricket lobiju no citas lapas — vienmēr sākt ar 1. soli (četru režīmu izvēle). */
  Vue.watch(
    () => route.path,
    (path, prevPath) => {
      if (gameKindRef.value !== 'cricket' || path !== '/lobby/cricket' || room.value) return;
      if (prevPath != null && prevPath !== '' && prevPath !== path) {
        createWizardStep.value = 1;
      }
    },
  );

  function applyLobbyQueryFromRoute() {
    syncGameKindToForm();
    if (gameKindRef.value === 'cricket') {
      const rawCt = route.query.cricket_type;
      if (rawCt !== undefined && rawCt !== null && String(rawCt).trim() !== '') {
        const ct = String(rawCt).toLowerCase();
        createForm.cricket_type = ct === 'random' ? 'random' : 'standard';
      }
      const rawPm = route.query.play_mode;
      if (rawPm === 'local' || rawPm === 'online') {
        createForm.play_mode = rawPm;
        if (rawPm === 'local') void loadFriendsAndPresets();
      }
      tab.value = 'create';
      return;
    }
    const v = Number(route.query.variant);
    createForm.variant = v === 301 ? 301 : 501;
    tab.value = 'create';
  }

  Vue.watch(() => route.query, applyLobbyQueryFromRoute, { deep: true, immediate: true });

  Vue.onMounted(async () => {
    if (!auth.user) {
      checkingActive.value = false;
      return;
    }
    try {
      await refreshBlockedRoomForType({ immediate: true });
    } catch (_) {}
    checkingActive.value = false;
  });

  async function createRoom() {
    if (checkingSetupMatch.value) return;
    syncGameKindToForm();
    error.value = '';
    loading.value = true;
    try {
      if (createForm.play_mode === 'local') {
        if (localRosterCount.value < 1) {
          error.value = t('lobby.localRosterEmpty');
          loading.value = false;
          return;
        }
      }
      const config = buildConfig(createForm);
      const payload = {
        game_type: createForm.game_type,
        game_config: config,
        max_players: createForm.max_players,
        play_mode: createForm.play_mode === 'local' ? 'local' : 'online',
      };
      if (createForm.play_mode === 'local') {
        payload.local_roster = buildLocalRoster();
      }
      const { data } = await Rooms.create(payload);
      room.value = data;
      startRoomPoll();
      if (data.play_mode === 'local') {
        Vue.nextTick(() => openOrderModal());
      }
    } catch (e) {
      const st = e.response?.status;
      const d = e.response?.data || {};
      error.value = d.error || 'Kļūda.';
      if (st === 409 && d.room) {
        error.value = '';
        blockedRoomForType.value = null;
        room.value = d.room;
        if (d.room.match_id) {
          stopRoomPoll();
          router.push(`/game/${d.room.match_id}`);
        } else {
          startRoomPoll();
          if (d.room.play_mode === 'local') {
            Vue.nextTick(() => openOrderModal());
          }
        }
      }
    } finally {
      loading.value = false;
    }
  }

  async function joinRoom() {
    if (createForm.play_mode === 'local') return;
    if (checkingSetupMatch.value) return;
    error.value = '';
    loading.value = true;
    try {
      const { data } = await Rooms.join({ code: joinForm.code.toUpperCase() });
      room.value = data;
      if (data.match_id) router.push(`/game/${data.match_id}`);
      else startRoomPoll();
    } catch (e) {
      error.value = e.response?.data?.error || 'Kods nav atrasts.';
    } finally {
      loading.value = false;
    }
  }

  async function leaveRoom() {
    stopRoomPoll();
    await Rooms.leave(room.value.id);
    room.value = null;
  }

  function buildConfig(f) {
    if (f.game_type === 'x01') return { variant: f.variant, in: f.in_mode, out: f.out_mode };
    if (f.game_type === 'cricket') return { cricket_type: f.cricket_type };
    return {};
  }

  function copyCode() {
    navigator.clipboard?.writeText(room.value?.code);
    window._dartToast?.(t('lobby.codeCopied'));
  }

  function openOrderModal() {
    playerOrder.value = [...(room.value?.players ?? [])].sort((a, b) => a.order - b.order);
    orderMethod.value = 'current';
    if (!BO_LEG_OPTIONS.includes(createForm.legs)) {
      createForm.legs = 1;
    }
    if (!SET_COUNT_OPTIONS.includes(createForm.sets)) {
      createForm.sets = 1;
    }
    showOrderModal.value = true;
  }

  function setOrderMethod(method) {
    orderMethod.value = method;
    if (method === 'random') {
      const arr = [...playerOrder.value];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      playerOrder.value = arr;
    } else if (method === 'current') {
      playerOrder.value = [...(room.value?.players ?? [])].sort((a, b) => a.order - b.order);
    }
  }

  function moveUp(i) {
    if (i === 0) return;
    const arr = [...playerOrder.value];
    [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
    playerOrder.value = arr;
  }

  function moveDown(i) {
    if (i >= playerOrder.value.length - 1) return;
    const arr = [...playerOrder.value];
    [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
    playerOrder.value = arr;
  }

  async function confirmStartGame() {
    loading.value = true;
    error.value = '';
    try {
      const { data } = await Rooms.start(room.value.id, {
        legs: createForm.legs,
        sets: createForm.sets,
        player_order: playerOrder.value.map((p) => p.id),
      });
      showOrderModal.value = false;
      stopRoomPoll();
      router.push(`/game/${data.match_id}`);
    } catch (e) {
      error.value = e.response?.data?.error || 'Kļūda startējot.';
    } finally {
      loading.value = false;
    }
  }

  return {
    auth,
    tab,
    loading,
    checkingActive,
    error,
    room,
    isHost,
    hostPlayer,
    t,
    showOrderModal,
    orderMethod,
    playerOrder,
    ORDER_METHODS,
    ORDER_METHOD_KEYS,
    createForm,
    joinForm,
    createWizardStep,
    goWizardNext,
    goWizardBack,
    openCreateTab,
    createRoom,
    joinRoom,
    leaveRoom,
    copyCode,
    openOrderModal,
    setOrderMethod,
    moveUp,
    moveDown,
    confirmStartGame,
    BO_LEG_OPTIONS,
    SET_COUNT_OPTIONS,
    friendList,
    presetList,
    selectedFriendIds,
    selectedPresetIds,
    adHocGuests,
    newAdHocGuest,
    localRosterCount,
    filteredFriendList,
    filteredPresetList,
    localPickerTab,
    friendSearch,
    presetSearch,
    saveGuestToLibrary,
    guestPickerBusy,
    loadFriendsAndPresets,
    toggleFriendId,
    togglePresetId,
    addAdHocGuest,
    removeAdHoc,
    submitAddGuestFromPicker,
    deletePreset,
    rosterAtCap,
    localRosterDisplay,
    removeFromLocalRoster,
    blockedRoomForType,
    refreshBlockedRoomForType,
    continueExistingTypeRoom,
    resetExistingTypeRoom,
    blockedRoomSummaryLine,
    checkingSetupMatch,
    lobbyShellLocked,
    showLobbyTip,
  };
}
