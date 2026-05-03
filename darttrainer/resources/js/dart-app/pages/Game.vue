<script setup>
import { ref, computed, watch, onMounted, onUnmounted, reactive, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useBodyShellClass } from '../composables/useBodyShellClass.js';
import { useGameScreenLayout } from '../composables/useGameScreenLayout.js';
import { useAuthStore, useLocaleStore, useGameStore } from '../store/index.js';
import MatchReport from '../components/MatchReport.vue';
import CricketMarkCell from '../components/CricketMarkCell.vue';
import CricketClosedCheck from '../components/CricketClosedCheck.vue';
import CricketGameAdaptiveLayout from '../components/game/CricketGameAdaptiveLayout.vue';
import {
  detectCricketAchievements,
  simulateCricketClosingHits,
  cricketDartMeta,
} from '../composables/useCricketTurnAnalysis.js';

const props = defineProps(['matchId']);

useBodyShellClass('body--game-shell');
const {
  layoutKind,
  layoutLabel,
  layoutWidth,
  layoutHeight,
  layoutAspect,
  syncGameScreenLayout,
} = useGameScreenLayout();
const gameStore = useGameStore();
const auth = useAuthStore();
const locale = useLocaleStore();
const t = (k) => locale.t(k);
const router = useRouter();

const dartInput        = reactive({ darts: [] });
const submitting       = ref(false);
const turnResult       = ref(null);
/** Leg uzvara pēc checkout / cricket win — { winnerName, wonSet, wonLeg, line } */
const legWonCelebration = ref(null);
/** Mača beigas — īss ekrāna aplaus; pēc tam parādās MatchReport */
const matchEndCelebration = ref(null);
let matchEndCelebrationTimer = null;
const activeMultiplier = ref(1);
const showUndoConfirm    = ref(false);
const showAbandonConfirm = ref(false);
/** Kamēr ielādē + lokālajam hostam automātisks resume no pauzes. */
const gameBootPending = ref(true);
const cricketAchievement = ref(null);
const cricketFlash       = ref(null);
let cricketFlashTimer = null;
const nowMs = ref(Date.now());
const turnTimeoutBusy = ref(false);
let turnClockInterval = null;

const state     = computed(() => gameStore.state);
const isMyTurn  = computed(() => gameStore.isMyTurn);
const isMatchActive = computed(() => gameStore.isMatchActive);
const isSuspended = computed(() => gameStore.isSuspended);
const waitingForTurnUi = computed(() => isMatchActive.value && !isMyTurn.value);
const legsConfigTotal = computed(() => Math.max(1, Number(state.value?.legs_config?.legs) || 1));
const setsConfigTotal = computed(() => Math.max(1, Number(state.value?.legs_config?.sets) || 1));
const undoAvailable = computed(() => gameStore.undoAvailable);
const isX01     = computed(() => gameStore.gameType === 'x01');
const isCricket = computed(() => gameStore.gameType === 'cricket');
const players   = computed(() => gameStore.players);
const finished  = computed(() => gameStore.isFinished);
const legsToWin = computed(() => Math.ceil((state.value?.legs_config?.legs ?? 1) / 2));

const turnTimer = computed(() => state.value?.turn_timer ?? null);
const useTurnTimer = computed(() => !!state.value?.use_turn_timer);
const hasTurnTimer = computed(() => {
  const tt = turnTimer.value;
  return !!(tt?.deadline_at || tt?.pending);
});

const turnTimerRemainingSec = computed(() => {
  const tt = turnTimer.value;
  if (!tt?.deadline_at) return 0;
  const end = new Date(tt.deadline_at).getTime();
  return Math.max(0, Math.ceil((end - nowMs.value) / 1000));
});

const turnTimerProgress = computed(() => {
  const tt = turnTimer.value;
  if (!tt?.deadline_at || tt.pending) return 0;
  const w = Math.max(1, tt.window_seconds || 300);
  const rem = turnTimerRemainingSec.value;
  return Math.min(100, Math.max(0, (rem / w) * 100));
});

const turnTimerRowVisible = computed(() => {
  if (!hasTurnTimer.value || !isMatchActive.value) return false;
  const tt = turnTimer.value;
  return !!(tt?.deadline_at && !tt.pending);
});

const showTurnTimeoutWaitingBanner = computed(() => {
  if (!hasTurnTimer.value || !isMatchActive.value || !turnTimer.value?.pending) return false;
  const uid = auth.user?.id;
  const cpu = state.value?.current_player?.user_id;
  if (uid == null || cpu == null) return false;
  return Number(cpu) === Number(uid);
});

const showTurnTimeoutOpponentModal = computed(() => {
  if (!hasTurnTimer.value || !isMatchActive.value || !turnTimer.value?.pending) return false;
  const uid = auth.user?.id;
  const cpu = state.value?.current_player?.user_id;
  if (uid == null || cpu == null) return false;
  return Number(cpu) !== Number(uid);
});



function formatTurnClock(sec) {
  const s = Math.max(0, Number(sec) || 0);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m + ':' + String(r).padStart(2, '0');
}

async function onTurnTimeoutGrantExtra() {
  if (turnTimeoutBusy.value) return;
  turnTimeoutBusy.value = true;
  try {
    await gameStore.turnTimeoutGrantExtra();
  } catch (e) {
    const msg = e.response?.data?.error || e.response?.data?.message || 'Kļūda.';
    window._dartToast?.(msg, 'error');
  } finally {
    turnTimeoutBusy.value = false;
  }
}

async function onTurnTimeoutEndNoStats() {
  if (turnTimeoutBusy.value) return;
  turnTimeoutBusy.value = true;
  try {
    await gameStore.turnTimeoutEndNoStats();
  } catch (e) {
    const msg = e.response?.data?.error || e.response?.data?.message || 'Kļūda.';
    window._dartToast?.(msg, 'error');
  } finally {
    turnTimeoutBusy.value = false;
  }
}

const cricketActiveSegs = computed(() => {
  const segs = state.value?.cricket_segments;
  const raw = Array.isArray(segs) && segs.length ? segs : [20, 19, 18, 17, 16, 15, 25];
  return raw.map(s => Number(s));
});

// ── Cricket helpers ───────────────────────────────────────────────────────

function hitsFor(playerId, seg) {
  if (playerId === undefined || playerId === null) return 0;
  const pid = Number(playerId);
  const player = players.value.find(p => Number(p.id) === pid);
  const c = player?.cricket;
  if (!c) return 0;
  const s = Number(seg);
  return s === 25 ? (c.seg_bull ?? 0) : (c['seg_' + s] ?? 0);
}

function myHitsFor(seg) {
  return hitsFor(state.value?.current_player?.id, seg);
}

function segClosedByAll(seg) {
  const s = Number(seg);
  return players.value.length > 0 && players.value.every(p => hitsFor(p.id, s) >= 3);
}

const scorecardColumnTemplate = computed(() => {
  const n = players.value.length;
  const left  = Math.ceil(n / 2);
  const right = Math.floor(n / 2);
  return [...Array(left).fill('1fr'), 'minmax(3.25rem, 5vw)', ...Array(right).fill('1fr')].join(' ');
});

const scorecardGridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: scorecardColumnTemplate.value,
  alignItems: 'center',
}));

const scorecardRowGridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: scorecardColumnTemplate.value,
  alignItems: 'stretch',
  minHeight: 0,
}));

const leftPlayers  = computed(() => players.value.slice(0, Math.ceil(players.value.length / 2)));
const rightPlayers = computed(() => players.value.slice(Math.ceil(players.value.length / 2)));

function sortCricketSegmentsNumeric(activeList) {
  const raw = (activeList || []).map(Number);
  const set = new Set(raw);
  const standard = [...set].filter(s => s >= 1 && s <= 20).sort((a, b) => a - b);
  const other = [...set].filter(s => (s < 1 || s > 20) && s !== 25).sort((a, b) => a - b);
  const out = [...standard, ...other];
  if (set.has(25)) out.push(25);
  return out;
}

const cricketSdtSegments = computed(() => sortCricketSegmentsNumeric(cricketActiveSegs.value));

const cricketSdtNonBull = computed(() => cricketSdtSegments.value.filter(s => s !== 25));
const cricketSdtHasBull = computed(() => cricketSdtSegments.value.includes(25));
const cricketPadSplit = computed(() => {
  const segs = cricketSdtNonBull.value;
  const mid = Math.ceil(segs.length / 2);
  return { left: segs.slice(0, mid), right: segs.slice(mid) };
});

// ── X01 helpers ───────────────────────────────────────────────────────────

function addX01Dart(seg, mul) {
  if (dartInput.darts.length >= 3) return;
  dartInput.darts.push({ segment: seg, multiplier: mul });
}

function addX01Miss() {
  if (dartInput.darts.length >= 3) return;
  dartInput.darts.push({ segment: 0, multiplier: 0 });
}

function addCricketDart(seg, mul) {
  if (dartInput.darts.length >= 3) return;
  const throwerId = state.value?.current_player?.id;
  const activeSegs = (state.value?.cricket_segments ?? [20, 19, 18, 17, 16, 15, 25]).map(Number);
  const snapshotPlayers = [...players.value];
  const { H, playerIds, segs, tid } = simulateCricketClosingHits(snapshotPlayers, activeSegs, throwerId, dartInput.darts);
  const meta = cricketDartMeta({
    hits: H,
    playerIds,
    segs,
    throwerId: tid,
    segment: seg,
    multiplier: mul,
  });

  dartInput.darts.push({
    segment: seg,
    multiplier: mul,
    cricketMeta: meta,
  });
}

function removeDart(i) { dartInput.darts.splice(i, 1); }

function dartLabel(d) {
  if (d.segment === 0) return 'Miss';
  if (d.segment === 25 && d.multiplier === 2) return 'Bull';
  if (d.segment === 25) return 'Outer';
  const pre = d.multiplier === 2 ? 'D' : d.multiplier === 3 ? 'T' : 'S';
  return pre + d.segment;
}

function dartValue(d) { return d.segment === 0 ? 0 : d.segment * d.multiplier; }

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function detectLegAdvanced(prevLeg, prevSet, data) {
  return prevLeg != null && prevSet != null
    && (Number(data.current_leg) !== Number(prevLeg)
      || Number(data.current_set) !== Number(prevSet));
}

function scoreTierFromPoints(pts) {
  if (pts >= 180) return 't180';
  if (pts >= 140) return 't140';
  if (pts >= 100) return 't100';
  if (pts >= 95) return 't95';
  return null;
}

function scoreHeadlineForTier(tier) {
  switch (tier) {
    case 't95': return 'Pīķa zona';
    case 't100': return 'Labi sit!';
    case 't140': return 'Premium gājiens';
    case 't180': return 'TON 80 · EXCELLENT';
    default: return '';
  }
}

function checkoutCopyForRemaining(prevRem) {
  const r = Number(prevRem);
  if (!r || r <= 0) return { coTier: null, title: '', tag: '' };
  if (r <= 20) {
    return {
      coTier: 'co1',
      title: pickRandom(['Aizvērts!', 'Ieejamā!', 'Čau, score!', 'Klusi, bet precīzi']),
      tag: pickRandom(['Kā ar karoti medu.', 'Miers ir miers.', 'Mini finišs, liela sirds.']),
    };
  }
  if (r <= 40) {
    return {
      coTier: 'co2',
      title: pickRandom(['Slēdzam!', 'Aizķēries!', 'Uz mājām!']),
      tag: pickRandom(['Jau redzams gals.', 'Vēl tuvāk kāpām.', 'Pretinieks nervozē.']),
    };
  }
  if (r <= 80) {
    return {
      coTier: 'co3',
      title: pickRandom(['Labs finišs!', 'Turpinām kāpt!', 'Score krīt!']),
      tag: pickRandom(['Šis sāp pretiniekam.', 'Kārtīgs gājiens.', 'Tā turēt!']),
    };
  }
  if (r <= 120) {
    return {
      coTier: 'co4',
      title: pickRandom(['Iespaidīgs checkout!', 'Augstākā līga!', 'Meistarība!']),
      tag: pickRandom(['Tu dari to pareizi.', 'Šķīvis klausa.', 'Tā ir māksla.']),
    };
  }
  if (r <= 169) {
    return {
      coTier: 'co5',
      title: pickRandom(['Augstas raudzes finišs!', 'Reta putna līmenis!', 'Ko tu dari ar šķīvi?!']),
      tag: pickRandom(['Šito rāda atkārtojumā.', 'Kā no grāmatas.', 'Elite.']),
    };
  }
  return {
    coTier: 'coTop',
    title: pickRandom(['LEĢENDĀRS!', '170 klubs!', 'Meistarklase!']),
    tag: pickRandom(['Aplaudi. Tu to nopelnīji.', 'Šādu redz reti.', 'Respekts.']),
  };
}

function turnResultShellClass(tr) {
  const k = tr?.kind;
  const co = tr?.checkoutTitle;
  const coRing = co ? 'ring-2 ring-emerald-500/30 border-emerald-600/45' : '';
  if (k === 'bust') {
    return 'border-rose-500/75 bg-gradient-to-br from-rose-950/98 via-[#1a0a0f]/95 to-slate-900/98 shadow-xl shadow-rose-900/40 ring-1 ring-rose-500/30';
  }
  if (k === 'miss') {
    return 'border-slate-500/70 bg-slate-900/98 shadow-lg shadow-black/40 ring-1 ring-slate-600/30';
  }
  if (k === 'high') {
    const t = tr.highTier;
    if (t === 't95') {
      return `border-amber-700/50 bg-gradient-to-br from-slate-900/98 to-[#0f172a]/98 shadow-md ${coRing}`.trim();
    }
    if (t === 't100') {
      return `border-amber-400/65 bg-gradient-to-br from-amber-950/90 via-[#0f172a]/98 to-slate-900/98 shadow-lg shadow-amber-900/25 ${coRing}`.trim();
    }
    if (t === 't140') {
      return `border-fuchsia-400/55 bg-gradient-to-br from-fuchsia-950/85 via-amber-950/50 to-[#0a1120]/98 shadow-xl shadow-fuchsia-900/30 ${coRing}`.trim();
    }
    if (t === 't180') {
      return `border-yellow-300/70 bg-gradient-to-br from-yellow-950/90 via-amber-900/60 to-slate-950/98 shadow-2xl shadow-amber-500/35 ${coRing}`.trim();
    }
  }
  if (co) {
    return 'border-emerald-500/55 bg-gradient-to-br from-emerald-950/90 via-[#0f172a]/98 to-slate-900/98 shadow-xl shadow-emerald-900/25';
  }
  return 'border-slate-600 bg-slate-800/95';
}

