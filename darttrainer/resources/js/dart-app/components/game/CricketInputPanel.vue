<script setup>
import { computed } from 'vue';
import CricketXMarkCell from '../CricketXMarkCell.js';

const props = defineProps({
  state:              { type: Object,   required: true },
  dartInput:          { type: Object,   required: true },
  submitting:         { type: Boolean,  default: false },
  waitingForTurnUi:   { type: Boolean,  default: false },
  cricketPadSplit:    { type: Object,   default: () => ({ left: [], right: [] }) },
  cricketSdtHasBull:  { type: Boolean,  default: false },
  segClosedByAll:     { type: Function, required: true },
  myHitsFor:          { type: Function, required: true },
  addCricketDart:     { type: Function, required: true },
  removeDart:         { type: Function, required: true },
  submitThrow:        { type: Function, required: true },
  undo:               { type: Function, required: true },
  dartLabel:          { type: Function, required: true },
  dartValue:          { type: Function, required: true },
  /** 'compact' = portreta apakšpanelis | 'default' = ainavas labā kolonna */
  density:            { type: String,   default: 'default' },
});

/** Visi ne-bull segmenti secībā — izmanto kompakta 3×2 tabulai. */
const allNonBullSegs = computed(() => [
  ...props.cricketPadSplit.left,
  ...props.cricketPadSplit.right,
]);

/** Kārtā ievadīto efektīvo marku skaits (rāda dzīvu statistiku). */
const turnMarkCount = computed(() => {
  const segs = new Set([
    ...props.cricketPadSplit.left,
    ...props.cricketPadSplit.right,
    ...(props.cricketSdtHasBull ? [25] : []),
  ]);
  return props.dartInput.darts.reduce((sum, d) => {
    const seg = Number(d.segment ?? 0);
    const mul = Number(d.multiplier ?? 0);
    return sum + (seg > 0 && mul > 0 && segs.has(seg) ? mul : 0);
  }, 0);
});

const markCountColor = computed(() => {
  if (turnMarkCount.value >= 9) return '#3ecf8e';
  if (turnMarkCount.value >= 6) return '#f5a623';
  if (turnMarkCount.value >= 4) return '#7b8ba8';
  return '#3a4a63';
});

function segLabel(seg) {
  return seg === 25 ? '25' : String(seg);
}
</script>

