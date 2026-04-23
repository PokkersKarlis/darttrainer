<script setup>
import { inject, computed } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useAuthStore } from '../../store/index.js';
import { useCricketLobbySetup } from '../../composables/useCricketLobbySetup.js';

const l = inject('lobbyCtx');
if (!l) {
  throw new Error('CricketLobbyLayout: missing lobbyCtx');
}

const auth = useAuthStore(); 
const route = useRoute();
const router = useRouter();

const t = l.t;

/** Nedestrukturējam, lai `computed` ref paliek viennozīmīgi reaktīvs veidā. */
const cricketLobby = useCricketLobbySetup(router, route, l);

// IMPORTANT (Vue 3): template ref-unwrapping neattiecas uz `inject()` objekta īpašībām.
// Tāpēc izceļam refus kā top-level bindingus, lai `v-if="createWizardStep === 1"` strādātu.
const showLobbyTip = l.showLobbyTip;
const createWizardStep = l.createWizardStep;
const error = l.error;
const checkingSetupMatch = l.checkingSetupMatch;
const blockedRoomForType = l.blockedRoomForType;
const loading = l.loading;
const lobbyShellLocked = l.lobbyShellLocked;
const createForm = l.createForm;
const lobbyAuth = l.auth;
const room = l.room;
const isHost = l.isHost;
const joinForm = l.joinForm;
const localRosterCount = l.localRosterCount;
const localPickerTab = l.localPickerTab;
const friendSearch = l.friendSearch;
const friendList = l.friendList;
const presetList = l.presetList;
const filteredFriendList = l.filteredFriendList;
const filteredPresetList = l.filteredPresetList;
const selectedFriendIds = l.selectedFriendIds;
const selectedPresetIds = l.selectedPresetIds;
const localRosterDisplay = l.localRosterDisplay;
const newAdHocGuest = l.newAdHocGuest;
const saveGuestToLibrary = l.saveGuestToLibrary;
const guestPickerBusy = l.guestPickerBusy;
const joinRoom = l.joinRoom;
const copyCode = l.copyCode;
const leaveRoom = l.leaveRoom;
const openOrderModal = l.openOrderModal;

const onlineName = computed(() => auth.user?.name || '—');
</script>

