<script setup>
import { computed } from 'vue';
import CricketMarkCell from '../CricketMarkCell.js';
import CricketXMarkCell from '../CricketXMarkCell.js';
import CricketClosedCheck from '../CricketClosedCheck.js';
import CricketInputPanel from './CricketInputPanel.vue';
import { useLocaleStore } from '../../store/locale.js';

const props = defineProps({
  layoutKind: { type: String, required: true },
  layoutWidth: { type: Number, default: 0 },
  layoutHeight: { type: Number, default: 0 },
  state: { type: Object, required: true },
  players: { type: Array, default: () => [] },
  leftPlayers: { type: Array, default: () => [] },
  rightPlayers: { type: Array, default: () => [] },
  cricketSdtSegments: { type: Array, default: () => [] },
  cricketSdtNonBull: { type: Array, default: () => [] },
  cricketSdtHasBull: { type: Boolean, default: false },
  cricketPadSplit: { type: Object, default: () => ({ left: [], right: [] }) },
  legsConfigTotal: { type: Number, default: 1 },
  setsConfigTotal: { type: Number, default: 1 },
  legsToWin: { type: Number, default: 1 },
  isMatchActive: { type: Boolean, default: false },
  isSuspended: { type: Boolean, default: false },
  auth: { type: Object, default: null },
  dartInput: { type: Object, required: true },
  submitting: { type: Boolean, default: false },
  waitingForTurnUi: { type: Boolean, default: false },
  showTurnTimeoutWaitingBanner: { type: Boolean, default: false },
  turnTimerRowVisible: { type: Boolean, default: false },
  turnTimerProgress: { type: Number, default: 0 },
  turnTimerRemainingSec: { type: Number, default: 0 },
  scorecardGridStyle: { type: Object, required: true },
  scorecardRowGridStyle: { type: Object, required: true },
  hitsFor: { type: Function, required: true },
  segClosedByAll: { type: Function, required: true },
  myHitsFor: { type: Function, required: true },
  dartLabel: { type: Function, required: true },
  dartValue: { type: Function, required: true },
  formatTurnClock: { type: Function, required: true },
  addCricketDart: { type: Function, required: true },
  removeDart: { type: Function, required: true },
  submitThrow: { type: Function, required: true },
  undo: { type: Function, required: true },
  exitGameSaving: { type: Function, required: true },
  onShowAbandon: { type: Function, required: true },
});

const locale = useLocaleStore();
const t = (k) => locale.t(k);

const isPortrait = computed(() => props.layoutKind === 'portrait');
const isSquare = computed(() => props.layoutKind === 'square');
const isLandscape = computed(() => props.layoutKind === 'landscape');
const headerCompact = computed(() => isPortrait.value || isLandscape.value);

const baseW = computed(() => (isPortrait.value ? 430 : isSquare.value ? 800 : 1280));
const baseH = computed(() => (isPortrait.value ? 932 : isSquare.value ? 800 : 720));

const canvasScale = computed(() => {
  const w = Math.max(1, props.layoutWidth || 1);
  const h = Math.max(1, props.layoutHeight || 1);
  // Vienmēr “contain” (bez apgriešanas).
  // Landscape pilnam ekrānam mēs aizpildām stage ar 100% un centrējam iekšējo canvas ar translate().
  return Math.min(w / baseW.value, h / baseH.value);
});

/** Ārējā kaste = vizuālais izmērs pēc scale (citādi flex joprojām rezervē BASE_W×BASE_H). */
const stageStyle = computed(() => {
  const s = canvasScale.value;
  if (isLandscape.value) {
    return {
      width: '100%',
      height: '100%',
      flex: '1 1 0%',
      minWidth: 0,
      minHeight: 0,
    };
  }
  return {
    width: `${baseW.value * s}px`,
    height: `${baseH.value * s}px`,
    flexShrink: '0',
  };
});

const canvasOffset = computed(() => {
  if (!isLandscape.value) return { x: 0, y: 0 };
  const w = Math.max(1, props.layoutWidth || 1);
  const h = Math.max(1, props.layoutHeight || 1);
  const s = canvasScale.value;
  return {
    x: Math.max(0, Math.round((w - baseW.value * s) / 2)),
    y: Math.max(0, Math.round((h - baseH.value * s) / 2)),
  };
});

/** Iekšējais dizaina laukums — fiksēti px, mērogojas no augšējā kreisā stūra kā HTML prototipos. */
const canvasInnerStyle = computed(() => ({
  width: `${baseW.value}px`,
  height: `${baseH.value}px`,
  transform: `translate(${canvasOffset.value.x}px, ${canvasOffset.value.y}px) scale(${canvasScale.value})`,
  transformOrigin: 'top left',
}));

