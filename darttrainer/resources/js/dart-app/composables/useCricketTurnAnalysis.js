export const CRICKET_HITS_TO_CLOSE = 3;

export function cricketSegKey(seg) {
  const s = Number(seg);
  return s === 25 ? 'seg_bull' : `seg_${s}`;
}

export function cricketSegHitsFromPlayer(player, seg) {
  const c = player?.cricket;
  if (!c) return 0;
  const k = cricketSegKey(seg);
  return Math.max(0, Math.min(CRICKET_HITS_TO_CLOSE, Number(c[k] ?? 0)));
}

export function buildCricketHitsSnapshot(players, activeSegments) {
  const segs = (activeSegments || []).map(Number);
  const playerIds = (players || []).map((p) => Number(p.id));
  const hits = {};
  for (const pid of playerIds) {
    hits[pid] = {};
    const pl = (players || []).find((x) => Number(x.id) === pid);
    for (const seg of segs) {
      hits[pid][seg] = pl ? cricketSegHitsFromPlayer(pl, seg) : 0;
    }
  }
  return { hits, playerIds };
}

export function cloneCricketHits(hits, playerIds, activeSegments) {
  const segs = (activeSegments || []).map(Number);
  const out = {};
  for (const pid of playerIds) {
    out[pid] = {};
    for (const seg of segs) {
      out[pid][seg] = hits?.[pid]?.[seg] ?? 0;
    }
  }
  return out;
}

export function allPlayersClosedSegment(hits, playerIds, seg) {
  const s = Number(seg);
  return (playerIds || []).length > 0
    && playerIds.every((pid) => (hits?.[pid]?.[s] ?? 0) >= CRICKET_HITS_TO_CLOSE);
}

export function anyOpponentOpenSegment(hits, playerIds, throwerId, seg) {
  const s = Number(seg);
  const tid = Number(throwerId);
  for (const pid of (playerIds || [])) {
    if (Number(pid) === tid) continue;
    if ((hits?.[pid]?.[s] ?? 0) < CRICKET_HITS_TO_CLOSE) return true;
  }
  return false;
}

/** “Efektīvie” slēgšanas trāpījumi (0..3), kas patiešām vajadzīgi līdz 3. */
export function statHitBeforeApply(hits, playerIds, activeSegments, throwerId, segment, multiplier) {
  const segs = (activeSegments || []).map(Number);
  const seg = Number(segment);
  const mul = Number(multiplier);
  const tid = Number(throwerId);
  if (mul <= 0 || seg <= 0) return 0;
  if (!segs.includes(seg)) return 0;
  if (allPlayersClosedSegment(hits, playerIds, seg)) return 0;

  const myHits = hits?.[tid]?.[seg] ?? 0;
  if (myHits >= CRICKET_HITS_TO_CLOSE) return 0;
  return Math.min(mul, CRICKET_HITS_TO_CLOSE - myHits);
}

/** Pieliek slēgšanas trāpījumus (tikai līdz 3; punktu daļa šeit netiek simulēta). */
export function applyDartToCricketHits(hits, throwerId, segment, multiplier, activeSegments) {
  const segs = (activeSegments || []).map(Number);
  const seg = Number(segment);
  const mul = Number(multiplier);
  const tid = Number(throwerId);
  if (mul <= 0 || seg <= 0) return;
  if (!segs.includes(seg)) return;
  const current = hits?.[tid]?.[seg] ?? 0;
  if (current >= CRICKET_HITS_TO_CLOSE) return;
  const need = CRICKET_HITS_TO_CLOSE - current;
  const add = Math.min(mul, need);
  hits[tid][seg] = current + add;
}

/**
 * Izveido “turn simulator” stāvokli (H), kas ietver jau ieliktos darts šajā gājienā.
 * Tas ļauj ievades brīdī zināt “hitsBefore/needToClose” nākamajam metienam.
 */
export function simulateCricketClosingHits(players, activeSegments, throwerId, dartsSoFar) {
  const segs = (activeSegments || []).map(Number);
  const { hits, playerIds } = buildCricketHitsSnapshot(players || [], segs);
  const H = cloneCricketHits(hits, playerIds, segs);
  const tid = Number(throwerId);
  for (const d of (dartsSoFar || [])) {
    applyDartToCricketHits(H, tid, d.segment, d.multiplier, segs);
  }
  return { H, playerIds, segs, tid };
}

/**
 * Aprēķina konkrētā metiena meta-info (esošie trāpījumi, cik vajag līdz 3, vai lauks jau “dead”, utt.).
 * `hits` jābūt “simulētam” ar jau ievadītajiem darts šajā gājienā.
 */
