<?php

namespace App\Services;

use App\Models\GameMatch;
use App\Models\GameRoom;
use App\Models\Leg;
use App\Models\RoomPlayer;
use App\Models\Turn;
use App\Services\CricketEngine;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class GameStateManager
{
    /** Gājiena laika limits (sekundes) — pēc tam pretiniekam tiek piedāvāta izvēle. */
    public const TURN_TIMER_MAIN_SECONDS = 30;

    /** Papildu minūte pēc pretinieka piekrišanas. */
    public const TURN_TIMER_EXTRA_SECONDS = 60;

    public function __construct(
        private readonly X01Engine $x01,
        private readonly CricketEngine $cricket,
        private readonly MatchArchiver $archiver,
    ) {}

    /**
     * Ja pašreizējā kārta ir pārsniegusi termiņu, ieslēdz gaidīšanu pretinieka lēmumam.
     */
    public static function turnTimerSchemaReady(): bool
    {
        static $ready = null;
        if ($ready === null) {
            $ready = Schema::hasColumn('matches', 'turn_deadline_at');
        }

        return $ready;
    }

    /** Taimeris tikai 2–4 aktīviem (ne-spectator) spēlētājiem. */
    public function activeCompetitorCount(GameMatch $match): int
    {
        $match->loadMissing('room');

        return (int) $match->room->activePlayers()->count();
    }

    public function useTurnTimerForMatch(GameMatch $match): bool
    {
        if (!self::turnTimerSchemaReady()) {
            return false;
        }

        if ($match->status !== 'active') {
            return false;
        }

        $match->loadMissing('room');
        // Lokālajā spēlē taimeris netiek lietots.
        if ($match->room && $match->room->isLocalPlay()) {
            return false;
        }

        return $this->activeCompetitorCount($match) >= 2;
    }

    /** Noņem taimera laukus, ja spēlētāju kļuvis < 2 vai funkcija izslēgta. */
    public function clearTurnTimerState(GameMatch $match): void
    {
        if (!self::turnTimerSchemaReady()) {
            return;
        }

        $match->refresh();

        if (!$match->turn_deadline_at && !$match->turn_timeout_pending) {
            return;
        }

        $match->turn_deadline_at = null;
        $match->turn_timeout_pending = false;
        $match->updated_at = now();
        $match->save();
    }

    public function evaluateTurnTimeout(GameMatch $match): void
    {
        if (!$this->useTurnTimerForMatch($match)) {
            return;
        }

        $match->refresh();

        if (!$match->current_player_id || !$match->turn_deadline_at) {
            return;
        }

        if ($match->turn_timeout_pending) {
            return;
        }

        if (now()->lte($match->turn_deadline_at)) {
            return;
        }

        $match->turn_timeout_pending = true;
        $match->updated_at = now();
        $match->save();
    }

    /** Aktīvām spēlēm pirms taimera ieviešanas — vienu reizi iestāda termiņu. */
    public function ensureTurnDeadlineExists(GameMatch $match): void
    {
        if (!$this->useTurnTimerForMatch($match)) {
            return;
        }

        $match->refresh();

        if (!$match->current_player_id) {
            return;
        }

        if ($match->turn_deadline_at || $match->turn_timeout_pending) {
            return;
        }

        $this->bumpTurnDeadline($match, self::TURN_TIMER_MAIN_SECONDS);
    }

    /**
     * Jauna termiņa atskaite (pēc metiena, undo, spēles sākuma vai papildu minūtes).
     */
    public function bumpTurnDeadline(GameMatch $match, int $seconds): void
    {
        if (!$this->useTurnTimerForMatch($match)) {
            return;
        }

        $match->refresh();

        if (!$match->current_player_id) {
            return;
        }

        $match->turn_timeout_pending = false;
        $match->turn_timer_window_seconds = $seconds;
        $match->turn_deadline_at = now()->addSeconds($seconds);
        $match->updated_at = now();
        $match->save();
    }

    /**
     * Build a full state snapshot for polling.
     * This is the primary response for GET /api/games/{match_id}/state.
     */
    public function buildSnapshot(GameMatch $match): array
    {
        $match->loadMissing('room');

        $useTurnTimer = $this->useTurnTimerForMatch($match);

        if (self::turnTimerSchemaReady() && $match->status === 'active' && !$useTurnTimer) {
            $this->clearTurnTimerState($match);
        }

        if ($useTurnTimer) {
            $this->evaluateTurnTimeout($match);
            $this->ensureTurnDeadlineExists($match);
            $match->refresh();
        }

        // Eager-load room and player relations
        $match->load(['room.players.user', 'currentPlayer']);

        $room     = $match->room;
        $gameType = $room->game_type;
        $config   = $room->game_config;

        // Query the current leg directly to avoid a Laravel HasOne eager-loading bug
        // where ->where($this->property) constraints are lost during ->load()
        $currentLeg = Leg::where('match_id', $match->id)
            ->where('leg_number', $match->current_leg)
            ->where('set_number', $match->current_set)
            ->first();

        // Pre-load cricket states for this leg (avoids N+1)
        $cricketStates = null;
        if ($gameType === 'cricket' && $currentLeg) {
            $cricketStates = \App\Models\CricketState::where('leg_id', $currentLeg->id)->get();
        }

        $activeSegments = $config['cricket_segments'] ?? CricketEngine::STANDARD_SEGMENTS;

        // Cricket: aprēķinām vidējo visiem spēlētājiem vienā caurlaidē (lai nav N× smags aprēķins).
        $cricketAvgPtsByPlayer = [];
        if ($gameType === 'cricket') {
            $cricketAvgPtsByPlayer = $this->calcCricketAvgPtsForPlayers($match);
        }

        $visitsByPlayer = [];
        if ($gameType === 'x01' && $currentLeg) {
            foreach ($room->activePlayers as $p) {
                $visitsByPlayer[(int) $p->id] = [];
            }
            $legTurns = Turn::where('leg_id', $currentLeg->id)
                ->where('is_undone', false)
                ->orderBy('id')
                ->get(['player_id', 'total_scored', 'is_bust']);
            foreach ($legTurns as $t) {
                $pid = (int) $t->player_id;
                if (!array_key_exists($pid, $visitsByPlayer)) {
                    $visitsByPlayer[$pid] = [];
                }
                $visitsByPlayer[$pid][] = [
                    'pts'  => (int) $t->total_scored,
                    'bust' => (bool) $t->is_bust,
                ];
            }
        }

        $playersData = $room->activePlayers->map(function (RoomPlayer $player) use ($match, $currentLeg, $gameType, $config, $cricketStates, $activeSegments, $visitsByPlayer, $cricketAvgPtsByPlayer) {
            $data = [
                'id'           => $player->id,
                'name'         => $player->display_name,
                'order'        => $player->order,
                'team'         => $player->team,
                'is_spectator' => $player->is_spectator,
                'sets_won'     => $this->countSetsWon($match, $player->id),
                'legs_won'     => $this->countLegsWon($match, $player->id),
            ];

            if ($gameType === 'x01' && $currentLeg) {
                $data['remaining'] = $this->calcRemaining($currentLeg, $player->id, $config);
                $data['checkout']  = $this->x01->suggestCheckout($data['remaining']);
                $data['avg']       = $this->calcAverage($match, $player->id);
                $data['visits_this_leg'] = $visitsByPlayer[(int) $player->id] ?? [];
            }

            if ($gameType === 'cricket' && $cricketStates !== null) {
                $state = $cricketStates->firstWhere('player_id', $player->id);
                if ($state) {
                    $cricketData = [
                        'points'     => $state->points,
                        'all_closed' => $state->allClosed($activeSegments),
                    ];
                    // Build hit counts for every active segment using the JSON data
                    foreach ($activeSegments as $seg) {
                        $key = $seg === 25 ? 'seg_bull' : 'seg_' . $seg;
                        $cricketData[$key] = $state->getSegmentHits($seg);
                    }
                    $data['cricket'] = $cricketData;
                }
            }

            // Cricket “vidējais” jābūt visiem spēlētājiem, arī ja kādam nav ielasīts stāvoklis (drošībai).
            if ($gameType === 'cricket') {
                $data['avg_pts'] = $cricketAvgPtsByPlayer[(int) $player->id] ?? 0.0;
            }

            return $data;
        })->values()->toArray();

        $currentTurn = $this->currentTurnDarts($match, $currentLeg);

        $undoAvailable = false;
        if ($match->status === 'active' && $currentLeg) {
            $undoAvailable = Turn::where('leg_id', $currentLeg->id)
                ->where('is_undone', false)
                ->exists();
        }

        return [
            'match_id'         => $match->id,
            'room_id'          => (int) $match->room_id,
            'room_code'        => $room->code,
            'host_user_id'     => (int) $room->host_user_id,
            'play_mode'        => $room->play_mode ?? 'online',
            'status'           => $match->status,
            'undo_available'   => $undoAvailable,
            'updated_at'       => $match->updated_at?->toIso8601String(),
            'game_type'        => $gameType,
            'game_config'      => $config,
            'cricket_segments' => $gameType === 'cricket'
                ? ($config['cricket_segments'] ?? CricketEngine::STANDARD_SEGMENTS)
                : null,
            'current_leg'    => $match->current_leg,
            'current_set'    => $match->current_set,
            'legs_config'    => $match->legs_config,
            'current_player' => [
                'id'      => $match->currentPlayer?->id,
                'user_id' => $match->currentPlayer?->user_id,
                'name'    => $match->currentPlayer?->display_name,
            ],
            'players'        => $playersData,
            'current_turn'   => $currentTurn,
            'winner'         => $match->winner ? [
                'id'   => $match->winner->id,
                'name' => $match->winner->display_name,
            ] : null,
            'use_turn_timer' => $useTurnTimer,
            'turn_timer' => $useTurnTimer ? [
                'deadline_at'    => $match->turn_deadline_at?->toIso8601String(),
                'pending'        => (bool) $match->turn_timeout_pending,
                'window_seconds' => (int) ($match->turn_timer_window_seconds ?? self::TURN_TIMER_MAIN_SECONDS),
            ] : [
                'deadline_at'    => null,
                'pending'        => false,
                'window_seconds' => self::TURN_TIMER_MAIN_SECONDS,
            ],
            'exclude_from_stats' => self::turnTimerSchemaReady() ? (bool) $match->exclude_from_stats : false,
        ];
    }

    public function nextPlayer(GameMatch $match): RoomPlayer
    {
        $players = $match->room->activePlayers()->orderBy('order')->get();
        $currentOrder = $match->currentPlayer->order;

        $next = $players->firstWhere('order', '>', $currentOrder)
            ?? $players->first();

        $match->current_player_id = $next->id;
        $match->save();

        return $next;
    }

    public function advanceLeg(GameMatch $match, int $winnerId): void
    {
        $currentLeg = $match->currentLeg()->first();
        if ($currentLeg) {
            $currentLeg->winner_player_id = $winnerId;
            $currentLeg->finished_at = now();
            $currentLeg->save();
        }

        $legsConfig = $match->legs_config;
        $legsToWin  = (int) ceil($legsConfig['legs'] / 2);

        $legsWon = $this->countLegsWon($match, $winnerId);

        if ($legsWon >= $legsToWin) {
            // Player won the set
            $this->advanceSet($match, $winnerId);
            return;
        }

        // Start next leg
        $match->current_leg++;
        $match->save();

        $this->createLeg($match);
    }

    /**
     * `legs_config.sets` = tieši tik setu jāizspēlē (nav “best of” pēc setiem).
     * Mačs beidzas pēc pēdējā seta; kopējo uzvarētāju nosaka pēc uzvarēto setu skaita,
     * vienādībā — pēc legu skaita visā mačā, tad pēdējā seta uzvarētājs.
     */
    private function advanceSet(GameMatch $match, int $setWinnerId): void
    {
        $totalSets = max(1, (int) ($match->legs_config['sets'] ?? 1));

        if ($match->current_set >= $totalSets) {
            $this->finishMatchAfterScheduledSets($match, $setWinnerId);
            return;
        }

        $match->current_set++;
        $match->current_leg = 1;
        $match->save();

        $this->createLeg($match);
    }

    private function finishMatchAfterScheduledSets(GameMatch $match, int $lastSetWinnerId): void
    {
        $match->loadMissing('room');
        $players = $match->room->activePlayers()->orderBy('order')->get();

        $stats = [];
        foreach ($players as $p) {
            $pid = (int) $p->id;
            $stats[$pid] = [
                'sets' => $this->countSetsWon($match, $pid),
                'legs' => $this->countMatchLegsWon($match, $pid),
            ];
        }

        $ids = $players->map(fn ($p) => (int) $p->id)->values()->all();
        usort($ids, function (int $pidA, int $pidB) use ($stats, $lastSetWinnerId) {
            $sa = $stats[$pidA]['sets'];
            $sb = $stats[$pidB]['sets'];
            if ($sa !== $sb) {
                return $sb <=> $sa;
            }
            $la = $stats[$pidA]['legs'];
            $lb = $stats[$pidB]['legs'];
            if ($la !== $lb) {
                return $lb <=> $la;
            }
            if ($pidA === $lastSetWinnerId) {
                return -1;
            }
            if ($pidB === $lastSetWinnerId) {
                return 1;
            }

            return $pidA <=> $pidB;
        });

        $winnerId = $ids[0] ?? $lastSetWinnerId;

        $match->status           = 'finished';
        $match->winner_player_id = $winnerId;
        $match->finished_at      = now();
        $match->save();

        $match->room->status = 'finished';
        $match->room->save();

        // Pabeigtam mačam: izveido protokola snapshot + arhivē metienus/statistiku.
        $this->archiver->archiveIfTerminal($match);
    }

    private function countMatchLegsWon(GameMatch $match, int $roomPlayerId): int
    {
        return Leg::where('match_id', $match->id)
            ->where('winner_player_id', $roomPlayerId)
            ->count();
    }

    public function createLeg(GameMatch $match): Leg
    {
        $config = $match->room->game_config;
        $leg = Leg::create([
            'match_id'       => $match->id,
            'leg_number'     => $match->current_leg,
            'set_number'     => $match->current_set,
            'starting_score' => $config['variant'] ?? null,
        ]);

        if ($match->room->game_type === 'cricket') {
            $segments = $config['cricket_segments'] ?? CricketEngine::STANDARD_SEGMENTS;
            $playerIds = $match->room->activePlayers()->pluck('id')->toArray();
            $this->cricket->initStates($leg, $playerIds, $segments);
        }

        $this->assignLegStarter($match);

        return $leg;
    }

    /**
     * Katru jaunu legu sāk nākamais spēlētājs pēc kārtas (2 spēlētāji — maiņās; vairāk — pa apli).
     */
    public function assignLegStarter(GameMatch $match): void
    {
        $match->loadMissing('room');
        $players = $match->room->activePlayers()->orderBy('order')->get();
        if ($players->isEmpty()) {
            return;
        }

        $n = $players->count();
        $finishedLegs = Leg::where('match_id', $match->id)->whereNotNull('winner_player_id')->count();
        $idx = $finishedLegs % $n;
        $starter = $players->values()->get($idx);
        if ($starter) {
            $match->current_player_id = $starter->id;
            $match->save();
        }
    }

    /**
     * Average effective hit marks per turn for cricket (replay).
     * Misses, inactive segments, and darts on segments already closed by everyone do not count.
     */
    private function calcCricketAvgPts(GameMatch $match, int $roomPlayerId): float
    {
        $turns = Turn::where('match_id', $match->id)
            ->where('player_id', $roomPlayerId)
            ->where('is_undone', false)
            ->count();

        if ($turns === 0) {
            return 0.0;
        }

        $room            = $match->room;
        $config          = $room->game_config ?? [];
        $activeSegments  = $config['cricket_segments'] ?? CricketEngine::STANDARD_SEGMENTS;
        $playerIds       = $room->activePlayers()->pluck('id')->values()->all();

        $totalEffective = 0.0;

        $legs = Leg::where('match_id', $match->id)
            ->orderBy('set_number')
            ->orderBy('leg_number')
            ->get();

        foreach ($legs as $leg) {
            $hits = [];
            foreach ($playerIds as $pid) {
                foreach ($activeSegments as $seg) {
                    $hits[$pid][$seg] = 0;
                }
            }

            $legTurns = Turn::where('leg_id', $leg->id)
                ->where('is_undone', false)
                ->orderBy('id')
                ->with(['darts' => fn ($q) => $q->orderBy('dart_number')])
                ->get();

            foreach ($legTurns as $turn) {
                foreach ($turn->darts as $dart) {
                    $tid  = (int) $turn->player_id;
                    $seg  = (int) $dart->segment;
                    $mult = (int) $dart->multiplier;

                    if ($tid === $roomPlayerId) {
                        // “Vidējais” spēles laukumā skaita trāpījumu reizes (S=1,D=2,T=3),
                        // nevis “cik šautriņas trāpīja”.
                        // Tāpēc ieskaitām:
                        // - slēgšanas trāpījumus (līdz 3) = statHitMultiplierBeforeApply
                        // - punktu trāpījumus pēc slēgšanas, ja segments vēl nav “dead” visiem.
                        $validAmount = 0;
                        if ($mult > 0 && $seg > 0 && in_array($seg, $activeSegments, true)) {
                            $myHitsBefore = (int) ($hits[$tid][$seg] ?? 0);
                            $allClosedBefore = true;
                            foreach ($playerIds as $pid) {
                                if ((int) ($hits[$pid][$seg] ?? 0) < CricketEngine::HITS_TO_CLOSE) {
                                    $allClosedBefore = false;
                                    break;
                                }
                            }

                            if ($myHitsBefore >= CricketEngine::HITS_TO_CLOSE && !$allClosedBefore) {
                                // Punktu metiens (segments jau slēgts man, bet vēl atvērts kādam citam)
                                $validAmount = $mult;
                            } else {
                                // Slēgšanas metiens (tikai tik, cik patiešām vajag līdz 3)
                                $validAmount = $this->cricket->statHitMultiplierBeforeApply(
                                    $hits,
                                    $playerIds,
                                    $activeSegments,
                                    $tid,
                                    $seg,
                                    $mult
                                );
                            }
                        }
                        $totalEffective += $validAmount;
                    }

                    $this->cricket->applyDartToHitMap($hits, $tid, $seg, $mult, $activeSegments);
                }
            }
        }

        return round($totalEffective / $turns, 1);
    }

    /**
     * Cricket “avg_pts” visiem spēlētājiem.
     * Skaita trāpījumu reizes (S=1,D=2,T=3), kur derīgums atbilst spēles loģikai:
     * - slēgšanas trāpījumi (līdz 3) skaitās pēc statHitMultiplierBeforeApply
     * - ja spēlētājam segments jau slēgts, bet vēl nav “dead” visiem, tad skaitās pilns multiplikators (punktu metiens)
     *
     * @return array<int, float> [room_player_id => avg_pts]
     */
    private function calcCricketAvgPtsForPlayers(GameMatch $match): array
    {
        $match->loadMissing('room');

        $room           = $match->room;
        $config         = $room->game_config ?? [];
        $activeSegments = $config['cricket_segments'] ?? CricketEngine::STANDARD_SEGMENTS;
        $playerIds      = $room->activePlayers()->pluck('id')->values()->all();

        // Turns count per player (match-wide)
        $turnCounts = Turn::where('match_id', $match->id)
            ->whereIn('player_id', $playerIds)
            ->where('is_undone', false)
            ->selectRaw('player_id, COUNT(*) as c')
            ->groupBy('player_id')
            ->pluck('c', 'player_id')
            ->toArray();

        $totals = [];
        foreach ($playerIds as $pid) {
            $totals[(int) $pid] = 0.0;
        }

        $legs = Leg::where('match_id', $match->id)
            ->orderBy('set_number')
            ->orderBy('leg_number')
            ->get();

        foreach ($legs as $leg) {
            // Hit map reset per leg
            $hits = [];
            foreach ($playerIds as $pid) {
                foreach ($activeSegments as $seg) {
                    $hits[$pid][$seg] = 0;
                }
            }

            $legTurns = Turn::where('leg_id', $leg->id)
                ->where('is_undone', false)
                ->orderBy('id')
                ->with(['darts' => fn ($q) => $q->orderBy('dart_number')])
                ->get();

            foreach ($legTurns as $turn) {
                $tid = (int) $turn->player_id;
                foreach ($turn->darts as $dart) {
                    $seg  = (int) $dart->segment;
                    $mult = (int) $dart->multiplier;

                    if (array_key_exists($tid, $totals)) {
                        $validAmount = 0;
                        if ($mult > 0 && $seg > 0 && in_array($seg, $activeSegments, true)) {
                            $myHitsBefore = (int) ($hits[$tid][$seg] ?? 0);

                            $allClosedBefore = true;
                            foreach ($playerIds as $pid) {
                                if ((int) ($hits[$pid][$seg] ?? 0) < CricketEngine::HITS_TO_CLOSE) {
                                    $allClosedBefore = false;
                                    break;
                                }
                            }

                            if ($myHitsBefore >= CricketEngine::HITS_TO_CLOSE && !$allClosedBefore) {
                                $validAmount = $mult;
                            } else {
                                $validAmount = $this->cricket->statHitMultiplierBeforeApply(
                                    $hits,
                                    $playerIds,
                                    $activeSegments,
                                    $tid,
                                    $seg,
                                    $mult
                                );
                            }
                        }

                        $totals[$tid] += $validAmount;
                    }

                    $this->cricket->applyDartToHitMap($hits, $tid, $seg, $mult, $activeSegments);
                }
            }
        }

        $out = [];
        foreach ($playerIds as $pid) {
            $turns = (int) ($turnCounts[$pid] ?? 0);
            $out[(int) $pid] = $turns > 0 ? round(((float) $totals[(int) $pid]) / $turns, 1) : 0.0;
        }

        return $out;
    }

    private function calcRemaining(Leg $leg, int $playerId, array $config): int
    {
        $startingScore = $leg->starting_score ?? ($config['variant'] ?? 501);

        $scored = Turn::where('leg_id', $leg->id)
            ->where('player_id', $playerId)
            ->where('is_bust', false)
            ->where('is_undone', false)
            ->sum('total_scored');

        return $startingScore - $scored;
    }

    private function calcAverage(GameMatch $match, int $playerId): float
    {
        $turns = Turn::where('match_id', $match->id)
            ->where('player_id', $playerId)
            ->where('is_bust', false)
            ->where('is_undone', false)
            ->withCount('darts')
            ->get();

        if ($turns->isEmpty()) {
            return 0.0;
        }

        $totalScored = $turns->sum('total_scored');
        $totalDarts  = $turns->sum('darts_count');

        if ($totalDarts === 0) {
            return 0.0;
        }

        return round($totalScored / $totalDarts * 3, 2);
    }

    private function countLegsWon(GameMatch $match, int $playerId): int
    {
        return Leg::where('match_id', $match->id)
            ->where('set_number', $match->current_set)
            ->where('winner_player_id', $playerId)
            ->count();
    }

    private function countSetsWon(GameMatch $match, int $playerId): int
    {
        $legsPerSet = $match->legs_config['legs'] ?? 1;
        $legsToWin  = (int) ceil($legsPerSet / 2);

        $setWins = 0;
        $maxSet  = $match->current_set;

        for ($set = 1; $set <= $maxSet; $set++) {
            $won = Leg::where('match_id', $match->id)
                ->where('set_number', $set)
                ->where('winner_player_id', $playerId)
                ->count();
            if ($won >= $legsToWin) {
                $setWins++;
            }
        }

        return $setWins;
    }

    private function currentTurnDarts(GameMatch $match, ?Leg $leg): array
    {
        if (!$leg) {
            return [];
        }

        $lastTurn = Turn::where('leg_id', $leg->id)
            ->where('player_id', $match->current_player_id)
            ->where('is_undone', false)
            ->latest('id')
            ->first();

        if (!$lastTurn) {
            return ['darts' => [], 'remaining_darts' => 3];
        }

        $darts = $lastTurn->darts()->get()->map(fn($d) => [
            'segment'    => $d->segment,
            'multiplier' => $d->multiplier,
            'value'      => $d->value,
            'label'      => $d->getLabel(),
        ])->toArray();

        return [
            'turn_id'        => $lastTurn->id,
            'darts'          => $darts,
            'remaining_darts' => 3 - count($darts),
            'total_scored'   => $lastTurn->total_scored,
        ];
    }

    /**
     * Pārtraukts mačs: dzēš mača rindu (CASCADE attīra legs, turns, darts, cricket_state),
     * telpu atzīmē kā abandoned.
     */
    public function abandonAndPurgeMatch(GameMatch $match): void
    {
        DB::transaction(function () use ($match) {
            $match->refresh();
            $match->loadMissing('room');
            $room = $match->room;

            $this->clearTurnTimerState($match);
            // Nelietojam "purge": saglabājam protokolu/statistiku, bet atzīmējam kā abandoned.
            $match->status = 'abandoned';
            $match->finished_at = now();
            $match->updated_at = now();
            $match->save();

            if ($room) {
                $room->status = 'abandoned';
                $room->save();
            }

            $this->archiver->archiveIfTerminal($match);
        });
    }
}
