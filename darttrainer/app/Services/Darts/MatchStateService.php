<?php

namespace App\Services\Darts;

use App\Events\MatchStateUpdated;
use App\Models\DartMatch;
use App\Models\DartX01SoloActiveTurn;
use App\Models\MatchPlayer;

class MatchStateService
{
    public function __construct(
        private readonly X01ScoringService $scoring,
        private readonly MatchTurnTimerService $turnTimer,
        private readonly CheckoutCalculationService $checkoutCalc,
        private readonly LobbySetupService $lobbySetup,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function buildState(DartMatch $match): array
    {
        $match->load(['config', 'players', 'legs.soloTurns.throws', 'activeLeg.soloTurns.throws', 'activeLeg.soloTurns.player']);

        if ($this->turnTimer->syncExpiry($match)) {
            $match->refresh();
            $match->load(['config', 'players', 'legs.soloTurns.throws', 'activeLeg.soloTurns.throws', 'activeLeg.soloTurns.player']);
            broadcast(new MatchStateUpdated($match))->toOthers();
        }

        $config = $match->config;
        $leg = $match->activeLeg;
        $scoreboard = [];
        $activePlayerId = null;
        $dartsThrownThisTurn = 0;
        $currentTurnScore = 0;
        $turnThrows = [];
        $turnIsBust = false;

        $legsWonByPlayer = $match->legs
            ->where('status', 'finished')
            ->countBy('winner_player_id');

        if ($leg !== null && $leg->status === 'active') {
            $activePlayerId = $this->resolveActivePlayerId($match, $leg->id);
        }

        foreach ($match->players as $player) {
            $remaining = $this->lobbySetup->resolvePlayerStartingPoints($player, $config->starting_points);
            $dartsTotal = 0;
            $pointsScoredLeg = 0;
            $turnCount = 0;
            $latestTurn = null;
            $openTurn = null;
            $matchDartStats = $this->aggregatePlayerDartStats($match->legs, $player->id);
            $averageMatch3pad = $this->computeThreeDartAverage(
                $matchDartStats['points_scored'],
                $matchDartStats['darts_thrown'],
            );

            if ($leg !== null) {
                $turns = $leg->soloTurns
                    ->where('player_id', $player->id)
                    ->sortBy('turn_number');

                $turnCount = $turns->count();

                foreach ($turns as $turn) {
                    if (! $turn->is_bust) {
                        $remaining = $turn->remaining_points;
                        $pointsScoredLeg += $turn->points_scored;
                    }
                    $dartsTotal += $turn->throws->count();
                }

                $latestTurn = $turns->last();
                $openTurn = $latestTurn !== null
                    && $latestTurn->throws->count() < 3
                    && ! $latestTurn->is_bust
                    && $latestTurn->remaining_points > 0
                    && ! $latestTurn->throws->contains(fn ($throw) => $throw->is_leg_winner)
                    && ! $latestTurn->throws->contains(fn ($throw) => ($throw->input_source ?? 'board') === 'calculator')
                    ? $latestTurn
                    : null;

                if ($leg->status === 'active' && $activePlayerId === $player->id && $openTurn !== null) {
                    $dartsThrownThisTurn = $openTurn->throws->count();
                    $currentTurnScore = $openTurn->points_scored;
                    $turnIsBust = $openTurn->is_bust;
                    $turnThrows = $openTurn->throws
                        ->sortBy('throw_number')
                        ->map(fn ($throw) => [
                            'sector' => $throw->sector,
                            'multiplier' => $throw->multiplier,
                            'points' => $this->scoring->dartPoints($throw->sector, $throw->multiplier),
                            'is_leg_winner' => $throw->is_leg_winner,
                        ])
                        ->values()
                        ->all();
                }
            }

            $averageLeg3pad = $this->computeThreeDartAverage($pointsScoredLeg, $dartsTotal);

            if ($leg !== null && $leg->status === 'active' && $activePlayerId === $player->id) {
                if ($openTurn !== null) {
                    $visitNumber = $openTurn->turn_number;
                } else {
                    $visitNumber = max(1, ($latestTurn?->turn_number ?? 0) + 1);
                }
            } else {
                $visitNumber = $latestTurn?->turn_number ?? ($activePlayerId === $player->id ? 1 : 0);
            }

            $scoreboard[] = [
                'player_id' => $player->id,
                'user_id' => $player->user_id,
                'name' => $player->display_name,
                'remaining_points' => $remaining,
                'darts_thrown_total' => $dartsTotal,
                'legs_won' => (int) ($legsWonByPlayer[$player->id] ?? 0),
                'sets_won' => 0,
                'scoring_mode' => $player->scoring_mode ?? 'board',
                'stats_tier' => $player->stats_tier ?? 'full',
                'turn_number' => $visitNumber,
                'average_3pad' => $averageLeg3pad,
                'average_3pad_leg' => $averageLeg3pad,
                'average_3pad_match' => $averageMatch3pad,
                'is_turn' => $activePlayerId === $player->id,
            ];
        }

        $winnerPlayer = null;
        if ($match->status->value === 'finished') {
            $winningLeg = $match->legs
                ->where('status', 'finished')
                ->sortByDesc('leg_number')
                ->first();

            if ($winningLeg?->winner_player_id !== null) {
                $winnerPlayer = $match->players->firstWhere('id', $winningLeg->winner_player_id);
            }
        }

        $checkoutContext = null;
        if ($activePlayerId !== null) {
            $activeRow = collect($scoreboard)->firstWhere('player_id', $activePlayerId);
            if ($activeRow !== null) {
                $checkoutContext = $this->checkoutCalc->checkoutContext(
                    (int) $activeRow['remaining_points'],
                    $config->out_rule->value === 'double',
                );
            }
        }

        return [
            'match_uuid' => $match->uuid,
            'status' => $match->status->value,
            'game_type' => $match->game_type->value,
            'winner' => $winnerPlayer !== null ? [
                'player_id' => $winnerPlayer->id,
                'name' => $winnerPlayer->display_name,
            ] : null,
            'config' => [
                'mode' => $config->mode->value,
                'starting_points' => $config->starting_points,
                'in_rule' => $config->in_rule->value,
                'out_rule' => $config->out_rule->value,
                'format' => $config->format->value,
                'legs_target' => $config->legs_target,
                'sets_target' => $config->sets_target,
                'track_checkout_rate' => $config->track_checkout_rate,
            ],
            'current_state' => [
                'current_leg' => $leg?->leg_number ?? $match->legs->max('leg_number') ?? 0,
                'current_set' => 1,
                'active_player_id' => $activePlayerId,
                'darts_thrown_this_turn' => $dartsThrownThisTurn,
                'current_turn_score' => $currentTurnScore,
                'turn_throws' => $turnThrows,
                'turn_is_bust' => $turnIsBust,
                'turn_timer' => $this->turnTimer->buildTimerPayload($match),
                'recent_turns' => $this->buildRecentTurns($match, $leg),
                'checkout_context' => $checkoutContext,
            ],
            'scoreboard' => $scoreboard,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function buildSpectatorState(DartMatch $match): array
    {
        $full = $this->buildState($match);

        return [
            'match_uuid' => $full['match_uuid'],
            'status' => $full['status'],
            'game_type' => $full['game_type'],
            'visibility' => 'public',
            'current_state' => [
                'current_leg' => $full['current_state']['current_leg'],
            ],
            'scoreboard' => collect($full['scoreboard'])->map(fn (array $row) => [
                'name' => $row['name'],
                'remaining_points' => $row['remaining_points'],
                'is_turn' => $row['is_turn'],
            ])->values()->all(),
        ];
    }

    public function resolveActivePlayerId(DartMatch $match, int $legId): ?int
    {
        $lastTurn = DartX01SoloActiveTurn::query()
            ->where('leg_id', $legId)
            ->orderByDesc('id')
            ->first();

        if ($lastTurn === null) {
            return $this->resolveLegStartingPlayerId($match, $legId);
        }

        $playerIds = $match->players()->orderBy('slot')->pluck('id')->values();
        $currentIndex = $playerIds->search($lastTurn->player_id);

        if ($currentIndex === false) {
            return $playerIds->first();
        }

        if ($lastTurn->throws()->count() < 3 && ! $lastTurn->is_bust && $lastTurn->remaining_points > 0) {
            $hasCalculatorThrow = $lastTurn->throws()
                ->where('input_source', 'calculator')
                ->exists();

            if (! $hasCalculatorThrow) {
                return $lastTurn->player_id;
            }
        }

        $nextIndex = ($currentIndex + 1) % $playerIds->count();

        return $playerIds[$nextIndex];
    }

    public function resolveLegStartingPlayerId(DartMatch $match, int $legId): ?int
    {
        $players = $match->players()->orderBy('slot')->get();

        if ($players->isEmpty()) {
            return null;
        }

        if ($match->match_type->value === 'team') {
            $leg = $match->legs()->whereKey($legId)->first()
                ?? $match->activeLeg;

            $legNumber = $leg?->leg_number ?? 1;
            $startSlot = ($legNumber % 2 === 1) ? 1 : 2;

            return $players->firstWhere('slot', $startSlot)?->id ?? $players->first()?->id;
        }

        return $players->first()?->id;
    }

    /**
     * @param  iterable<int, \App\Models\DartX01ActiveLeg>  $legs
     * @return array{points_scored: int, darts_thrown: int}
     */
    private function aggregatePlayerDartStats(iterable $legs, int $playerId): array
    {
        $pointsScored = 0;
        $dartsThrown = 0;

        foreach ($legs as $leg) {
            foreach ($leg->soloTurns->where('player_id', $playerId) as $turn) {
                $dartsThrown += $turn->throws->count();

                if (! $turn->is_bust) {
                    $pointsScored += $turn->points_scored;
                }
            }
        }

        return [
            'points_scored' => $pointsScored,
            'darts_thrown' => $dartsThrown,
        ];
    }

    private function computeThreeDartAverage(int $pointsScored, int $dartsThrown): float
    {
        if ($dartsThrown <= 0) {
            return 0.0;
        }

        return round(($pointsScored / $dartsThrown) * 3, 1);
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function buildRecentTurns(DartMatch $match, $leg): array
    {
        if ($leg === null) {
            return [];
        }

        $turns = $leg->soloTurns
            ->sortBy('id')
            ->slice(-40)
            ->values();

        return $turns->map(function ($turn) use ($match) {
            $player = $match->players->firstWhere('id', $turn->player_id);
            $throws = $turn->throws
                ->sortBy('throw_number')
                ->values()
                ->map(fn ($throw) => [
                    'throw_number' => $throw->throw_number,
                    'sector' => $throw->sector,
                    'multiplier' => $throw->multiplier,
                    'points' => $this->scoring->dartPoints($throw->sector, $throw->multiplier),
                    'input_source' => $throw->input_source ?? 'board',
                ])
                ->all();

            $inputSource = $turn->throws->isEmpty()
                ? 'board'
                : ($turn->throws->every(fn ($throw) => ($throw->input_source ?? 'board') === 'calculator')
                    ? 'calculator'
                    : 'board');

            $isCalculatorVisit = $inputSource === 'calculator' && count($throws) >= 1;

            $isCheckout = ! $turn->is_bust
                && $turn->remaining_points === 0
                && $turn->throws->contains(fn ($throw) => $throw->is_leg_winner);

            return [
                'turn_id' => $turn->id,
                'player_id' => $turn->player_id,
                'player_name' => $player?->display_name ?? '',
                'turn_number' => $turn->turn_number,
                'points_scored' => $turn->points_scored,
                'remaining_points' => $turn->remaining_points,
                'is_bust' => $turn->is_bust,
                'throws' => $throws,
                'input_source' => $inputSource,
                'dart_count' => count($throws),
                'is_complete' => count($throws) >= 3 || $turn->is_bust || $turn->remaining_points === 0 || $isCalculatorVisit,
                'is_checkout' => $isCheckout,
            ];
        })->values()->all();
    }
}