const topBarH = computed(() => (isPortrait.value ? 48 : isSquare.value ? 46 : 48));
const inputW = computed(() => (isPortrait.value ? '100%' : isSquare.value ? '268px' : '320px'));
const centerW = computed(() => (isPortrait.value ? '80px' : isSquare.value ? '120px' : '180px'));

// Landscape (1280×720) proportions from provided HTML prototype
const LANDSCAPE_PLAYER_H = 76;
const LANDSCAPE_SUBHDR_H = 28;
const LANDSCAPE_PADDING_Y = 20;
const landscapeRowH = computed(() => {
  if (!isLandscape.value) return 0;
  const rows = Math.max(1, props.cricketSdtSegments?.length || 1);
  const tableH = baseH.value - topBarH.value - LANDSCAPE_PLAYER_H - LANDSCAPE_SUBHDR_H - LANDSCAPE_PADDING_Y;
  return tableH / rows;
});
const landscapeMarkSize = computed(() => {
  if (!isLandscape.value) return 44;
  return Math.max(20, Math.min(56, Math.round(landscapeRowH.value * 0.54)));
});

/** Portreta apakšējā ievades josla — fiksēti dizaina px (kā prototipā INPUT_H ≈ 310). */
const PORTRAIT_INPUT_BLOCK = 310;

function isCurrent(pid) {
  return Number(pid) === Number(props.state?.current_player?.id);
}

function segLabel(seg) {
  return seg === 25 ? '25' : String(seg);
}
</script>

