<script setup>
import { computed } from 'vue';
import { useLocaleStore } from '../store/index.js';
import CricketClosedCheck from './CricketClosedCheck.vue';

const props = defineProps({
  players:         { type: Array,  required: true },
  currentPlayerId: { type: Number, default: null },
  gameConfig:      { type: Object, default: () => ({}) },
});

const locale = useLocaleStore();
const t = (k) => locale.t(k);

const segments = computed(() => {
  const segs = props.gameConfig?.cricket_segments;
  return Array.isArray(segs) && segs.length ? segs : [20, 19, 18, 17, 16, 15, 25];
});

const gridStyle = computed(() => {
  const n = segments.value.length;
  const cols = [
    'minmax(0,1.05fr)',
    ...Array(n).fill('minmax(0,1fr)'),
    'minmax(0,0.95fr)',
    'minmax(0,0.95fr)',
  ].join(' ');
  return `display:grid;width:100%;grid-template-columns:${cols};gap:2px;align-items:stretch`;
});

function segKey(seg)   { return seg === 25 ? 'seg_bull' : 'seg_' + seg; }
function segLabel(seg) { return seg === 25 ? 'B' : String(seg); }

function digitHits(hits) {
  const n = hits ?? 0;
  if (n === 2) return '2';
  if (n === 1) return '1';
  return '0';
}

function hitTitle(hits) {
  const n = hits ?? 0;
  if (n >= 3) return 'Slēgts (3 trāpījumi)';
  if (n === 2) return 'Divi trāpījumi';
  if (n === 1) return 'Viens trāpījums';
  return 'Nav trāpījumu';
}

function cellClass(hits, seg) {
  const n = hits ?? 0;
  const allClosed = closedByAll(seg);
  if (allClosed) {
    return 'bg-[#050a14] border border-[#1e2a3d] text-slate-600';
  }
  if (n >= 3) {
    return 'bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 font-black';
  }
  if (n === 2) {
    return 'bg-amber-950/50 border border-amber-700/50 text-amber-300 font-bold';
  }
  if (n === 1) {
    return 'bg-sky-950/40 border border-sky-700/40 text-sky-200 font-bold';
  }
  return 'bg-[#162540] border border-[#1e3050] text-slate-500';
}

function headerSegClass(seg) {
  return closedByAll(seg)
    ? 'bg-[#0a1120]/95 border border-[#1e3050] shadow-inner'
    : 'border border-rose-900/40 bg-[#1a0a0f] shadow-inner';
}

function headerSegTextClass(seg) {
  return closedByAll(seg) ? 'text-slate-500 line-through' : 'text-rose-300/90';
}

function closedByAll(seg) {
  return props.players.length > 0 &&
    props.players.every(p => (p.cricket?.[segKey(seg)] ?? 0) >= 3);
}

const leaderId = computed(() => {
  if (!props.players.length) return null;
  let best = -1, bestId = null;
  for (const p of props.players) {
    const pts = p.cricket?.points ?? 0;
    if (pts > best) { best = pts; bestId = p.id; }
  }
  return best > 0 ? bestId : null;
});
</script>

