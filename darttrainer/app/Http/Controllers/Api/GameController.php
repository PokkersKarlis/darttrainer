<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CricketState;
use App\Models\Dart;
use App\Models\GameMatch;
use App\Models\Leg;
use App\Models\Turn;
use App\Services\CricketEngine;
use App\Services\GameStateManager;
use App\Services\MatchArchiver;
use App\Services\MatchReportService;
use App\Services\X01Engine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class GameController extends Controller
{
    public function __construct(
        private readonly GameStateManager $stateManager,
        private readonly X01Engine $x01,
        private readonly CricketEngine $cricket,
        private readonly MatchReportService $matchReport,
        private readonly MatchArchiver $archiver,
    ) {}

    public function state(Request $request, GameMatch $match): JsonResponse|Response
    {
        $this->authorizeMatchAccess($match);
        $ifNoneMatch = $request->header('If-None-Match');

        // Turn taimeris var izraisīt "laika" stāvokļa maiņu (pending), pat ja DB vēl nav mainīts.
        // Ja termiņš ir pārsniegts, vispirms aprēķinām timeout, lai ETag/304 loģika nepaslēpj modāli līdz reload.
        if (GameStateManager::turnTimerSchemaReady()
            && $this->stateManager->useTurnTimerForMatch($match)
            && $match->status === 'active'
            && $match->turn_deadline_at
            && !$match->turn_timeout_pending
            && now()->gt($match->turn_deadline_at)) {
            $this->stateManager->evaluateTurnTimeout($match);
            $match->refresh();
        }

        $etag = $this->matchEtag($match);

        if ($ifNoneMatch && trim($ifNoneMatch) === $etag) {
            return response()->noContent(304, ['ETag' => $etag]);
        }

        return response()->json($this->stateManager->buildSnapshot($match), 200, ['ETag' => $etag]);
    }

    public function submitThrow(Request $request, GameMatch $match): JsonResponse
    {
        $this->authorizeMatchAccess($match);
        $this->authorizeCurrentPlayer($match);

        if ($match->status !== 'active') {
            return response()->json(['error' => 'Spēle nav aktīva.'], 409);
        }

        $match->refresh();

        $data = $request->validate([
            'darts'              => 'required|array|min:1|max:3',
            'darts.*.segment'    => 'required|integer|min:0|max:25',
            'darts.*.multiplier' => 'required|integer|min:0|max:3',
        ]);

        $outMode = $match->room->game_config['out'] ?? X01Engine::OUT_DOUBLE;
        $inMode  = $match->room->game_config['in'] ?? X01Engine::IN_STRAIGHT;

        // Compute values (segment=0 / multiplier=0 = Miss, worth 0 pts)
        $darts = array_map(fn ($dart) => [
            'segment'    => $dart['segment'],
            'multiplier' => $dart['multiplier'],
            'value'      => $dart['segment'] * $dart['multiplier'],
        ], $data['darts']);

        if ($match->room->game_type === 'x01' && !empty($darts)) {
            $leg      = $match->currentLeg()->first();
            $playerId = $match->current_player_id;
            if ($leg && $playerId) {
                $hasOpened = Turn::where('leg_id', $leg->id)
                    ->where('player_id', $playerId)
                    ->where('is_undone', false)
                    ->where('is_bust', false)
                    ->where('total_scored', '>', 0)
                    ->exists();
                $needDblIn = ($inMode === X01Engine::IN_DOUBLE) && !$hasOpened;
                if (!$this->x01->validateDoubleIn($darts, $needDblIn ? X01Engine::IN_DOUBLE : X01Engine::IN_STRAIGHT)) {
                    return response()->json(['error' => 'Double-in: pirmajam punktu metienam jābūt dubultajam.'], 422);
                }
            }
        }

        $gameType = $match->room->game_type;
        $config   = $match->room->game_config;
        $leg      = $match->currentLeg()->first();
        $playerId = $match->current_player_id;

        if ($gameType === 'x01') {
            return $this->handleX01Throw($match, $leg, $playerId, $darts, $config);
        }

        if ($gameType === 'cricket') {
            return $this->handleCricketThrow($match, $leg, $playerId, $darts, $config);
        }

        return response()->json(['error' => 'Spēles tips neatbalsta šo endpoint.'], 422);
    }

    public function undo(GameMatch $match): JsonResponse
    {
        $this->authorizeMatchAccess($match);
        $this->authorizeCurrentPlayer($match);

        $match->refresh();
        if ($match->status !== 'active') {
            return response()->json(['error' => 'Spēle nav aktīva.'], 409);
        }

        $leg = $match->currentLeg()->first();
        if (!$leg) {
            return response()->json(['error' => 'Nav aktīvas leg.'], 422);
        }

        $lastTurn = Turn::where('leg_id', $leg->id)
            ->where('is_undone', false)
            ->latest('id')
            ->first();

        if (!$lastTurn) {
            return response()->json(['error' => 'Nav ko atcelt.'], 422);
        }

        $lastTurn->is_undone = true;
        $lastTurn->save();

        // Revert cricket state if needed
        if ($match->room->game_type === 'cricket') {
            $this->revertCricketState($match, $leg, $lastTurn);
        }

        // Restore previous player's turn
        $match->current_player_id = $lastTurn->player_id;
        $match->save();

        $match->refresh();
        $this->stateManager->bumpTurnDeadline($match, GameStateManager::TURN_TIMER_MAIN_SECONDS);

        return response()->json($this->stateManager->buildSnapshot($match->fresh()));
    }

    /**
     * Pretinieks piešķir +1 min pašreizējai kārtai (pēc galvenā taimera beigām).
     */
    public function turnTimeoutGrantExtra(GameMatch $match): JsonResponse
    {
        $this->authorizeMatchAccess($match);
        $this->authorizeNotCurrentPlayer($match);

        if (!GameStateManager::turnTimerSchemaReady()) {
            return response()->json(['error' => 'Palaid datubāzes migrāciju: php artisan migrate'], 503);
        }

        if (!$this->stateManager->useTurnTimerForMatch($match)) {
            return response()->json(['error' => 'Gājiena taimeris nav aktivizēts (vajag vismaz 2 spēlētājus).'], 422);
        }

        $match->refresh();
        if ($match->status !== 'active' || !$match->turn_timeout_pending) {
            return response()->json(['error' => 'Nav gaidošas izvēles.'], 409);
        }

        $this->stateManager->bumpTurnDeadline($match, GameStateManager::TURN_TIMER_EXTRA_SECONDS);

        return response()->json($this->stateManager->buildSnapshot($match->fresh()));
    }

    /**
     * Pretinieks beidz spēli pēc gājiena laika — bez statistikas saglabāšanas (exclude_from_stats).
     */
    public function turnTimeoutEndNoStats(GameMatch $match): JsonResponse
    {
        $this->authorizeMatchAccess($match);
        $this->authorizeNotCurrentPlayer($match);

        if (!GameStateManager::turnTimerSchemaReady()) {
            return response()->json(['error' => 'Palaid datubāzes migrāciju: php artisan migrate'], 503);
        }

        if (!$this->stateManager->useTurnTimerForMatch($match)) {
            return response()->json(['error' => 'Gājiena taimeris nav aktivizēts (vajag vismaz 2 spēlētājus).'], 422);
        }

        $match->load('room');
        $match->refresh();

        if ($match->status !== 'active' || !$match->turn_timeout_pending) {
            return response()->json(['error' => 'Nav gaidošas izvēles.'], 409);
        }

        $match->exclude_from_stats = true;
        $match->turn_timeout_pending = false;
        $match->turn_deadline_at = null;
        $match->status = 'abandoned';
        $match->finished_at = now();
        $match->updated_at = now();
        $match->save();

        $match->room->update(['status' => 'abandoned']);

        $this->archiver->archiveIfTerminal($match);

        return response()->json($this->stateManager->buildSnapshot($match->fresh()));
    }

    public function history(GameMatch $match): JsonResponse
    {
        $this->authorizeMatchAccess($match);

        // Pabeigtos mačos metieni var būt arhivēti.
        if ($match->archived_at) {
            $turns = DB::table('turns_archive as t')
                ->join('room_players as rp', 'rp.id', '=', 't.player_id')
                ->where('t.match_id', $match->id)
                ->orderBy('t.id')
                ->get([
                    't.id', 't.leg_id', 't.total_scored', 't.is_bust', 't.is_checkout', 't.is_undone',
                    'rp.guest_name',
                ])
                ->map(function ($t) {
                    $darts = DB::table('darts_archive')
                        ->where('turn_id', (int) $t->id)
                        ->orderBy('dart_number')
                        ->get(['segment', 'multiplier'])
                        ->map(function ($d) {
                            $seg = (int) $d->segment;
                            $mul = (int) $d->multiplier;
                            if ($seg === 0 || $mul === 0) return 'MISS';
                            if ($seg === 25) return $mul === 2 ? 'DBULL' : 'BULL';
                            return ($mul === 3 ? 'T' : ($mul === 2 ? 'D' : '')) . $seg;
                        })
                        ->values()
                        ->all();

                    return [
                        'id'          => (int) $t->id,
                        'player'      => (string) ($t->guest_name ?? 'Player'),
                        'leg'         => (int) $t->leg_id,
                        'scored'      => (int) $t->total_scored,
                        'is_bust'     => (bool) $t->is_bust,
                        'is_checkout' => (bool) $t->is_checkout,
                        'is_undone'   => (bool) $t->is_undone,
                        'darts'       => $darts,
                    ];
                });
        } else {
            $turns = Turn::where('match_id', $match->id)
                ->with(['player', 'darts'])
                ->orderBy('id')
                ->get()
                ->map(fn($t) => [
                    'id'          => $t->id,
                    'player'      => $t->player->display_name,
                    'leg'         => $t->leg_id,
                    'scored'      => $t->total_scored,
                    'is_bust'     => $t->is_bust,
                    'is_checkout' => $t->is_checkout,
                    'is_undone'   => $t->is_undone,
                    'darts'       => $t->darts->map(fn($d) => $d->getLabel())->toArray(),
                ]);
        }

        return response()->json(['turns' => $turns]);
    }

    /**
     * Pilns spēles protokols: legs pēc seta/leg numura ar visiem metieniem.
     */
    public function protocol(GameMatch $match): JsonResponse
    {
        $this->authorizeMatchAccess($match);

        // Ja mačs ir pabeigts/pārtraukts, dodam gatavu snapshot (ātri, bez smagiem join).
        if (in_array($match->status, ['finished', 'abandoned'], true)) {
            $snap = DB::table('match_protocols')->where('match_id', $match->id)->value('payload');
            if ($snap) {
                $decoded = json_decode($snap, true);
                if (is_array($decoded)) {
                    return response()->json($decoded);
                }
            }
            // Ja snapshot vēl nav (vecs mačs), uzģenerējam un arhivējam.
            $this->archiver->archiveIfTerminal($match);
            $snap2 = DB::table('match_protocols')->where('match_id', $match->id)->value('payload');
            if ($snap2) {
                $decoded2 = json_decode($snap2, true);
                if (is_array($decoded2)) {
                    return response()->json($decoded2);
                }
            }
        }

        $match->load(['room.activePlayers.user', 'winner']);

        $room = $match->room;
        $players = $room->activePlayers->map(fn ($p) => [
            'id'   => $p->id,
            'name' => $p->display_name,
        ])->values();

        $legs = Leg::query()
            ->where('match_id', $match->id)
            ->with([
                'winner',
                'turns' => fn ($q) => $q->with(['player', 'darts'])->orderBy('turn_number'),
            ])
            ->orderBy('set_number')
            ->orderBy('leg_number')
            ->get();

        $legsPayload = $legs->map(function (Leg $leg) {
            $winner = null;
            if ($leg->winner_player_id && $leg->winner) {
                $winner = [
                    'id'   => (int) $leg->winner_player_id,
                    'name' => $leg->winner->display_name,
                ];
            }

            $turns = $leg->turns->map(function (Turn $t) {
                return [
                    'turn_number'  => $t->turn_number,
                    'player_id'    => $t->player_id,
                    'player'       => $t->player?->display_name,
                    'darts'        => $t->darts->map(fn (Dart $d) => $d->getLabel())->values()->all(),
                    'total_scored' => (int) $t->total_scored,
                    'score_before' => $t->score_before,
                    'score_after'  => $t->score_after,
                    'is_bust'      => (bool) $t->is_bust,
                    'is_checkout'  => (bool) $t->is_checkout,
                    'is_undone'    => (bool) $t->is_undone,
                ];
            })->values();

            return [
                'id'          => $leg->id,
                'set_number'  => (int) $leg->set_number,
                'leg_number'  => (int) $leg->leg_number,
                'winner'      => $winner,
                'turns'       => $turns,
            ];
        })->values();

        return response()->json([
            'match' => [
                'id'           => $match->id,
                'game_type'    => $room->game_type,
                'game_config'  => $room->game_config,
                'legs_config'  => $match->legs_config,
                'status'       => $match->status,
                'room_code'    => $room->code,
                'winner'       => $match->winner ? [
                    'id'   => $match->winner->id,
                    'name' => $match->winner->display_name,
                ] : null,
            ],
            'players' => $players,
            'legs'    => $legsPayload,
            'report'  => $this->matchReport->build($match),
        ]);
    }

    // ── X01 logic ────────────────────────────────────────────────────────────

    private function handleX01Throw(GameMatch $match, $leg, int $playerId, array $darts, array $config): JsonResponse
    {
        $outMode = $config['out'] ?? X01Engine::OUT_DOUBLE;
        $inMode  = $config['in'] ?? X01Engine::IN_STRAIGHT;

        $remaining   = $this->getX01Remaining($leg, $playerId, $config);
        $totalScored = $this->x01->calculateScore($darts);
        $lastDart    = end($darts);

        $isBust     = $this->x01->isBust($remaining, $totalScored, $outMode);
        $isCheckout = !$isBust && $this->x01->isCheckout($remaining, $totalScored, $lastDart, $outMode);

        $turnNumber = Turn::where('leg_id', $leg->id)->count() + 1;

        $turn = Turn::create([
            'match_id'     => $match->id,
            'leg_id'       => $leg->id,
            'player_id'    => $playerId,
            'turn_number'  => $turnNumber,
            'score_before' => $remaining,
            'score_after'  => $isBust ? $remaining : $remaining - $totalScored,
            'total_scored' => $isBust ? 0 : $totalScored,
            'is_bust'      => $isBust,
            'is_checkout'  => $isCheckout,
        ]);

        foreach ($darts as $i => $dart) {
            Dart::create([
                'turn_id'    => $turn->id,
                'dart_number' => $i + 1,
                'segment'    => $dart['segment'],
                'multiplier' => $dart['multiplier'],
                'value'      => $dart['value'],
            ]);
        }

        if ($isCheckout) {
            $this->stateManager->advanceLeg($match, $playerId);
        } else {
            $this->stateManager->nextPlayer($match);
        }

        $match->updated_at = now();
        $match->save();

        $match->refresh();
        $this->stateManager->bumpTurnDeadline($match, GameStateManager::TURN_TIMER_MAIN_SECONDS);

        return response()->json($this->stateManager->buildSnapshot($match->fresh()));
    }

    private function getX01Remaining($leg, int $playerId, array $config): int
    {
        $startingScore = $leg->starting_score ?? ($config['variant'] ?? 501);
        $scored = Turn::where('leg_id', $leg->id)
            ->where('player_id', $playerId)
            ->where('is_bust', false)
            ->where('is_undone', false)
            ->sum('total_scored');

        return $startingScore - $scored;
    }

    // ── Cricket logic ─────────────────────────────────────────────────────────

    private function handleCricketThrow(GameMatch $match, $leg, int $playerId, array $darts, array $config): JsonResponse
    {
        $segments   = $config['cricket_segments'] ?? CricketEngine::STANDARD_SEGMENTS;
        $allStates  = CricketState::where('leg_id', $leg->id)->get();
        $myState    = $allStates->firstWhere('player_id', $playerId);

        $totalScored = 0;
        $turnNumber  = Turn::where('leg_id', $leg->id)->count() + 1;

        $turn = Turn::create([
            'match_id'    => $match->id,
            'leg_id'      => $leg->id,
            'player_id'   => $playerId,
            'turn_number' => $turnNumber,
            'total_scored' => 0,
        ]);

        foreach ($darts as $i => $dart) {
            Dart::create([
                'turn_id'     => $turn->id,
                'dart_number' => $i + 1,
                'segment'     => $dart['segment'],
                'multiplier'  => $dart['multiplier'],
                'value'       => $dart['value'],
            ]);

            $result = $this->cricket->registerHit(
                $myState,
                $dart['segment'],
                $dart['multiplier'],
                $allStates->all(),
                $segments
            );

            $totalScored += $result['points_scored'];
        }

        $turn->total_scored = $totalScored;
        $turn->save();

        $winnerId = $this->cricket->checkWinCondition($allStates->fresh()->all(), $segments);

        if ($winnerId !== null) {
            // Map cricket state player_id to room_player_id (they are the same)
            $this->stateManager->advanceLeg($match, $winnerId);
        } else {
            $this->stateManager->nextPlayer($match);
        }

        $match->updated_at = now();
        $match->save();

        $match->refresh();
        $this->stateManager->bumpTurnDeadline($match, GameStateManager::TURN_TIMER_MAIN_SECONDS);

        return response()->json($this->stateManager->buildSnapshot($match->fresh()));
    }

    private function revertCricketState(GameMatch $match, $leg, Turn $turn): void
    {
        // Simplest safe approach: recompute state from scratch for this player
        $state = CricketState::where('leg_id', $leg->id)
            ->where('player_id', $turn->player_id)
            ->first();

        if (!$state) {
            return;
        }

        $config   = $match->room->game_config;
        $segments = $config['cricket_segments'] ?? CricketEngine::STANDARD_SEGMENTS;

        // Reset state — zero out legacy columns and the JSON seg_data
        foreach (['seg_15','seg_16','seg_17','seg_18','seg_19','seg_20','seg_bull'] as $col) {
            $state->$col = 0;
        }
        $state->seg_data = array_fill_keys(array_map('strval', $segments), 0);
        $state->points   = 0;
        $state->save();

        // Replay all non-undone turns for this player
        $allStates = CricketState::where('leg_id', $leg->id)->get();

        $validTurns = Turn::where('leg_id', $leg->id)
            ->where('player_id', $turn->player_id)
            ->where('is_undone', false)
            ->with('darts')
            ->orderBy('id')
            ->get();

        foreach ($validTurns as $t) {
            foreach ($t->darts as $dart) {
                $this->cricket->registerHit($state, $dart->segment, $dart->multiplier, $allStates->all(), $segments);
            }
        }
    }

    public function abandon(GameMatch $match): JsonResponse
    {
        $this->authorizeMatchAccess($match);
        $match->load('room');
        $room   = $match->room;
        $userId = (int) Auth::id();

        // Jebkurš aktīvs (ne-spectator) spēlētājs telpā var pārtraukt maču
        $isPlayer = $room && $room->players()
            ->where('user_id', $userId)
            ->where('is_spectator', false)
            ->exists();

        if (!$isPlayer) {
            return response()->json(['message' => 'Tikai telpas spēlētājs var pārtraukt spēli.'], 403);
        }

        if (!in_array($match->status, ['active', 'suspended'], true)) {
            return response()->json(['message' => 'Spēle nav aktīva.'], 422);
        }

        $this->stateManager->abandonAndPurgeMatch($match);

        return response()->json([
            'message'      => 'Spēle pārtraukta; mača un gājienu dati noņemti.',
            'match_status' => 'abandoned',
            'purged'       => true,
        ]);
    }

    /**
     * Lokālā aktīva spēle: pauze (saglabā stāvokli) — «Iziet» bez datu dzēšanas.
     */
    public function suspendLocal(GameMatch $match): JsonResponse
    {
        $this->authorizeMatchAccess($match);
        $match->load('room');
        $room = $match->room;
        if (!$room || !$room->isLocalPlay()) {
            return response()->json(['error' => 'Tikai lokālai spēlei.'], 422);
        }
        if ((int) $room->host_user_id !== (int) Auth::id()) {
            return response()->json(['error' => 'Tikai hosts var saglabāt pauzi.'], 403);
        }
        if ($match->status === 'suspended') {
            return response()->json([
                'message'      => 'Jau saglabāta kā pauze.',
                'match_status' => 'suspended',
            ]);
        }
        if ($match->status !== 'active') {
            return response()->json(['error' => 'Spēle nav aktīva.'], 422);
        }

        $match->update(['status' => 'suspended', 'finished_at' => null]);
        $room->update(['status' => 'suspended']);

        return response()->json([
            'message'      => 'Lokālā spēle saglabāta — vari turpināt vēlāk.',
            'match_status' => 'suspended',
        ]);
    }

    /**
     * Lokālai pauzētai spēlei: atjauno aktīvu statusu (tikai hosts).
     */
    public function resume(GameMatch $match): JsonResponse
    {
        $this->authorizeMatchAccess($match);
        $match->load('room');
        $room = $match->room;
        if (!$room || !$room->isLocalPlay()) {
            return response()->json(['error' => 'Tikai lokālai pauzētai spēlei.'], 422);
        }
        if ((int) $room->host_user_id !== (int) Auth::id()) {
            return response()->json(['error' => 'Tikai hosts var turpināt.'], 403);
        }
        if ($match->status !== 'suspended' || $room->status !== 'suspended') {
            return response()->json(['error' => 'Spēle nav pauzē.'], 422);
        }

        $match->update(['status' => 'active']);
        $room->update(['status' => 'active']);
        $match->refresh();
        if ($this->stateManager->useTurnTimerForMatch($match)) {
            $this->stateManager->bumpTurnDeadline($match, GameStateManager::TURN_TIMER_MAIN_SECONDS);
        }

        return response()->json($this->stateManager->buildSnapshot($match->fresh()));
    }

    /**
     * Lokālai pauzētai spēlei: pavisam dzēst pauzi un atbrīvot jaunu telpu (tikai hosts).
     */
    public function discardSuspended(GameMatch $match): JsonResponse
    {
        $this->authorizeMatchAccess($match);
        $match->load('room');
        $room = $match->room;
        if (!$room || !$room->isLocalPlay()) {
            return response()->json(['error' => 'Tikai lokālai pauzētai spēlei.'], 422);
        }
        if ((int) $room->host_user_id !== (int) Auth::id()) {
            return response()->json(['error' => 'Tikai hosts var dzēst pauzēto spēli.'], 403);
        }
        if ($match->status !== 'suspended') {
            return response()->json(['error' => 'Spēle nav pauzē.'], 422);
        }

        $this->stateManager->abandonAndPurgeMatch($match);

        return response()->json(['ok' => true, 'purged' => true]);
    }

    private function authorizeMatchAccess(GameMatch $match): void
    {
        $userId = Auth::id();
        if ($userId === null) {
            abort(401);
        }

        $match->loadMissing('room');
        $room = $match->room;
        if (!$room) {
            abort(404);
        }

        $playerRow = $room->players()->where('user_id', (int) $userId)->first();
        $allowed = (bool) $playerRow;
        // Neatklājam spēles eksistenci: ja nav dalībnieks, izliekamies ka nav atrasts.
        if (!$allowed) {
            abort(404);
        }

        // Online/lokāli: piekļuve ir tikai pēc tā, vai lietotājs ir telpas spēlētājs.
    }

    private function authorizeCurrentPlayer(GameMatch $match): void
    {
        $userId = Auth::id();
        $currentPlayer = $match->currentPlayer;

        if (!$currentPlayer) {
            abort(403, 'Nav aktīva spēlētāja.');
        }

        $match->loadMissing('room');
        $room = $match->room;
        if ($room && $room->isLocalPlay() && (int) $room->host_user_id === (int) $userId) {
            return;
        }

        if ((int) $currentPlayer->user_id !== (int) $userId) {
            abort(403, 'Nav tava kārta.');
        }
    }

    /** Telpas spēlētājs, kas nav pašreizējā kārta (pretinieks / citi pret gaidošo taimeri). */
    private function authorizeNotCurrentPlayer(GameMatch $match): void
    {
        $userId = (int) Auth::id();
        $match->loadMissing(['currentPlayer', 'room.activePlayers']);

        $current = $match->currentPlayer;
        if (!$current || (int) $current->user_id === $userId) {
            abort(403, 'Šo izvēli var veikt tikai pretinieks.');
        }

        $isActivePlayer = $match->room->activePlayers->contains(
            fn ($p) => (int) $p->user_id === $userId && !$p->is_spectator
        );

        if (!$isActivePlayer) {
            abort(403, 'Nav tiesību.');
        }
    }

    private function matchEtag(GameMatch $match): string
    {
        $version = $match->updated_at?->format('U.u') ?? '0';
        return '"' . sha1($match->id . ':' . $version) . '"';
    }
}