<template>
  <div
    class="flex min-h-0 flex-1 flex-col overflow-hidden"
    :class="density === 'compact' ? 'gap-1.5 p-2' : 'gap-3 p-3'"
  >
    <!-- ── GAIDĪŠANA (abiem density) ──────────────────────────────────── -->
    <div
      v-if="waitingForTurnUi"
      class="flex flex-1 flex-col items-center justify-center gap-3 p-4 text-center"
    >
      <div class="text-xs font-semibold uppercase tracking-widest text-slate-500">Gaida</div>
      <div class="text-xl font-black text-slate-100">{{ state.current_player?.name }}</div>
      <div class="flex gap-1.5">
        <span class="h-2 w-2 animate-bounce rounded-full bg-amber-500" style="animation-delay:0ms" />
        <span class="h-2 w-2 animate-bounce rounded-full bg-amber-500" style="animation-delay:150ms" />
        <span class="h-2 w-2 animate-bounce rounded-full bg-amber-500" style="animation-delay:300ms" />
      </div>
    </div>

    <!-- ── KOMPAKTS (portreta režīms) ─────────────────────────────────── -->
    <template v-else-if="density === 'compact'">

      <!-- 1. Kārtas galvene -->
      <div class="flex shrink-0 items-center justify-between">
        <span class="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-600">Šīs kārtas</span>
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-semibold text-slate-400">{{ state.current_player?.name }}</span>
          <div class="flex gap-[3px]">
            <span
              v-for="i in 3"
              :key="i"
              class="h-1.5 w-1.5 rounded-full transition-all"
              :class="i <= dartInput.darts.length ? 'bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,.5)]' : 'bg-[#1e3050]'"
            />
          </div>
        </div>
         <!-- 3. Kārtas marks (mini statistika) -->
        <div v-if="turnMarkCount > 0" class="flex shrink-0 items-center justify-end gap-1">
        <span class="text-[9px] text-slate-600">kārtā:</span>
        <span
          class="text-[11px] font-black tabular-nums transition-colors"
          :style="{ color: markCountColor }"
        >{{ turnMarkCount }} m</span>
        <span v-if="turnMarkCount >= 9" class="text-[9px] font-black text-emerald-400">🔥</span>
        <span v-else-if="turnMarkCount >= 6" class="text-[9px] text-amber-500">⬡</span>
      </div>
      </div>

      <!-- 2. Ievadītās šautriņas -->
      <div class="flex shrink-0 gap-1.5">
        <div
          v-for="(d, i) in dartInput.darts"
          :key="i"
          class="relative flex h-[2.4rem] flex-1 items-center overflow-hidden rounded-xl border border-[#1e3050] bg-[#0f1c30] px-2"
        >
          <div class="min-w-0 flex-1">
            <div class="truncate font-mono text-sm font-black leading-tight text-amber-400">{{ dartLabel(d) }}</div>
            <div class="text-[10px] tabular-nums text-slate-600">{{ dartValue(d) > 0 ? dartValue(d) : '—' }}</div>
          </div>
          <button
            type="button"
            class="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-700/70 text-[9px] font-black text-white transition hover:bg-red-600 active:scale-90 touch-manipulation"
            @click="removeDart(i)"
          >✕</button>
        </div>
        <div
          v-for="i in 3 - dartInput.darts.length"
          :key="'e' + i"
          class="flex h-[2.4rem] flex-1 items-center justify-center rounded-xl border border-dashed border-[#1e3050] bg-[#060d18]/60 font-mono text-xs text-[#1e3050]"
        >—</div>
      </div>
      

      <!-- 4. Segmentu tīkls 3 × N -->
      <div
        class="min-h-0 flex-1 grid grid-cols-3 gap-[3px]"
        style="grid-template-rows: 1fr 1fr"
      >
        <div
          v-for="seg in allNonBullSegs"
          :key="'cs' + seg"
          class="flex flex-col overflow-hidden rounded-xl transition-opacity"
          :class="
            segClosedByAll(seg)
              ? 'border border-[#131720] bg-[#090d12] opacity-30'
              : 'border border-slate-500/20 bg-gradient-to-b from-[#101c32] via-[#0a1424] to-[#060d14] shadow-md shadow-black/30 ring-1 ring-white/[0.05]'
          "
        >
          <!-- Segments galvene: marks + cipars -->
          <div class="flex shrink-0 items-center justify-between px-1.5 pt-1">
            <CricketXMarkCell
              :hits="myHitsFor(seg)"
              :dimmed="segClosedByAll(seg)"
              :size="13"
            />
            <span
              class="text-sm font-extrabold tabular-nums leading-none"
              :class="segClosedByAll(seg) ? 'text-[#3a4a63] line-through' : 'text-[#f5a623]'"
            >{{ segLabel(seg) }}</span>
          </div>

          <!-- Multiplier pogas -->
          <div class="flex min-h-0 flex-1 items-stretch gap-[2px] p-1 pt-0.5">
            <button
              v-for="m in 3"
              :key="m"
              type="button"
              class="flex flex-1 items-center justify-center rounded-lg text-[11px] font-bold transition active:scale-90 touch-manipulation disabled:opacity-20"
              :class="
                myHitsFor(seg) >= 3
                  ? 'bg-emerald-950/70 text-emerald-500/80'
                  : m === 3
                    ? 'bg-[#2a1e0a] text-[#f5a623] hover:bg-[#3a2a0e]'
                    : m === 2
                      ? 'bg-[#0a1828] text-sky-300/90 hover:bg-[#0e2035]'
                      : 'bg-[#1a2030] text-[#c0c8d8] hover:bg-[#222a3c]'
              "
              :disabled="segClosedByAll(seg) || dartInput.darts.length >= 3"
              @click="addCricketDart(seg, m)"
            >{{ m }}×</button>
          </div>
        </div>
      </div>

      <!-- 5. Bull + Miss rinda -->
      <div class="flex shrink-0 gap-1.5">
        <!-- Bull -->
        <div
          v-if="cricketSdtHasBull"
          class="flex-[2] overflow-hidden rounded-xl transition-opacity"
          :class="
            segClosedByAll(25)
              ? 'border border-[#131720] bg-[#090d12] opacity-30'
              : 'border border-[#1e3050] bg-gradient-to-b from-[#101c32] to-[#060d14] shadow-md ring-1 ring-white/[0.05]'
          "
        >
          <div class="flex items-center justify-between px-1.5 pt-1">
            <CricketXMarkCell :hits="myHitsFor(25)" :dimmed="segClosedByAll(25)" :size="13" />
            <span
              class="text-sm font-extrabold leading-none"
              :class="segClosedByAll(25) ? 'text-[#3a4a63] line-through' : 'text-[#ff5252]'"
            >25</span>
          </div>
          <div class="flex gap-[2px] p-1 pt-0.5">
            <button
              type="button"
              class="flex flex-1 items-center justify-center rounded-lg py-0.5 text-[11px] font-bold transition active:scale-90 touch-manipulation disabled:opacity-20"
              :class="myHitsFor(25) >= 3 ? 'bg-emerald-950/70 text-emerald-500/80' : 'bg-[#1a2030] text-[#c0c8d8] hover:bg-[#222a3c]'"
              :disabled="segClosedByAll(25) || dartInput.darts.length >= 3"
              @click="addCricketDart(25, 1)"
            >1×</button>
            <button
              type="button"
              class="flex flex-[2] items-center justify-center rounded-lg py-0.5 text-[12px] font-bold transition active:scale-90 touch-manipulation disabled:opacity-20"
              :class="myHitsFor(25) >= 3 ? 'bg-emerald-950/70 text-emerald-500/80' : 'bg-[#200a0f] text-[#ff5252] hover:bg-[#2c0e14]'"
              :disabled="segClosedByAll(25) || dartInput.darts.length >= 3"
              @click="addCricketDart(25, 2)"
            >2× Bull</button>
          </div>
        </div>

        <!-- Miss -->
        <button
          type="button"
          class="flex-1 rounded-xl border border-rose-900/35 bg-[#1a0a0f] py-1 text-[11px] font-black uppercase tracking-wide text-rose-300/80 transition hover:bg-[#241018] active:scale-[0.97] touch-manipulation disabled:opacity-20"
          :disabled="dartInput.darts.length >= 3"
          @click="addCricketDart(0, 0)"
        >Miss</button>
      </div>

      <!-- 6. Darbību pogas -->
      <div class="flex shrink-0 gap-2">
        <button
          type="button"
          class="flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl border border-[#1e3050] bg-[#0f1c30] py-2.5 text-sm font-bold text-slate-300 transition hover:bg-[#162540] active:scale-[0.97] touch-manipulation"
          @click="undo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none"
               stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"
               class="w-4 h-4 shrink-0">
            <path d="M7.5 5H13a4 4 0 0 1 0 8H7"/>
            <polyline points="4 5 7.5 2 7.5 8"/>
          </svg>
          Atsaukt
        </button>
        <button
          type="button"
          class="flex-1 rounded-2xl bg-amber-500 py-2.5 text-sm font-black text-black shadow-lg shadow-amber-950/30 transition hover:bg-amber-400 active:scale-[0.97] touch-manipulation disabled:opacity-40"
          :disabled="dartInput.darts.length === 0 || submitting"
          @click="submitThrow"
        >{{ submitting ? '...' : 'Iesniegt →' }}</button>
      </div>

    </template>

    <!-- ── NOKLUSĒJUMA (ainava / square) ──────────────────────────────── -->
    <template v-else>
      <div class="flex shrink-0 items-center justify-between gap-2">
        <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">Šīs kārtas</span>
        <div class="flex gap-1" aria-hidden="true">
          <span
            v-for="i in 3"
            :key="i"
            class="h-1.5 w-1.5 rounded-full transition-all"
            :class="i <= dartInput.darts.length ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,.5)]' : 'bg-[#1e3050]'"
          />
        </div>
      </div>

      <div class="flex shrink-0 gap-2">
        <div
          v-for="(d, i) in dartInput.darts"
          :key="i"
          class="group relative flex min-h-[3.5rem] min-w-0 flex-1 flex-col justify-center rounded-xl border border-[#162540] bg-[#0f1c30] px-1.5 py-2 text-center touch-manipulation"
        >
          <div class="truncate font-mono text-sm font-black text-amber-400 sm:text-base">{{ dartLabel(d) }}</div>
          <div class="text-[11px] tabular-nums text-slate-500">{{ dartValue(d) > 0 ? dartValue(d) : '—' }}</div>
          <button
            type="button"
            class="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-700 text-xs text-white shadow-md transition hover:bg-red-600 sm:h-6 sm:w-6"
            @click="removeDart(i)"
          >✕</button>
        </div>
        <div
          v-for="i in 3 - dartInput.darts.length"
          :key="'e' + i"
          class="flex min-h-[3.5rem] flex-1 items-center justify-center rounded-xl border border-dashed border-[#1e3050] bg-[#060d18]/80 font-mono text-xs text-[#1e3050]"
        >—</div>
      </div>

      <div class="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-0.5">
        <div class="grid grid-cols-2 gap-x-2 gap-y-2">
          <div class="flex flex-col gap-2">
            <div
              v-for="seg in cricketPadSplit.left"
              :key="'il' + seg"
              class="rounded-2xl border border-slate-500/25 bg-gradient-to-b from-[#101c32] via-[#0a1424] to-[#060d14] p-2 shadow-lg shadow-black/25 ring-1 ring-white/[0.06]"
            >
              <div class="mb-1.5 flex items-center justify-between gap-2">
                <span class="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">Lauks</span>
                <span class="min-w-[2.25rem] rounded-xl border border-rose-900/40 bg-[#1a0a0f] px-2.5 py-1 text-center text-xl font-black tabular-nums text-rose-300/90">{{ seg }}</span>
              </div>
              <div class="grid grid-cols-3 gap-1.5">
                <button
                  v-for="m in 3"
                  :key="m"
                  type="button"
                  class="relative flex select-none items-center justify-center overflow-hidden rounded-xl border px-1 py-2.5 shadow-sm ring-1 ring-inset transition active:scale-[0.96] touch-manipulation disabled:opacity-20"
                  :class="[
                    myHitsFor(seg) >= 3
                      ? '!border-emerald-600/50 !from-emerald-950/90 !to-emerald-950 !ring-emerald-500/15'
                      : m === 3
                        ? 'border-amber-400/45 bg-gradient-to-b from-amber-600/40 to-amber-950/95 text-amber-50 ring-amber-300/15 hover:from-amber-500/50'
                        : m === 2
                          ? 'border-sky-400/40 bg-gradient-to-b from-sky-600/45 to-sky-950/95 text-sky-50 ring-sky-300/15 hover:from-sky-500/55'
                          : 'border-slate-400/35 bg-gradient-to-b from-slate-600/50 to-slate-950/95 text-white ring-white/10 hover:from-slate-500/55',
                  ]"
                  :disabled="segClosedByAll(seg) || dartInput.darts.length >= 3"
                  @click="addCricketDart(seg, m)"
                >
                  <span class="text-xl font-black leading-none tabular-nums">{{ m }}×</span>
                  <span v-if="myHitsFor(seg) >= 3" class="absolute right-0.5 top-0.5 text-[8px] text-emerald-400">✓</span>
                </button>
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <div
              v-for="seg in cricketPadSplit.right"
              :key="'ir' + seg"
              class="rounded-2xl border border-slate-500/25 bg-gradient-to-b from-[#101c32] via-[#0a1424] to-[#060d14] p-2 shadow-lg shadow-black/25 ring-1 ring-white/[0.06]"
            >
              <div class="mb-1.5 flex items-center justify-between gap-2">
                <span class="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">Lauks</span>
                <span class="min-w-[2.25rem] rounded-xl border border-rose-900/40 bg-[#1a0a0f] px-2.5 py-1 text-center text-xl font-black tabular-nums text-rose-300/90">{{ seg }}</span>
              </div>
              <div class="grid grid-cols-3 gap-1.5">
                <button
                  v-for="m in 3"
                  :key="m"
                  type="button"
                  class="relative flex select-none items-center justify-center overflow-hidden rounded-xl border px-1 py-2.5 shadow-sm ring-1 ring-inset transition active:scale-[0.96] touch-manipulation disabled:opacity-20"
                  :class="[
                    myHitsFor(seg) >= 3
                      ? '!border-emerald-600/50 !from-emerald-950/90 !to-emerald-950 !ring-emerald-500/15'
                      : m === 3
                        ? 'border-amber-400/45 bg-gradient-to-b from-amber-600/40 to-amber-950/95 text-amber-50 ring-amber-300/15 hover:from-amber-500/50'
                        : m === 2
                          ? 'border-sky-400/40 bg-gradient-to-b from-sky-600/45 to-sky-950/95 text-sky-50 ring-sky-300/15 hover:from-sky-500/55'
                          : 'border-slate-400/35 bg-gradient-to-b from-slate-600/50 to-slate-950/95 text-white ring-white/10 hover:from-slate-500/55',
                  ]"
                  :disabled="segClosedByAll(seg) || dartInput.darts.length >= 3"
                  @click="addCricketDart(seg, m)"
                >
                  <span class="text-xl font-black leading-none tabular-nums">{{ m }}×</span>
                  <span v-if="myHitsFor(seg) >= 3" class="absolute right-0.5 top-0.5 text-[8px] text-emerald-400">✓</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bull (default) -->
      <div
        v-if="cricketSdtHasBull"
        class="shrink-0 rounded-2xl border border-[#1e3050] bg-gradient-to-b from-[#101c32] via-[#0a1424] to-[#060d14] p-2 shadow-lg ring-1 ring-white/[0.06]"
      >
        <div class="mb-1.5 flex items-center justify-between gap-2 px-0.5">
          <span class="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">Bull</span>
          <span class="rounded-xl border border-rose-900/40 bg-[#1a0a0f] px-2.5 py-1 text-xl font-black tabular-nums text-rose-300/90">25</span>
        </div>
        <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-1.5">
          <button
            type="button"
            class="relative flex select-none items-center justify-center overflow-hidden rounded-xl border border-emerald-700/45 bg-gradient-to-b from-emerald-800/50 to-emerald-950/95 px-1 py-2.5 text-emerald-100 shadow-sm ring-1 ring-inset ring-emerald-500/15 transition hover:from-emerald-700/55 active:scale-[0.96] touch-manipulation disabled:opacity-20"
            :class="myHitsFor(25) >= 3 ? '!border-emerald-600/50 !from-emerald-950/90 !to-emerald-950' : ''"
            :disabled="segClosedByAll(25) || dartInput.darts.length >= 3"
            @click="addCricketDart(25, 1)"
          >
            <span class="text-xl font-black tabular-nums leading-none">1×</span>
            <span v-if="myHitsFor(25) >= 3" class="absolute right-1 top-1 text-[8px] text-emerald-400">✓</span>
          </button>
          <button
            type="button"
            class="relative flex select-none items-center justify-center overflow-hidden rounded-xl border border-red-800/50 bg-gradient-to-b from-red-800/55 to-red-950/95 px-1 py-2.5 text-red-50 shadow-md ring-1 ring-inset ring-red-500/20 transition hover:from-red-700/60 active:scale-[0.96] touch-manipulation disabled:opacity-20"
            :class="myHitsFor(25) >= 3 ? '!border-emerald-600/50 !from-emerald-950/90 !to-emerald-950 !ring-emerald-500/30' : ''"
            :disabled="segClosedByAll(25) || dartInput.darts.length >= 3"
            @click="addCricketDart(25, 2)"
          >
            <span class="text-2xl font-black tabular-nums leading-none">2×</span>
            <span v-if="myHitsFor(25) >= 3" class="absolute right-1 top-1 text-[8px] text-emerald-400">✓</span>
          </button>
        </div>
      </div>

      <!-- Miss (default) -->
      <button
        type="button"
        class="shrink-0 w-full select-none rounded-2xl border border-rose-900/40 bg-[#1a0a0f] py-3 text-xs font-black uppercase tracking-wide text-rose-300/90 transition hover:bg-[#2a1218] active:scale-95 touch-manipulation disabled:opacity-20"
        :disabled="dartInput.darts.length >= 3"
        @click="addCricketDart(0, 0)"
      >Miss</button>

      <!-- Pogas (default) -->
      <div class="flex shrink-0 gap-2 pt-1">
        <button
          type="button"
          class="flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl border border-[#1e3050] bg-[#162540] py-3.5 text-sm font-bold text-slate-200 transition hover:bg-[#1e3050] active:scale-[0.97] touch-manipulation"
          @click="undo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none"
               stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"
               class="w-4 h-4 shrink-0">
            <path d="M7.5 5H13a4 4 0 0 1 0 8H7"/>
            <polyline points="4 5 7.5 2 7.5 8"/>
          </svg>
          Atsaukt
        </button>
        <button
          type="button"
          class="flex-1 rounded-2xl bg-amber-500 py-3.5 text-sm font-black text-black shadow-lg shadow-amber-950/30 transition hover:bg-amber-400 active:scale-[0.97] touch-manipulation disabled:opacity-40"
          :disabled="dartInput.darts.length === 0 || submitting"
          @click="submitThrow"
        >{{ submitting ? '...' : 'Iesniegt →' }}</button>
      </div>
    </template>

  </div>
</template>