<template>
  <div class="rounded-xl border border-[#162540] bg-[#0f1c30] w-full min-w-0 overflow-hidden">
    <div class="hidden md:flex flex-wrap items-center gap-1.5 px-2.5 py-2 border-b border-[#162540] bg-[#0a1120] text-[9px] leading-tight">
      <span class="font-black text-slate-500 uppercase tracking-wider mr-1">Trāpījumi:</span>
      <span class="rounded px-2 py-0.5 bg-[#162540] text-slate-400 border border-[#1e3050] font-mono font-black">0</span>
      <span class="text-slate-600">nav</span>
      <span class="rounded px-2 py-0.5 bg-sky-950/50 text-sky-200 border border-sky-600/50 font-mono font-black">1</span>
      <span class="rounded px-2 py-0.5 bg-amber-950/50 text-amber-200 border border-amber-600/50 font-mono font-black">2</span>
      <span class="inline-flex items-center justify-center rounded px-1.5 py-0.5 bg-emerald-950/55 border border-emerald-600/50 text-[10px] leading-none">
        <CricketClosedCheck :boosted="false" />
      </span>
      <span class="text-slate-500">slēgts</span>
      <span class="text-slate-600 ml-auto text-[9px]">Kolonna „mirusi", kad visiem ✓</span>
    </div>

    <!-- MOBILAIS: vertikāls -->
    <div class="md:hidden p-1.5 space-y-0.5 w-full min-w-0 box-border">
      <div class="flex gap-1 items-end min-h-[36px]">
        <div class="w-11 flex-shrink-0 text-[8px] font-black text-slate-600 uppercase leading-none pb-0.5">Seg.</div>
        <div v-for="p in players" :key="'mv-h-'+p.id"
             class="flex-1 min-w-0 text-center text-[9px] font-bold leading-tight px-0.5 pb-0.5 rounded-t-md border-b-2 truncate"
             :class="p.id === currentPlayerId
               ? 'text-amber-300 border-amber-500 bg-amber-500/10'
               : 'text-slate-300 border-[#1e3050]'">
          {{ p.name }}
        </div>
      </div>

      <div v-for="seg in segments" :key="'mv-'+seg" class="flex gap-1 items-stretch min-h-[38px]">
        <div class="w-11 flex-shrink-0 rounded-lg flex items-center justify-center font-black text-sm"
             :class="headerSegClass(seg)">
          <span class="tabular-nums tracking-tight" :class="headerSegTextClass(seg)">{{ segLabel(seg) }}</span>
        </div>
        <div v-for="p in players" :key="p.id+'-'+seg"
             :title="hitTitle(p.cricket?.[segKey(seg)])"
             class="flex-1 min-w-0 flex items-center justify-center rounded-md font-mono text-sm font-black py-0.5 px-0.5"
             :class="cellClass(p.cricket?.[segKey(seg)], seg)">
          <CricketClosedCheck v-if="(p.cricket?.[segKey(seg)] ?? 0) >= 3" :boosted="true" />
          <template v-else>{{ digitHits(p.cricket?.[segKey(seg)]) }}</template>
        </div>
      </div>

      <div class="flex gap-1 items-stretch pt-1 border-t border-[#162540] min-h-[32px]">
        <div class="w-11 flex-shrink-0 flex items-center text-[9px] font-black text-slate-500 uppercase">Pts</div>
        <div v-for="p in players" :key="'mv-pts-'+p.id"
             class="flex-1 min-w-0 flex items-center justify-center rounded-md text-xs font-black border border-[#1e3050] tabular-nums"
             :class="p.id === leaderId ? 'text-amber-400 bg-amber-950/25' : 'text-slate-200 bg-[#162540]'">
          {{ p.cricket?.points ?? 0 }}
        </div>
      </div>
      <div class="flex gap-1 items-stretch min-h-[34px]">
        <div class="w-11 flex-shrink-0 flex items-center px-0.5 leading-tight">
          <span class="text-[8px] font-black uppercase tracking-tight text-amber-500/95 text-center w-full"
                :title="t('game.cricketAvgHint')">{{ t('game.cricketAvgShort') }}</span>
        </div>
        <div v-for="p in players" :key="'mv-ht-'+p.id"
             :title="t('game.cricketAvgHint')"
             class="flex-1 min-w-0 flex items-center justify-center rounded-md text-sm sm:text-base font-black tabular-nums px-0.5
                    border border-amber-900/40 bg-amber-950/30 text-amber-100 shadow-[inset_0_1px_0_rgba(251,191,36,.12)]">
          {{ p.avg_pts != null ? p.avg_pts : '—' }}
        </div>
      </div>
    </div>

    <!-- DESKTOP: horizontālais režģis -->
    <div class="hidden md:block p-1.5 sm:p-2 w-full min-w-0 box-border">
      <div class="w-full min-w-0" :style="gridStyle">

        <div class="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase px-0.5 min-w-0 flex items-end pb-0.5 leading-none">
          Spēl.
        </div>
        <div v-for="seg in segments" :key="'h'+seg"
             class="text-center rounded-lg min-w-0 font-black leading-none flex items-center justify-center min-h-[42px] sm:min-h-[48px] px-0.5 py-1.5"
             :class="headerSegClass(seg)">
          <span class="tabular-nums truncate text-[15px] sm:text-[17px] tracking-tight"
                :class="headerSegTextClass(seg)">{{ segLabel(seg) }}</span>
        </div>
        <div class="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase flex items-end justify-center pb-0.5 min-w-0 text-center leading-none">
          Pts
        </div>
        <div class="text-[7px] sm:text-[8px] font-black text-amber-500/95 uppercase flex items-end justify-center pb-0.5 min-w-0 text-center leading-tight px-0.5"
             :title="t('game.cricketAvgHint')">
          <span class="line-clamp-2">{{ t('game.cricketAvgShort') }}</span>
        </div>

        <template v-for="player in players" :key="player.id">

          <div class="px-1 py-1.5 rounded-md text-[10px] sm:text-[11px] font-bold truncate flex items-center gap-0.5 min-w-0"
               :class="player.id === currentPlayerId
                 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                 : 'bg-[#162540] text-slate-200 border border-[#1e3050]'">
            <span class="truncate min-w-0">{{ player.name }}</span>
            <span v-if="player.cricket?.all_closed"
                  class="inline-flex items-center justify-center w-5 h-5 text-emerald-400 flex-shrink-0">
              <CricketClosedCheck :boosted="false" />
            </span>
          </div>

          <div v-for="seg in segments" :key="player.id+'-'+seg"
               :title="hitTitle(player.cricket?.[segKey(seg)])"
               class="flex items-center justify-center rounded-md font-mono text-sm sm:text-base font-black leading-none py-1 min-h-[34px] sm:min-h-[40px] min-w-0 transition"
               :class="cellClass(player.cricket?.[segKey(seg)], seg)">
            <span class="truncate tabular-nums inline-flex items-center justify-center min-w-0 w-full">
              <CricketClosedCheck v-if="(player.cricket?.[segKey(seg)] ?? 0) >= 3" :boosted="true" />
              <template v-else>{{ digitHits(player.cricket?.[segKey(seg)]) }}</template>
            </span>
          </div>

          <div class="flex items-center justify-center py-1 min-w-0 rounded-md text-[11px] sm:text-sm font-black border border-[#1e3050] tabular-nums overflow-hidden"
               :class="player.id === leaderId ? 'text-amber-400 bg-amber-950/20' : 'text-slate-200 bg-[#162540]'">
            {{ player.cricket?.points ?? 0 }}
          </div>

          <div class="flex items-center justify-center py-1 min-w-0 text-sm sm:text-base font-black tabular-nums overflow-hidden px-0.5
                      border border-amber-900/40 bg-amber-950/25 text-amber-100 shadow-[inset_0_1px_0_rgba(251,191,36,.1)]"
               :title="t('game.cricketAvgHint')">
            {{ player.avg_pts != null ? player.avg_pts : '—' }}
          </div>

        </template>
      </div>
    </div>
  </div>
</template>