function turnResultMotionClass(tr) {
  const parts = [];
  const k = tr?.kind;
  if (k === 'bust') parts.push('dt-x01-toast-bust');
  else if (k === 'miss') parts.push('dt-x01-toast-miss');
  else if (k === 'high') {
    if (tr.highTier === 't95') parts.push('dt-x01-tier-95');
    else if (tr.highTier === 't100') parts.push('dt-x01-tier-100');
    else if (tr.highTier === 't140') parts.push('dt-x01-tier-140');
    else if (tr.highTier === 't180') parts.push('dt-x01-tier-180');
  }
  if (tr.checkoutTitle) parts.push('dt-x01-co-pop');
  return parts.join(' ');
}

function turnResultTopBannerClass(tr) {
  if (tr.kind === 'bust') return 'text-rose-300';
  if (tr.kind === 'miss') return 'text-slate-400';
  if (tr.highTier === 't95') return 'text-amber-200/90 text-[11px] sm:text-xs font-black tracking-[0.18em]';
  if (tr.highTier === 't100') return 'text-amber-200 text-xs sm:text-sm font-black tracking-wide';
  if (tr.highTier === 't140') return 'text-fuchsia-200 text-sm sm:text-base font-black tracking-tight';
  if (tr.highTier === 't180') {
    return 'text-yellow-200 text-base sm:text-lg font-black drop-shadow-[0_0_14px_rgba(250,204,21,0.4)]';
  }
  if (tr.checkoutTitle && tr.kind === 'normal') return 'text-emerald-300 text-xs sm:text-sm font-black';
  return 'text-slate-200 text-xs font-bold';
}

const LEG_WIN_LINES = [
  'Legs iekārtots!',
  'Šajā legā — tu!',
  'Kāpes augšā!',
  'Punkts pievienots!',
  'Uzvaras aplis!',
];

function queueLegWinCelebration({ winnerName, wonSet, wonLeg }, delayMs) {
  setTimeout(() => {
    legWonCelebration.value = {
      winnerName,
      wonSet,
      wonLeg,
      line: pickRandom(LEG_WIN_LINES),
    };
    setTimeout(() => { legWonCelebration.value = null; }, 5000);
  }, delayMs);
}

function showX01TurnFeedback(thrown, { throwerId, prevLeg, prevSet, prevRemaining, data }) {
  const pts = thrown.reduce((s, d) => s + dartValue(d), 0);
  const labels = thrown.map(dartLabel);
  const legAdvanced = detectLegAdvanced(prevLeg, prevSet, data);
  const nextPlayers = data.players || [];
  const p = throwerId != null ? nextPlayers.find((x) => Number(x.id) === Number(throwerId)) : null;
  const newRem = p?.remaining;

  let kind = 'normal';
  if (pts === 0) {
    kind = 'miss';
  } else if (!legAdvanced && prevRemaining != null && newRem != null
      && Number(prevRemaining) === Number(newRem)) {
    kind = 'bust';
  } else {
    const st = scoreTierFromPoints(pts);
    if (st) {
      kind = 'high';
    }
  }

  const isCheckout = legAdvanced && pts > 0 && prevRemaining != null
    && Number(prevRemaining) === Number(pts);
  const co = isCheckout ? checkoutCopyForRemaining(prevRemaining) : { title: '', tag: '', coTier: null };

  const highTier = kind === 'high' ? scoreTierFromPoints(pts) : null;
  const scoreHeadline = highTier ? scoreHeadlineForTier(highTier) : '';

  let topBanner = '';
  if (kind === 'bust') topBanner = 'BUST';
  else if (kind === 'miss') topBanner = '';
  else if (scoreHeadline) topBanner = scoreHeadline;
  else if (co.title) topBanner = co.title;

  const checkoutDetail = (isCheckout && scoreHeadline && co.title)
    ? { title: co.title, tag: co.tag }
    : null;
  const checkoutFooter = (isCheckout && !scoreHeadline && co.tag) ? co.tag : null;

  let durationMs = 2800;
  if (kind === 'miss' || kind === 'bust') durationMs = 3500;
  if (kind === 'high') {
    if (highTier === 't95') durationMs = 3100;
    else if (highTier === 't100') durationMs = 3900;
    else if (highTier === 't140') durationMs = 4400;
    else if (highTier === 't180') durationMs = 5400;
  }
  if (co.title) durationMs = Math.max(durationMs, 4000);

  turnResult.value = {
    labels,
    pts,
    kind,
    highTier,
    checkoutTitle: (isCheckout && co.title) ? co.title : null,
    topBanner,
    bannerIsCompact: kind === 'bust' || kind === 'miss',
    checkoutDetail,
    checkoutFooter,
  };
  setTimeout(() => { turnResult.value = null; }, durationMs);

  const matchFinishedNow = data.status === 'finished';
  const isLegWin = (legAdvanced || matchFinishedNow) && pts > 0 && kind !== 'bust' && kind !== 'miss';
  if (isLegWin && throwerId && !matchFinishedNow) {
    const winner = nextPlayers.find((x) => Number(x.id) === Number(throwerId));
    queueLegWinCelebration(
      {
        winnerName: winner?.name || '—',
        wonSet: prevSet,
        wonLeg: prevLeg,
      },
      durationMs + 220,
    );
  }
}

watch(
  () => [state.value?.current_set, state.value?.current_leg],
  () => {
    dartInput.darts = [];
  },
);