export function cricketDartMeta({ hits, playerIds, segs, throwerId, segment, multiplier }) {
  const seg = Number(segment ?? 0);
  const mul = Number(multiplier ?? 0);
  const tid = Number(throwerId);

  const myHitsBefore = seg > 0 ? (hits?.[tid]?.[seg] ?? 0) : 0;
  const needToClose = Math.max(0, CRICKET_HITS_TO_CLOSE - myHitsBefore);
  const allClosedBefore = seg > 0 ? allPlayersClosedSegment(hits, playerIds, seg) : false;

  const effMarks = statHitBeforeApply(hits, playerIds, segs, tid, seg, mul);
  const opponentOpenBefore = seg > 0 ? anyOpponentOpenSegment(hits, playerIds, tid, seg) : false;
  const scoredEligible = (myHitsBefore >= CRICKET_HITS_TO_CLOSE) && opponentOpenBefore;

  // Dart can both close and score overflow in the same throw (e.g. had 2 hits, threw T).
  const overflow = Math.max(0, mul - effMarks);
  const closesNow = (myHitsBefore < CRICKET_HITS_TO_CLOSE) && (myHitsBefore + effMarks >= CRICKET_HITS_TO_CLOSE);
  const overflowScoredEligible = closesNow && overflow > 0 && opponentOpenBefore;

  let validAmount = 0;
  if (allClosedBefore || seg <= 0 || mul <= 0 || !(segs || []).map(Number).includes(seg)) {
    validAmount = 0;
  } else if (scoredEligible) {
    validAmount = mul;
  } else {
    validAmount = effMarks + (overflowScoredEligible ? overflow : 0);
  }
  return {
    myHitsBefore,
    needToClose,
    allClosedBefore,
    effMarks,
    scoredEligible,
    overflowScoredEligible,
    validAmount,
  };
}

/**
 * Cricket gājiena pienesums:
 * - totalMarks: kopā efektīvie slēgšanas trāpījumi (0..9)
 * - totalValid: kopā “derīgie” trāpījumi animācijām (slēgšana + punktu metieni)
 * - perDartMarks / perDartValid / perDartScored: masīvi katrai šautnei
 */
export function cricketTurnContribution(darts, activeSegments, players, throwerId) {
  const segs = (activeSegments || []).map(Number);
  const { hits, playerIds } = buildCricketHitsSnapshot(players || [], segs);
  const H = cloneCricketHits(hits, playerIds, segs);
  const tid = Number(throwerId);

  const perDartMarks = [];
  const perDartValid = [];
  const perDartScored = [];
  let totalMarks = 0;
  let totalValid = 0;

  for (const d of (darts || [])) {
    const seg = Number(d.segment ?? 0);
    const mul = Number(d.multiplier ?? 0);

    let effMarks = 0;
    let scored = false;
    let validAmount = 0;

    if (seg > 0 && mul > 0 && segs.includes(seg)) {
      const myHitsBefore = H?.[tid]?.[seg] ?? 0;
      const allClosedBefore = allPlayersClosedSegment(H, playerIds, seg);
      const opponentOpenBefore = anyOpponentOpenSegment(H, playerIds, tid, seg);

      if (!allClosedBefore) {
        effMarks = statHitBeforeApply(H, playerIds, segs, tid, seg, mul);

        // Scoring if already closed for thrower and at least one opponent still open
        if (myHitsBefore >= CRICKET_HITS_TO_CLOSE && opponentOpenBefore) {
          scored = true;
          validAmount = mul;
        } else {
          // Can close and score overflow on the same dart
          const overflow = Math.max(0, mul - effMarks);
          const closesNow = (myHitsBefore < CRICKET_HITS_TO_CLOSE) && (myHitsBefore + effMarks >= CRICKET_HITS_TO_CLOSE);
          const overflowScoredEligible = closesNow && overflow > 0 && opponentOpenBefore;
          validAmount = effMarks + (overflowScoredEligible ? overflow : 0);
        }
      }

      applyDartToCricketHits(H, tid, seg, mul, segs);
    }

    perDartMarks.push(effMarks);
    perDartScored.push(scored);
    perDartValid.push(validAmount);

    totalMarks += effMarks;
    totalValid += validAmount;
  }

  return { totalMarks, totalValid, perDartMarks, perDartValid, perDartScored };
}