<template>
  <div
    class="lobby-v2 lobby-v2--cricket flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden lg:h-full"
  >
    <!-- Galvenā kolonna (pilnekrāna Cricket lobby — bez sānjoslas) -->
    <div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <!-- Augšas josla: mobilais -->
      <header
        class="flex h-12 shrink-0 items-center gap-3 border-b border-[#1e2738] bg-[#0f1520] px-4 lg:hidden"
      >
        <RouterLink
          to="/"
          class="shrink-0 rounded-lg border border-[#252d3d] px-2.5 py-1.5 text-xs font-semibold text-[#7b8ba8] hover:border-[#f5a62355] hover:text-[#e8eaf0]"
        >
          ← {{ t('nav.home') }}
        </RouterLink>
        <h1 class="min-w-0 flex-1 truncate text-sm font-bold text-[#e8eaf0]">
          {{ t('lobby.titleCricket') }}
        </h1>
        <button
          type="button"
          class="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/35 bg-amber-500/10 text-amber-400 text-xs font-black"
          :aria-expanded="showLobbyTip"
          :title="t('lobby.tipToggleTitle')"
          @click="showLobbyTip = !showLobbyTip"
        >
          ?
        </button>
      </header>

      <!-- Desktop: augšas josla -->
      <div
        class="hidden h-[52px] shrink-0 items-center justify-between border-b border-[#1e2738] px-6 lg:flex"
      >
        <div class="flex min-w-0 items-center gap-3">
          <RouterLink
            to="/"
            class="shrink-0 rounded-lg border border-[#252d3d] px-3 py-1.5 text-[12px] font-semibold text-[#7b8ba8] hover:border-[#f5a62355] hover:text-[#e8eaf0]"
          >
            ← {{ t('nav.home') }}
          </RouterLink>
          <div class="min-w-0">
            <h1 class="text-base font-bold text-[#e8eaf0]">{{ t('lobby.titleCricket') }}</h1>
            <p class="text-[11px] text-[#7b8ba8]">{{ t('lobby.subtitleCricket') }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-500/35 bg-amber-500/10 text-amber-400 text-xs font-black hover:bg-amber-500/20"
            :aria-expanded="showLobbyTip"
            :title="t('lobby.tipToggleTitle')"
            @click="showLobbyTip = !showLobbyTip"
          >
            ?
          </button>
          <div
            class="flex items-center gap-2 rounded-lg border border-[#252d3d] bg-[#131720] px-3 py-1.5"
          >
            <span
              class="h-2 w-2 shrink-0 rounded-full"
              style="background: #3ecf8e"
              aria-hidden="true"
            />
            <span class="text-xs font-semibold text-[#e8eaf0]">{{ onlineName }}</span>
          </div>
          <button
            v-if="auth.hydrated && auth.user"
            type="button"
            class="rounded-lg border border-[#3a1515] bg-[#2a1010] px-3.5 py-2 text-[13px] font-semibold"
            style="color: #ff5252"
            @click="auth.logout(); router.push('/login')"
          >
            {{ t('shell.logout') }}
          </button>
        </div>
      </div>

      <!-- Vīzarda soļu josla -->
      <div
        class="flex flex-shrink-0 items-stretch justify-center border-b border-[#1e2738] bg-[#0f1520] px-3 py-2.5 lg:px-6"
        role="status"
        aria-live="polite"
      >
        <div
          class="flex w-full max-w-md items-center gap-2 rounded-xl border border-[#252d3d] bg-[#131720] px-2.5 py-1.5"
        >
          <div class="flex min-w-0 flex-1 items-center gap-2">
            <span
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black"
              :style="createWizardStep === 1
                ? { background: 'linear-gradient(135deg, #f5a623, #f5c842)', color: '#0b0e14', boxShadow: '0 2px 10px rgba(245, 166, 35, 0.25)' }
                : { background: '#252d3d', color: '#7b8ba8', border: '1px solid #1e2738' }"
            >1</span>
            <span
              class="truncate text-[10px] font-black uppercase tracking-wider"
              :class="createWizardStep === 1 ? 'text-[#f5a623]' : 'text-[#7b8ba8]'"
            >{{ t('lobby.cricketWizardStep1') }}</span>
          </div>
          <span class="shrink-0 text-[10px] font-bold text-[#3a4a63]">›</span>
          <div class="flex min-w-0 flex-1 items-center justify-end gap-2">
            <span
              class="truncate text-right text-[10px] font-black uppercase tracking-wider"
              :class="createWizardStep === 2 ? 'text-[#f5a623]' : 'text-[#7b8ba8]'"
            >{{ t('lobby.wizardLabel2') }}</span>
            <span
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black"
              :style="createWizardStep === 2
                ? { background: 'linear-gradient(135deg, #f5a623, #f5c842)', color: '#0b0e14', boxShadow: '0 2px 10px rgba(245, 166, 35, 0.25)' }
                : { background: '#252d3d', color: '#7b8ba8', border: '1px solid #1e2738' }"
            >2</span>
          </div>
        </div>
      </div>
      <div
        v-show="showLobbyTip"
        class="shrink-0 border-b border-[#1e2738] bg-[#131720] px-4 py-2 lg:px-6"
      >
        <p class="text-[10px] leading-snug text-[#7b8ba8]">{{ t('lobby.tipBody') }}</p>
      </div>

      <div class="min-h-0 flex min-w-0 flex-1 flex-col overflow-hidden">
          <p v-if="error && createWizardStep === 2" class="shrink-0 px-4 pt-2 text-center text-xs text-red-400 lg:px-6">
            {{ error }}
          </p>

        <div
          v-if="createWizardStep === 1"
          class="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6"
        >
          <p
            v-if="error && createWizardStep === 1"
            class="mb-2 text-center text-xs text-red-400"
          >{{ error }}</p>
          <div
            class="mx-auto w-full max-w-xl"
            :aria-busy="checkingSetupMatch && lobbyAuth.user ? 'true' : 'false'"
          >
            <p class="mb-1 text-center text-[11px] font-black uppercase tracking-[0.14em] text-[#f5a623]">
              {{ t('lobby.cricketLobbyFourModes') }}
            </p>
            <p class="mb-1 text-center text-sm font-bold text-[#e8eaf0]">
              {{ t('lobby.cricketTypePickTitle') }}
            </p>
            <p class="mb-3 text-center text-[10px] leading-snug text-[#5a6d82]">
              {{ t('lobby.cricketWizardStep1Hint') }}
            </p>
            <p
              v-if="lobbyAuth.user && checkingSetupMatch"
              class="mb-2 text-center text-[10px] font-medium text-[#7b8ba8]"
            >{{ t('lobby.cricketSetupChecking') }}</p>
            <div
              class="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3"
              :class="(checkingSetupMatch && lobbyAuth.user) ? 'pointer-events-none opacity-[0.72]' : ''"
            >
              <button
                v-for="setup in cricketLobby.setups"
                :key="setup.id"
                type="button"
                class="flex min-h-[92px] flex-col rounded-2xl p-3 text-left transition-[opacity,transform] duration-150 sm:min-h-[126px] sm:p-4"
                :style="cricketLobby.cardTone(setup)"
                :aria-pressed="cricketLobby.isSetupSelected(setup) ? 'true' : 'false'"
                :disabled="(checkingSetupMatch && lobbyAuth.user) || loading"
                @click="cricketLobby.selectSetup(setup)"
              >
                <span class="text-[12px] font-extrabold leading-snug text-[#e8eaf0] sm:text-base">{{ t(setup.titleKey) }}</span>
                <span
                  class="mt-1.5 font-mono text-[8px] font-semibold leading-tight sm:mt-2 sm:text-[10px]"
                  :style="cricketLobby.isSetupSelected(setup)
                    ? (setup.cricketType === 'random' ? { color: '#ddd6fe' } : { color: '#a7f3d0' })
                    : { color: '#5a6d82' }"
                >{{ t(setup.segmentKey) }}</span>
                <span
                  v-if="cricketLobby.showsActiveRoomForSelection && cricketLobby.isSetupSelected(setup)"
                  class="mt-auto pt-1.5 text-[9px] font-bold leading-snug text-emerald-300 sm:pt-2 sm:text-[10px]"
                >{{ t('lobby.cricketSetupHasActiveRoom') }}</span>
              </button>
            </div>

            <div
              v-if="lobbyAuth.user && blockedRoomForType"
              class="mt-3 overflow-hidden rounded-2xl border border-[#065f46] bg-gradient-to-br from-[#052e16] to-[#064e3b]"
            >
              <div class="px-3 py-2.5">
                <p class="text-[10px] leading-snug text-emerald-100/90">{{ t('lobby.wizardStep1ResumeHint') }}</p>
                <div class="mt-2 flex items-center justify-between gap-2">
                  <p class="min-w-0 text-[10px] font-semibold text-slate-200">
                    <span class="truncate">{{ l.blockedRoomSummaryLine(blockedRoomForType) }}</span>
                    <span class="font-mono text-amber-400"> {{ blockedRoomForType.code }}</span>
                  </p>
                  <button
                    type="button"
                    :disabled="loading"
                    class="shrink-0 rounded-lg bg-[#10b981] px-2.5 py-1.5 text-[11px] font-bold text-white disabled:opacity-40"
                    @click="l.continueExistingTypeRoom()"
                  >{{ t('lobby.activeForTypeContinue') }}</button>
                </div>
              </div>
            </div>
            <p class="mt-4 text-center text-[10px] leading-snug text-[#5a6d82]">
              {{
                createForm.cricket_type === 'random'
                  ? t('lobby.cricketRandomDesc')
                  : t('lobby.cricketStandardDesc')
              }}
            </p>
          </div>
        </div>

        <div
          v-else-if="createWizardStep === 2"
          class="min-h-0 flex flex-1 flex-col overflow-hidden"
        >
          <div class="hidden shrink-0 border-b border-[#1e2738] bg-[#0f1520] px-4 py-2.5 lg:block lg:px-6">
            <button
              type="button"
              class="w-full rounded-lg border border-[#3a4a63] bg-[#1a2030] py-2.5 text-center text-[12px] font-semibold text-[#e8eaf0] hover:border-[#f5a62355]"
              @click="l.goWizardBack"
            >
              ← {{ t('lobby.cricketBackToFourModes') }}
            </button>
            <p class="mt-1.5 text-center text-[10px] leading-snug text-[#7b8ba8]">
              {{ t('lobby.cricketBackToFourModesHint') }}
            </p>
          </div>
          <div
            v-if="createForm.play_mode === 'local'"
            class="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6"
          >
            <div class="mx-auto w-full max-w-xl lg:max-w-md">
            <div
              class="mb-3 rounded-xl border border-[#252d3d] bg-[#131720] p-4"
            >
              <div class="mb-1 flex items-start justify-between">
                <div>
                  <h2 class="text-sm font-bold text-[#e8eaf0]">{{ t('lobby.localRosterHeading') }}</h2>
                  <p class="text-xs text-[#7b8ba8]">{{ t('lobby.localCap') }}</p>
                </div>
                <span
                  class="rounded-full px-2.5 py-1 text-xs font-semibold"
                  style="background: #3a2a0a; color: #f5a623"
                >{{ 1 + localRosterCount }}/4</span>
              </div>
              <div class="mt-2 text-xs font-semibold" style="color: #f5a623">
                ★ {{ (lobbyAuth.user?.name || 'Host') }} – {{ t('lobby.localHostShort') }}
              </div>
              <div class="mt-2 flex flex-wrap gap-2">
                <button
                  v-for="row in localRosterDisplay"
                  :key="row.key"
                  type="button"
                  class="inline-flex max-w-full items-center gap-2 rounded-lg border px-2 py-1 text-[11px] font-semibold"
                  :class="row.kind === 'host' ? 'border-[#1e2738] bg-[#0b0e14] text-[#7b8ba8]' : 'border-[#252d3d] bg-[#0b0e14] text-[#e8eaf0]'"
                  :disabled="row.kind === 'host'"
                  @click="row.kind !== 'host' && l.removeFromLocalRoster(row)"
                >
                  <span class="max-w-[220px] truncate">{{ row.name }}</span>
                  <span v-if="row.kind !== 'host'" class="text-[#ff5252] font-black">×</span>
                </button>
              </div>
            </div>

            <div class="mb-3 flex gap-0.5 rounded-lg border border-[#1e2738] bg-[#0b0e14] p-1">
              <button
                type="button"
                class="flex-1 rounded-md py-2 text-[11px] font-bold"
                :style="localPickerTab === 'friends' ? { background: 'linear-gradient(135deg, #f5a623, #f5c842)', color: '#0b0e14' } : { color: '#7b8ba8' }"
                @click="localPickerTab = 'friends'"
              >{{ t('lobby.localFriends') }}</button>
              <button
                type="button"
                class="flex-1 rounded-md py-2 text-[11px] font-bold"
                :style="localPickerTab === 'presets' ? { background: 'linear-gradient(135deg, #f5a623, #f5c842)', color: '#0b0e14' } : { color: '#7b8ba8' }"
                @click="localPickerTab = 'presets'"
              >{{ t('lobby.localPresets') }}</button>
              <button
                type="button"
                class="flex-1 rounded-md py-2 text-[11px] font-bold"
                :style="localPickerTab === 'guest' ? { background: 'linear-gradient(135deg, #f5a623, #f5c842)', color: '#0b0e14' } : { color: '#7b8ba8' }"
                @click="localPickerTab = 'guest'"
              >{{ t('lobby.localPickerTabGuest') }}</button>
            </div>

            <div v-if="localPickerTab === 'friends'" class="min-h-0">
              <input
                v-model="friendSearch"
                type="search"
                class="w-full rounded-lg border border-[#252d3d] bg-[#0b0e14] px-3.5 py-2.5 text-sm text-[#e8eaf0] outline-none placeholder:text-[#7b8ba8]"
                :placeholder="t('lobby.localSearchFriendsPlaceholder')"
              />
              <div class="mt-2 overflow-hidden rounded-lg border border-[#1e2738]">
                <p v-if="!friendList.length" class="p-3 text-xs text-[#7b8ba8]">{{ t('lobby.noFriendsForLocal') }}</p>
                <p v-else-if="!filteredFriendList.length" class="p-3 text-xs text-[#7b8ba8]">{{ t('lobby.localSearchNoResults') }}</p>
                <template v-else>
                  <button
                    v-for="fr in filteredFriendList"
                    :key="'f'+fr.id"
                    type="button"
                    class="flex w-full items-center justify-between border-b border-[#1e2738] px-3.5 py-2.5 text-left last:border-0"
                    :disabled="l.rosterAtCap() && !selectedFriendIds.includes(fr.id)"
                    @click="l.toggleFriendId(fr.id)"
                  >
                    <span class="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[13px] font-bold"
                          style="background: #252d3d; color: #7b8ba8">
                      {{ (fr.name || '?').charAt(0).toUpperCase() }}
                      <span
                        v-if="fr.is_online"
                        class="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border border-[#0b0e14]"
                        style="background: #3ecf8e"
                        aria-hidden="true"
                      />
                    </span>
                    <span class="min-w-0 flex-1 truncate pl-2 text-[13px] font-semibold text-[#e8eaf0]">{{ fr.name }}</span>
                    <span
                      v-if="selectedFriendIds.includes(fr.id)"
                      class="text-xs font-bold"
                      style="color: #f5a623"
                    >✓</span>
                    <span v-else class="text-xs font-bold text-[#7b8ba8]">+ Pievienot</span>
                  </button>
                </template>
              </div>
            </div>
            <div v-else-if="localPickerTab === 'presets'" class="p-0">
              <p v-if="!presetList.length" class="text-xs text-[#7b8ba8]">{{ t('lobby.localPresetsEmpty') }}</p>
              <div v-else class="overflow-hidden rounded-lg border border-[#1e2738]">
                <div
                  v-for="pr in presetList"
                  :key="'p'+pr.id"
                  class="flex items-stretch border-b border-[#1e2738] last:border-0"
                >
                  <button
                    type="button"
                    class="flex min-w-0 flex-1 items-center justify-between px-3 py-2.5 text-left"
                    :disabled="l.rosterAtCap() && !selectedPresetIds.includes(pr.id)"
                    @click="l.togglePresetId(pr.id)"
                  >
                    <span class="text-[13px] font-semibold text-[#e8eaf0]">{{ pr.name }}</span>
                    <span v-if="selectedPresetIds.includes(pr.id)">✓</span>
                  </button>
                  <button
                    type="button"
                    class="px-2 text-red-400"
                    @click="l.deletePreset(pr.id)"
                  >×</button>
                </div>
              </div>
            </div>
            <div v-else class="space-y-2">
              <input
                v-model="newAdHocGuest"
                class="w-full rounded-lg border border-[#252d3d] bg-[#0b0e14] px-3 py-2 text-sm text-white"
                :placeholder="t('lobby.localNewGuest')"
                @keyup.enter="l.submitAddGuestFromPicker"
              />
              <label class="flex gap-2 text-xs text-[#7b8ba8]">
                <input v-model="saveGuestToLibrary" type="checkbox" />
                {{ t('lobby.localSaveToLibrary') }}
              </label>
              <button
                type="button"
                class="w-full py-2.5 text-xs font-bold"
                style="background: linear-gradient(135deg, #f5a623, #f5c842); color: #0b0e14; border-radius: 8px; border: none"
                :disabled="guestPickerBusy"
                @click="l.submitAddGuestFromPicker"
              >+ {{ guestPickerBusy ? t('lobby.localAddingGuest') : t('lobby.localAddToGameOnly') }}</button>
            </div>
            </div>
          </div>

          <div
            v-else
            class="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6"
          >
            <div class="mx-auto w-full max-w-xl lg:max-w-2xl">
              <div v-if="!room" class="space-y-3">
                <div class="rounded-xl border border-[#252d3d] bg-[#131720] p-4">
                  <h2 class="text-sm font-bold text-[#e8eaf0]">{{ t('lobby.joinCodeLabel') }}</h2>
                  <p class="mt-1 text-xs text-[#7b8ba8]">{{ t('lobby.wizardStep2HintOnline') }}</p>
                  <div class="mt-3 flex gap-2">
                    <input
                      v-model="joinForm.code"
                      type="text"
                      maxlength="6"
                      class="flex-1 rounded-lg border border-[#252d3d] bg-[#0b0e14] px-3.5 py-2.5 text-sm font-mono tracking-widest text-[#e8eaf0] outline-none placeholder:text-[#3a4a63]"
                      :placeholder="t('lobby.joinCodePlaceholder')"
                      :disabled="loading || lobbyShellLocked"
                      @keyup.enter="!lobbyShellLocked && joinRoom()"
                    />
                    <button
                      type="button"
                      class="shrink-0 rounded-lg px-4 py-2.5 text-sm font-bold disabled:opacity-40"
                      style="background: linear-gradient(135deg, #f5a623, #f5c842); color: #0b0e14; border: none"
                      :disabled="loading || lobbyShellLocked || !joinForm.code"
                      @click="joinRoom"
                    >
                      {{ t('lobby.joinRoom') }}
                    </button>
                  </div>
                </div>

                <div class="rounded-xl border border-[#252d3d] bg-[#131720] p-4">
                  <h2 class="text-sm font-bold text-[#e8eaf0]">{{ t('lobby.createRoom') }}</h2>
                  <p class="mt-1 text-xs text-[#7b8ba8]">{{ t('lobby.createRoomHint') }}</p>
                  <button
                    type="button"
                    class="mt-3 w-full rounded-lg py-2.5 text-sm font-bold disabled:opacity-40"
                    style="background: linear-gradient(135deg, #f5a623, #f5c842); color: #0b0e14; border: none"
                    :disabled="loading || lobbyShellLocked"
                    @click="l.createRoom"
                  >
                    {{ t('lobby.createRoomCta') }}
                  </button>
                </div>
              </div>

                <div v-else class="space-y-3">
                <div class="rounded-2xl border border-[#252d3d] bg-[#131720] p-5">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <h2 class="text-base font-black text-[#e8eaf0]">{{ t('lobby.roomCode') }}</h2>
                      <p class="mt-1 text-xs text-[#7b8ba8]">{{ t('lobby.shareCodeHint') }}</p>
                      <div class="mt-3 font-mono text-3xl font-black tracking-[0.22em] sm:text-4xl" style="color: #f5a623">
                        {{ room.code }}
                      </div>
                    </div>
                    <div class="flex shrink-0 flex-col gap-2">
                      <button
                        type="button"
                        class="min-h-[56px] rounded-xl border border-[#252d3d] bg-[#0b0e14] px-5 py-3.5 text-base font-black text-[#e8eaf0] hover:border-[#3a4a63]"
                        :disabled="loading"
                        @click="copyCode"
                      >{{ t('lobby.copyCode') }}</button>
                      <button
                        type="button"
                        class="min-h-[56px] rounded-xl border border-[#3a1515] bg-[#2a1010] px-5 py-3.5 text-base font-black"
                        style="color: #ff5252"
                        :disabled="loading"
                        @click="leaveRoom"
                      >{{ t('lobby.leave') }}</button>
                    </div>
                  </div>
                </div>

                <div class="rounded-2xl border border-[#252d3d] bg-[#131720] p-5">
                  <h3 class="text-[11px] font-black uppercase tracking-widest text-[#7b8ba8]">{{ t('lobby.players') }}</h3>
                  <div class="mt-2 space-y-2">
                    <div
                      v-for="p in (room.players || [])"
                      :key="p.id"
                      class="flex items-center justify-between rounded-xl border border-[#1e2738] bg-[#0b0e14] px-4 py-3"
                    >
                      <span class="min-w-0 truncate text-base font-bold text-[#e8eaf0]">{{ p.name }}</span>
                      <span v-if="p.is_host" class="text-[11px] font-black text-amber-400">{{ t('lobby.host') }}</span>
                    </div>
                  </div>

                  <button
                    v-if="isHost"
                    type="button"
                    class="mt-4 w-full rounded-xl py-3 text-base font-black disabled:opacity-40"
                    style="background: linear-gradient(135deg, #f5a623, #f5c842); color: #0b0e14; border: none"
                    :disabled="loading || (room.players || []).length < 2"
                    @click="openOrderModal"
                  >
                    {{ t('lobby.hostStartSetup') }}
                  </button>
                  <p v-else class="mt-4 text-center text-sm text-[#7b8ba8]">{{ t('lobby.waitingForHost') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Apakšas darbības -->
      <div
        class="flex shrink-0 items-center gap-2 border-t border-[#1e2738] px-4 py-3 lg:px-6"
        style="padding-bottom: max(12px, env(safe-area-inset-bottom))"
      >
        <button
          v-if="createWizardStep === 2"
          type="button"
          class="flex items-center gap-1 rounded-lg border border-[#252d3d] bg-[#1a2030] px-3 py-2 text-sm font-semibold text-[#7b8ba8]"
          @click="l.goWizardBack"
        >←</button>
        <div class="min-w-0 flex-1" />
        <button
          v-if="createWizardStep === 1"
          type="button"
          class="rounded-lg py-2.5 px-5 text-sm font-bold"
          :disabled="lobbyShellLocked || checkingSetupMatch || !!blockedRoomForType || loading"
          style="background: linear-gradient(135deg, #f5a623, #f5c842); color: #0b0e14; border: none"
          @click="l.goWizardNext()"
        >
          <template v-if="checkingSetupMatch">{{ t('lobby.setupLookupShort') }}</template>
          <template v-else>{{ t('lobby.wizardNext') }} →</template>
        </button>
        <button
          v-else
          type="button"
          class="flex items-center gap-1 rounded-lg py-2.5 px-8 text-sm font-semibold"
          :disabled="loading || !!blockedRoomForType || lobbyShellLocked"
          style="background: linear-gradient(135deg, #f5a623, #f5c842); color: #0b0e14; border: none"
          @click="l.createRoom"
        >▶ {{ t('lobby.wizardStartGame') }}</button>
      </div>
    </div>
  </div>
</template>
