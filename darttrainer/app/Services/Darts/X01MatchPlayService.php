<?php

namespace App\Services\Darts;

use App\Enums\LobbyMode;
use App\Enums\MatchStatus;
use App\Enums\X01Format;
use App\Events\MatchStateUpdated;
use App\Jobs\CompleteDartsMatchJob;
use App\Models\DartMatch;
use App\Models\DartX01ActiveLeg;
use App\Models\DartX01SoloActiveThrow;
use App\Models\DartX01SoloActiveTurn;
use App\Models\MatchPlayer;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class X01MatchPlayService
{
    public function __construct(
        private readonly X01ScoringService $scoring,
        private readonly MatchStateService $stateService,
        private readonly MatchTurnTimerService $turnTimer,
        private readonly X01DartPointsMapper $dartPoints,
        private readonly MatchScoringModeService $scoringMode,
        private readonly CheckoutCalculationService $checkoutCalc,
        private readonly LobbySetupService $lobbySetup,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function recordThrow(DartMatch $match, User $actor, int $sector, int $multiplier): array
    {
        $this->assertValidDart($sector, $multiplier);

        return $this->recordThrowInternal($match, $actor, $sector, $multiplier, 'board');
    }

    /**
     * @param  list<array{sector: int, multiplier: int}>|null  $throwsDetail
     */
    public function recordPointsThrow(
        DartMatch $match,
        User $actor,
        int $points,
        ?int $dartCount = null,
        ?int $checkoutDart = null,
        ?int $doubleDarts = null,
        ?array $throwsDetail = null,
    ): array {
        $this->dartPoints->assertValidVisitPoints($points);

        $match->loadMissing(['config', 'activeLeg']);
        $requireDoubleOut = $match->config->out_rule->value === 'double';

        $remainingBefore = null;
        $leg = $match->activeLeg;
        if ($leg !== null) {
            $activePlayerId = $this->stateService->resolveActivePlayerId($match, $leg->id);
            if ($activePlayerId !== null) {
                $remainingBefore = $this->remainingBeforeTurn($leg, $activePlayerId);
            }
        }

        $wouldBust = $remainingBefore !== null && (
            $points > $remainingBefore
            || ($requireDoubleOut && $remainingBefore - $points === 1)
        );

        if ($match->config->track_checkout_rate
            && $remainingBefore !== null
            && $this->checkoutCalc->requiresDoubleAttemptsPrompt($points, $remainingBefore, $wouldBust)
        ) {
            if ($doubleDarts === null) {
                abort(422, 'double-attempts-required');
            }

            $allowed = $this->checkoutCalc->getAllowedDoubleAttempts(
                $remainingBefore,
                $points,
                $dartCount,
                $requireDoubleOut,
            );

            if ($allowed === [] || ! in_array($doubleDarts, $allowed, true)) {
                abort(422, 'invalid-double-attempts');
            }
        }

        if ($throwsDetail !== null) {
            if ($throwsDetail === []) {
                abort(422, 'invalid-throws-detail');
            }

            foreach ($throwsDetail as $dart) {
                $this->assertValidDart((int) $dart['sector'], (int) $dart['multiplier']);
            }

            $darts = $throwsDetail;
        } else {
            $darts = $this->dartPoints->buildVisitDarts(
                $points,
                $dartCount,
                $checkoutDart,
                $doubleDarts,
                $remainingBefore,
                $requireDoubleOut,
            );

            if ($darts === null || $darts === []) {
                abort(422, 'invalid-visit-points');
            }
        }

        return $this->recordCalculatorVisit($match, $actor, $darts, $doubleDarts);
    }

    /**
     * @param  list<array{sector: int, multiplier: int}>  $darts
     * @return array<string, mixed>
     */
    private function recordCalculatorVisit(DartMatch $match, User $actor, array $darts, ?int $doubleAttempts = null): array
    {
        return DB::transaction(function () use ($match, $actor, $darts, $doubleAttempts): array {
            $match = DartMatch::query()
                ->whereKey($match->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($match->status !== MatchStatus::Active) {
                abort(422, 'match-not-active');
            }

            $match->load(['config', 'players', 'activeLeg.soloTurns.throws']);

            $leg = $match->activeLeg;
            if ($leg === null || $leg->status !== 'active') {
                abort(422, 'no-active-leg');
            }

            $activePlayerId = $this->stateService->resolveActivePlayerId($match, $leg->id);
            if ($activePlayerId === null) {
                abort(422, 'no-active-player');
            }

            /** @var MatchPlayer $activePlayer */
            $activePlayer = $match->players->firstWhere('id', $activePlayerId);
            $this->assertCanThrow($match, $actor, $activePlayer);
            $this->scoringMode->ensureCalculatorMode($activePlayer);
            $activePlayer->refresh();

            $turn = $this->resolveOpenTurn($leg, $activePlayer);

            if ($turn->throws()->exists()) {
                $turn->throws()->delete();
            }

            $remainingAtTurnStart = $this->remainingAtTurnStart($leg, $activePlayer, $turn);
            $playerHasScored = $this->playerHasScoredInLeg($leg, $activePlayer->id);

            foreach ($darts as $index => $dart) {
                DartX01SoloActiveThrow::query()->create([
                    'turn_id' => $turn->id,
                    'throw_number' => $index + 1,
                    'sector' => (int) $dart['sector'],
                    'multiplier' => (int) $dart['multiplier'],
                    'input_source' => 'calculator',
                    'is_leg_winner' => false,
                ]);
            }

            $turn->load('throws');
            $dartPayload = $turn->throws
                ->sortBy('throw_number')
                ->map(fn (DartX01SoloActiveThrow $throw) => [
                    'sector' => $throw->sector,
                    'multiplier' => $throw->multiplier,
                ])
                ->values()
                ->all();

            $evaluation = $this->scoring->evaluateTurn(
                $remainingAtTurnStart,
                $dartPayload,
                $match->config->in_rule,
                $match->config->out_rule,
                $playerHasScored,
            );

            $turn->update([
                'points_scored' => $evaluation['is_bust'] ? 0 : $evaluation['points_scored'],
                'double_attempts' => $doubleAttempts,
                'remaining_points' => $evaluation['is_bust'] ? $remainingAtTurnStart : $evaluation['remaining'],
                'is_bust' => $evaluation['is_bust'],
            ]);

            foreach ($evaluation['throws'] as $throwResult) {
                $turn->throws()
                    ->where('throw_number', $throwResult['throw_number'])
                    ->update(['is_leg_winner' => $throwResult['is_leg_winner']]);
            }

            $turnComplete = true;

            if ($evaluation['won']) {
                $this->finishLeg($match, $leg, $activePlayer);
            }

            $match = $match->fresh(['config', 'players', 'legs', 'activeLeg.soloTurns.throws', 'activeLeg.soloTurns.player']);
            $leg = $match->activeLeg;
            $nextActiveId = $leg !== null ? $this->stateService->resolveActivePlayerId($match, $leg->id) : null;
            $this->turnTimer->onThrowRecorded($match, $turnComplete && ! $evaluation['won'], $nextActiveId);

            $state = $this->stateService->buildState($match->fresh(['config', 'players', 'legs', 'activeLeg.soloTurns.throws', 'activeLeg.soloTurns.player']));

            broadcast(new MatchStateUpdated($match))->toOthers();

            return $state;
        });
    }

    /**
     * @return array<string, mixed>
     */
    private function recordThrowInternal(
        DartMatch $match,
        User $actor,
        int $sector,
        int $multiplier,
        string $inputSource,
    ): array {
        return DB::transaction(function () use ($match, $actor, $sector, $multiplier, $inputSource): array {
            $match = DartMatch::query()
                ->whereKey($match->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($match->status !== MatchStatus::Active) {
                abort(422, 'match-not-active');
            }

            $match->load(['config', 'players', 'activeLeg.soloTurns.throws']);

            $leg = $match->activeLeg;
            if ($leg === null || $leg->status !== 'active') {
                abort(422, 'no-active-leg');
            }

            $activePlayerId = $this->stateService->resolveActivePlayerId($match, $leg->id);
            if ($activePlayerId === null) {
                abort(422, 'no-active-player');
            }

            /** @var MatchPlayer $activePlayer */
            $activePlayer = $match->players->firstWhere('id', $activePlayerId);
            $this->assertCanThrow($match, $actor, $activePlayer);

            if ($inputSource === 'board') {
                $this->scoringMode->assertBoardInputAllowed($activePlayer);
            }

            if ($inputSource === 'calculator') {
                $this->scoringMode->ensureCalculatorMode($activePlayer);
                $activePlayer->refresh();
            }

            $turn = $this->resolveOpenTurn($leg, $activePlayer);
            if ($turn->throws()->count() >= 3) {
                abort(422, 'turn-complete');
            }

            $remainingAtTurnStart = $this->remainingAtTurnStart($leg, $activePlayer, $turn);
            $playerHasScored = $this->playerHasScoredInLeg($leg, $activePlayer->id);

            $throwNumber = $turn->throws()->count() + 1;
            DartX01SoloActiveThrow::query()->create([
                'turn_id' => $turn->id,
                'throw_number' => $throwNumber,
                'sector' => $sector,
                'multiplier' => $multiplier,
                'input_source' => $inputSource,
                'is_leg_winner' => false,
            ]);

            $turn->load('throws');
            $darts = $turn->throws
                ->sortBy('throw_number')
                ->map(fn (DartX01SoloActiveThrow $throw) => [
                    'sector' => $throw->sector,
                    'multiplier' => $throw->multiplier,
                ])
                ->values()
                ->all();

            $evaluation = $this->scoring->evaluateTurn(
                $remainingAtTurnStart,
                $darts,
                $match->config->in_rule,
                $match->config->out_rule,
                $playerHasScored,
            );

            $turn->update([
                'points_scored' => $evaluation['is_bust'] ? 0 : $evaluation['points_scored'],
                'remaining_points' => $evaluation['is_bust'] ? $remainingAtTurnStart : $evaluation['remaining'],
                'is_bust' => $evaluation['is_bust'],
            ]);

            foreach ($evaluation['throws'] as $throwResult) {
                $turn->throws()
                    ->where('throw_number', $throwResult['throw_number'])
                    ->update(['is_leg_winner' => $throwResult['is_leg_winner']]);
            }

            $turnComplete = $evaluation['is_bust']
                || $evaluation['won']
                || $turn->throws()->count() >= 3;

            if ($evaluation['won']) {
                $this->finishLeg($match, $leg, $activePlayer);
            } elseif ($turnComplete) {
                $turn->refresh();
            }

            $match = $match->fresh(['config', 'players', 'legs', 'activeLeg.soloTurns.throws', 'activeLeg.soloTurns.player']);
            $leg = $match->activeLeg;
            $nextActiveId = $leg !== null ? $this->stateService->resolveActivePlayerId($match, $leg->id) : null;
            $this->turnTimer->onThrowRecorded($match, $turnComplete && ! $evaluation['won'], $nextActiveId);

            $state = $this->stateService->buildState($match->fresh(['config', 'players', 'legs', 'activeLeg.soloTurns.throws', 'activeLeg.soloTurns.player']));

            broadcast(new MatchStateUpdated($match))->toOthers();

            return $state;
        });
    }

    public function finishLegAfterEdit(DartMatch $match, DartX01ActiveLeg $leg, MatchPlayer $winner): void
    {
        $this->finishLeg($match, $leg, $winner);
    }

    public function assertValidDart(int $sector, int $multiplier): void
    {
        if ($sector === 0 && $multiplier !== 0) {
            abort(422, 'invalid-dart');
        }

        if ($multiplier === 0 && $sector !== 0) {
            abort(422, 'invalid-dart');
        }

        if ($sector < 0 || $sector > 25) {
            abort(422, 'invalid-dart');
        }

        if ($multiplier < 0 || $multiplier > 3) {
            abort(422, 'invalid-dart');
        }

        if ($sector === 25 && $multiplier === 3) {
            abort(422, 'invalid-dart');
        }

        if ($sector > 20 && $sector !== 25) {
            abort(422, 'invalid-dart');
        }
    }

    private function assertCanThrow(DartMatch $match, User $actor, MatchPlayer $activePlayer): void
    {
        if ($activePlayer->user_id === $actor->id) {
            return;
        }

        $match->loadMissing('config');

        if ($match->config->mode === LobbyMode::Local && $match->host_user_id === $actor->id) {
            return;
        }

        if ($activePlayer->user_id === null && $match->host_user_id === $actor->id) {
            return;
        }

        abort(403, 'not-your-turn');
    }

    private function resolveOpenTurn(DartX01ActiveLeg $leg, MatchPlayer $player): DartX01SoloActiveTurn
    {
        $latestTurn = DartX01SoloActiveTurn::query()
            ->where('leg_id', $leg->id)
            ->where('player_id', $player->id)
            ->orderByDesc('turn_number')
            ->with('throws')
            ->first();

        if ($latestTurn !== null
            && $latestTurn->throws->count() < 3
            && ! $latestTurn->is_bust
            && $latestTurn->remaining_points > 0
            && ! $latestTurn->throws()->where('is_leg_winner', true)->exists()
            && ! $latestTurn->throws()->where('input_source', 'calculator')->exists()
        ) {
            return $latestTurn;
        }

        $turnNumber = ($latestTurn?->turn_number ?? 0) + 1;
        $remainingBefore = $this->remainingBeforeTurn($leg, $player->id);

        return DartX01SoloActiveTurn::query()->create([
            'leg_id' => $leg->id,
            'player_id' => $player->id,
            'guest_id' => $player->guest_id,
            'guest_name' => $player->user_id === null ? $player->display_name : null,
            'turn_number' => $turnNumber,
            'points_scored' => 0,
            'is_bust' => false,
            'remaining_points' => $this->playerStartingPoints($leg, $player),
        ]);
    }

    private function remainingBeforeTurn(DartX01ActiveLeg $leg, int $playerId): int
    {
        $lastValidTurn = DartX01SoloActiveTurn::query()
            ->where('leg_id', $leg->id)
            ->where('player_id', $playerId)
            ->where('is_bust', false)
            ->orderByDesc('turn_number')
            ->first();

        if ($lastValidTurn !== null) {
            return $lastValidTurn->remaining_points;
        }

        $player = MatchPlayer::query()->find($playerId);

        return $player !== null
            ? $this->playerStartingPoints($leg, $player)
            : $leg->starting_points;
    }

    private function playerStartingPoints(DartX01ActiveLeg $leg, MatchPlayer $player): int
    {
        $leg->loadMissing('match.config');

        return $this->lobbySetup->resolvePlayerStartingPoints(
            $player,
            $leg->match->config->starting_points,
        );
    }

    private function remainingAtTurnStart(DartX01ActiveLeg $leg, MatchPlayer $player, DartX01SoloActiveTurn $turn): int
    {
        if ($turn->throws()->count() === 0 && $turn->points_scored === 0) {
            return $this->remainingBeforeTurn($leg, $player->id);
        }

        return $turn->remaining_points + $turn->points_scored;
    }

    private function playerHasScoredInLeg(DartX01ActiveLeg $leg, int $playerId): bool
    {
        return DartX01SoloActiveTurn::query()
            ->where('leg_id', $leg->id)
            ->where('player_id', $playerId)
            ->where('is_bust', false)
            ->where('points_scored', '>', 0)
            ->exists();
    }

    private function finishLeg(DartMatch $match, DartX01ActiveLeg $leg, MatchPlayer $winner): void
    {
        $leg->update([
            'status' => 'finished',
            'winner_player_id' => $winner->id,
        ]);

        $legsWon = DartX01ActiveLeg::query()
            ->where('match_id', $match->id)
            ->where('status', 'finished')
            ->where('winner_player_id', $winner->id)
            ->count();

        $required = $this->legsRequiredToWin($match);

        if ($legsWon >= $required) {
            $this->finishMatch($match, $winner);

            return;
        }

        $newLeg = DartX01ActiveLeg::query()->create([
            'match_id' => $match->id,
            'leg_number' => $leg->leg_number + 1,
            'starting_points' => $match->config->starting_points,
            'status' => 'active',
        ]);

        $match->refresh(['players', 'activeLeg']);
        $firstPlayerId = $this->stateService->resolveActivePlayerId($match, $newLeg->id);
        if ($firstPlayerId !== null) {
            $this->turnTimer->startForPlayer($match, $firstPlayerId);
        }
    }

    private function legsRequiredToWin(DartMatch $match): int
    {
        $config = $match->config;

        if ($config->format === X01Format::BestOf) {
            return (int) ceil($config->legs_target / 2);
        }

        return max(1, $config->legs_target);
    }

    private function finishMatch(DartMatch $match, MatchPlayer $winner): void
    {
        $match->update([
            'status' => MatchStatus::Finished,
            'winner_id' => $winner->user_id,
            'finished_at' => now(),
        ]);

        CompleteDartsMatchJob::dispatch($match->id);
    }
}