export function detectCricketAchievements(darts, activeSegs, players, throwerId) {
  const segs = (activeSegs || []).map(Number);
  const { perDartMarks, perDartValid } = cricketTurnContribution(darts, segs, players, throwerId);

  // IMPORTANT:
  // “Animāciju trāpījumi” jāatbilst rezultātam, t.i. jāskaita perDartValid (validAmount),
  // nevis vienmēr pilnais multiplikators.
  let bullValidMarks = 0;
  let bullEffExists = false;
  const segAllMults = {}; // seg → Set of multipliers thrown
  const tripleSegs = [];  // all triple segments in this turn (non-bull)
  let totalValidNonBull = 0;

  for (let i = 0; i < (darts || []).length; i++) {
    const d = darts[i];
    const seg = Number(d.segment ?? 0);
    const mul = Number(d.multiplier ?? 0);
    // eslint-disable-next-line no-unused-vars
    const eff = perDartMarks[i] ?? 0;
    const validAmount = Number(perDartValid[i] ?? 0);
    const valid = validAmount > 0;
    if (!seg || !mul || !segs.includes(seg)) continue;
    if (seg === 25) {
      bullValidMarks += validAmount;
      if (valid) bullEffExists = true;
    }
    if (seg !== 25 && valid) totalValidNonBull += validAmount;
    // Special-combo metieni (T / Shanghai) skaitās tikai tad, ja metiens ir “derīgs”
    // (t.i. slēgšanas trāpījums vai punktu metiens; dead segments = 0, un animācija nedrīkst parādīties).
    if (mul === 3 && seg !== 25 && valid) tripleSegs.push(seg);
    if (valid) {
      if (!segAllMults[seg]) segAllMults[seg] = new Set();
      segAllMults[seg].add(mul);
    }
  }

  const isHolyGrail = (tripleSegs.length === 3) && (new Set(tripleSegs)).size === 1;
  const holySeg = isHolyGrail ? tripleSegs[0] : null;
  const isWhiteHorse = (tripleSegs.length === 3) && (new Set(tripleSegs)).size === 3;
  const isTriple9Split = (tripleSegs.length === 3) && (new Set(tripleSegs)).size === 2;
  const isShanghai = Object.keys(segAllMults).some((segRaw) => {
    const seg = Number(segRaw);
    if (seg === 25) return false;
    const mults = segAllMults[seg];
    return !!(mults && mults.has(1) && mults.has(2) && mults.has(3));
  });

  const ach = (tier, emoji, title, sub, color, glow, extra = {}) => ({
    tier,
    emoji,
    title,
    sub,
    color,
    glow,
    shake: false,
    fullScreen: false,
    duration: 2200,
    ...extra,
  });

  if (isHolyGrail) {
    return ach('holyGrail', '✨', 'Holy Grail', `3× triple vienā laukā · T${holySeg}`, '#fde68a', '#f59e0b',
      { shake: true, fullScreen: true, duration: 4200 });
  }
  if (isWhiteHorse) {
    return ach('whitehorse', '🐴', 'White Horse!', '3 triples · 3 dažādi lauki', '#e2e8f0', '#94a3b8',
      { fullScreen: true, duration: 3500 });
  }
  if (isTriple9Split) {
    return ach('tripleTriples', '💥', '9 trāpījumi', '2× triple vienā laukā + 1× triple citā', '#fcd34d', '#f59e0b',
      { shake: true, duration: 2800 });
  }
  if (isShanghai) {
    return ach('shanghai', '⛩️', 'Shanghai!', 'Single · Double · Triple (vienā laukā)', '#fca5a5', '#ef4444',
      { duration: 2800 });
  }

  if (totalValidNonBull >= 8) {
    return ach('insaneMark', '🔥', 'Insane Mark!', '8 trāpījumi', '#fbbf24', '#d97706',
      { shake: true, duration: 3200 });
  }
  if (totalValidNonBull >= 7) {
    return ach('ultraMark', '💥', 'Ultra Mark!', '7 trāpījumi', '#f9a8d4', '#ec4899',
      { shake: true, duration: 2900 });
  }
  if (bullValidMarks >= 6 && bullEffExists) {
    return ach('rodeo', '🤠', 'Rodeo!', '3× Double Bull', '#fcd34d', '#d97706', { duration: 3000 });
  }
  if (totalValidNonBull >= 6) {
    return ach('megaMark', '⚡', 'Mega Mark!', '6 trāpījumi', '#fde047', '#eab308',
      { shake: true, duration: 2700 });
  }
  if (totalValidNonBull >= 5) {
    return ach('superMark', '🎇', 'Super Mark!', '5 trāpījumi', '#fb923c', '#ea580c',
      { duration: 2300 });
  }
  if (bullValidMarks >= 3 && bullEffExists) {
    return ach('bulls3', '🎯', `${bullValidMarks} Bull!`, `Bull trāpījumi: ${bullValidMarks}`, '#f87171', '#dc2626',
      { duration: 2200 });
  }
  if (totalValidNonBull >= 4) {
    return ach('bigMark', '⬡', 'Big Mark!', '4 trāpījumi', '#93c5fd', '#3b82f6',
      { duration: 1800 });
  }
  return null;
}