async function submitThrow() {
  if (dartInput.darts.length === 0) return;
  submitting.value = true;
  const thrown = [...dartInput.darts];
  const snapshotPlayers = [...players.value];
  const throwerId = state.value?.current_player?.id;
  const prevLeg = state.value?.current_leg;
  const prevSet = state.value?.current_set;
  const prevRemaining = throwerId != null
    ? players.value.find((p) => Number(p.id) === Number(throwerId))?.remaining
    : null;
  try {
    const data = await gameStore.submitThrow(thrown);
    const legAdv = detectLegAdvanced(prevLeg, prevSet, data);
    if (!isCricket.value) {
      showX01TurnFeedback(thrown, {
        throwerId, prevLeg, prevSet, prevRemaining, data,
      });
    } else {
      const activeSegs = (state.value?.cricket_segments ?? [20, 19, 18, 17, 16, 15, 25]).map(Number);
      const ach = throwerId != null
        ? detectCricketAchievements(thrown, activeSegs, snapshotPlayers, throwerId)
        : null;
      if (ach) {
        cricketAchievement.value = ach;
        // Screen flash for impactful tiers
        if (ach.fullScreen || ach.shake) {
          if (cricketFlashTimer) clearTimeout(cricketFlashTimer);
          cricketFlash.value = { color: ach.glow };
          cricketFlashTimer = setTimeout(() => {
            cricketFlash.value = null;
            cricketFlashTimer = null;
          }, 550);
        }
        // Haptic feedback on mobile
        if (ach.shake && typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(
            ach.tier === 'holyGrail'  ? [120, 60, 120, 60, 200] :
            ach.tier === 'insaneMark' ? [80, 40, 80, 40, 120]   :
                                        [60, 40, 80]
          );
        }
        setTimeout(() => { cricketAchievement.value = null; }, ach.duration);
      }
      if (legAdv && data.status !== 'finished' && throwerId) {
        const winner = (data.players || []).find((p) => Number(p.id) === Number(throwerId));
        queueLegWinCelebration({
          winnerName: winner?.name || '—',
          wonSet: prevSet,
          wonLeg: prevLeg,
        }, ach ? 2950 : 450);
      }
    }
    if (data.status === 'finished') {
      const w = data.winner;
      const name = w?.name
        || (data.players || []).find((p) => Number(p.id) === Number(w?.id))?.name
        || '—';
      if (matchEndCelebrationTimer) {
        clearTimeout(matchEndCelebrationTimer);
        matchEndCelebrationTimer = null;
      }
      matchEndCelebration.value = { winnerName: name };
      matchEndCelebrationTimer = setTimeout(() => {
        matchEndCelebration.value = null;
        matchEndCelebrationTimer = null;
      }, 5000);
    }
    dartInput.darts = [];
  } finally { submitting.value = false; }
}

async function undo() {
  if (dartInput.darts.length > 0) {
    dartInput.darts.pop();
  } else {
    showUndoConfirm.value = true;
  }
}

async function confirmUndo() {
  showUndoConfirm.value = false;
  if (!undoAvailable.value) return;
  const ok = await gameStore.undo();
  dartInput.darts = [];
  if (!ok) {
    window._dartToast?.('Neizdevās atsaukt gājienu.', 'error');
  }
}

function goAbandonFromUndoDialog() {
  showUndoConfirm.value = false;
  showAbandonConfirm.value = true;
}

async function confirmAbandon() {
  showAbandonConfirm.value = false;
  try {
    const data = await gameStore.abandonMatch();
    if (data?.message) {
      window._dartToast?.(data.message, 'info');
    }
    router.push('/');
  } catch (e) {
    // Ja mačs jau ir pazudis (404), pārejam uz sākumu bez kļūdas.
    if (e?.response?.status === 404) {
      router.push('/');
      return;
    }
    const msg = e.response?.data?.message || e.response?.data?.error || 'Neizdevās pārtraukt spēli.';
    window._dartToast?.(msg, 'error');
  }
}

async function maybeAutoResumeSuspendedLocal() {
  const s = gameStore.state;
  if (!s || s.status !== 'suspended' || s.play_mode !== 'local') return;
  if (!auth.user || Number(s.host_user_id) !== Number(auth.user.id)) return;
  try {
    await gameStore.resumeMatch();
  } catch (e) {
    const msg = e.response?.data?.error || e.response?.data?.message || t('common.error');
    window._dartToast?.(msg, 'error');
    router.push('/');
  }
}

/** Aizvērt skatu, saglabājot spēli (lokāli: pauze; tiešsaistē: paliek telpā). Novirza uz sākumlapu. */
async function exitGameSaving() {
  const playMode = state.value?.play_mode;
  const hostId = state.value?.host_user_id;
  const uid = auth.user?.id;
  const isLocalHost = playMode === 'local' && uid != null && Number(hostId) === Number(uid);

  try {
    if (isLocalHost && gameStore.isMatchActive) {
      await gameStore.suspendLocalMatch();
      window._dartToast?.(t('game.suspendedExitToast'), 'success');
    }
  } catch (e) {
    const msg = e.response?.data?.message || e.response?.data?.error || t('common.error');
    window._dartToast?.(msg, 'error');
    return;
  }
  gameStore.reset();
  router.push('/');
}

function goHome() { gameStore.reset(); router.push('/'); }

function revealAbandonConfirm() {
  showAbandonConfirm.value = true;
}

function onDocKeydown(e) {
  if (showTurnTimeoutOpponentModal.value) return;
  if (!isMyTurn.value || submitting.value) return;
  const el = e.target;
  if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || (el.closest && el.closest('[contenteditable="true"]')))) return;
  if (e.key === 'Enter' && dartInput.darts.length > 0) {
    e.preventDefault();
    submitThrow();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    undo();
  } else if (e.key === 'Backspace' && dartInput.darts.length > 0) {
    e.preventDefault();
    removeDart(dartInput.darts.length - 1);
  }
}

onMounted(async () => {
  gameBootPending.value = true;
  try {
    await gameStore.loadState(props.matchId);
    await maybeAutoResumeSuspendedLocal();
  } finally {
    gameBootPending.value = false;
  }
  nextTick(() => syncGameScreenLayout());
  gameStore.startPolling(1100);
  document.addEventListener('keydown', onDocKeydown);
  turnClockInterval = setInterval(() => { nowMs.value = Date.now(); }, 500);
});

onUnmounted(() => {
  gameStore.stopPolling();
  document.removeEventListener('keydown', onDocKeydown);
  if (turnClockInterval) {
    clearInterval(turnClockInterval);
    turnClockInterval = null;
  }
  if (matchEndCelebrationTimer) {
    clearTimeout(matchEndCelebrationTimer);
    matchEndCelebrationTimer = null;
  }
  if (cricketFlashTimer) {
    clearTimeout(cricketFlashTimer);
    cricketFlashTimer = null;
  }
});

const matchId = computed(() => props.matchId);
</script>

