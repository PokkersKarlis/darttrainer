<script>
import { toRef } from 'vue';
import { useLobbyCore } from './useLobbyCore.js';

export default {
  name: 'LobbyApp',
  props: {
    gameKind: {
      type: String,
      required: true,
      validator: (v) => v === 'cricket' || v === 'x01',
    },
  },
  setup(props) {
    const gameKind = toRef(props, 'gameKind');
    return {
      gameKind,
      ...useLobbyCore(gameKind),
    };
  },
};
</script>

<template>
    <div class="lobby-compact lobby-root flex flex-1 min-h-0 w-full flex-col overflow-hidden bg-[#060d18] text-slate-200">
    <div class="flex flex-1 min-h-0 w-full max-w-lg lg:max-w-4xl mx-auto px-2 sm:px-3 py-1 sm:py-1.5 flex flex-col gap-1 sm:gap-1.5 min-h-0">

      <div class="shrink-0 flex items-start justify-between gap-2">
        <div class="min-w-0 text-left flex-1">
          <h1 class="text-base sm:text-lg font-black text-white tracking-tight leading-tight">{{ gameKind === 'cricket' ? t('lobby.titleCricket') : t('lobby.titleX01') }}</h1>
          <p class="text-slate-600 text-[10px] sm:text-xs mt-0.5 line-clamp-1 sm:line-clamp-none">{{ gameKind === 'cricket' ? t('lobby.subtitleCricket') : t('lobby.subtitleX01') }}</p>
        </div>
        <button type="button" @click="showLobbyTip = !showLobbyTip"
                :disabled="lobbyShellLocked"
                class="shrink-0 w-8 h-8 rounded-lg border border-amber-500/35 bg-amber-500/10 text-amber-400 text-xs font-black hover:bg-amber-500/20 transition disabled:cursor-not-allowed disabled:opacity-40"
                :aria-expanded="showLobbyTip" :title="t('lobby.tipToggleTitle')">?</button>
      </div>
      <div v-show="showLobbyTip" class="shrink-0 rounded-lg border border-amber-500/25 bg-amber-500/5 px-2 py-1">
        <p class="text-[10px] text-slate-500 leading-snug">{{ t('lobby.tipBody') }}</p>
      </div>

      <div v-if="checkingActive" class="flex flex-1 min-h-[120px] flex-col items-center justify-center text-center py-4 shrink-0">
        <div class="flex justify-center gap-2 mb-2">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style="animation-delay:0ms"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style="animation-delay:150ms"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style="animation-delay:300ms"></span>
        </div>
        <span class="text-slate-600 text-xs">{{ t('lobby.checking') }}</span>
      </div>

      <template v-else>

        <!-- ═══ WAITING ROOM (tikai tiešsaiste — kods, spēlētāji) ═══ -->
        <div v-if="room && room.play_mode !== 'local'" class="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div class="min-h-0 flex-1 overflow-y-auto overscroll-y-contain flex flex-col gap-1.5 pr-0.5">
            <div class="shrink-0 bg-slate-800/80 border border-slate-700/60 rounded-xl p-2 sm:p-2.5">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <div class="text-[9px] text-slate-600 uppercase tracking-widest font-semibold mb-0.5">{{ t('lobby.roomCode') }}</div>
                  <div class="text-2xl sm:text-3xl font-mono font-black text-amber-400 tracking-[0.1em] leading-none select-all break-all">
                    {{ room.code }}
                  </div>
                </div>
                <div class="flex flex-col items-end gap-1 shrink-0">
                  <button type="button" @click="copyCode"
                          class="flex items-center gap-1 text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white px-2 py-1 rounded-lg transition font-semibold">
                    📋 {{ t('lobby.copy') }}
                  </button>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        :class="room.game_type === 'cricket'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                          : 'bg-amber-950 text-amber-400 border border-amber-900'">
                    {{ room.game_type === 'cricket' ? '🏏 Cricket' : '🎯 X01' }}
                  </span>
                </div>
              </div>
              <p v-if="room.play_mode !== 'local'" class="text-slate-600 text-[9px] mt-1 line-clamp-1">{{ t('lobby.shareCode') }}</p>
              <p v-else class="text-slate-600 text-[9px] mt-1 line-clamp-1">{{ t('lobby.localShare') }}</p>
            </div>

            <div class="shrink-0 bg-slate-800/80 border border-slate-700/60 rounded-xl overflow-hidden">
              <div class="px-2 py-1 border-b border-slate-700/50 flex items-center justify-between">
                <span class="text-[10px] font-bold text-slate-200">{{ t('lobby.players') }}</span>
                <span class="text-[10px] text-slate-600 font-mono bg-slate-900/60 px-1.5 py-0.5 rounded-full">
                  {{ room.players.length }}/{{ room.max_players }}
                </span>
              </div>
              <div v-for="p in room.players" :key="p.id"
                   class="flex items-center gap-1.5 px-2 py-1.5 border-b border-slate-700/30 last:border-b-0">
                <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 select-none"
                     :class="p.is_host ? 'bg-amber-500 text-black' : 'bg-slate-700 text-slate-200'">
                  {{ p.name.charAt(0).toUpperCase() }}
                </div>
                <span class="flex-1 text-white text-xs font-semibold truncate">{{ p.name }}</span>
                <span v-if="p.is_host"
                      class="text-[9px] bg-amber-500/15 text-amber-400 border border-amber-500/25 px-1.5 py-0.5 rounded-full font-bold shrink-0">
                  {{ t('lobby.host') }}
                </span>
                <span v-else class="w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-80 shrink-0"></span>
              </div>
              <div v-for="i in (room.max_players - room.players.length)" :key="'slot-'+i"
                   class="flex items-center gap-1.5 px-2 py-1.5 border-b border-slate-700/20 last:border-b-0 opacity-40">
                <div class="w-6 h-6 rounded-full border border-dashed border-slate-700 flex items-center justify-center flex-shrink-0">
                  <span class="text-slate-600 text-xs leading-none">+</span>
                </div>
                <span class="text-slate-600 text-xs italic truncate">{{ t('lobby.slotFree') }}</span>
              </div>
            </div>
          </div>

          <div class="shrink-0 flex flex-col gap-1.5 border-t border-slate-800/80 bg-[#060d18]/95 pt-2 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-sm">
            <p v-if="error" class="text-red-400 text-[10px] px-0.5 text-center">{{ error }}</p>

            <button v-if="isHost"
                    type="button"
                    @click="openOrderModal"
                    :disabled="loading || room.players.length < 1"
                    class="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-black py-2.5 rounded-xl transition-all disabled:opacity-40 text-xs sm:text-sm shadow-lg shadow-amber-950/40 active:scale-[0.99]">
              {{ loading ? t('lobby.starting') : t('lobby.startGame') }}
            </button>

            <div v-else-if="room.play_mode !== 'local'" class="bg-slate-900/50 border border-slate-800 rounded-xl py-1.5 px-2 text-center">
              <div class="flex justify-center gap-1 mb-1">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style="animation-delay:0ms"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style="animation-delay:150ms"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style="animation-delay:300ms"></span>
              </div>
              <div class="text-slate-300 text-xs leading-tight">
                {{ t('lobby.waitingFor') }} <span class="text-amber-400 font-bold">{{ hostPlayer?.name ?? t('lobby.hostWord') }}</span>
              </div>
              <div class="text-slate-600 text-[9px] mt-0.5">{{ t('lobby.autoRefresh') }}</div>
            </div>
            <div v-else class="bg-slate-900/40 border border-slate-800 rounded-xl py-1.5 text-center text-slate-500 text-[10px] px-1">
              {{ t('lobby.localHostOnly') }}
            </div>

            <button type="button" @click="leaveRoom"
                    class="w-full text-slate-600 hover:text-red-400 text-[10px] py-1 transition font-semibold tracking-wide">
              {{ t('lobby.leaveRoom') }}
            </button>
          </div>
        </div>

        <!-- ═══ LOKĀLĀ TELPA: bez koda/saraksta; secība modālī ═══ -->
        <div v-else-if="room && room.play_mode === 'local'"
             class="flex min-h-0 flex-1 flex-col items-stretch justify-center gap-3 overflow-hidden px-2 py-4">
          <p class="px-1 text-center text-[11px] leading-snug text-slate-400">{{ t('lobby.localPreStartHint') }}</p>
          <button type="button" @click="openOrderModal"
                  class="w-full rounded-xl bg-amber-500 py-3 text-sm font-black text-black shadow-lg shadow-amber-950/40 transition hover:bg-amber-400 active:scale-[0.99]">
            {{ t('lobby.localOpenOrderLegs') }}
          </button>
          <button type="button" @click="leaveRoom"
                  class="w-full py-2 text-center text-[10px] font-semibold tracking-wide text-slate-600 transition hover:text-red-400">
            {{ t('lobby.leaveRoom') }}
          </button>
        </div>

        <!-- ═══ CREATE / JOIN ═══ -->
        <div v-else class="flex flex-1 min-h-0 min-w-0 flex-col gap-1 overflow-hidden">

          <div class="shrink-0 flex bg-slate-900/70 border border-slate-700/70 rounded-2xl p-1 gap-1 shadow-inner shadow-black/30">
            <button type="button" @click="openCreateTab"
                    :disabled="lobbyShellLocked"
                    class="flex-1 py-2 rounded-xl text-[11px] sm:text-xs font-black transition-all disabled:cursor-not-allowed disabled:opacity-40"
                    :class="tab === 'create'
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-900/30'
                      : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/80'">
              {{ t('lobby.tabCreate') }}
            </button>
            <button type="button"
                    :disabled="lobbyShellLocked || createForm.play_mode === 'local'"
                    :title="createForm.play_mode === 'local' ? t('lobby.tabJoinDisabledLocal') : ''"
                    @click="!lobbyShellLocked && createForm.play_mode !== 'local' && (tab = 'join', error = '')"
                    class="flex-1 py-2 rounded-xl text-[11px] sm:text-xs font-black transition-all"
                    :class="tab === 'join'
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-900/30'
                      : createForm.play_mode === 'local' || lobbyShellLocked
                        ? 'text-slate-600 cursor-not-allowed opacity-50'
                        : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/80'">
              {{ t('lobby.tabJoin') }}
            </button>
          </div>

          <div class="flex flex-1 min-h-0 flex-col overflow-hidden min-h-0">
          <Transition name="fade" mode="out-in">
          <div v-if="tab === 'create'" key="c"
               class="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden">

            <div class="relative flex min-h-0 min-w-0 flex-1 flex-col gap-1 overflow-hidden">
            <div v-if="lobbyShellLocked"
                 class="absolute inset-0 z-[15] cursor-wait rounded-2xl bg-slate-950/50 backdrop-blur-[1px]"
                 aria-busy="true"></div>

            <div class="shrink-0 flex items-stretch justify-center gap-1.5 px-0.5 pt-0.5" role="status" aria-live="polite">
              <div class="flex w-full max-w-md items-center gap-2 rounded-xl border border-slate-800/80 bg-slate-900/40 px-2 py-1.5">
                <div class="flex min-w-0 flex-1 items-center gap-2">
                  <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black"
                        :class="createWizardStep === 1 ? 'bg-amber-500 text-black shadow-md shadow-amber-950/40' : 'bg-slate-800 text-slate-500 border border-slate-700'">1</span>
                  <span class="truncate text-[10px] font-black uppercase tracking-wider"
                        :class="createWizardStep === 1 ? 'text-amber-200' : 'text-slate-500'">{{ t('lobby.wizardLabel1') }}</span>
                </div>
                <span class="text-slate-600 text-[10px] font-bold shrink-0">›</span>
                <div class="flex min-w-0 flex-1 items-center justify-end gap-2">
                  <span class="truncate text-right text-[10px] font-black uppercase tracking-wider"
                        :class="createWizardStep === 2 ? 'text-amber-200' : 'text-slate-500'">{{ t('lobby.wizardLabel2') }}</span>
                  <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black"
                        :class="createWizardStep === 2 ? 'bg-amber-500 text-black shadow-md shadow-amber-950/40' : 'bg-slate-800 text-slate-500 border border-slate-700'">2</span>
                </div>
              </div>
            </div>

            <div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <div v-show="createWizardStep === 1"
                 class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden touch-pan-y overscroll-y-contain">
            <div class="flex flex-col gap-1 pb-2">
            <div class="shrink-0">
              <label class="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-1.5 lg:text-[11px] lg:mb-2">{{ t('lobby.playModeTitle') }}</label>
              <div class="grid grid-cols-2 gap-2 lg:gap-3">
                <button type="button" @click="createForm.play_mode = 'online'"
                        class="relative p-2.5 rounded-2xl border-2 text-left transition-all active:scale-[0.99] ring-offset-2 ring-offset-[#060d18] lg:min-h-[7.25rem] lg:p-4 lg:flex lg:flex-col lg:justify-center"
                        :class="createForm.play_mode === 'online'
                          ? 'border-sky-500/80 bg-gradient-to-br from-sky-500/20 to-slate-900/60 ring-2 ring-sky-400/40'
                          : 'border-slate-700/70 bg-slate-800/50 hover:border-slate-600 ring-2 ring-transparent'">
                  <div class="font-black text-white text-xs lg:text-sm">{{ t('lobby.playOnline') }}</div>
                  <div class="lobby-play-desc text-[9px] text-slate-500 mt-1 leading-tight line-clamp-2 lg:text-[10px] lg:mt-2 lg:leading-snug lg:line-clamp-none">{{ t('lobby.playOnlineDesc') }}</div>
                </button>
                <button type="button" @click="createForm.play_mode = 'local'; loadFriendsAndPresets()"
                        class="relative p-2.5 rounded-2xl border-2 text-left transition-all active:scale-[0.99] ring-offset-2 ring-offset-[#060d18] lg:min-h-[7.25rem] lg:p-4 lg:flex lg:flex-col lg:justify-center"
                        :class="createForm.play_mode === 'local'
                          ? 'border-amber-500/90 bg-gradient-to-br from-amber-500/15 to-slate-900/60 ring-2 ring-amber-400/35'
                          : 'border-slate-700/70 bg-slate-800/50 hover:border-slate-600 ring-2 ring-transparent'">
                  <div class="font-black text-white text-xs lg:text-sm">{{ t('lobby.playLocal') }}</div>
                  <div class="lobby-play-desc text-[9px] text-slate-500 mt-1 leading-tight line-clamp-2 lg:text-[10px] lg:mt-2 lg:leading-snug lg:line-clamp-none">{{ t('lobby.playLocalDesc') }}</div>
                </button>
              </div>
            </div>

            <template v-if="gameKind === 'x01'">
              <div class="shrink-0 bg-slate-800/70 border border-slate-700/60 rounded-2xl p-2.5 space-y-2 shadow-sm shadow-black/20 lg:p-4 lg:space-y-3">
                <div class="flex items-center gap-2 lg:gap-3">
                  <span class="text-[9px] text-slate-500 uppercase font-bold shrink-0 w-14 lg:w-16 lg:text-[10px]">{{ t('lobby.variant') }}</span>
                  <div class="flex flex-1 gap-1 bg-slate-900/60 rounded-lg p-0.5 lg:p-1">
                    <button v-for="v in [501, 301]" :key="v" type="button"
                            @click="createForm.variant = v"
                            class="flex-1 py-1.5 rounded-md text-xs font-black transition lg:py-2.5 lg:text-sm"
                            :class="createForm.variant === v ? 'bg-amber-500 text-black' : 'text-slate-500 hover:text-white'">
                      {{ v }}
                    </button>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-2 lg:gap-3">
                  <div>
                    <span class="text-[9px] text-slate-500 uppercase font-bold block mb-0.5 lg:text-[10px]">{{ t('lobby.inLabel') }}</span>
                    <div class="flex gap-0.5 bg-slate-900/60 rounded-lg p-0.5 lg:p-1">
                      <button type="button" @click="createForm.in_mode = 'straight'"
                              class="flex-1 px-0.5 py-1.5 rounded-md text-[8px] min-[360px]:text-[9px] sm:text-[10px] font-bold leading-tight text-center transition lg:py-2.5 lg:text-xs"
                              :class="createForm.in_mode === 'straight' ? 'bg-slate-300 text-slate-900' : 'text-slate-500'">{{ t('lobby.inStraight') }}</button>
                      <button type="button" @click="createForm.in_mode = 'double'"
                              class="flex-1 px-0.5 py-1.5 rounded-md text-[8px] min-[360px]:text-[9px] sm:text-[10px] font-bold leading-tight text-center transition lg:py-2.5 lg:text-xs"
                              :class="createForm.in_mode === 'double' ? 'bg-slate-300 text-slate-900' : 'text-slate-500'">{{ t('lobby.inDouble') }}</button>
                    </div>
                  </div>
                  <div>
                    <span class="text-[9px] text-slate-500 uppercase font-bold block mb-0.5 lg:text-[10px]">{{ t('lobby.outLabel') }}</span>
                    <div class="flex gap-0.5 bg-slate-900/60 rounded-lg p-0.5 lg:p-1">
                      <button type="button" @click="createForm.out_mode = 'double'"
                              class="flex-1 px-0.5 py-1.5 rounded-md text-[8px] min-[360px]:text-[9px] sm:text-[10px] font-bold leading-tight text-center transition lg:py-2.5 lg:text-xs"
                              :class="createForm.out_mode === 'double' ? 'bg-sky-400 text-slate-900' : 'text-slate-500'">{{ t('lobby.outDouble') }}</button>
                      <button type="button" @click="createForm.out_mode = 'straight'"
                              class="flex-1 px-0.5 py-1.5 rounded-md text-[8px] min-[360px]:text-[9px] sm:text-[10px] font-bold leading-tight text-center transition lg:py-2.5 lg:text-xs"
                              :class="createForm.out_mode === 'straight' ? 'bg-sky-400 text-slate-900' : 'text-slate-500'">{{ t('lobby.outStraight') }}</button>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <template v-if="gameKind === 'cricket'">
              <div class="shrink-0 bg-slate-800/70 border border-slate-700/60 rounded-2xl p-2.5 shadow-sm shadow-black/20 lg:p-4">
                <span class="text-[9px] text-slate-500 uppercase font-bold block mb-1 lg:text-[10px] lg:mb-1.5">{{ t('lobby.cricketType') }}</span>
                <div class="flex gap-1 bg-slate-900/60 rounded-lg p-0.5 lg:p-1">
                  <button type="button" @click="createForm.cricket_type = 'standard'"
                          :title="t('lobby.cricketStandardDesc')"
                          class="flex-1 px-0.5 py-1.5 rounded-md text-[8px] min-[360px]:text-[9px] sm:text-[10px] font-bold leading-tight text-center transition lg:py-2.5 lg:text-xs"
                          :class="createForm.cricket_type === 'standard' ? 'bg-emerald-500 text-black' : 'text-slate-500'">{{ t('lobby.cricketLabelStandard') }}</button>
                  <button type="button" @click="createForm.cricket_type = 'random'"
                          :title="t('lobby.cricketRandomDesc')"
                          class="flex-1 px-0.5 py-1.5 rounded-md text-[8px] min-[360px]:text-[9px] sm:text-[10px] font-bold leading-tight text-center transition lg:py-2.5 lg:text-xs"
                          :class="createForm.cricket_type === 'random' ? 'bg-emerald-500 text-black' : 'text-slate-500'">{{ t('lobby.cricketLabelRandom') }}</button>
                </div>
                <p class="lobby-cricket-longdesc text-[9px] text-slate-600 mt-1 line-clamp-2 leading-tight lg:text-[10px] lg:mt-2 lg:line-clamp-none lg:leading-snug">
                  {{ createForm.cricket_type === 'standard' ? t('lobby.cricketStandardDesc') : t('lobby.cricketRandomDesc') }}
                </p>
              </div>
            </template>

            </div>
            </div>

            <div v-show="createWizardStep === 2"
                 class="flex min-h-0 min-w-0 flex-1 flex-col gap-1"
                 :class="createForm.play_mode === 'local'
                   ? 'overflow-hidden'
                   : 'overflow-y-auto overflow-x-hidden touch-pan-y overscroll-y-contain'">
            <p class="shrink-0 rounded-lg border border-slate-700/50 bg-slate-900/30 px-2 py-1 text-[10px] text-slate-400 leading-snug">
              {{ createForm.play_mode === 'online' ? t('lobby.wizardStep2HintOnline') : t('lobby.wizardStep2HintLocal') }}
            </p>

            <div v-if="createForm.play_mode === 'local'"
                 class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-amber-500/35 bg-gradient-to-b from-amber-950/40 via-slate-900/55 to-slate-950/90 shadow-lg shadow-black/25">
              <div class="flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-2">
                <div class="shrink-0 rounded-xl border border-amber-900/35 bg-amber-950/25 px-2.5 py-2.5">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <h3 class="text-xs font-black text-amber-300 tracking-tight">{{ t('lobby.localPanelTitle') }}</h3>
                      <p class="text-[10px] text-slate-500 mt-0.5 leading-snug">{{ t('lobby.localCap') }}</p>
                    </div>
                    <span class="shrink-0 text-[10px] font-mono font-bold text-amber-400/90 bg-black/25 px-2 py-0.5 rounded-lg border border-amber-900/40">
                      {{ 1 + localRosterCount }}/4
                    </span>
                  </div>
                  <p class="text-[10px] text-slate-400 font-semibold mt-2">{{ t('lobby.localRosterHeading') }}</p>
                  <div class="flex flex-wrap gap-1.5 mt-1.5">
                    <span v-for="row in localRosterDisplay" :key="row.key"
                          class="inline-flex items-center gap-1 max-w-full rounded-lg border px-2 py-1 text-[11px] font-semibold"
                          :class="row.kind === 'host'
                            ? 'border-amber-500/50 bg-amber-500/15 text-amber-100'
                            : 'border-slate-600/70 bg-slate-800/90 text-slate-100 pr-1'">
                      <span v-if="row.kind === 'host'" class="text-amber-400 shrink-0" aria-hidden="true">★</span>
                      <span v-else-if="row.kind === 'friend'" class="text-sky-400 shrink-0 text-[10px]" title="Friend">👤</span>
                      <span v-else-if="row.kind === 'preset'" class="text-emerald-400 shrink-0 text-[10px]" title="Saved">📌</span>
                      <span v-else class="text-slate-400 shrink-0 text-[10px]" title="Guest">✎</span>
                      <span class="truncate min-w-0">{{ row.kind === 'host' ? row.name + ' · ' + t('lobby.localHostShort') : row.name }}</span>
                      <button v-if="row.kind !== 'host'" type="button"
                              class="shrink-0 ml-0.5 w-5 h-5 flex items-center justify-center rounded-md text-slate-500 hover:text-red-400 hover:bg-red-950/40 text-sm font-black leading-none"
                              :title="t('lobby.localRemoveFromGame')"
                              @click="removeFromLocalRoster(row)">×</button>
                    </span>
                  </div>
                  <p v-if="localRosterCount < 1"
                     class="mt-2 rounded-lg border border-amber-600/30 bg-amber-950/30 px-2 py-1.5 text-[10px] text-amber-100/90 leading-snug">
                    {{ t('lobby.localNeedExtra') }}
                  </p>
                </div>

                <div class="mt-2 flex min-h-0 min-w-0 flex-1 flex-col gap-1.5 overflow-hidden">
                  <div class="grid shrink-0 grid-cols-3 gap-0.5 rounded-xl border border-slate-700/60 bg-slate-900/70 p-0.5" role="tablist" aria-label="Local player picker">
                    <button type="button" role="tab" :aria-selected="localPickerTab === 'friends'"
                            @click="localPickerTab = 'friends'"
                            class="rounded-lg px-0.5 py-1.5 text-[8px] font-black uppercase leading-tight tracking-wide transition min-[380px]:text-[9px] sm:px-1 sm:text-[10px]"
                            :class="localPickerTab === 'friends' ? 'bg-amber-500 text-black shadow-md shadow-amber-950/30' : 'text-slate-400 hover:text-slate-200'">
                      {{ t('lobby.localFriends') }}
                    </button>
                    <button type="button" role="tab" :aria-selected="localPickerTab === 'presets'"
                            @click="localPickerTab = 'presets'"
                            class="rounded-lg px-0.5 py-1.5 text-[8px] font-black uppercase leading-tight tracking-wide transition min-[380px]:text-[9px] sm:px-1 sm:text-[10px]"
                            :class="localPickerTab === 'presets' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/30' : 'text-slate-400 hover:text-slate-200'">
                      {{ t('lobby.localPresets') }}
                    </button>
                    <button type="button" role="tab" :aria-selected="localPickerTab === 'guest'"
                            @click="localPickerTab = 'guest'"
                            class="rounded-lg px-0.5 py-1.5 text-[8px] font-black uppercase leading-tight tracking-wide transition min-[380px]:text-[9px] sm:px-1 sm:text-[10px]"
                            :class="localPickerTab === 'guest' ? 'bg-slate-200 text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-200'">
                      {{ t('lobby.localPickerTabGuest') }}
                    </button>
                  </div>

                  <div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/35">
                    <template v-if="localPickerTab === 'friends'">
                      <div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                      <div class="shrink-0 border-b border-slate-800/70 p-2">
                        <input v-model="friendSearch" type="search" inputmode="search" autocomplete="off"
                               :placeholder="t('lobby.localSearchFriendsPlaceholder')"
                               class="w-full rounded-lg border border-slate-600 bg-slate-950 px-2 py-1.5 text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/25" />
                      </div>
                      <div id="local-friends-panel" role="tabpanel" class="min-h-0 flex-1 basis-0 overflow-y-auto overscroll-y-contain touch-pan-y">
                        <p v-if="!friendList.length" class="px-2.5 py-3 text-[11px] text-slate-500 leading-snug">{{ t('lobby.noFriendsForLocal') }}</p>
                        <p v-else-if="!filteredFriendList.length" class="px-2.5 py-3 text-[11px] text-slate-500">{{ t('lobby.localSearchNoResults') }}</p>
                        <template v-else>
                          <button v-for="fr in filteredFriendList" :key="'f'+fr.id" type="button"
                                  class="flex w-full items-center justify-between gap-2 border-b border-slate-800/50 py-2.5 pl-2 pr-2.5 text-left transition last:border-b-0 hover:bg-slate-800/60 disabled:cursor-not-allowed disabled:opacity-40 border-l-2"
                                  :class="selectedFriendIds.includes(fr.id) ? 'border-l-amber-500 bg-amber-500/5' : 'border-l-transparent'"
                                  :disabled="rosterAtCap() && !selectedFriendIds.includes(fr.id)"
                                  :aria-pressed="selectedFriendIds.includes(fr.id)"
                                  @click="toggleFriendId(fr.id)">
                            <span class="min-w-0 truncate text-sm font-medium text-white">{{ fr.name }}</span>
                            <span v-if="selectedFriendIds.includes(fr.id)"
                                  class="shrink-0 rounded-md border border-amber-500/50 bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-black text-amber-300">✓</span>
                            <span v-else class="shrink-0 text-[10px] font-bold text-slate-600">+</span>
                          </button>
                        </template>
                      </div>
                      </div>
                    </template>

                    <template v-else-if="localPickerTab === 'presets'">
                      <div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                      <div class="shrink-0 border-b border-slate-800/70 p-2">
                        <input v-model="presetSearch" type="search" inputmode="search" autocomplete="off"
                               :placeholder="t('lobby.localSearchPresetsPlaceholder')"
                               class="w-full rounded-lg border border-slate-600 bg-slate-950 px-2 py-1.5 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/25" />
                      </div>
                      <div id="local-presets-panel" role="tabpanel" class="min-h-0 flex-1 basis-0 overflow-y-auto overscroll-y-contain touch-pan-y">
                        <p v-if="!presetList.length" class="px-2.5 py-3 text-[11px] text-slate-600 leading-snug">{{ t('lobby.localPresetsEmpty') }}</p>
                        <p v-else-if="!filteredPresetList.length" class="px-2.5 py-3 text-[11px] text-slate-500">{{ t('lobby.localSearchNoResults') }}</p>
                        <template v-else>
                          <div v-for="pr in filteredPresetList" :key="'p'+pr.id"
                               class="flex items-stretch gap-0 border-b border-slate-800/80 last:border-b-0">
                            <button type="button"
                                    class="flex min-w-0 flex-1 items-center justify-between gap-2 border-l-2 py-2.5 pl-2 pr-2.5 text-left transition hover:bg-slate-800/50 disabled:cursor-not-allowed disabled:opacity-40"
                                    :class="selectedPresetIds.includes(pr.id) ? 'border-l-emerald-500 bg-emerald-500/5' : 'border-l-transparent'"
                                    :disabled="rosterAtCap() && !selectedPresetIds.includes(pr.id)"
                                    :aria-pressed="selectedPresetIds.includes(pr.id)"
                                    @click="togglePresetId(pr.id)">
                              <span class="min-w-0 truncate text-sm font-medium text-white">{{ pr.name }}</span>
                              <span v-if="selectedPresetIds.includes(pr.id)"
                                    class="shrink-0 rounded-md border border-emerald-500/45 bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-black text-emerald-300">✓</span>
                              <span v-else class="shrink-0 text-[10px] font-bold text-slate-600">+</span>
                            </button>
                            <button type="button" @click="deletePreset(pr.id)"
                                    class="shrink-0 border-l border-slate-800/80 px-2.5 py-2.5 text-[10px] font-bold text-red-400/90 hover:bg-red-950/25 hover:text-red-300">
                              {{ t('lobby.localDeletePreset') }}
                            </button>
                          </div>
                        </template>
                      </div>
                      </div>
                    </template>

                    <template v-else>
                      <div role="tabpanel" class="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-y-contain p-2.5 touch-pan-y basis-0">
                        <p class="shrink-0 text-[10px] text-slate-500 leading-snug">{{ t('lobby.localGuestTabHint') }}</p>
                        <input v-model="newAdHocGuest" type="text" maxlength="50" @keyup.enter="submitAddGuestFromPicker"
                               :placeholder="t('lobby.localNewGuest')"
                               class="shrink-0 w-full rounded-xl border border-slate-600 bg-slate-950 px-2.5 py-2 text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30" />
                        <label class="flex shrink-0 cursor-pointer items-start gap-2.5 rounded-lg border border-slate-700/80 bg-slate-950/50 px-2.5 py-2">
                          <input v-model="saveGuestToLibrary" type="checkbox"
                                 class="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-500 accent-amber-500" />
                          <span class="text-[11px] font-medium leading-snug text-slate-300">{{ t('lobby.localSaveToLibrary') }}</span>
                        </label>
                        <button type="button" @click="submitAddGuestFromPicker"
                                :disabled="rosterAtCap() || guestPickerBusy || !String(newAdHocGuest || '').trim()"
                                class="mt-auto w-full rounded-xl bg-amber-500 px-3 py-2.5 text-xs font-black text-black shadow-md shadow-amber-950/30 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-35">
                          {{ guestPickerBusy ? t('lobby.localAddingGuest') : (saveGuestToLibrary ? t('lobby.localSaveAndAddToGame') : t('lobby.localAddToGameOnly')) }}
                        </button>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="auth.user && blockedRoomForType"
                 class="shrink-0 rounded-2xl border border-[#065f46] bg-gradient-to-br from-[#052e16] to-[#064e3b] px-2.5 py-2 flex flex-col gap-1 shadow-md shadow-emerald-950/20">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <div class="text-[#6ee7b7] text-[9px] font-bold uppercase leading-none">{{ t('home.activeGame') }}</div>
                  <div class="text-[#f1f5f9] font-semibold text-[11px] leading-tight mt-0.5 truncate">
                    {{ blockedRoomSummaryLine(blockedRoomForType) }}
                    <span class="text-[#475569] font-normal">·</span>
                    <span class="font-mono text-[#f59e0b]">{{ blockedRoomForType.code }}</span>
                  </div>
                </div>
                <button type="button" @click="continueExistingTypeRoom()" :disabled="loading"
                        class="shrink-0 bg-[#10b981] hover:bg-[#059669] text-white font-bold text-[10px] px-2 py-1 rounded-md disabled:opacity-40">
                  {{ loading ? t('lobby.continuingRoom') : (blockedRoomForType.match_id ? t('home.continue') : t('home.backToLobby')) }}
                </button>
              </div>
              <p class="text-[9px] text-emerald-200/80 leading-tight line-clamp-1">{{
                blockedRoomForType.match_status === 'suspended' ? t('lobby.activeForTypeSuspended')
                  : (blockedRoomForType.status === 'active' ? t('lobby.activeForTypePlaying') : t('lobby.activeForTypeWaiting'))
              }}</p>
            </div>

            </div>

            </div>
            </div>

            <div class="shrink-0 flex flex-col gap-1.5 border-t border-slate-800/70 pt-2 mt-1">
              <p v-if="error" class="text-red-400 text-[10px] text-center leading-tight">{{ error }}</p>
              <template v-if="createWizardStep === 1">
                <div v-if="auth.user && blockedRoomForType"
                     class="shrink-0 rounded-2xl border border-[#065f46] bg-gradient-to-br from-[#052e16] to-[#064e3b] px-2.5 py-2 flex flex-col gap-1.5 shadow-md shadow-emerald-950/20">
                  <p class="text-[10px] text-emerald-100/90 leading-snug">{{ t('lobby.wizardStep1ResumeHint') }}</p>
                  <div class="flex items-center justify-between gap-2">
                    <div class="min-w-0 text-[10px] text-slate-200 font-semibold leading-tight truncate">
                      {{ blockedRoomSummaryLine(blockedRoomForType) }}
                      <span class="text-slate-500 font-normal">·</span>
                      <span class="font-mono text-amber-400">{{ blockedRoomForType.code }}</span>
                    </div>
                    <button type="button" @click="continueExistingTypeRoom()" :disabled="loading"
                            class="shrink-0 bg-[#10b981] hover:bg-[#059669] text-white font-black text-[11px] px-3 py-2 rounded-lg disabled:opacity-40">
                      {{ loading ? t('lobby.continuingRoom') : (blockedRoomForType.match_id ? t('lobby.activeForTypeContinue') : t('home.backToLobby')) }}
                    </button>
                  </div>
                  <p class="text-[9px] text-emerald-200/75 leading-tight">{{
                    blockedRoomForType.match_status === 'suspended' ? t('lobby.activeForTypeSuspended')
                      : (blockedRoomForType.status === 'active' ? t('lobby.activeForTypePlaying') : t('lobby.activeForTypeWaiting'))
                  }}</p>
                </div>
                <button v-else type="button" @click="goWizardNext"
                        :disabled="lobbyShellLocked"
                        class="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-black py-2.5 sm:py-3 rounded-xl transition-all disabled:opacity-50 text-xs sm:text-sm shadow-md shadow-amber-950/30">
                  <span v-if="checkingSetupMatch" class="inline-flex items-center justify-center gap-2">
                    <span class="flex gap-1" aria-hidden="true">
                      <span class="w-1.5 h-1.5 rounded-full bg-black/40 animate-bounce" style="animation-delay:0ms"></span>
                      <span class="w-1.5 h-1.5 rounded-full bg-black/40 animate-bounce" style="animation-delay:120ms"></span>
                      <span class="w-1.5 h-1.5 rounded-full bg-black/40 animate-bounce" style="animation-delay:240ms"></span>
                    </span>
                    {{ t('lobby.setupLookupShort') }}
                  </span>
                  <span v-else>{{ t('lobby.wizardNext') }}</span>
                </button>
              </template>
              <template v-else>
                <button type="button" @click="goWizardBack"
                        :disabled="lobbyShellLocked"
                        class="w-full py-2 rounded-xl border border-slate-600 bg-slate-800/80 text-slate-200 text-xs font-bold hover:bg-slate-700/80 transition disabled:cursor-not-allowed disabled:opacity-40">
                  {{ t('lobby.wizardBack') }}
                </button>
                <button type="button" @click="createRoom" :disabled="loading || !!blockedRoomForType || lobbyShellLocked"
                        class="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-black py-2.5 sm:py-3 rounded-xl transition-all disabled:opacity-40 text-xs sm:text-sm shadow-md shadow-amber-950/30">
                  {{ loading ? t('lobby.creating') : (blockedRoomForType ? t('lobby.createRoomBlocked') : t('lobby.wizardStartGame')) }}
                </button>
              </template>
            </div>
          </div>
          </Transition>

          <Transition name="fade" mode="out-in">
          <div v-if="tab === 'join'" key="j" class="relative flex flex-1 min-h-0 flex-col gap-1.5 justify-center overflow-hidden py-0.5">
            <div v-if="lobbyShellLocked"
                 class="absolute inset-0 z-[15] cursor-wait rounded-2xl bg-slate-950/50 backdrop-blur-[1px]"
                 aria-busy="true"></div>
            <div class="shrink-0 bg-slate-800/70 border border-slate-700/60 rounded-2xl p-3 shadow-sm shadow-black/20">
              <label class="text-[10px] text-slate-500 uppercase font-bold block mb-1.5 text-center tracking-widest">{{ t('lobby.joinCodeLabel') }}</label>
              <input v-model="joinForm.code"
                     type="text" maxlength="6" :placeholder="t('lobby.joinCodePlaceholder')"
                     :readonly="lobbyShellLocked"
                     :disabled="lobbyShellLocked"
                     @keyup.enter="!lobbyShellLocked && joinRoom()"
                     class="w-full bg-slate-900/80 border-2 border-slate-700 rounded-xl px-2 py-2
                            text-white text-center text-2xl sm:text-3xl font-mono font-black tracking-[0.15em] uppercase
                            focus:border-amber-500 focus:outline-none transition-colors placeholder-slate-800 disabled:cursor-not-allowed disabled:opacity-50" />
              <p class="text-[9px] text-slate-600 mt-1 text-center leading-tight">{{ t('lobby.joinHint') }}</p>
            </div>
            <p v-if="error" class="shrink-0 text-red-400 text-[10px] text-center">{{ error }}</p>
            <button type="button" @click="joinRoom"
                    :disabled="loading || joinForm.code.length < 6 || lobbyShellLocked"
                    class="shrink-0 w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-2 rounded-xl transition-all disabled:opacity-40 text-xs shadow-md shadow-amber-950/30">
              {{ loading ? t('lobby.joining') : t('lobby.joinRoom') }}
            </button>
          </div>
          </Transition>
          </div>

        </div>

      </template>

      <!-- ═══ Order modal ═══ -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="showOrderModal"
               class="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-3 backdrop-blur-sm sm:items-center sm:p-4"
               @click.self="showOrderModal = false">
            <div class="flex min-h-0 max-h-[min(92dvh,calc(100dvh-1.5rem))] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl sm:max-h-[min(88dvh,720px)]"
                 @click.stop>

              <div class="shrink-0 border-b border-slate-700/80 px-4 pb-3 pt-4">
                <h3 class="text-lg font-black leading-tight text-white">{{ t('lobby.orderTitle') }}</h3>
                <p class="mt-1 text-xs leading-snug text-slate-500">{{ t('lobby.orderSubtitle') }}</p>
              </div>

              <div class="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-3">
                <div class="space-y-4">
                  <div class="grid grid-cols-2 gap-2">
                    <button v-for="key in ORDER_METHOD_KEYS" :key="key" type="button"
                            @click="setOrderMethod(key)"
                            :title="ORDER_METHODS[key].description"
                            class="rounded-xl border px-2 py-2.5 text-left text-xs font-bold transition active:scale-[0.98]"
                            :class="orderMethod === key
                              ? 'border-amber-500 bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30'
                              : 'border-slate-600/60 bg-slate-900/50 text-slate-300 hover:border-slate-500'">
                      <span class="block text-[11px] font-black">{{ ORDER_METHODS[key].label }}</span>
                      <span class="mt-0.5 block text-[10px] font-normal leading-snug text-slate-500 line-clamp-3">{{ ORDER_METHODS[key].description }}</span>
                    </button>
                  </div>

                  <div class="space-y-1.5">
                    <div v-for="(p, i) in playerOrder" :key="p.id"
                         class="flex items-center gap-2 rounded-xl border px-3 py-2 transition"
                         :class="p.is_host
                           ? 'border-amber-900/40 bg-amber-950/30'
                           : 'border-slate-800/60 bg-slate-900/60'">
                      <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-black"
                           :class="i === 0 ? 'bg-amber-500 text-black' : 'bg-slate-700 text-slate-300'">
                        {{ i + 1 }}
                      </div>
                      <span class="flex-1 truncate text-sm font-semibold text-white">{{ p.name }}</span>
                      <span v-if="p.is_host" class="shrink-0 text-[10px] font-bold text-amber-500">{{ t('lobby.host') }}</span>
                      <div v-if="orderMethod === 'manual' || orderMethod === 'bulloff'" class="flex shrink-0 gap-0.5">
                        <button type="button" @click="moveUp(i)" :disabled="i === 0"
                                class="flex h-8 w-8 items-center justify-center rounded-lg text-sm text-slate-400 transition hover:bg-slate-700 hover:text-white disabled:opacity-20">↑</button>
                        <button type="button" @click="moveDown(i)" :disabled="i >= playerOrder.length - 1"
                                class="flex h-8 w-8 items-center justify-center rounded-lg text-sm text-slate-400 transition hover:bg-slate-700 hover:text-white disabled:opacity-20">↓</button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label class="text-[10px] font-bold uppercase tracking-widest text-slate-500">{{ t('lobby.legs') }}</label>
                    <div class="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-6">
                      <button v-for="n in BO_LEG_OPTIONS" :key="'bo'+n" type="button"
                              @click="createForm.legs = n"
                              class="rounded-lg border py-2 text-xs font-black transition"
                              :class="createForm.legs === n
                                ? 'border-amber-400 bg-amber-500 text-black shadow'
                                : 'border-slate-700 bg-slate-900/80 text-slate-400 hover:text-white'">
                        Bo{{ n }}
                      </button>
                    </div>
                    <p class="mt-1.5 text-[10px] leading-snug text-slate-600">{{ t('lobby.winLegsHint') }} {{ Math.ceil(createForm.legs / 2) }} {{ t('lobby.winLegsWord') }}</p>
                  </div>

                    <div>
                    <label class="text-[10px] font-bold uppercase tracking-widest text-slate-500">{{ t('lobby.sets') }}</label>
                    <div class="mt-2 grid grid-cols-5 gap-1.5 sm:grid-cols-10">
                      <button v-for="n in SET_COUNT_OPTIONS" :key="'st'+n" type="button"
                              @click="createForm.sets = n"
                              class="rounded-lg border py-2 text-xs font-black transition"
                              :class="createForm.sets === n
                                ? 'border-sky-400 bg-sky-500 text-black shadow'
                                : 'border-slate-700 bg-slate-900/80 text-slate-400 hover:text-white'">
                        {{ n }}
                      </button>
                    </div>
                    <p class="mt-1.5 text-[10px] leading-snug text-slate-600">{{ t('lobby.setsFixedHint') }}</p>
                  </div>

                  <p v-if="error" class="text-xs text-red-400">{{ error }}</p>
                </div>
              </div>

              <div class="flex shrink-0 gap-2 border-t border-slate-700/80 bg-slate-800 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <button type="button" @click="showOrderModal = false"
                        class="flex-1 rounded-xl bg-slate-700 py-3 text-sm font-bold text-white transition hover:bg-slate-600">
                  {{ t('lobby.cancel') }}
                </button>
                <button type="button" @click="confirmStartGame" :disabled="loading"
                        class="flex-1 rounded-xl bg-amber-500 py-3 text-sm font-black text-black shadow-md shadow-amber-950/40 transition hover:bg-amber-400 disabled:opacity-40">
                  {{ loading ? t('lobby.starting') : t('lobby.startConfirm') }}
                </button>
              </div>

            </div>
          </div>
        </Transition>
      </Teleport>

    </div>
    </div>
  
</template>