<template>
  <div
    class="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#040609]"
    :data-cricket-canvas="layoutKind"
  >
    <div
      class="flex min-h-0 min-w-0 flex-1 overflow-hidden"
      :class="isLandscape ? 'items-stretch justify-stretch' : 'items-center justify-center'"
    >
      <div
        class="relative overflow-hidden rounded-sm shadow-2xl shadow-black/40"
        :class="isLandscape ? 'flex-1 min-h-0 min-w-0' : 'shrink-0'"
        :style="stageStyle"
      >
        <div
          class="absolute left-0 top-0 flex flex-col overflow-hidden bg-[#0b0e14] font-sans text-[#e8eaf0]"
          :style="canvasInnerStyle"
        >
        <!-- TOP BAR -->
        <div
          class="flex shrink-0 items-center gap-2 border-b border-[#1e2738] bg-[#0c1018]"
          :style="{ height: topBarH + 'px', padding: isPortrait ? '0 14px' : '0 16px', gap: isPortrait ? '10px' : '12px' }"
        >
          <div class="flex shrink-0 items-center gap-2">
            <div
              class="flex shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#f5a623] to-[#f5c842]"
              :style="{ width: isPortrait ? '24px' : '26px', height: isPortrait ? '24px' : '26px' }"
            >
              <svg
                class="text-[#0b0e14]"
                :width="isPortrait ? 13 : 14"
                :height="isPortrait ? 13 : 14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </div>
            <span v-if="!headerCompact" class="text-[12px] font-bold">traindart</span>
          </div>
          <div v-if="!headerCompact" class="h-4 w-px shrink-0 bg-[#1e2738]" />
          <span class="min-w-0 flex-1 truncate text-[13px] font-bold">Cricket</span>
          <div class="flex shrink-0 gap-1.5">
            <div
              class="rounded-md border border-[#1e2738] bg-[#131720] text-[10px] font-semibold text-[#7b8ba8]"
              :class="isPortrait ? 'px-2 py-0.5' : 'px-2.5 py-0.5'"
            >
              {{ isPortrait ? 'L' : 'Leg' }}<span class="font-bold text-[#e8eaf0]">{{ state.current_leg }}</span
              >/{{ legsConfigTotal }}
            </div>
            <div
              v-if="setsConfigTotal > 1"
              class="rounded-md border border-[#1e2738] bg-[#131720] text-[10px] font-semibold text-[#7b8ba8]"
              :class="isPortrait ? 'px-2 py-0.5' : 'px-2.5 py-0.5'"
            >
              {{ isPortrait ? 'S' : 'Set' }}<span class="font-bold text-[#e8eaf0]">{{ state.current_set }}</span
              >/{{ setsConfigTotal }}
            </div>
          </div>
          <div class="ml-auto flex shrink-0 items-center gap-2">
            <span
              v-if="!headerCompact"
              class="hidden max-w-[8rem] truncate font-mono text-[9px] text-[#3a4a63] sm:inline"
              :title="layoutKind + ' · ' + layoutWidth + '×' + layoutHeight"
            >
              {{ state.room_code }}
            </span>
            <div v-if="!headerCompact" class="hidden items-center gap-3 lg:flex">
              <div class="flex items-center gap-1.5">
                <CricketMarkCell :hits="1" :closed="false" size="board-sm" />
                <span class="text-[9px] text-[#7b8ba8]">1×</span>
              </div>
              <div class="flex items-center gap-1.5">
                <CricketMarkCell :hits="2" :closed="false" size="board-sm" />
                <span class="text-[9px] text-[#7b8ba8]">2×</span>
              </div>
              <div class="flex items-center gap-1.5">
                <CricketMarkCell :hits="3" :closed="false" size="board-sm" />
                <span class="text-[9px] text-[#7b8ba8]">slēgts</span>
              </div>
            </div>
            <div class="h-4 w-px shrink-0 bg-[#1e2738]" />
            <button
              v-if="(isMatchActive || isSuspended) && auth?.user"
              type="button"
              class="shrink-0 rounded-md border border-[#252d3d] bg-transparent text-[11px] font-semibold text-[#7b8ba8] hover:bg-[#131720]"
              :class="isPortrait ? 'px-2.5 py-1' : 'px-3 py-1'"
              @click="exitGameSaving"
            >
              {{ t('game.exitSave') }}
            </button>
            <button
              v-if="isMatchActive && auth?.user"
              type="button"
              class="shrink-0 rounded-md border border-[#3a1515] bg-[#2a1010] text-[11px] font-semibold text-[#ff5252]"
              :class="isPortrait ? 'px-2.5 py-1' : 'px-3 py-1'"
              @click="onShowAbandon"
            >
              Pārtraukt
            </button>
          </div>
        </div>

        <!-- Turn timer: moved onto active player's card (new design) -->

        <!-- PORTRAIT -->
        <template v-if="isPortrait">
          <div class="flex shrink-0 gap-1.5 px-2.5 pt-2">
            <div
              v-for="player in players"
              :key="'pc-' + player.id"
              class="relative min-w-0 flex-1 overflow-hidden rounded-[12px] border px-3.5 py-3"
              :class="isCurrent(player.id) ? 'border-[#f5a62345] bg-[#1b2232]' : 'border-[#1e2738] bg-[#131720]'"
            >
              <div
                v-if="isCurrent(player.id)"
                class="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-[#f5a623] to-[#f5c842]"
              />
              <div class="mb-1.5 flex items-center gap-2">
                <span v-if="isCurrent(player.id)" class="h-2 w-2 shrink-0 rounded-full bg-[#f5a623]" />
                <span class="truncate text-[14px] font-bold" :class="isCurrent(player.id) ? 'text-[#f5a623]' : 'text-[#8ea0bf]'">{{
                  player.name
                }}</span>
              </div>

              <!-- Timer above active player block -->
              <div
                v-if="isMatchActive && isCurrent(player.id) && turnTimerRowVisible"
                class="mb-1.5 flex items-center gap-2"
              >
                <div class="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-[#1e3050]">
                  <div
                    class="h-full rounded-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-300 transition-[width] duration-500 ease-linear"
                    :style="{ width: turnTimerProgress + '%' }"
                  />
                </div>
                <span class="w-[3.5rem] shrink-0 text-right font-mono text-[11px] font-black tabular-nums text-amber-400">{{
                  formatTurnClock(turnTimerRemainingSec)
                }}</span>
              </div>
              <div class="text-[36px] font-black leading-none tracking-tight text-[#e8eaf0]">{{ player.cricket?.points ?? 0 }}</div>
              <div class="mt-1 flex items-center justify-between text-[10px] text-[#7b8ba8]" :title="t('game.cricketAvgHint')">
                <span class="font-bold uppercase tracking-wide text-amber-600/90">{{ t('game.cricketAvgShort') }}</span>
                <span class="font-mono font-black text-amber-100/90">{{ player.avg_pts ?? '—' }}</span>
              </div>
              <div class="mt-1 text-[11px] text-[#7b8ba8]">
                S:<span class="ml-0.5 font-bold text-[#e8eaf0]">{{ player.sets_won ?? 0 }}</span> L:<span class="ml-0.5 font-bold text-[#e8eaf0]">{{
                  player.legs_won ?? 0
                }}</span>
              </div>
            </div>
          </div>
          <div class="flex min-h-0 flex-1 flex-col overflow-hidden px-2.5 pt-1.5">
            <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div class="flex shrink-0 border-b border-[#1a2030] px-1">
                <div class="flex-1 py-1 text-center text-[9px] font-bold uppercase tracking-wide text-[#252d3d]">
                  {{ leftPlayers[0]?.name?.slice(0, 8) || '—' }}
                </div>
                <div class="w-20 shrink-0 py-1 text-center text-[9px] font-bold uppercase tracking-wide text-[#252d3d]">LAUKS</div>
                <div class="flex-1 py-1 text-center text-[9px] font-bold uppercase tracking-wide text-[#252d3d]">
                  {{ rightPlayers[0]?.name?.slice(0, 8) || '—' }}
                </div>
              </div>
              <div
                v-for="(seg, idx) in cricketSdtSegments"
                :key="'pr-' + seg"
                class="flex min-h-0 flex-1 basis-0 items-center border-b border-[#0d1016] transition-colors"
                :class="[
                  segClosedByAll(seg) ? 'bg-[#060810]/60' : idx % 2 !== 0 ? 'bg-[#060910]/35' : '',
                ]"
              >
                <!-- P1 mark -->
                <div class="flex flex-1 items-center justify-center">
                  <CricketXMarkCell
                    :hits="hitsFor(leftPlayers[0]?.id, seg)"
                    :dimmed="segClosedByAll(seg)"
                    :size="36"
                  />
                </div>

                <!-- Field chip -->
                <div class="flex w-[4.5rem] shrink-0 items-center justify-center">
                  <div
                    class="flex flex-col items-center justify-center rounded-lg border transition-all"
                    :class="
                      segClosedByAll(seg)
                        ? 'border-[#151b26] bg-[#0c1016] opacity-35'
                        : seg === 25
                          ? 'border-[#ff525328] bg-[#1c0808]'
                          : 'border-[#252d3d] bg-[#1a2030]'
                    "
                    style="width:50px;height:68%;max-height:54px;min-height:28px"
                  >
                    <span
                      class="font-extrabold leading-none tracking-tight"
                      :class="[
                        segClosedByAll(seg)
                          ? 'text-[#3a4a63] line-through decoration-[#1e2738]'
                          : seg === 25 ? 'text-[#ff5252]' : 'text-[#f5a623]',
                        seg >= 20 ? 'text-[15px]' : 'text-[14px]',
                      ]"
                    >{{ segLabel(seg) }}</span>
                    <span
                      v-if="seg === 25 && !segClosedByAll(seg)"
                      class="mt-0.5 text-[6px] font-bold uppercase tracking-wider text-[#ff525270]"
                    >BULL</span>
                  </div>
                </div>

                <!-- P2 mark -->
                <div class="flex flex-1 items-center justify-center">
                  <CricketXMarkCell
                    :hits="hitsFor(rightPlayers[0]?.id, seg)"
                    :dimmed="segClosedByAll(seg)"
                    :size="36"
                  />
                </div>
              </div>
            </div>
          </div>
          <div
            class="flex shrink-0 flex-col overflow-hidden border-t border-[#1e2738] bg-[#0c1018] px-2 pb-3 pt-2"
            :style="{ height: PORTRAIT_INPUT_BLOCK + 'px', minHeight: PORTRAIT_INPUT_BLOCK + 'px' }"
          >
            <div class="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <CricketInputPanel
              density="compact"
              :state="state"
              :dart-input="dartInput"
              :submitting="submitting"
              :waiting-for-turn-ui="waitingForTurnUi"
              :cricket-pad-split="cricketPadSplit"
              :cricket-sdt-has-bull="cricketSdtHasBull"
              :seg-closed-by-all="segClosedByAll"
              :my-hits-for="myHitsFor"
              :add-cricket-dart="addCricketDart"
              :remove-dart="removeDart"
              :submit-throw="submitThrow"
              :undo="undo"
              :dart-label="dartLabel"
              :dart-value="dartValue"
            />
            </div>
          </div>
        </template>

        <!-- LANDSCAPE + SQUARE -->
        <div v-else class="flex min-h-0 flex-1 overflow-hidden">
          <div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <!-- Landscape prototype block (Square keeps the existing dense grid) -->
            <template v-if="isLandscape">
              <!-- Player cards -->
              <div class="flex shrink-0 gap-0 px-[10px] pt-[10px]">
                <div class="min-w-0 flex-1 pr-1">
                  <div
                    v-for="p in leftPlayers"
                    :key="'lc2-' + p.id"
                    class="relative flex items-center gap-[14px] overflow-hidden rounded-[10px] border px-[18px] py-[11px] last:mb-0"
                    :class="isCurrent(p.id) ? 'bg-[#1b2232]' : 'bg-[#131720]'"
                    :style="{ borderWidth: '1.5px', borderColor: isCurrent(p.id) ? '#f5a62348' : '#1e2738' }"
                  >
                    <div v-if="isCurrent(p.id)" class="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-[#f5a623] to-[#f5c842]" />
                    <div class="min-w-0 flex-1">
                      <div class="mb-[6px] flex items-center gap-2">
                        <div v-if="isCurrent(p.id)" class="h-[7px] w-[7px] shrink-0 rounded-full bg-[#f5a623]" />
                        <div class="truncate text-[14px] font-semibold" :class="isCurrent(p.id) ? 'text-[#f5a623]' : 'text-[#7b8ba8]'">{{ p.name }}</div>
                      </div>
                      <div v-if="isMatchActive && isCurrent(p.id) && turnTimerRowVisible" class="mb-[6px] flex items-center gap-2">
                        <div class="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-[#1e3050]">
                          <div
                            class="h-full rounded-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-300 transition-[width] duration-500 ease-linear"
                            :style="{ width: turnTimerProgress + '%' }"
                          />
                        </div>
                        <span class="w-[3.5rem] shrink-0 text-right font-mono text-[11px] font-black tabular-nums text-amber-400">{{
                          formatTurnClock(turnTimerRemainingSec)
                        }}</span>
                      </div>
                      <div class="flex items-baseline gap-[10px]">
                        <span class="text-[38px] font-extrabold leading-none tracking-[-2px] text-[#e8eaf0]">{{ p.cricket?.points ?? 0 }}</span>
                      </div>
                      <div class="mt-1 flex items-center justify-between text-[10px] text-[#7b8ba8]" :title="t('game.cricketAvgHint')">
                        <span class="font-bold uppercase tracking-wide text-amber-600/90">{{ t('game.cricketAvgShort') }}</span>
                        <span class="font-mono font-black text-amber-100/90">{{ p.avg_pts ?? '—' }}</span>
                      </div>
                    </div>
                    <div class="flex flex-col items-end gap-[5px]">
                      <div class="text-[11px] text-[#7b8ba8]">
                        <span class="font-bold text-[#e8eaf0]">{{ p.sets_won ?? 0 }}</span> sets&nbsp;
                        <span class="font-bold text-[#e8eaf0]">{{ p.legs_won ?? 0 }}</span> legs
                      </div>
                      <div
                        class="rounded-full px-2 py-[2px] text-[10px] font-bold uppercase tracking-[0.06em]"
                        :class="isCurrent(p.id) ? 'border border-[#f5a62335] bg-[#f5a62318] text-[#f5a623]' : 'border border-[#1e2738] bg-[#0b0e14] text-[#3a4a63]'"
                      >
                        {{ isCurrent(p.id) ? '● AKTĪVS' : '○ GAIDA' }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex shrink-0 items-center justify-center" :style="{ width: centerW }">
                  <span class="text-[9px] font-bold uppercase tracking-[0.14em] text-[#2e3a50]">LAUKS</span>
                </div>
                <div class="min-w-0 flex-1 pl-1">
                  <div
                    v-for="p in rightPlayers"
                    :key="'rc2-' + p.id"
                    class="relative flex items-center gap-[14px] overflow-hidden rounded-[10px] border px-[18px] py-[11px] last:mb-0"
                    :class="isCurrent(p.id) ? 'bg-[#1b2232]' : 'bg-[#131720]'"
                    :style="{ borderWidth: '1.5px', borderColor: isCurrent(p.id) ? '#f5a62348' : '#1e2738' }"
                  >
                    <div v-if="isCurrent(p.id)" class="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-[#f5a623] to-[#f5c842]" />
                    <div class="min-w-0 flex-1">
                      <div class="mb-[6px] flex items-center gap-2">
                        <div v-if="isCurrent(p.id)" class="h-[7px] w-[7px] shrink-0 rounded-full bg-[#f5a623]" />
                        <div class="truncate text-[14px] font-semibold" :class="isCurrent(p.id) ? 'text-[#f5a623]' : 'text-[#7b8ba8]'">{{ p.name }}</div>
                      </div>
                      <div v-if="isMatchActive && isCurrent(p.id) && turnTimerRowVisible" class="mb-[6px] flex items-center gap-2">
                        <div class="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-[#1e3050]">
                          <div
                            class="h-full rounded-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-300 transition-[width] duration-500 ease-linear"
                            :style="{ width: turnTimerProgress + '%' }"
                          />
                        </div>
                        <span class="w-[3.5rem] shrink-0 text-right font-mono text-[11px] font-black tabular-nums text-amber-400">{{
                          formatTurnClock(turnTimerRemainingSec)
                        }}</span>
                      </div>
                      <div class="flex items-baseline gap-[10px]">
                        <span class="text-[38px] font-extrabold leading-none tracking-[-2px] text-[#e8eaf0]">{{ p.cricket?.points ?? 0 }}</span>
                      </div>
                      <div class="mt-1 flex items-center justify-between text-[10px] text-[#7b8ba8]" :title="t('game.cricketAvgHint')">
                        <span class="font-bold uppercase tracking-wide text-amber-600/90">{{ t('game.cricketAvgShort') }}</span>
                        <span class="font-mono font-black text-amber-100/90">{{ p.avg_pts ?? '—' }}</span>
                      </div>
                    </div>
                    <div class="flex flex-col items-end gap-[5px]">
                      <div class="text-[11px] text-[#7b8ba8]">
                        <span class="font-bold text-[#e8eaf0]">{{ p.sets_won ?? 0 }}</span> sets&nbsp;
                        <span class="font-bold text-[#e8eaf0]">{{ p.legs_won ?? 0 }}</span> legs
                      </div>
                      <div
                        class="rounded-full px-2 py-[2px] text-[10px] font-bold uppercase tracking-[0.06em]"
                        :class="isCurrent(p.id) ? 'border border-[#f5a62335] bg-[#f5a62318] text-[#f5a623]' : 'border border-[#1e2738] bg-[#0b0e14] text-[#3a4a63]'"
                      >
                        {{ isCurrent(p.id) ? '● AKTĪVS' : '○ GAIDA' }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Column sub-headers -->
              <div class="flex shrink-0 px-[10px] pt-[6px]">
                <div class="flex-1 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-[#252d3d]">trāpījumi</div>
                <div class="shrink-0" :style="{ width: centerW }" />
                <div class="flex-1 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-[#252d3d]">trāpījumi</div>
              </div>

              <!-- Table -->
              <div class="flex min-h-0 flex-1 overflow-hidden px-[10px] pb-[10px] pt-[4px]">
                <!-- Player 1 marks -->
                <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
                  <div
                    v-for="seg in cricketSdtSegments"
                    :key="'lrow-' + seg"
                    class="flex items-center justify-center border-b border-[#131720] last:border-b-0"
                    :style="{ height: landscapeRowH + 'px' }"
                  >
                    <CricketXMarkCell :hits="hitsFor(leftPlayers[0]?.id, seg)" :dimmed="segClosedByAll(seg)" :size="landscapeMarkSize" />
                  </div>
                </div>

                <!-- Center field numbers -->
                <div class="flex shrink-0 flex-col overflow-hidden" :style="{ width: centerW }">
                  <div
                    v-for="seg in cricketSdtSegments"
                    :key="'crow-' + seg"
                    class="flex items-center justify-center border-b border-[#0f1218] last:border-b-0"
                    :style="{ height: landscapeRowH + 'px' }"
                  >
                    <div
                      class="flex flex-col items-center justify-center rounded-lg border"
                      :class="segClosedByAll(seg) ? 'opacity-45' : ''"
                      :style="{
                        width: '78px',
                        height: Math.round(landscapeRowH * 0.7) + 'px',
                        background: segClosedByAll(seg) ? '#0e1118' : (seg === 25 ? '#200a0a' : '#1a2030'),
                        borderColor: segClosedByAll(seg) ? '#151b26' : (seg === 25 ? '#ff525235' : '#252d3d'),
                      }"
                    >
                      <div
                        class="font-extrabold leading-none"
                        :style="{ fontSize: '22px', letterSpacing: '-0.5px', color: segClosedByAll(seg) ? '#3a4a63' : (seg === 25 ? '#ff5252' : '#f5a623') }"
                      >
                        {{ segLabel(seg) }}
                      </div>
                      <div
                        v-if="seg === 25"
                        class="mt-[1px] text-[8px] font-bold uppercase tracking-[0.08em]"
                        :style="{ color: segClosedByAll(seg) ? '#3a4a63' : '#ff525288' }"
                      >
                        BULL
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Player 2 marks -->
                <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
                  <div
                    v-for="seg in cricketSdtSegments"
                    :key="'rrow-' + seg"
                    class="flex items-center justify-center border-b border-[#131720] last:border-b-0"
                    :style="{ height: landscapeRowH + 'px' }"
                  >
                    <CricketXMarkCell :hits="hitsFor(rightPlayers[0]?.id, seg)" :dimmed="segClosedByAll(seg)" :size="landscapeMarkSize" />
                  </div>
                </div>
              </div>
            </template>

            <!-- Square (keep existing grid layout) -->
            <template v-else>
              <div class="flex shrink-0 gap-0 px-2 pt-2" :class="isSquare ? 'px-2' : 'px-2.5'">
                <div class="min-w-0 flex-1 pr-1">
                  <div
                    v-for="p in leftPlayers"
                    :key="'lc-' + p.id"
                    class="relative mb-1 overflow-hidden rounded-[10px] border px-4 py-3 last:mb-0"
                    :class="isCurrent(p.id) ? 'border-[#f5a62348] bg-[#1b2232]' : 'border-[#1e2738] bg-[#131720]'"
                  >
                    <div
                      v-if="isCurrent(p.id)"
                      class="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-[#f5a623] to-[#f5c842]"
                    />
                    <div class="mb-1 flex items-center gap-2">
                      <span v-if="isCurrent(p.id)" class="h-1.5 w-1.5 shrink-0 rounded-full bg-[#f5a623]" />
                      <span class="truncate text-sm font-semibold" :class="isCurrent(p.id) ? 'text-[#f5a623]' : 'text-[#7b8ba8]'">{{ p.name }}</span>
                    </div>
                    <div class="text-[38px] font-extrabold leading-none tracking-tight text-[#e8eaf0]">{{ p.cricket?.points ?? 0 }}</div>
                    <div class="mt-1 flex items-end justify-between gap-2">
                      <div class="flex flex-col gap-0.5" :title="t('game.cricketAvgHint')">
                        <span class="text-[9px] font-bold uppercase tracking-wide text-amber-500/90">{{ t('game.cricketAvgShort') }}</span>
                        <span class="text-base font-black tabular-nums text-amber-100">{{ p.avg_pts ?? '—' }}</span>
                      </div>
                      <div class="flex flex-col items-end gap-1">
                        <div class="flex gap-0.5">
                          <div
                            v-for="i in legsToWin"
                            :key="i"
                            class="h-1.5 w-1.5 rounded-full border transition-all"
                            :class="i <= (p.legs_won || 0) ? 'border-amber-400 bg-amber-400' : 'border-[#1e3050]'"
                          />
                        </div>
                        <div class="text-right text-[11px] text-[#7b8ba8]">
                          <span class="font-bold text-[#e8eaf0]">{{ p.sets_won ?? 0 }}</span> S
                          <span class="mx-1 font-bold text-[#e8eaf0]">{{ p.legs_won ?? 0 }}</span> L
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  class="flex shrink-0 items-center justify-center text-[9px] font-bold uppercase tracking-widest text-[#2e3a50]"
                  :style="{ width: centerW }"
                >
                  LAUKS
                </div>
                <div class="min-w-0 flex-1 pl-1">
                  <div
                    v-for="p in rightPlayers"
                    :key="'rc-' + p.id"
                    class="relative mb-1 overflow-hidden rounded-[10px] border px-4 py-3 last:mb-0"
                    :class="isCurrent(p.id) ? 'border-[#f5a62348] bg-[#1b2232]' : 'border-[#1e2738] bg-[#131720]'"
                  >
                    <div
                      v-if="isCurrent(p.id)"
                      class="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-[#f5a623] to-[#f5c842]"
                    />
                    <div class="mb-1 flex items-center gap-2">
                      <span v-if="isCurrent(p.id)" class="h-1.5 w-1.5 shrink-0 rounded-full bg-[#f5a623]" />
                      <span class="truncate text-sm font-semibold" :class="isCurrent(p.id) ? 'text-[#f5a623]' : 'text-[#7b8ba8]'">{{ p.name }}</span>
                    </div>
                    <div class="text-[38px] font-extrabold leading-none tracking-tight text-[#e8eaf0]">{{ p.cricket?.points ?? 0 }}</div>
                    <div class="mt-1 flex items-end justify-between gap-2">
                      <div class="flex flex-col gap-0.5" :title="t('game.cricketAvgHint')">
                        <span class="text-[9px] font-bold uppercase tracking-wide text-amber-500/90">{{ t('game.cricketAvgShort') }}</span>
                        <span class="text-base font-black tabular-nums text-amber-100">{{ p.avg_pts ?? '—' }}</span>
                      </div>
                      <div class="flex flex-col items-end gap-1">
                        <div class="flex gap-0.5">
                          <div
                            v-for="i in legsToWin"
                            :key="i"
                            class="h-1.5 w-1.5 rounded-full border transition-all"
                            :class="i <= (p.legs_won || 0) ? 'border-amber-400 bg-amber-400' : 'border-[#1e3050]'"
                          />
                        </div>
                        <div class="text-right text-[11px] text-[#7b8ba8]">
                          <span class="font-bold text-[#e8eaf0]">{{ p.sets_won ?? 0 }}</span> S
                          <span class="mx-1 font-bold text-[#e8eaf0]">{{ p.legs_won ?? 0 }}</span> L
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex shrink-0 px-2 pb-1 pt-0.5">
                <div class="flex-1 text-center text-[9px] font-semibold uppercase tracking-wide text-[#1e2738]">trāpījumi</div>
                <div class="shrink-0" :style="{ width: centerW }" />
                <div class="flex-1 text-center text-[9px] font-semibold uppercase tracking-wide text-[#1e2738]">trāpījumi</div>
              </div>
              <div class="flex min-h-0 flex-1 flex-col overflow-hidden px-2 pb-2">
                <div class="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-[#162540] bg-[#0f1c30]/90 shadow-inner">
                  <div class="shrink-0 border-b border-[#162540] bg-[#0a1120]/60 py-2" :style="scorecardGridStyle">
                    <div
                      v-for="p in leftPlayers"
                      :key="'lh-' + p.id"
                      class="truncate px-1 text-center text-xs font-bold"
                      :class="isCurrent(p.id) ? 'text-amber-400' : 'text-slate-500'"
                    >
                      {{ p.name }}
                    </div>
                    <div class="text-center text-[10px] font-black uppercase tracking-widest text-slate-500">Lauks</div>
                    <div
                      v-for="p in rightPlayers"
                      :key="'rh-' + p.id"
                      class="truncate px-1 text-center text-xs font-bold"
                      :class="isCurrent(p.id) ? 'text-amber-400' : 'text-slate-500'"
                    >
                      {{ p.name }}
                    </div>
                  </div>
                  <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
                    <div
                      v-for="(seg, idx) in cricketSdtSegments"
                      :key="'sr-' + seg"
                      class="min-h-0 min-w-0 flex-1 basis-0 border-b border-[#162540]/40 transition-all last:border-b-0"
                      :class="[idx % 2 === 0 ? 'bg-[#0a1120]/25' : '', segClosedByAll(seg) ? 'opacity-25' : '']"
                      :style="scorecardRowGridStyle"
                    >
                      <div
                        v-for="p in leftPlayers"
                        :key="'lm-' + p.id + '-' + seg"
                        class="flex min-h-0 min-w-0 items-center justify-center border-r border-[#162540]/30 p-1"
                      >
                        <CricketMarkCell :hits="hitsFor(p.id, seg)" :closed="segClosedByAll(seg)" size="board" />
                      </div>
                      <div
                        class="mx-0.5 my-0.5 flex min-h-0 min-w-0 items-center justify-center rounded-lg px-1 shadow-inner"
                        :class="
                          segClosedByAll(seg) ? 'border border-[#1e3050] bg-[#0a1120]/95' : 'border border-rose-900/40 bg-[#1a0a0f]'
                        "
                      >
                        <div class="flex flex-col items-center justify-center gap-0.5 py-0.5 leading-none">
                          <span
                            class="select-none font-black tabular-nums"
                            :class="[
                              isSquare ? 'text-[20px]' : 'text-[22px]',
                              segClosedByAll(seg) ? 'text-slate-500 line-through' : 'text-rose-300/90',
                            ]"
                            >{{ segLabel(seg) }}</span
                          >
                          <span v-if="seg === 25 && !segClosedByAll(seg)" class="text-[8px] font-bold uppercase tracking-widest text-rose-400/80"
                            >bull</span
                          >
                        </div>
                      </div>
                      <div
                        v-for="p in rightPlayers"
                        :key="'rm-' + p.id + '-' + seg"
                        class="flex min-h-0 min-w-0 items-center justify-center border-l border-[#162540]/30 p-1"
                      >
                        <CricketMarkCell :hits="hitsFor(p.id, seg)" :closed="segClosedByAll(seg)" size="board" />
                      </div>
                    </div>
                  </div>
                  <div
                    class="flex shrink-0 flex-wrap gap-x-4 gap-y-1 border-t border-[#162540] bg-[#0a1120]/40 px-3 py-1.5 text-[11px] text-slate-500"
                  >
                    <span><span class="font-mono font-black text-slate-400">0</span> nav</span>
                    <span><span class="font-mono font-black text-sky-400/90">1</span> viens</span>
                    <span><span class="font-mono font-black text-amber-400/90">2</span> divi</span>
                    <span class="inline-flex items-center gap-1.5">
                      <span class="inline-flex h-4 w-4 flex-shrink-0 items-center justify-center text-emerald-400/95">
                        <CricketClosedCheck :boosted="false" />
                      </span>
                      slēgts
                    </span>
                  </div>
                </div>
              </div>
            </template>
          </div>
          <div
            class="flex min-h-0 shrink-0 flex-col overflow-hidden border-l border-[#1e2738] bg-[#0c1018]"
            :style="{ width: inputW, padding: isSquare ? '12px 10px' : '14px 12px' }"
          >
            <CricketInputPanel
              density="default"
              :state="state"
              :dart-input="dartInput"
              :submitting="submitting"
              :waiting-for-turn-ui="waitingForTurnUi"
              :cricket-pad-split="cricketPadSplit"
              :cricket-sdt-has-bull="cricketSdtHasBull"
              :seg-closed-by-all="segClosedByAll"
              :my-hits-for="myHitsFor"
              :add-cricket-dart="addCricketDart"
              :remove-dart="removeDart"
              :submit-throw="submitThrow"
              :undo="undo"
              :dart-label="dartLabel"
              :dart-value="dartValue"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>