<template>
  <div class="flex h-full min-h-0 flex-1 flex-col w-full min-w-0 overflow-hidden bg-[#060d18] text-slate-200"
       :data-game-layout="state && !gameBootPending && !finished ? layoutKind : null">

    <!-- Turn result toast (X01: punkti / checkout / BUST / Miss) -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="turnResult"
             class="fixed left-1/2 -translate-x-1/2 z-50 pointer-events-none backdrop-blur-sm max-w-[min(100%,24rem)] w-[calc(100%-2rem)]
                    bottom-[30%] sm:bottom-[22%] md:bottom-24">
          <div class="rounded-2xl border px-4 py-2.5 sm:px-5 sm:py-3 shadow-2xl flex flex-col gap-1.5"
               :class="turnResultShellClass(turnResult)">
            <div v-if="turnResult.topBanner"
                 class="font-black leading-tight"
                 :class="[
                   turnResult.bannerIsCompact ? 'uppercase tracking-[0.2em] text-[10px]' : '',
                   turnResultTopBannerClass(turnResult),
                 ]">
              {{ turnResult.topBanner }}
            </div>
            <div v-if="turnResult.checkoutDetail" class="rounded-lg bg-emerald-950/50 border border-emerald-600/35 px-2.5 py-1.5">
              <div class="text-xs font-black text-emerald-200 leading-snug">{{ turnResult.checkoutDetail.title }}</div>
              <div v-if="turnResult.checkoutDetail.tag" class="text-[11px] text-emerald-400/90 leading-snug mt-0.5">
                {{ turnResult.checkoutDetail.tag }}
              </div>
            </div>
            <div v-else-if="turnResult.checkoutFooter" class="text-[11px] text-emerald-400/90 leading-snug">
              {{ turnResult.checkoutFooter }}
            </div>
            <div class="flex items-center gap-2 sm:gap-4" :class="turnResultMotionClass(turnResult)">
              <div class="flex flex-wrap gap-1.5 min-w-0">
                <span v-for="(lbl, i) in turnResult.labels" :key="i"
                      class="font-mono font-black tabular-nums leading-none"
                      :class="turnResult.kind === 'bust' ? 'text-rose-200 text-base sm:text-lg'
                        : turnResult.kind === 'miss' ? 'text-slate-400 text-sm sm:text-base'
                        : turnResult.kind === 'high' && turnResult.highTier === 't180' ? 'text-yellow-200 text-lg sm:text-2xl'
                        : turnResult.kind === 'high' ? 'text-amber-300 text-base sm:text-xl'
                        : 'text-amber-400 text-base sm:text-lg'">
                  {{ lbl }}
                </span>
              </div>
              <div class="border-l border-white/15 pl-2 sm:pl-4 font-black tabular-nums text-base sm:text-xl shrink-0"
                   :class="turnResult.kind === 'bust' ? 'text-rose-400'
                     : turnResult.kind === 'miss' ? 'text-slate-400 text-sm sm:text-base uppercase tracking-widest'
                     : turnResult.kind === 'high' && turnResult.highTier === 't180' ? 'text-yellow-200 text-lg sm:text-2xl'
                     : turnResult.kind === 'high' ? 'text-amber-200'
                     : turnResult.pts > 0 ? 'text-emerald-400' : 'text-slate-500'">
                <template v-if="turnResult.kind === 'miss'">Miss</template>
                <template v-else-if="turnResult.kind === 'bust'">0</template>
                <template v-else>{{ turnResult.pts > 0 ? '+' + turnResult.pts : '0' }}</template>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Leg uzvara -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="legWonCelebration"
             class="fixed left-1/2 z-[55] pointer-events-none w-[min(22rem,92vw)]"
             style="top: 16%; transform: translateX(-50%)">
          <div class="dt-leg-won-enter rounded-2xl border border-amber-500/45 bg-gradient-to-b from-[#2a1f0a]/98 via-[#0f172a]/98 to-[#060d18]/98 px-4 py-4 sm:px-5 sm:py-5 text-center shadow-2xl shadow-amber-900/45 ring-1 ring-amber-400/20">
            <div class="text-[10px] font-black uppercase tracking-[0.28em] text-amber-500/95 mb-1">Leg uzvara</div>
            <div class="text-xl sm:text-2xl font-black text-amber-50 leading-tight">{{ legWonCelebration.winnerName }}</div>
            <div class="text-[11px] text-slate-500 mt-1.5 font-mono tabular-nums">
              Set {{ legWonCelebration.wonSet }} · Leg {{ legWonCelebration.wonLeg }}
            </div>
            <div class="text-sm text-amber-400/95 mt-2 font-semibold leading-snug">{{ legWonCelebration.line }}</div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Mača uzvara — pirms protokola (~5 s) -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="finished && matchEndCelebration"
             class="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-sm px-4 pointer-events-none">
          <div class="pointer-events-none max-w-md w-full text-center rounded-2xl border border-amber-500/40 bg-gradient-to-b from-[#1a1408]/98 to-[#0c1528]/98 px-8 py-10 shadow-2xl shadow-amber-900/30">
            <div class="text-[11px] font-black uppercase tracking-[0.2em] text-amber-500/90 mb-3">{{ t('game.matchVictoryTitle') }}</div>
            <div class="text-3xl sm:text-4xl font-black text-amber-50 leading-tight mb-2">{{ matchEndCelebration.winnerName }}</div>
            <div class="text-sm text-slate-400">{{ t('game.matchVictorySubtitle') }}</div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Cricket achievement: screen flash -->
    <Teleport to="body">
      <Transition name="cricket-flash">
        <div v-if="cricketFlash"
             class="fixed inset-0 pointer-events-none dt-ach-flash"
             style="z-index:44"
             :style="{ background: cricketFlash.color + '28' }"></div>
      </Transition>
    </Teleport>

    <!-- Cricket achievement popup -->
    <Teleport to="body">
      <Transition name="achieve">
        <div v-if="cricketAchievement"
             class="fixed z-[45] pointer-events-none"
             :style="{
               top: '24%',
               left: '50%',
               transform: 'translateX(-50%)',
               width: cricketAchievement.fullScreen ? 'min(28rem,92vw)' : 'min(22rem,90vw)',
             }">

          <!-- Ambient backdrop for epic tiers -->
          <div v-if="cricketAchievement.fullScreen"
               class="fixed inset-0 pointer-events-none"
               style="z-index:-1"
               :style="{ background: 'radial-gradient(ellipse at 50% 28%, ' + cricketAchievement.glow + '1e 0%, transparent 62%)' }"></div>

          <!-- Holy Grail: rotating rays behind card -->
          <div v-if="cricketAchievement.tier === 'holyGrail'"
               class="absolute pointer-events-none"
               style="inset:-300%; overflow:hidden; z-index:-1">
            <div class="dt-ach-rays"></div>
          </div>

          <!-- White Horse: silhouette running across full screen -->
          <div v-if="cricketAchievement.tier === 'whitehorse'"
               class="fixed pointer-events-none dt-ach-horse-run"
               style="top:32%; left:0; z-index:46; font-size:7rem; line-height:1;
                      filter:drop-shadow(0 0 18px rgba(255,255,255,.75)) drop-shadow(0 0 36px rgba(148,163,184,.5))">
            🐴
          </div>

          <!-- Main card -->
          <div class="relative overflow-hidden rounded-2xl shadow-2xl shadow-black/80 dt-ach-card"
               :class="['dt-ach-' + cricketAchievement.tier, cricketAchievement.shake ? 'dt-ach-shake' : '']">

            <!-- Top accent bar -->
            <div class="h-1.5 w-full" :style="{ background: cricketAchievement.glow }"></div>

            <!-- Bull pulsing rings (bulls3 / rodeo) -->
            <div v-if="cricketAchievement.tier === 'bulls3' || cricketAchievement.tier === 'rodeo'"
                 class="absolute inset-0 pointer-events-none overflow-hidden">
              <div class="dt-ach-ring"></div>
              <div class="dt-ach-ring"></div>
              <div class="dt-ach-ring"></div>
            </div>

            <!-- Gold sparkles (insaneMark / holyGrail) -->
            <template v-if="cricketAchievement.tier === 'insaneMark' || cricketAchievement.tier === 'holyGrail'">
              <span class="dt-ach-spark" style="left:10%"></span>
              <span class="dt-ach-spark" style="left:28%;animation-delay:.18s"></span>
              <span class="dt-ach-spark" style="left:50%;animation-delay:.08s"></span>
              <span class="dt-ach-spark" style="left:70%;animation-delay:.28s"></span>
              <span class="dt-ach-spark" style="left:88%;animation-delay:.14s"></span>
            </template>

            <!-- Content -->
            <div class="relative px-6 py-5 flex flex-col items-center text-center gap-1.5">
              <div class="leading-none mb-1 drop-shadow-[0_4px_20px_rgba(0,0,0,0.75)]"
                   :class="cricketAchievement.fullScreen ? 'text-7xl' : 'text-6xl'">
                {{ cricketAchievement.emoji }}
              </div>
              <div class="font-black text-white tracking-tight leading-snug"
                   :class="cricketAchievement.fullScreen ? 'text-2xl' : 'text-xl'">
                {{ cricketAchievement.title }}
              </div>
              <div v-if="cricketAchievement.sub"
                   class="text-sm font-semibold leading-snug"
                   :style="{ color: cricketAchievement.color }">
                {{ cricketAchievement.sub }}
              </div>
            </div>

            <!-- Glow edge overlay -->
            <div class="absolute inset-0 pointer-events-none rounded-2xl"
                 :style="{ boxShadow: '0 0 80px 0 ' + cricketAchievement.glow + '44' }"></div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Undo / nav pēdējā gājiena — Cricket: piedāvāt pārtraukt spēli -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showUndoConfirm"
             class="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                    bg-black/60 backdrop-blur-sm px-4 pb-[env(safe-area-inset-bottom)] sm:pb-4"
             @click.self="showUndoConfirm = false">
          <div class="w-full max-w-sm bg-[#0d1a2e] border border-[#1e3050] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
            <template v-if="undoAvailable">
              <div class="px-6 pt-6 pb-5">
                <div class="w-10 h-10 rounded-full bg-rose-950/60 border border-rose-700/40
                            flex items-center justify-center mb-4">
                  <span class="text-rose-400 text-lg">↩</span>
                </div>
                <h3 class="text-base font-black text-slate-100 mb-1">Atsaukt pēdējo gājienu?</h3>
                <p class="text-slate-400 text-sm leading-relaxed">
                  Iepriekšējais iesniegtais gājiens tiks atcelts un rezultāts atjaunots visiem spēlētājiem.
                </p>
              </div>
              <div class="flex border-t border-[#1e3050]">
                <button type="button" @click="showUndoConfirm = false"
                        class="flex-1 py-4 text-slate-300 font-bold text-sm border-r border-[#1e3050]
                               hover:bg-[#162540] active:bg-[#1e3050] transition touch-manipulation">
                  Aizvērt
                </button>
                <button type="button" @click="confirmUndo"
                        class="flex-1 py-4 text-rose-400 font-black text-sm
                               hover:bg-rose-950/40 active:bg-rose-950/60 transition touch-manipulation">
                  Jā, atsaukt
                </button>
              </div>
            </template>
            <template v-else>
              <div class="px-6 pt-6 pb-5">
                <div class="w-10 h-10 rounded-full bg-slate-700/80 border border-slate-600/50
                            flex items-center justify-center mb-4">
                  <span class="text-slate-300 text-lg">↩</span>
                </div>
                <h3 class="text-base font-black text-slate-100 mb-1">Nav ko atsaukt</h3>
                <p class="text-slate-400 text-sm leading-relaxed">
                  Šajā legā vēl nav iesniegts neviens gājiens, ko varētu atsaukt. Vari pārtraukt visu spēli
                  (abi spēlētāji redzēs pārtraukumu reāllaikā) vai doties prom no skata.
                </p>
              </div>
              <div class="flex flex-col border-t border-[#1e3050]">
                <button type="button" @click="goAbandonFromUndoDialog"
                        class="w-full py-3.5 text-rose-400 font-black text-sm border-b border-[#1e3050]
                               hover:bg-rose-950/30 active:bg-rose-950/50 transition touch-manipulation">
                  Pārtraukt spēli…
                </button>
                <button type="button" @click="showUndoConfirm = false"
                        class="w-full py-3.5 text-slate-300 font-bold text-sm hover:bg-[#162540] transition touch-manipulation">
                  Aizvērt
                </button>
              </div>
            </template>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Pārtraukt spēli (apstiprinājums) -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showAbandonConfirm"
             class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center
                    bg-black/70 backdrop-blur-sm px-4 pb-[env(safe-area-inset-bottom)] sm:pb-4"
             @click.self="showAbandonConfirm = false">
          <div class="w-full max-w-sm bg-[#0d1a2e] border border-rose-900/40 rounded-2xl shadow-2xl overflow-hidden">
            <div class="px-6 pt-6 pb-5">
              <h3 class="text-base font-black text-slate-100 mb-1">
                {{ state?.play_mode === 'local' ? t('game.abandonLocalTitle') : t('game.abandonOnlineTitle') }}
              </h3>
              <p class="text-slate-400 text-sm leading-relaxed">
                {{ state?.play_mode === 'local' ? t('game.abandonLocalBody') : t('game.abandonOnlineBody') }}
              </p>
            </div>
            <div class="flex border-t border-[#1e3050]">
              <button type="button" @click="showAbandonConfirm = false"
                      class="flex-1 py-4 text-slate-300 font-bold text-sm border-r border-[#1e3050]
                             hover:bg-[#162540] transition touch-manipulation">
                Atcelt
              </button>
              <button type="button" @click="confirmAbandon"
                      class="flex-1 py-4 text-rose-400 font-black text-sm
                             hover:bg-rose-950/40 transition touch-manipulation">
                Jā, pārtraukt
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Pretinieka izvēle pēc gājiena taimera -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showTurnTimeoutOpponentModal"
             class="fixed inset-0 z-[70] flex items-end sm:items-center justify-center
                    bg-black/75 backdrop-blur-sm px-4 pb-[env(safe-area-inset-bottom)] sm:pb-4"
             role="dialog" aria-modal="true">
          <div class="w-full max-w-md overflow-hidden rounded-2xl border border-amber-900/40 bg-gradient-to-b from-[#1a1408] to-[#0d1a2e] shadow-2xl shadow-black/60">
            <div class="h-1 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600"></div>
            <div class="px-6 pt-5 pb-4">
              <h3 class="text-lg font-black text-amber-100 tracking-tight mb-2">{{ t('game.turnTimer.opponentTitle') }}</h3>
              <p class="text-sm text-slate-400 leading-relaxed">{{ t('game.turnTimer.opponentBody') }}</p>
            </div>
            <div class="flex flex-col gap-2 border-t border-[#1e3050] px-4 py-4 sm:flex-row sm:items-stretch">
              <button type="button" :disabled="turnTimeoutBusy" @click="onTurnTimeoutEndNoStats"
                      class="flex-1 py-3 rounded-xl border border-rose-900/50 bg-rose-950/40 text-rose-200 font-bold text-sm
                             hover:bg-rose-950/70 transition disabled:opacity-40 touch-manipulation">
                {{ turnTimeoutBusy ? t('game.turnTimer.busy') : t('game.turnTimer.endNoStats') }}
              </button>
              <button type="button" :disabled="turnTimeoutBusy" @click="onTurnTimeoutGrantExtra"
                      class="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-sm
                             transition disabled:opacity-40 shadow-md shadow-amber-950/30 touch-manipulation">
                {{ turnTimeoutBusy ? t('game.turnTimer.busy') : t('game.turnTimer.grantExtra') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Loading (arī kamēr lokālais resume no pauzes) -->
    <div v-if="!state || gameBootPending" class="flex flex-1 min-h-[50vh] items-center justify-center bg-[#060d18]">
      <div class="flex gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-bounce" style="animation-delay:0ms"></span>
        <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-bounce" style="animation-delay:150ms"></span>
        <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-bounce" style="animation-delay:300ms"></span>
      </div>
    </div>

    <template v-else>

      <!-- ══ FINISHED: protokols (ritināms, pilns augstums no shell) ══ -->
      <div v-if="finished" class="relative flex min-h-0 flex-1 flex-col overflow-hidden w-full">
        <MatchReport v-show="!matchEndCelebration" :match-id="matchId" class="min-h-0 flex-1" @home="goHome" />
      </div>

      <!-- ════════════════ CRICKET ════════════════ -->
      <div v-else-if="isCricket" class="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CricketGameAdaptiveLayout
          :layout-kind="layoutKind"
          :layout-width="layoutWidth"
          :layout-height="layoutHeight"
          :state="state"
          :players="players"
          :left-players="leftPlayers"
          :right-players="rightPlayers"
          :cricket-sdt-segments="cricketSdtSegments"
          :cricket-sdt-non-bull="cricketSdtNonBull"
          :cricket-sdt-has-bull="cricketSdtHasBull"
          :cricket-pad-split="cricketPadSplit"
          :legs-config-total="legsConfigTotal"
          :sets-config-total="setsConfigTotal"
          :legs-to-win="legsToWin"
          :is-match-active="isMatchActive"
          :is-suspended="isSuspended"
          :auth="auth"
          :dart-input="dartInput"
          :submitting="submitting"
          :waiting-for-turn-ui="waitingForTurnUi"
          :show-turn-timeout-waiting-banner="showTurnTimeoutWaitingBanner"
          :turn-timer-row-visible="turnTimerRowVisible"
          :turn-timer-progress="turnTimerProgress"
          :turn-timer-remaining-sec="turnTimerRemainingSec"
          :scorecard-grid-style="scorecardGridStyle"
          :scorecard-row-grid-style="scorecardRowGridStyle"
          :hits-for="hitsFor"
          :seg-closed-by-all="segClosedByAll"
          :my-hits-for="myHitsFor"
          :dart-label="dartLabel"
          :dart-value="dartValue"
          :format-turn-clock="formatTurnClock"
          :add-cricket-dart="addCricketDart"
          :remove-dart="removeDart"
          :submit-throw="submitThrow"
          :undo="undo"
          :exit-game-saving="exitGameSaving"
          :on-show-abandon="revealAbandonConfirm"
        />
      </div>

      <!-- ════════════════ X01 ════════════════ -->
      <div v-else class="flex-1 min-h-0 overflow-y-auto overscroll-y-contain bg-[#060d18] flex flex-col pb-[env(safe-area-inset-bottom)]">
        <div class="flex-1 min-h-0 max-w-5xl mx-auto w-full px-2 sm:px-4 py-2 sm:py-6 pb-4 sm:pb-10 flex flex-col min-h-0">
        <div class="shrink-0 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 mb-2 sm:mb-4 pb-2 sm:pb-3 border-b border-[#162540]">
          <div class="text-[11px] sm:text-sm text-slate-500 min-w-0 leading-snug">
            <span class="text-amber-400 font-mono font-black">{{ state.room_code }}</span>
            <span class="mx-1 sm:mx-2 text-slate-700">·</span>
            Leg {{ state.current_leg }}/{{ legsConfigTotal }}<template v-if="setsConfigTotal > 1"> · Set {{ state.current_set }}/{{ setsConfigTotal }}</template>
          </div>
          <div v-if="(isMatchActive || isSuspended) && auth.user" class="flex gap-1 sm:gap-2 flex-shrink-0">
            <button type="button" @click="exitGameSaving"
                    class="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold border border-slate-600/60 text-slate-400 hover:bg-[#162540] transition touch-manipulation">
              {{ t('game.exitSave') }}
            </button>
            <button v-if="isMatchActive" type="button" @click="showAbandonConfirm = true"
                    class="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black border border-rose-800/50 text-rose-400 hover:bg-rose-950/30 transition touch-manipulation">
              Pārtraukt
            </button>
          </div>
        </div>

        <div v-if="isMatchActive && showTurnTimeoutWaitingBanner"
             class="shrink-0 -mx-0 px-2 sm:px-3 py-2 sm:py-2.5 mb-2 sm:mb-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-center text-[11px] sm:text-xs font-semibold text-amber-100 leading-snug">
          {{ t('game.turnTimer.waitingOpponentChoice') }}
        </div>
        <div v-else-if="turnTimerRowVisible"
             class="shrink-0 flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 px-0.5 sm:px-1">
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-500 shrink-0 hidden sm:inline">{{ t('game.turnTimer.label') }}</span>
          <div class="flex-1 min-w-0 h-1.5 sm:h-2 rounded-full bg-[#1e3050] overflow-hidden ring-1 ring-black/20">
            <div class="h-full rounded-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-300 transition-[width] duration-500 ease-linear"
                 :style="{ width: turnTimerProgress + '%' }"></div>
          </div>
          <span class="text-xs sm:text-sm font-mono font-black tabular-nums text-amber-400 w-[4rem] sm:w-[4.75rem] text-right shrink-0">{{ formatTurnClock(turnTimerRemainingSec) }}</span>
        </div>

        <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 min-h-0">

          <div class="lg:col-span-2 min-h-0 overflow-y-auto flex flex-col gap-2 sm:gap-4 order-2 lg:order-1">

            <div v-for="player in players" :key="player.id"
                 class="border-2 rounded-lg sm:rounded-xl p-2.5 sm:p-4 transition-all duration-300 shrink-0"
                 :class="Number(player.id) === Number(state.current_player?.id)
                   ? 'border-amber-500/40 bg-[#0f1c30] shadow-md shadow-black/10'
                   : 'border-[#162540] bg-[#0a1120]/80'">
              <div class="flex justify-between items-start gap-3">
                <div class="min-w-0">
                  <div class="flex items-center gap-1.5 mb-1">
                    <span class="font-black text-base leading-none"
                          :class="Number(player.id) === Number(state.current_player?.id) ? 'text-amber-400' : 'text-slate-100'">
                      {{ player.name }}
                    </span>
                    <span v-if="Number(player.id) === Number(state.current_player?.id)"
                          class="text-xs bg-amber-500 text-black px-2 py-0.5 rounded-full font-black">
                      Kārta
                    </span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <div v-for="i in legsToWin" :key="i"
                         class="w-3 h-3 rounded-full border-2 transition-colors"
                         :class="i <= player.legs_won ? 'bg-amber-400 border-amber-400' : 'border-slate-700'"></div>
                    <span v-if="state.legs_config?.sets > 1"
                          class="text-xs text-slate-600 ml-1">S{{ player.sets_won }}</span>
                  </div>
                </div>
                <div class="text-right flex-shrink-0">
                  <div class="text-2xl sm:text-4xl font-black text-white tabular-nums leading-none">{{ player.remaining }}</div>
                  <div v-if="player.checkout?.length" class="text-[10px] sm:text-xs text-emerald-400 mt-0.5 font-mono leading-tight">
                    {{ player.checkout.join(' → ') }}
                  </div>
                  <div class="mt-1 sm:mt-1.5 pt-1 border-t border-slate-700/80">
                    <div class="text-[9px] font-black uppercase tracking-wide text-sky-400/90 leading-none mb-0.5">{{ t('stats.avg3') }}</div>
                    <div class="text-base sm:text-lg font-black tabular-nums text-sky-100 leading-none">{{ player.avg ?? '—' }}</div>
                  </div>
                </div>
              </div>
              <div v-if="player.visits_this_leg?.length" class="mt-2 sm:mt-3 pt-2 border-t border-[#162540]/80">
                <div class="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Šīs leg gājieni</div>
                <div class="flex flex-wrap gap-0.5 sm:gap-1">
                  <span v-for="(v, vi) in player.visits_this_leg" :key="vi"
                        class="text-[10px] sm:text-[11px] font-mono font-bold tabular-nums px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg border"
                        :class="v.bust ? 'border-rose-500/50 bg-rose-950/40 text-rose-200' : 'border-slate-600/60 bg-[#060d18] text-slate-300'">
                    {{ v.bust ? 'BUST' : v.pts }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Input panel -->
          <div class="min-h-0 overflow-y-auto flex flex-col lg:sticky lg:top-2 lg:self-start bg-[#0f1c30] border border-[#162540] rounded-lg sm:rounded-xl p-2 sm:p-4 order-1 lg:order-2
                      shadow-[inset_0_1px_0_rgba(255,255,255,.05)] max-lg:max-h-[min(52vh,28rem)]">

            <div v-if="waitingForTurnUi" class="text-center py-6 sm:py-8 shrink-0">
              <div class="text-slate-600 text-xs mb-2 uppercase tracking-widest">Gaida</div>
              <div class="text-white font-black text-lg">{{ state.current_player?.name }}</div>
              <div class="flex justify-center gap-1.5 mt-4">
                <span class="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style="animation-delay:0ms"></span>
                <span class="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style="animation-delay:150ms"></span>
                <span class="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style="animation-delay:300ms"></span>
              </div>
            </div>

            <template v-else>
              <!-- Dart slots -->
              <div class="flex gap-1.5 sm:gap-2 mb-2 sm:mb-3 shrink-0">
                <div v-for="(d, i) in dartInput.darts" :key="i"
                     class="flex-1 bg-[#0a1120] border border-[#162540] rounded-lg sm:rounded-xl py-1.5 sm:py-2 text-center relative group min-w-0 touch-manipulation">
                  <div class="text-amber-400 font-mono font-black text-sm sm:text-base truncate px-1">{{ dartLabel(d) }}</div>
                  <div class="text-slate-500 text-[10px] sm:text-xs tabular-nums">{{ dartValue(d) > 0 ? dartValue(d) : '—' }}</div>
                  <button type="button" @click="removeDart(i)"
                          class="absolute -top-1 -right-1 w-6 h-6 bg-red-700 hover:bg-red-600 text-white rounded-full text-[10px]
                                 flex items-center justify-center shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">✕</button>
                </div>
                <div v-for="i in (3 - dartInput.darts.length)" :key="'xe'+i"
                     class="flex-1 min-h-[2.65rem] sm:min-h-[3rem] bg-[#060d18]/80 border border-dashed border-[#1e3050]
                            rounded-lg sm:rounded-xl flex items-center justify-center text-[#1e3050] text-[10px] sm:text-xs font-mono">—</div>
              </div>

              <!-- Multiplier toggle -->
              <div class="flex gap-1 sm:gap-1.5 mb-2 sm:mb-3 shrink-0">
                <button v-for="m in [1, 2, 3]" :key="m" type="button"
                        @click="activeMultiplier = m"
                        class="flex-1 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm transition active:scale-[0.97] touch-manipulation border"
                        :class="activeMultiplier === m
                          ? m === 1 ? 'bg-slate-600 border-slate-400/50 text-white shadow-inner'
                          : m === 2 ? 'bg-sky-700 border-sky-400/50 text-sky-50 shadow-inner'
                          : 'bg-amber-600 border-amber-400/50 text-amber-50 shadow-inner'
                          : 'bg-[#0a1120] border-[#1e3050] text-slate-500 hover:text-slate-300'">
                  {{ m }}×
                </button>
              </div>

              <!-- Number grid 1–20 (Miss pogas stils) -->
              <div class="grid grid-cols-5 gap-0.5 sm:gap-1 mb-1.5 sm:mb-2 shrink-0">
                <button v-for="n in 20" :key="n" type="button"
                        @click="addX01Dart(n, activeMultiplier)"
                        :disabled="dartInput.darts.length >= 3"
                        class="py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm tabular-nums transition active:scale-[0.96] touch-manipulation
                               border border-rose-900/40 bg-[#1a0a0f] text-rose-300/90 hover:bg-[#2a1218]
                               disabled:opacity-30">
                  {{ n }}
                </button>
              </div>

              <!-- Bull / Outer / Miss -->
              <div class="flex gap-1 sm:gap-1.5 mb-2 sm:mb-3 shrink-0">
                <button type="button" @click="addX01Dart(25, 1)"
                        :disabled="dartInput.darts.length >= 3"
                        class="flex-1 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs border border-emerald-700/45 bg-emerald-950/75
                               text-emerald-200 hover:bg-emerald-900/55 transition active:scale-[0.97] touch-manipulation disabled:opacity-30">
                  Outer
                </button>
                <button type="button" @click="addX01Dart(25, 2)"
                        :disabled="dartInput.darts.length >= 3"
                        class="flex-1 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs border border-red-800/50 bg-red-950/85
                               text-red-100 hover:bg-red-900/55 transition active:scale-[0.97] touch-manipulation disabled:opacity-30">
                  Bull
                </button>
                <button type="button" @click="addX01Miss"
                        :disabled="dartInput.darts.length >= 3"
                        class="flex-1 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs border border-rose-900/40 bg-[#1a0a0f]
                               text-rose-300/90 hover:bg-[#2a1218] transition active:scale-[0.97] touch-manipulation disabled:opacity-30">
                  Miss
                </button>
              </div>

              <!-- Submit / Undo -->
              <div class="flex gap-1.5 sm:gap-2 shrink-0">
                <button type="button" @click="undo"
                        class="flex-1 py-2.5 sm:py-3 bg-[#162540] hover:bg-[#1e3050] text-slate-200 rounded-lg sm:rounded-xl
                               font-bold transition text-xs sm:text-sm active:scale-[0.97] border border-[#1e3050] touch-manipulation">
                  ↩ Atsaukt
                </button>
                <button type="button" @click="submitThrow"
                        :disabled="submitting || dartInput.darts.length === 0"
                        class="flex-1 py-2.5 sm:py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-lg sm:rounded-xl
                               font-black transition disabled:opacity-40 text-xs sm:text-sm
                               active:scale-[0.97] shadow-md shadow-amber-950/30 touch-manipulation">
                  {{ submitting ? '...' : 'Iesniegt →' }}
                </button>
              </div>
            </template>
          </div>

        </div>
        </div>
      </div>

    </template>
  </div>
</template>
