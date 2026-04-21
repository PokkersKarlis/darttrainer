import * as Vue from 'vue';
import { useRouter } from 'vue-router';
import { useBodyShellClass } from '../composables/useBodyShellClass.js';
import { useAuthStore, useLocaleStore, useGameStore } from '../store/index.js';
import MatchReport from '../components/MatchReport.js';
import CricketMarkCell from '../components/CricketMarkCell.js';
import CricketClosedCheck from '../components/CricketClosedCheck.js';

export default {
  props: ['matchId'],
  components: { MatchReport, CricketMarkCell, CricketClosedCheck },

  setup(props) {
    useBodyShellClass('body--game-shell');
    const gameStore = useGameStore();
    const auth = useAuthStore();
    const locale = useLocaleStore();
    const t = (k) => locale.t(k);
    const router = useRouter();

    const dartInput        = Vue.reactive({ darts: [] });
    const submitting       = Vue.ref(false);
    const turnResult       = Vue.ref(null);
    /** Leg uzvara pēc checkout / cricket win — { winnerName, wonSet, wonLeg, line } */
    const legWonCelebration = Vue.ref(null);
    const activeMultiplier = Vue.ref(1);
    const showUndoConfirm    = Vue.ref(false);
    const showAbandonConfirm = Vue.ref(false);
    /** Kamēr ielādē + lokālajam hostam automātisks resume no pauzes. */
    const gameBootPending = Vue.ref(true);
    const cricketAchievement = Vue.ref(null);
    const nowMs = Vue.ref(Date.now());
    const turnTimeoutBusy = Vue.ref(false);
    let turnClockInterval = null;

    const state     = Vue.computed(() => gameStore.state);
    const isMyTurn  = Vue.computed(() => gameStore.isMyTurn);
    const isMatchActive = Vue.computed(() => gameStore.isMatchActive);
    const isSuspended = Vue.computed(() => gameStore.isSuspended);
    const waitingForTurnUi = Vue.computed(() => isMatchActive.value && !isMyTurn.value);
    const legsConfigTotal = Vue.computed(() => Math.max(1, Number(state.value?.legs_config?.legs) || 1));
    const setsConfigTotal = Vue.computed(() => Math.max(1, Number(state.value?.legs_config?.sets) || 1));
    const undoAvailable = Vue.computed(() => gameStore.undoAvailable);
    const isX01     = Vue.computed(() => gameStore.gameType === 'x01');
    const isCricket = Vue.computed(() => gameStore.gameType === 'cricket');
    const players   = Vue.computed(() => gameStore.players);
    const finished  = Vue.computed(() => gameStore.isFinished);
    const legsToWin = Vue.computed(() => Math.ceil((state.value?.legs_config?.legs ?? 1) / 2));

    const turnTimer = Vue.computed(() => state.value?.turn_timer ?? null);
    const useTurnTimer = Vue.computed(() => !!state.value?.use_turn_timer);

    const turnTimerRemainingSec = Vue.computed(() => {
      const tt = turnTimer.value;
      if (!tt?.deadline_at) return 0;
      const end = new Date(tt.deadline_at).getTime();
      return Math.max(0, Math.ceil((end - nowMs.value) / 1000));
    });

    const turnTimerProgress = Vue.computed(() => {
      const tt = turnTimer.value;
      if (!tt?.deadline_at || tt.pending) return 0;
      const w = Math.max(1, tt.window_seconds || 300);
      const rem = turnTimerRemainingSec.value;
      return Math.min(100, Math.max(0, (rem / w) * 100));
    });

    const turnTimerRowVisible = Vue.computed(() => {
      if (!useTurnTimer.value || !isMatchActive.value) return false;
      const tt = turnTimer.value;
      return !!(tt?.deadline_at && !tt.pending);
    });

    const showTurnTimeoutWaitingBanner = Vue.computed(() => {
      if (!useTurnTimer.value || !isMatchActive.value || !turnTimer.value?.pending) return false;
      const uid = auth.user?.id;
      const cpu = state.value?.current_player?.user_id;
      if (uid == null || cpu == null) return false;
      return Number(cpu) === Number(uid);
    });

    const showTurnTimeoutOpponentModal = Vue.computed(() => {
      if (!useTurnTimer.value || !isMatchActive.value || !turnTimer.value?.pending) return false;
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

    const cricketActiveSegs = Vue.computed(() => {
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

    const scorecardColumnTemplate = Vue.computed(() => {
      const n = players.value.length;
      const left  = Math.ceil(n / 2);
      const right = Math.floor(n / 2);
      return [...Array(left).fill('1fr'), 'minmax(3.25rem, 5vw)', ...Array(right).fill('1fr')].join(' ');
    });

    const scorecardGridStyle = Vue.computed(() => ({
      display: 'grid',
      gridTemplateColumns: scorecardColumnTemplate.value,
      alignItems: 'center',
    }));

    const scorecardRowGridStyle = Vue.computed(() => ({
      display: 'grid',
      gridTemplateColumns: scorecardColumnTemplate.value,
      alignItems: 'stretch',
      minHeight: 0,
    }));

    const leftPlayers  = Vue.computed(() => players.value.slice(0, Math.ceil(players.value.length / 2)));
    const rightPlayers = Vue.computed(() => players.value.slice(Math.ceil(players.value.length / 2)));

    function sortCricketSegmentsNumeric(activeList) {
      const raw = (activeList || []).map(Number);
      const set = new Set(raw);
      const standard = [...set].filter(s => s >= 1 && s <= 20).sort((a, b) => a - b);
      const other = [...set].filter(s => (s < 1 || s > 20) && s !== 25).sort((a, b) => a - b);
      const out = [...standard, ...other];
      if (set.has(25)) out.push(25);
      return out;
    }

    const cricketSdtSegments = Vue.computed(() => sortCricketSegmentsNumeric(cricketActiveSegs.value));

    const cricketSdtNonBull = Vue.computed(() => cricketSdtSegments.value.filter(s => s !== 25));
    const cricketSdtHasBull = Vue.computed(() => cricketSdtSegments.value.includes(25));
    const cricketPadSplit = Vue.computed(() => {
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
      dartInput.darts.push({ segment: seg, multiplier: mul });
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
        title: pickRandom(['LEĠENDĀRS!', '170 klubs!', 'Meistarklase!']),
        tag: pickRandom(['Aplausi. Tu to nopelnīji.', 'Šādu redz reti.', 'Respekts.']),
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
        setTimeout(() => { legWonCelebration.value = null; }, 3600);
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
      if (isLegWin && throwerId) {
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

    Vue.watch(
      () => [state.value?.current_set, state.value?.current_leg],
      () => {
        dartInput.darts = [];
      },
    );

    /** Spēlē Cricket — slēgšanas trāpījumi (atbilst servera CricketEngine::statHitMultiplierBeforeApply). */
    const CRICKET_HITS_TO_CLOSE = 3;

    function cricketSegKey(seg) {
      const s = Number(seg);
      return s === 25 ? 'seg_bull' : `seg_${s}`;
    }

    function cricketSegHitsFromPlayer(player, seg) {
      const c = player?.cricket;
      if (!c) return 0;
      const k = cricketSegKey(seg);
      return Math.max(0, Math.min(CRICKET_HITS_TO_CLOSE, Number(c[k] ?? 0)));
    }

    function buildCricketHitsSnapshot(players, activeSegments) {
      const playerIds = players.map((p) => Number(p.id));
      const hits = {};
      for (const pid of playerIds) {
        hits[pid] = {};
        const pl = players.find((x) => Number(x.id) === pid);
        for (const seg of activeSegments) {
          hits[pid][seg] = pl ? cricketSegHitsFromPlayer(pl, seg) : 0;
        }
      }
      return { hits, playerIds };
    }

    function cloneCricketHits(hits, playerIds, activeSegments) {
      const out = {};
      for (const pid of playerIds) {
        out[pid] = {};
        for (const seg of activeSegments) {
          out[pid][seg] = hits[pid][seg] ?? 0;
        }
      }
      return out;
    }

    function statHitBeforeApply(hits, playerIds, activeSegments, throwerId, segment, multiplier) {
      const seg = Number(segment);
      const mul = Number(multiplier);
      if (mul <= 0 || seg <= 0) return 0;
      if (!activeSegments.includes(seg)) return 0;

      let allClosed = true;
      for (const pid of playerIds) {
        if ((hits[pid][seg] ?? 0) < CRICKET_HITS_TO_CLOSE) {
          allClosed = false;
          break;
        }
      }
      if (allClosed) return 0;

      const myHits = hits[throwerId][seg] ?? 0;
      if (myHits >= CRICKET_HITS_TO_CLOSE) return 0;

      return Math.min(mul, CRICKET_HITS_TO_CLOSE - myHits);
    }

    function applyDartToCricketHits(hits, throwerId, segment, multiplier, activeSegments) {
      const seg = Number(segment);
      const mul = Number(multiplier);
      if (mul <= 0 || seg <= 0) return;
      if (!activeSegments.includes(seg)) return;
      const current = hits[throwerId][seg] ?? 0;
      if (current >= CRICKET_HITS_TO_CLOSE) return;
      const need = CRICKET_HITS_TO_CLOSE - current;
      const add = Math.min(mul, need);
      hits[throwerId][seg] = current + add;
    }

    /** Kopējie efektīvie slēgšanas trāpījumi gājienā + katrai šautnei (animācijai / sasniegumiem). */
    function effectiveCricketMarksForTurn(darts, activeSegments, players, throwerId) {
      const segs = activeSegments.map(Number);
      const { hits, playerIds } = buildCricketHitsSnapshot(players, segs);
      const H = cloneCricketHits(hits, playerIds, segs);
      const tid = Number(throwerId);
      const perDart = [];
      let total = 0;
      for (const d of darts) {
        const eff = statHitBeforeApply(H, playerIds, segs, tid, d.segment, d.multiplier);
        perDart.push(eff);
        total += eff;
        applyDartToCricketHits(H, tid, d.segment, d.multiplier, segs);
      }
      return { total, perDart };
    }

    function detectCricketAchievements(darts, activeSegs, players, throwerId) {
      const segs = activeSegs.map(Number);
      const { total, perDart } = effectiveCricketMarksForTurn(darts, segs, players, throwerId);

      let bullMarks = 0;
      let tripleCount = 0;
      const tripleSegs = new Set();

      for (let i = 0; i < darts.length; i++) {
        const d = darts[i];
        const seg = Number(d.segment);
        const mul = Number(d.multiplier);
        const eff = perDart[i] ?? 0;
        if (!seg || !mul || !segs.includes(seg)) continue;
        if (seg === 25) bullMarks += eff;
        if (mul === 3 && eff > 0) {
          tripleCount++;
          tripleSegs.add(seg);
        }
      }

      const achieve = (emoji, title, sub, color, glow) => ({ emoji, title, sub, color, glow });

      if (tripleCount >= 3 && tripleSegs.size >= 3 && total >= 9) {
        return achieve('🐎🔥', 'Baltais zirgs!', 'Trīs trīskārši · trīs lauki · 9 trāpījumi', '#6ee7b7', '#10b981');
      }

      if (total >= 9) {
        return achieve('🔥', `${total} trāpījumi!`, 'Maksimums', '#fca5a5', '#f43f5e');
      }

      if (tripleCount >= 3 && tripleSegs.size >= 3) {
        return achieve('🐎', 'Baltais zirgs!', 'Trīs trīskārši dažādos laukos', '#6ee7b7', '#10b981');
      }

      if (tripleCount >= 3 && tripleSegs.size === 1) {
        return achieve('💥', 'Trīs trīskārši!', 'Vienā laukā', '#fcd34d', '#f59e0b');
      }

      if (bullMarks >= 3) {
        const ex = bullMarks >= 6 ? '!!' : '!';
        return achieve('🎯', `${bullMarks} Bull${ex}`, `${bullMarks} trāpījumi bullā`, '#7dd3fc', '#0ea5e9');
      }

      if (total >= 4) {
        return achieve('⬡', `${total} trāpījumi!`, null, '#c4b5fd', '#8b5cf6');
      }

      return null;
    }

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
            setTimeout(() => { cricketAchievement.value = null; }, 2800);
          }
          if ((legAdv || data.status === 'finished') && throwerId) {
            const winner = (data.players || []).find((p) => Number(p.id) === Number(throwerId));
            queueLegWinCelebration({
              winnerName: winner?.name || '—',
              wonSet: prevSet,
              wonLeg: prevLeg,
            }, ach ? 2950 : 450);
          }
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

    Vue.onMounted(async () => {
      gameBootPending.value = true;
      try {
        await gameStore.loadState(props.matchId);
        await maybeAutoResumeSuspendedLocal();
      } finally {
        gameBootPending.value = false;
      }
      gameStore.startPolling(1100);
      document.addEventListener('keydown', onDocKeydown);
      turnClockInterval = setInterval(() => { nowMs.value = Date.now(); }, 500);
    });

    Vue.onUnmounted(() => {
      gameStore.stopPolling();
      document.removeEventListener('keydown', onDocKeydown);
      if (turnClockInterval) {
        clearInterval(turnClockInterval);
        turnClockInterval = null;
      }
    });

    const matchId = Vue.computed(() => props.matchId);

    return {
      matchId,
      state, isMyTurn, isX01, isCricket, players, finished, legsToWin,
      dartInput, submitting, turnResult, legWonCelebration, activeMultiplier, showUndoConfirm, showAbandonConfirm,
      isMatchActive, isSuspended, waitingForTurnUi, legsConfigTotal, setsConfigTotal,
      gameBootPending,
      undoAvailable,
      cricketActiveSegs, cricketSdtSegments, cricketSdtNonBull, cricketSdtHasBull, cricketPadSplit,
      hitsFor, myHitsFor, segClosedByAll,
      scorecardGridStyle, scorecardRowGridStyle, leftPlayers, rightPlayers,
      addX01Dart, addX01Miss, addCricketDart, removeDart, dartLabel, dartValue,
      turnResultShellClass, turnResultMotionClass, turnResultTopBannerClass,
      submitThrow, undo, confirmUndo, goAbandonFromUndoDialog, confirmAbandon, exitGameSaving, goHome, auth, gameStore,
      cricketAchievement,
      t,
      useTurnTimer, turnTimer, turnTimerRemainingSec, turnTimerProgress, turnTimerRowVisible,
      showTurnTimeoutWaitingBanner, showTurnTimeoutOpponentModal,
      formatTurnClock, turnTimeoutBusy, onTurnTimeoutGrantExtra, onTurnTimeoutEndNoStats,
    };
  },

  template: `
    <div class="flex h-full min-h-0 flex-1 flex-col w-full min-w-0 overflow-hidden bg-[#060d18] text-slate-200">

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

      <!-- Cricket achievement popup -->
      <Teleport to="body">
        <Transition name="achieve">
          <div v-if="cricketAchievement"
               class="fixed z-50 pointer-events-none"
               style="top: 26%; left: 50%; transform: translateX(-50%); width: min(22rem, 90vw)">
            <div class="relative overflow-hidden rounded-2xl shadow-2xl shadow-black/70"
                 style="background: #080f1e; border: 1px solid rgba(255,255,255,0.08)">
              <!-- colour accent bar -->
              <div class="h-1 w-full" :style="{ background: cricketAchievement.glow }"></div>
              <div class="px-6 py-5 flex flex-col items-center text-center gap-1">
                <div class="text-6xl leading-none mb-1 drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
                  {{ cricketAchievement.emoji }}
                </div>
                <div class="text-xl font-black text-white tracking-tight leading-snug">
                  {{ cricketAchievement.title }}
                </div>
                <div v-if="cricketAchievement.sub"
                     class="text-sm font-semibold leading-snug"
                     :style="{ color: cricketAchievement.color }">
                  {{ cricketAchievement.sub }}
                </div>
              </div>
              <!-- subtle glow overlay -->
              <div class="absolute inset-0 pointer-events-none rounded-2xl"
                   :style="{ boxShadow: '0 0 60px 0 ' + cricketAchievement.glow + '33' }"></div>
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
        <div v-if="finished" class="flex min-h-0 flex-1 flex-col overflow-hidden w-full">
          <MatchReport :match-id="matchId" class="min-h-0 flex-1" @home="goHome" />
        </div>

        <!-- ════════════════ CRICKET ════════════════ -->
        <div v-else-if="isCricket"
             class="flex flex-1 min-h-0 flex-col overflow-hidden bg-gradient-to-b from-[#060d18] via-[#070d16] to-[#0a1120]">

          <!-- ── Desktop layout (lg+) ── -->
          <div class="hidden lg:flex flex-1 min-h-0">

            <!-- Center: player cards + scoreboard -->
            <div class="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">

              <!-- Room/leg bar + multiplayer darbības -->
              <div class="flex-shrink-0 px-3 sm:px-5 py-2 border-b border-[#162540] bg-[#0a1120]/80
                          flex flex-wrap items-center justify-between gap-2">
                <span class="text-amber-400 font-mono font-black text-sm tracking-widest">{{ state.room_code }}</span>
                <div class="flex items-center gap-2 flex-wrap justify-end">
                  <span class="text-slate-500 text-xs tabular-nums">
                    Leg {{ state.current_leg }}/{{ legsConfigTotal }}<template v-if="setsConfigTotal > 1"> · Set {{ state.current_set }}/{{ setsConfigTotal }}</template>
                  </span>
                  <template v-if="(isMatchActive || isSuspended) && auth.user">
                    <button type="button" @click="exitGameSaving"
                            class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide
                                   border border-slate-600/60 text-slate-400 hover:text-white hover:bg-[#162540] transition touch-manipulation">
                      {{ t('game.exitSave') }}
                    </button>
                    <button v-if="isMatchActive" type="button" @click="showAbandonConfirm = true"
                            class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide
                                   border border-rose-800/50 text-rose-400 hover:bg-rose-950/40 transition touch-manipulation">
                      Pārtraukt
                    </button>
                  </template>
                </div>
              </div>

              <div v-if="isMatchActive && showTurnTimeoutWaitingBanner"
                   class="shrink-0 px-3 py-2.5 bg-amber-950/50 border-b border-amber-700/40 text-center text-xs sm:text-sm font-semibold text-amber-100 leading-snug">
                {{ t('game.turnTimer.waitingOpponentChoice') }}
              </div>
              <div v-else-if="turnTimerRowVisible"
                   class="shrink-0 flex items-center gap-3 px-3 sm:px-5 py-2 border-b border-[#162540] bg-[#0d1526]/95">
                <span class="text-[10px] font-black uppercase tracking-widest text-slate-500 shrink-0 hidden md:inline">{{ t('game.turnTimer.label') }}</span>
                <div class="flex-1 min-w-0 h-2 rounded-full bg-[#1e3050] overflow-hidden ring-1 ring-black/25">
                  <div class="h-full rounded-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-300 transition-[width] duration-500 ease-linear"
                       :style="{ width: turnTimerProgress + '%' }"></div>
                </div>
                <span class="text-sm font-mono font-black tabular-nums text-amber-400 w-[4.75rem] text-right shrink-0">{{ formatTurnClock(turnTimerRemainingSec) }}</span>
              </div>

              <!-- Player cards -->
              <div class="flex-shrink-0 px-4 pt-3 pb-2 grid gap-2"
                   :class="players.length >= 3 ? 'grid-cols-3' : 'grid-cols-2'">
                <div v-for="player in players" :key="player.id"
                     class="rounded-2xl px-4 py-3 transition-all duration-300"
                     :class="Number(player.id) === Number(state.current_player?.id)
                       ? 'bg-[#1a2540] border border-amber-500/35 shadow-md shadow-black/20'
                       : 'bg-[#0f1c30] border border-[#162540]'">
                  <div class="flex items-center gap-1.5 mb-1 min-w-0">
                    <span v-if="Number(player.id) === Number(state.current_player?.id)"
                          class="text-amber-400 text-xs animate-pulse flex-shrink-0">▶</span>
                    <span class="text-xs font-bold truncate flex-1"
                          :class="Number(player.id) === Number(state.current_player?.id) ? 'text-amber-300' : 'text-slate-500'">
                      {{ player.name }}
                    </span>
                    <!-- Leg / Set score -->
                    <div class="flex-shrink-0 flex items-center gap-1 ml-1">
                      <template v-if="state.legs_config?.sets > 1">
                        <span class="text-[10px] font-black tabular-nums px-1.5 py-0.5 rounded-md"
                              :class="Number(player.id) === Number(state.current_player?.id) ? 'bg-amber-500/20 text-amber-300' : 'bg-[#1a2a42] text-slate-400'">
                          {{ player.sets_won }}S · {{ player.legs_won }}L
                        </span>
                      </template>
                      <template v-else>
                        <span class="text-lg font-black tabular-nums leading-none"
                              :class="player.legs_won > 0
                                ? (Number(player.id) === Number(state.current_player?.id) ? 'text-amber-400' : 'text-slate-300')
                                : 'text-slate-700'">
                          {{ player.legs_won }}
                        </span>
                        <span class="text-slate-700 text-xs font-bold">/{{ legsToWin }}</span>
                      </template>
                    </div>
                  </div>
                  <div class="text-3xl font-black tabular-nums leading-none mb-1.5"
                       :class="player.cricket?.all_closed ? 'text-emerald-400' : 'text-slate-100'">
                    {{ player.cricket?.points ?? 0 }}
                  </div>
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex gap-0.5">
                      <div v-for="i in legsToWin" :key="i"
                           class="w-1.5 h-1.5 rounded-full border transition-all"
                           :class="i <= player.legs_won ? 'bg-amber-400 border-amber-400' : 'border-[#1e3050]'"></div>
                    </div>
                    <div class="flex flex-col items-end shrink-0" :title="t('game.cricketAvgHint')">
                      <span class="text-[9px] font-black uppercase tracking-wide text-amber-500 leading-none mb-0.5">{{ t('game.cricketAvgShort') }}</span>
                      <span class="text-base font-black tabular-nums text-amber-100 leading-none">{{ player.avg_pts ?? '—' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Scoreboard -->
              <div class="flex-1 min-h-0 mx-4 mb-4 rounded-xl overflow-hidden
                          border border-[#162540] bg-[#0f1c30]/90 flex flex-col shadow-inner">
                <!-- Headers -->
                <div class="flex-shrink-0 border-b border-[#162540] py-2 px-1 bg-[#0a1120]/60"
                     :style="scorecardGridStyle">
                  <div v-for="p in leftPlayers" :key="'lhd-'+p.id"
                       class="text-center text-xs font-bold truncate px-1"
                       :class="Number(p.id) === Number(state.current_player?.id) ? 'text-amber-400' : 'text-slate-500'">
                    {{ p.name }}
                  </div>
                  <div class="text-center text-[10px] text-slate-500 font-black uppercase tracking-widest">Lauks</div>
                  <div v-for="p in rightPlayers" :key="'rhd-'+p.id"
                       class="text-center text-xs font-bold truncate px-1"
                       :class="Number(p.id) === Number(state.current_player?.id) ? 'text-amber-400' : 'text-slate-500'">
                    {{ p.name }}
                  </div>
                </div>
                <!-- Segment rows -->
                <div class="flex-1 min-h-0 flex flex-col overflow-y-auto">
                  <div v-for="(seg, idx) in cricketSdtSegments" :key="seg"
                       class="flex-1 min-h-0 basis-0 border-b border-[#162540]/40 last:border-b-0 transition-all duration-300"
                       :class="[idx % 2 === 0 ? 'bg-[#0a1120]/25' : '', segClosedByAll(seg) ? 'opacity-25' : '']"
                       :style="scorecardRowGridStyle">
                    <div v-for="p in leftPlayers" :key="'lmd-'+p.id+'-'+seg"
                         class="flex items-center justify-center min-h-0 min-w-0 border-r border-[#162540]/30 p-1">
                      <CricketMarkCell :hits="hitsFor(p.id, seg)" :closed="segClosedByAll(seg)" size="board" />
                    </div>
                    <div class="flex items-center justify-center min-h-0 min-w-0 px-1 rounded-lg mx-0.5 my-0.5 shadow-inner"
                         :class="segClosedByAll(seg)
                           ? 'bg-[#0a1120]/95 border border-[#1e3050]'
                           : 'border border-rose-900/40 bg-[#1a0a0f]'">
                      <div class="flex flex-col items-center justify-center leading-none gap-0.5 py-0.5">
                        <span class="font-black tabular-nums select-none text-[clamp(1.125rem,2.8vmin,1.75rem)]"
                              :class="segClosedByAll(seg) ? 'text-slate-500 line-through' : 'text-rose-300/90'">
                          {{ seg === 25 ? '25' : seg }}
                        </span>
                        <span v-if="seg === 25 && !segClosedByAll(seg)"
                              class="text-[8px] font-bold uppercase tracking-widest text-rose-400/80">bull</span>
                      </div>
                    </div>
                    <div v-for="p in rightPlayers" :key="'rmd-'+p.id+'-'+seg"
                         class="flex items-center justify-center min-h-0 min-w-0 border-l border-[#162540]/30 p-1">
                      <CricketMarkCell :hits="hitsFor(p.id, seg)" :closed="segClosedByAll(seg)" size="board" />
                    </div>
                  </div>
                </div>
                <!-- Legend -->
                <div class="flex-shrink-0 border-t border-[#162540] py-1.5 px-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 bg-[#0a1120]/40">
                  <span><span class="font-mono font-black text-slate-400">0</span> nav</span>
                  <span><span class="font-mono font-black text-sky-400/90">1</span> viens</span>
                  <span><span class="font-mono font-black text-amber-400/90">2</span> divi</span>
                  <span class="inline-flex items-center gap-1.5">
                    <span class="inline-flex items-center justify-center text-emerald-400/95 w-4 h-4 flex-shrink-0">
                      <CricketClosedCheck :boosted="false" />
                    </span>
                    slēgts
                  </span>
                </div>
              </div>

            </div>

            <!-- Right: input panel -->
            <div class="flex-shrink-0 w-[min(22rem,40vw)] min-w-[18rem] flex flex-col border-l border-[#162540] bg-[#0a1120]/95 overflow-hidden">

              <div v-if="waitingForTurnUi"
                   class="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
                <div class="text-slate-500 text-xs uppercase tracking-widest font-semibold">Gaida</div>
                <div class="text-slate-100 font-black text-xl">{{ state.current_player?.name }}</div>
                <div class="flex gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style="animation-delay:0ms"></span>
                  <span class="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style="animation-delay:150ms"></span>
                  <span class="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style="animation-delay:300ms"></span>
                </div>
              </div>

              <template v-else>
                <div class="flex-1 flex flex-col gap-3 p-3 overflow-hidden min-h-0">

                  <div class="flex items-center justify-between gap-2 flex-shrink-0">
                    <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">Šīs kārtas</span>
                    <div class="flex gap-1" aria-hidden="true">
                      <span v-for="i in 3" :key="i"
                            class="h-1.5 w-1.5 rounded-full transition-all"
                            :class="i <= dartInput.darts.length ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,.5)]' : 'bg-[#1e3050]'"></span>
                    </div>
                  </div>

                  <!-- Dart slots -->
                  <div class="flex gap-2 flex-shrink-0">
                    <div v-for="(d, i) in dartInput.darts" :key="i"
                         class="flex-1 bg-[#0f1c30] border border-[#162540] rounded-xl
                                px-1.5 py-2 text-center relative group min-w-0 touch-manipulation min-h-[3.5rem] flex flex-col justify-center">
                      <div class="text-amber-400 font-mono font-black text-sm sm:text-base truncate">{{ dartLabel(d) }}</div>
                      <div class="text-slate-500 text-[11px] tabular-nums">{{ dartValue(d) > 0 ? dartValue(d) : '—' }}</div>
                      <button type="button" @click="removeDart(i)"
                              class="absolute -top-1 -right-1 w-7 h-7 sm:w-6 sm:h-6 bg-red-700 hover:bg-red-600 text-white
                                     rounded-full text-xs flex items-center justify-center shadow-md
                                     opacity-100 transition">✕</button>
                    </div>
                    <div v-for="i in (3 - dartInput.darts.length)" :key="'ed'+i"
                         class="flex-1 min-h-[3.5rem] bg-[#060d18]/80 border border-dashed border-[#1e3050]
                                rounded-xl flex items-center justify-center text-[#1e3050] text-xs font-mono">—</div>
                  </div>


                  <!-- Segment cards — scrollable -->
                  <div class="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 pr-0.5">
                    <div class="grid grid-cols-2 gap-x-2 gap-y-2">
                      <div class="flex flex-col gap-2">
                        <div v-for="seg in cricketPadSplit.left" :key="'dl'+seg"
                             class="rounded-2xl border border-slate-500/25 bg-gradient-to-b from-[#101c32] via-[#0a1424] to-[#060d14] p-2 shadow-lg shadow-black/25 ring-1 ring-white/[0.06]">
                          <div class="mb-1.5 flex items-center justify-between gap-2">
                            <span class="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">Lauks</span>
                            <span class="min-w-[2.25rem] rounded-xl px-2.5 py-1 text-center text-xl font-black tabular-nums border border-rose-900/40 bg-[#1a0a0f] text-rose-300/90">{{ seg }}</span>
                          </div>
                          <div class="grid grid-cols-3 gap-1.5">
                            <button type="button" @click="addCricketDart(seg, 1)"
                                    :disabled="segClosedByAll(seg) || dartInput.darts.length >= 3"
                                    class="relative flex items-center justify-center overflow-hidden rounded-xl border px-1 py-2.5 shadow-sm transition active:scale-[0.96] touch-manipulation select-none disabled:opacity-20
                                           border-slate-400/35 bg-gradient-to-b from-slate-600/50 to-slate-950/95 text-white ring-1 ring-inset ring-white/10 hover:from-slate-500/55"
                                    :class="myHitsFor(seg) >= 3 ? '!border-emerald-600/50 !from-emerald-950/90 !to-emerald-950 !ring-emerald-500/15' : ''">
                              <span class="text-xl font-black leading-none tabular-nums">1×</span>
                              <span v-if="myHitsFor(seg) >= 3" class="absolute right-0.5 top-0.5 text-[8px] text-emerald-400">✓</span>
                            </button>
                            <button type="button" @click="addCricketDart(seg, 2)"
                                    :disabled="segClosedByAll(seg) || dartInput.darts.length >= 3"
                                    class="relative flex items-center justify-center overflow-hidden rounded-xl border px-1 py-2.5 shadow-sm transition active:scale-[0.96] touch-manipulation select-none disabled:opacity-20
                                           border-sky-400/40 bg-gradient-to-b from-sky-600/45 to-sky-950/95 text-sky-50 ring-1 ring-inset ring-sky-300/15 hover:from-sky-500/55"
                                    :class="myHitsFor(seg) >= 3 ? '!border-emerald-600/50 !from-emerald-950/90 !to-emerald-950 !ring-emerald-500/15' : ''">
                              <span class="text-xl font-black leading-none tabular-nums">2×</span>
                              <span v-if="myHitsFor(seg) >= 3" class="absolute right-0.5 top-0.5 text-[8px] text-emerald-400">✓</span>
                            </button>
                            <button type="button" @click="addCricketDart(seg, 3)"
                                    :disabled="segClosedByAll(seg) || dartInput.darts.length >= 3"
                                    class="relative flex items-center justify-center overflow-hidden rounded-xl border px-1 py-2.5 shadow-sm transition active:scale-[0.96] touch-manipulation select-none disabled:opacity-20
                                           border-amber-400/45 bg-gradient-to-b from-amber-600/40 to-amber-950/95 text-amber-50 ring-1 ring-inset ring-amber-300/15 hover:from-amber-500/50"
                                    :class="myHitsFor(seg) >= 3 ? '!border-emerald-600/50 !from-emerald-950/90 !to-emerald-950 !ring-emerald-500/15' : ''">
                              <span class="text-xl font-black leading-none tabular-nums">3×</span>
                              <span v-if="myHitsFor(seg) >= 3" class="absolute right-0.5 top-0.5 text-[8px] text-emerald-400">✓</span>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div class="flex flex-col gap-2">
                        <div v-for="seg in cricketPadSplit.right" :key="'dr'+seg"
                             class="rounded-2xl border border-slate-500/25 bg-gradient-to-b from-[#101c32] via-[#0a1424] to-[#060d14] p-2 shadow-lg shadow-black/25 ring-1 ring-white/[0.06]">
                          <div class="mb-1.5 flex items-center justify-between gap-2">
                            <span class="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">Lauks</span>
                            <span class="min-w-[2.25rem] rounded-xl px-2.5 py-1 text-center text-xl font-black tabular-nums border border-rose-900/40 bg-[#1a0a0f] text-rose-300/90">{{ seg }}</span>
                          </div>
                          <div class="grid grid-cols-3 gap-1.5">
                            <button type="button" @click="addCricketDart(seg, 1)"
                                    :disabled="segClosedByAll(seg) || dartInput.darts.length >= 3"
                                    class="relative flex items-center justify-center overflow-hidden rounded-xl border px-1 py-2.5 shadow-sm transition active:scale-[0.96] touch-manipulation select-none disabled:opacity-20
                                           border-slate-400/35 bg-gradient-to-b from-slate-600/50 to-slate-950/95 text-white ring-1 ring-inset ring-white/10 hover:from-slate-500/55"
                                    :class="myHitsFor(seg) >= 3 ? '!border-emerald-600/50 !from-emerald-950/90 !to-emerald-950 !ring-emerald-500/15' : ''">
                              <span class="text-xl font-black leading-none tabular-nums">1×</span>
                              <span v-if="myHitsFor(seg) >= 3" class="absolute right-0.5 top-0.5 text-[8px] text-emerald-400">✓</span>
                            </button>
                            <button type="button" @click="addCricketDart(seg, 2)"
                                    :disabled="segClosedByAll(seg) || dartInput.darts.length >= 3"
                                    class="relative flex items-center justify-center overflow-hidden rounded-xl border px-1 py-2.5 shadow-sm transition active:scale-[0.96] touch-manipulation select-none disabled:opacity-20
                                           border-sky-400/40 bg-gradient-to-b from-sky-600/45 to-sky-950/95 text-sky-50 ring-1 ring-inset ring-sky-300/15 hover:from-sky-500/55"
                                    :class="myHitsFor(seg) >= 3 ? '!border-emerald-600/50 !from-emerald-950/90 !to-emerald-950 !ring-emerald-500/15' : ''">
                              <span class="text-xl font-black leading-none tabular-nums">2×</span>
                              <span v-if="myHitsFor(seg) >= 3" class="absolute right-0.5 top-0.5 text-[8px] text-emerald-400">✓</span>
                            </button>
                            <button type="button" @click="addCricketDart(seg, 3)"
                                    :disabled="segClosedByAll(seg) || dartInput.darts.length >= 3"
                                    class="relative flex items-center justify-center overflow-hidden rounded-xl border px-1 py-2.5 shadow-sm transition active:scale-[0.96] touch-manipulation select-none disabled:opacity-20
                                           border-amber-400/45 bg-gradient-to-b from-amber-600/40 to-amber-950/95 text-amber-50 ring-1 ring-inset ring-amber-300/15 hover:from-amber-500/50"
                                    :class="myHitsFor(seg) >= 3 ? '!border-emerald-600/50 !from-emerald-950/90 !to-emerald-950 !ring-emerald-500/15' : ''">
                              <span class="text-xl font-black leading-none tabular-nums">3×</span>
                              <span v-if="myHitsFor(seg) >= 3" class="absolute right-0.5 top-0.5 text-[8px] text-emerald-400">✓</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Bull block — always visible, above Miss -->
                  <div v-if="cricketSdtHasBull"
                       class="flex-shrink-0 rounded-2xl border border-[#1e3050] bg-gradient-to-b from-[#101c32] via-[#0a1424] to-[#060d14] p-2 shadow-lg ring-1 ring-white/[0.06]">
                    <div class="mb-1.5 flex items-center justify-between gap-2 px-0.5">
                      <span class="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">Bull</span>
                      <span class="rounded-xl px-2.5 py-1 text-xl font-black tabular-nums border border-rose-900/40 bg-[#1a0a0f] text-rose-300/90">25</span>
                    </div>
                    <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-1.5">
                      <button type="button" @click="addCricketDart(25, 1)"
                              :disabled="segClosedByAll(25) || dartInput.darts.length >= 3"
                              class="relative flex items-center justify-center overflow-hidden rounded-xl border px-1 py-2.5 shadow-sm transition active:scale-[0.96] touch-manipulation select-none disabled:opacity-20
                                     border-emerald-700/45 bg-gradient-to-b from-emerald-800/50 to-emerald-950/95 text-emerald-100 ring-1 ring-inset ring-emerald-500/15 hover:from-emerald-700/55"
                              :class="myHitsFor(25) >= 3 ? '!border-emerald-600/50 !from-emerald-950/90 !to-emerald-950' : ''">
                        <span class="text-xl font-black tabular-nums leading-none">1×</span>
                        <span v-if="myHitsFor(25) >= 3" class="absolute right-1 top-1 text-[8px] text-emerald-400">✓</span>
                      </button>
                      <button type="button" @click="addCricketDart(25, 2)"
                              :disabled="segClosedByAll(25) || dartInput.darts.length >= 3"
                              class="relative flex items-center justify-center overflow-hidden rounded-xl border px-1 py-2.5 shadow-md transition active:scale-[0.96] touch-manipulation select-none disabled:opacity-20
                                     border-red-800/50 bg-gradient-to-b from-red-800/55 to-red-950/95 text-red-50 ring-1 ring-inset ring-red-500/20 hover:from-red-700/60"
                              :class="myHitsFor(25) >= 3 ? '!border-emerald-600/50 !from-emerald-950/90 !to-emerald-950 !ring-emerald-500/30' : ''">
                        <span class="text-2xl font-black tabular-nums leading-none">2×</span>
                        <span v-if="myHitsFor(25) >= 3" class="absolute right-1 top-1 text-[8px] text-emerald-400">✓</span>
                      </button>
                    </div>
                  </div>

                  <!-- Miss -->
                  <button type="button" @click="addCricketDart(0, 0)"
                          :disabled="dartInput.darts.length >= 3"
                          class="flex-shrink-0 w-full rounded-2xl text-xs font-black uppercase tracking-wide bg-[#1a0a0f] text-rose-300/90
                                 hover:bg-[#2a1218] transition active:scale-95 touch-manipulation select-none
                                 disabled:opacity-20 border border-rose-900/40 py-3">
                    Miss
                  </button>

                  <div class="flex gap-2 flex-shrink-0 pt-1">
                    <button type="button" @click="undo"
                            class="flex-1 py-3.5 bg-[#162540] hover:bg-[#1e3050] text-slate-200 rounded-2xl
                                   font-bold transition text-sm active:scale-[0.97] border border-[#1e3050] touch-manipulation">
                      ↩ Atsaukt
                    </button>
                    <button type="button" @click="submitThrow"
                            :disabled="dartInput.darts.length === 0 || submitting"
                            class="flex-1 py-3.5 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl
                                   font-black transition disabled:opacity-40 text-sm
                                   active:scale-[0.97] shadow-lg shadow-amber-950/30 touch-manipulation">
                      {{ submitting ? '...' : 'Iesniegt →' }}
                    </button>
                  </div>

                </div>
              </template>

            </div>

          </div>

          <!-- ── Mobile layout ── -->
          <div class="lg:hidden grid flex-1 min-h-0 grid-rows-[auto_auto_minmax(0,1fr)_minmax(0,1fr)] overflow-hidden overscroll-none pb-[env(safe-area-inset-bottom)]">

            <div class="flex-shrink-0 px-2 py-1.5 border-b border-[#162540] bg-[#0a1120]/90 flex items-center justify-between gap-1 flex-wrap">
              <span class="text-amber-400 font-mono font-black text-xs tracking-wider truncate min-w-0">{{ state.room_code }}</span>
              <div class="flex items-center gap-1 flex-shrink-0">
                <span class="text-slate-500 text-[10px] tabular-nums">
                  L{{ state.current_leg }}/{{ legsConfigTotal }}<template v-if="setsConfigTotal > 1">·S{{ state.current_set }}/{{ setsConfigTotal }}</template>
                </span>
                <template v-if="(isMatchActive || isSuspended) && auth.user">
                  <button type="button" @click="exitGameSaving"
                          class="px-1.5 py-0.5 rounded text-[9px] font-bold border border-slate-600/50 text-slate-400 active:bg-[#162540] touch-manipulation">
                    Prom
                  </button>
                  <button v-if="isMatchActive" type="button" @click="showAbandonConfirm = true"
                          class="px-1.5 py-0.5 rounded text-[9px] font-black border border-rose-800/40 text-rose-400 active:bg-rose-950/30 touch-manipulation">
                    Stop
                  </button>
                </template>
              </div>
            </div>

            <div v-if="isMatchActive && showTurnTimeoutWaitingBanner"
                 class="shrink-0 px-2 py-1.5 bg-amber-950/50 border-b border-amber-700/40 text-center text-[10px] font-semibold text-amber-100 leading-snug">
              {{ t('game.turnTimer.waitingOpponentChoice') }}
            </div>
            <div v-else-if="turnTimerRowVisible"
                 class="shrink-0 flex items-center gap-2 px-2 py-1.5 border-b border-[#162540] bg-[#0d1526]/95">
              <div class="flex-1 min-w-0 h-1.5 rounded-full bg-[#1e3050] overflow-hidden">
                <div class="h-full rounded-full bg-gradient-to-r from-amber-700 to-amber-400 transition-[width] duration-500 ease-linear"
                     :style="{ width: turnTimerProgress + '%' }"></div>
              </div>
              <span class="text-[11px] font-mono font-black tabular-nums text-amber-400 w-11 text-right shrink-0">{{ formatTurnClock(turnTimerRemainingSec) }}</span>
            </div>

            <div class="flex-shrink-0 px-2 pt-1.5 pb-1 grid gap-1"
                 :class="players.length >= 3 ? 'grid-cols-3' : 'grid-cols-2'">
              <div v-for="player in players" :key="player.id"
                   class="rounded-xl px-2 py-1.5 transition-all duration-300 min-w-0"
                   :class="Number(player.id) === Number(state.current_player?.id)
                     ? 'bg-[#1a2540] border border-amber-500/35'
                     : 'bg-[#0f1c30] border border-[#162540]'">
                <div class="flex items-center gap-0.5 min-w-0 mb-0.5">
                  <span v-if="Number(player.id) === Number(state.current_player?.id)"
                        class="text-amber-400 text-[10px] flex-shrink-0">▶</span>
                  <span class="text-[11px] font-bold truncate leading-tight flex-1"
                        :class="Number(player.id) === Number(state.current_player?.id) ? 'text-amber-300' : 'text-slate-500'">
                    {{ player.name }}
                  </span>
                  <!-- Score badge -->
                  <span class="flex-shrink-0 font-black tabular-nums leading-none text-xs ml-0.5"
                        :class="player.legs_won > 0
                          ? (Number(player.id) === Number(state.current_player?.id) ? 'text-amber-400' : 'text-slate-300')
                          : 'text-slate-700'">
                    <template v-if="state.legs_config?.sets > 1">{{ player.sets_won }}S·{{ player.legs_won }}L</template>
                    <template v-else>{{ player.legs_won }}<span class="text-slate-700">/{{ legsToWin }}</span></template>
                  </span>
                </div>
                <div class="flex items-end justify-between gap-1">
                  <span class="text-lg font-black tabular-nums leading-none"
                        :class="player.cricket?.all_closed ? 'text-emerald-400' : 'text-slate-100'">
                    {{ player.cricket?.points ?? 0 }}
                  </span>
                  <div class="flex items-end gap-1.5">
                    <div class="flex flex-col items-end min-w-0" :title="t('game.cricketAvgHint')">
                      <span class="text-[7px] font-black uppercase text-amber-500 leading-none mb-px">{{ t('game.cricketAvgShort') }}</span>
                      <span class="text-sm font-black tabular-nums text-amber-100 leading-none">{{ player.avg_pts ?? '—' }}</span>
                    </div>
                    <div class="flex gap-0.5 flex-shrink-0 pb-0.5">
                      <div v-for="i in legsToWin" :key="i"
                           class="w-1 h-1 rounded-full border transition-all"
                           :class="i <= player.legs_won ? 'bg-amber-400 border-amber-400' : 'border-[#1e3050]'"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Scoreboard -->
            <div class="min-h-0 mx-2 mb-1 rounded-lg overflow-hidden border border-[#162540] bg-[#0f1c30]/95 flex flex-col shadow-inner">
              <div class="flex-shrink-0 border-b border-[#162540] py-1 px-0.5 bg-[#0a1120]/60"
                   :style="scorecardGridStyle">
                <div v-for="p in leftPlayers" :key="'lhm-'+p.id"
                     class="text-center text-[10px] font-bold truncate px-0.5 leading-tight"
                     :class="Number(p.id) === Number(state.current_player?.id) ? 'text-amber-400' : 'text-slate-500'">
                  {{ p.name }}
                </div>
                <div class="text-center text-[8px] text-slate-500 font-black uppercase tracking-wider leading-tight px-0.5">Lauks</div>
                <div v-for="p in rightPlayers" :key="'rhm-'+p.id"
                     class="text-center text-[10px] font-bold truncate px-0.5 leading-tight"
                     :class="Number(p.id) === Number(state.current_player?.id) ? 'text-amber-400' : 'text-slate-500'">
                  {{ p.name }}
                </div>
              </div>
              <div class="flex-1 min-h-0 flex flex-col overflow-y-auto">
                <div v-for="(seg, idx) in cricketSdtSegments" :key="seg"
                     class="flex-1 min-h-0 basis-0 border-b border-[#162540]/40 last:border-b-0 transition-all duration-300"
                     :class="[idx % 2 === 0 ? 'bg-[#0a1120]/25' : '', segClosedByAll(seg) ? 'opacity-30' : '']"
                     :style="scorecardRowGridStyle">
                  <div v-for="p in leftPlayers" :key="'lmm-'+p.id+'-'+seg"
                       class="flex items-center justify-center min-h-0 min-w-0 border-r border-[#162540]/30 p-px">
                    <CricketMarkCell :hits="hitsFor(p.id, seg)" :closed="segClosedByAll(seg)" size="board-sm" />
                  </div>
                  <div class="flex items-center justify-center min-h-0 min-w-0 px-px rounded mx-px my-px shadow-inner"
                       :class="segClosedByAll(seg)
                         ? 'bg-[#0a1120]/95 border border-[#1e3050]'
                         : 'border border-rose-900/40 bg-[#1a0a0f]'">
                    <div class="flex flex-col items-center justify-center leading-none gap-px">
                      <span class="font-black tabular-nums select-none text-[clamp(0.65rem,2.4vmin,0.95rem)]"
                            :class="segClosedByAll(seg) ? 'text-slate-500 line-through' : 'text-rose-300/90'">
                        {{ seg === 25 ? '25' : seg }}
                      </span>
                      <span v-if="seg === 25 && !segClosedByAll(seg)"
                            class="text-[6px] font-bold uppercase tracking-wider text-rose-400/80 leading-none">bull</span>
                    </div>
                  </div>
                  <div v-for="p in rightPlayers" :key="'rmm-'+p.id+'-'+seg"
                       class="flex items-center justify-center min-h-0 min-w-0 border-l border-[#162540]/30 p-px">
                    <CricketMarkCell :hits="hitsFor(p.id, seg)" :closed="segClosedByAll(seg)" size="board-sm" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Mobile input area -->
            <div class="min-h-0 flex flex-col overflow-y-auto overscroll-y-contain border-t border-[#162540] bg-[#0a1120]
                        px-2 pt-1.5 pb-[max(0.35rem,env(safe-area-inset-bottom))]">

              <div v-if="waitingForTurnUi" class="flex-1 min-h-0 flex flex-col items-center justify-center gap-2 py-2">
                <span class="text-slate-500 text-[10px] uppercase tracking-widest">Gaida</span>
                <span class="text-slate-100 font-bold text-sm text-center px-2">{{ state.current_player?.name }}</span>
                <div class="flex gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style="animation-delay:0ms"></span>
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style="animation-delay:150ms"></span>
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style="animation-delay:300ms"></span>
                </div>
              </div>

              <template v-else>

                <!-- Segment rows + Miss column side by side -->
                <div class="flex-shrink-0 flex gap-0.5 mb-0.5">

                  <!-- Left: segment rows + bull -->
                  <div class="flex-1 flex flex-col gap-0.5 min-w-0">
                    <div v-for="seg in cricketSdtNonBull" :key="'mr'+seg"
                         class="grid gap-0.5 items-stretch"
                         style="grid-template-columns: 1.5rem 1fr 1fr 1fr; min-height: 1.75rem">
                      <div class="flex items-center justify-center text-[11px] font-black tabular-nums leading-none rounded-md border px-0.5 min-w-0"
                           :class="segClosedByAll(seg)
                             ? 'text-slate-600 line-through opacity-40 border-[#1e3050] bg-[#0a1120]'
                             : myHitsFor(seg) >= 3
                             ? 'text-emerald-300 border-emerald-800/40 bg-emerald-950/50'
                             : 'text-rose-300/90 border-rose-900/40 bg-[#1a0a0f]'">
                        {{ seg }}
                      </div>
                      <button type="button" @click="addCricketDart(seg, 1)"
                              :disabled="segClosedByAll(seg) || dartInput.darts.length >= 3"
                              class="relative flex items-center justify-center rounded-md border font-black text-sm transition active:scale-[0.96] touch-manipulation select-none disabled:opacity-20
                                     border-slate-500/35 bg-gradient-to-b from-slate-600/40 to-slate-900/90 text-white"
                              :class="myHitsFor(seg) >= 3 ? '!border-emerald-600/40 !from-emerald-950/80 !to-emerald-950' : ''">
                        1×
                        <span v-if="myHitsFor(seg) >= 3" class="absolute right-0.5 top-0.5 text-[6px] text-emerald-400">✓</span>
                      </button>
                      <button type="button" @click="addCricketDart(seg, 2)"
                              :disabled="segClosedByAll(seg) || dartInput.darts.length >= 3"
                              class="relative flex items-center justify-center rounded-md border font-black text-sm transition active:scale-[0.96] touch-manipulation select-none disabled:opacity-20
                                     border-sky-500/40 bg-gradient-to-b from-sky-700/40 to-sky-950/90 text-sky-100"
                              :class="myHitsFor(seg) >= 3 ? '!border-emerald-600/40 !from-emerald-950/80 !to-emerald-950' : ''">
                        2×
                        <span v-if="myHitsFor(seg) >= 3" class="absolute right-0.5 top-0.5 text-[6px] text-emerald-400">✓</span>
                      </button>
                      <button type="button" @click="addCricketDart(seg, 3)"
                              :disabled="segClosedByAll(seg) || dartInput.darts.length >= 3"
                              class="relative flex items-center justify-center rounded-md border font-black text-sm transition active:scale-[0.96] touch-manipulation select-none disabled:opacity-20
                                     border-amber-500/40 bg-gradient-to-b from-amber-700/35 to-amber-950/90 text-amber-100"
                              :class="myHitsFor(seg) >= 3 ? '!border-emerald-600/40 !from-emerald-950/80 !to-emerald-950' : ''">
                        3×
                        <span v-if="myHitsFor(seg) >= 3" class="absolute right-0.5 top-0.5 text-[6px] text-emerald-400">✓</span>
                      </button>
                    </div>

                    <!-- Bull row -->
                    <div v-if="cricketSdtHasBull"
                         class="grid gap-0.5 items-stretch"
                         style="grid-template-columns: 1.5rem 1fr 2fr; min-height: 1.75rem">
                      <div class="flex items-center justify-center text-[11px] font-black rounded-md border px-0.5"
                           :class="segClosedByAll(25)
                             ? 'text-slate-600 opacity-40 border-[#1e3050] bg-[#0a1120]'
                             : myHitsFor(25) >= 3
                             ? 'text-emerald-300 border-emerald-800/40 bg-emerald-950/50'
                             : 'text-rose-300/90 border-rose-900/40 bg-[#1a0a0f]'">B</div>
                      <button type="button" @click="addCricketDart(25, 1)"
                              :disabled="segClosedByAll(25) || dartInput.darts.length >= 3"
                              class="relative flex items-center justify-center rounded-md border font-black text-sm transition active:scale-[0.96] touch-manipulation select-none disabled:opacity-20
                                     border-emerald-700/45 bg-gradient-to-b from-emerald-800/45 to-emerald-950/95 text-emerald-100"
                              :class="myHitsFor(25) >= 3 ? '!border-emerald-600/40 !from-emerald-950/80 !to-emerald-950' : ''">
                        1×
                        <span v-if="myHitsFor(25) >= 3" class="absolute right-0.5 top-0.5 text-[6px] text-emerald-400">✓</span>
                      </button>
                      <button type="button" @click="addCricketDart(25, 2)"
                              :disabled="segClosedByAll(25) || dartInput.darts.length >= 3"
                              class="relative flex items-center justify-center rounded-md border font-black text-sm transition active:scale-[0.96] touch-manipulation select-none disabled:opacity-20
                                     border-red-800/50 bg-gradient-to-b from-red-800/50 to-red-950/95 text-red-50"
                              :class="myHitsFor(25) >= 3 ? '!border-emerald-600/40 !from-emerald-950/80 !to-emerald-950' : ''">
                        2×
                        <span v-if="myHitsFor(25) >= 3" class="absolute right-1 top-0.5 text-[6px] text-emerald-400">✓</span>
                      </button>
                    </div>
                  </div>

                  <!-- Right: Miss vertical button -->
                  <button type="button" @click="addCricketDart(0, 0)"
                          :disabled="dartInput.darts.length >= 3"
                          class="flex-shrink-0 w-7 self-stretch flex items-center justify-center rounded-md border
                                 bg-[#1a0a0f] border-rose-900/40 touch-manipulation disabled:opacity-20
                                 active:scale-[0.97] transition">
                    <span class="text-rose-300/90 font-black text-[9px] uppercase tracking-widest"
                          style="writing-mode: vertical-rl; transform: rotate(180deg)">Miss</span>
                  </button>
                </div>

                <!-- Undo / Submit -->
                <div class="grid grid-cols-2 gap-1.5 flex-shrink-0 mb-1">
                  <button type="button" @click="undo"
                          class="py-1.5 bg-[#162540] hover:bg-[#1e3050] text-slate-200 rounded-xl font-bold text-xs
                                 active:scale-[0.98] border border-[#1e3050] touch-manipulation">
                    ↩ Atsaukt
                  </button>
                  <button type="button" @click="submitThrow"
                          :disabled="dartInput.darts.length === 0 || submitting"
                          class="py-1.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-black text-xs transition disabled:opacity-40
                                 active:scale-[0.98] shadow-md shadow-amber-950/25 touch-manipulation">
                    {{ submitting ? '...' : 'Iesniegt →' }}
                  </button>
                </div>

                <!-- Dart display — fills remaining space -->
                <div class="flex-1 min-h-0 flex gap-2 items-stretch overflow-hidden">
                  <div v-for="(d, i) in dartInput.darts" :key="i"
                       class="flex-1 min-w-0 min-h-0 bg-[#0d1a2e] border border-amber-500/25 rounded-xl
                              flex flex-col items-center justify-center gap-0.5 relative overflow-hidden">
                    <div class="font-mono font-black text-amber-400 leading-none tabular-nums
                                text-[clamp(1.1rem,6vw,2rem)]">{{ dartLabel(d) }}</div>
                    <div class="text-slate-500 text-[10px] tabular-nums leading-none">{{ dartValue(d) || 0 }}</div>
                    <button type="button" @click="removeDart(i)"
                            class="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-950/80 border border-rose-700/40
                                   text-rose-400 text-[9px] flex items-center justify-center active:bg-rose-800 touch-manipulation">✕</button>
                  </div>
                  <div v-for="i in (3 - dartInput.darts.length)" :key="'ep'+i"
                       class="flex-1 min-w-0 min-h-0 border border-dashed border-[#1a2a42] rounded-xl
                              flex items-center justify-center text-[#1e3050] font-mono text-xl"></div>
                </div>
              </template>

            </div>

          </div>

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

            <!-- Scoreboard -->
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
  `,
};
