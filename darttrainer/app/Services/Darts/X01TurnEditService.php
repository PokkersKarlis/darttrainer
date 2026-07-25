<?php

namespace App\Services\Darts;

use App\Enums\MatchStatus;
use App\Events\MatchStateUpdated;
use App\Models\DartMatch;
use App\Models\DartX01ActiveLeg;
use App\Models\DartX01SoloActiveThrow;
use App\Models\DartX01SoloActiveTurn;
use App\Models\MatchPlayer;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class X01TurnEditService
{
    public function __construct(
        private readonly X01ScoringService $scoring,
        private readonly X01MatchPlayService $playService,
        private readonly MatchStateService $stateService,
        private readonly MatchTurnTimerService $turnTimer,
        private readonly X01TurnEditAuditService $audit,
        private readonly X01DartPointsMapper $dartPoints,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function updateTurnFromVisitPoints(DartMatch $match, User $actor, int $turnId, int $points): array
    {
        $this->dartPoints->assertValidVisitPoints($points);

        $darts = $this->dartPoints->visitPointsToDarts($points);
        if ($darts === null || $darts === []) {
            abort(422, 'invalid-visit-points');
        }

        return $this->updateTurn($match, $actor, $turnId, $darts, 'calculator');
    }

    /**
     * @param  list<array{sector: int, multiplier: int}>  $darts
     * @return array<string, mixed>
     */
    public function updateTurn(
        DartMatch $match,
        User $actor,
        int $turnId,
        array $darts,
        string $inputSource = 'board',
    ): array {
        if (count($darts) < 1 || count($darts) > 3) {
            abort(422, 'invalid-turn-length');
        }

        foreach ($darts as $dart) {
            $this->playService->assertValidDart((int) $dart['sector'], (int) $dart['multiplier']);
        }

        return DB::transaction(function () use ($match, $actor, $turnId, $darts, $inputSource): array {
            $match = DartMatch::query()->whereKey($match->id)->lockForUpdate()->firstOrFail();

            if ($match->status !== MatchStatus::Active) {
                abort(422, 'match-not-active');
            }

            /** @var DartX01SoloActiveTurn $turn */
            $turn = DartX01SoloActiveTurn::query()
                ->whereKey($turnId)
                ->whereHas('leg', fn ($q) => $q->where('match_id', $match->id))
                ->firstOrFail();

            $this->assertCanEdit($match, $actor, $turn);

            /** @var DartX01ActiveLeg $leg */
            $leg = $turn->leg()->firstOrFail();

            if ($leg->status !== 'active') {
                abort(422, 'leg-not-active');
            }

            $before = $this->audit->snapshotTurn($turn);
            $legNumber = (int) $leg->leg_number;

            $turn->throws()->delete();

            foreach ($darts as $index => $dart) {
                DartX01SoloActiveThrow::query()->create([
                    'turn_id' => $turn->id,
                    'throw_number' => $index + 1,
                    'sector' => (int) $dart['sector'],
                    'multiplier' => (int) $dart['multiplier'],
                    'input_source' => $inputSource,
                    'is_leg_winner' => false,
                ]);
            }

            $this->recalculateLegFromTurn($match, $leg, $turn);

            $turn->refresh()->load('throws');
            $after = $this->audit->snapshotTurn($turn);
            $this->audit->recordEdit($match, $actor, $turn, $legNumber, $before, $after);

            $match = $match->fresh(['config', 'players', 'legs', 'activeLeg.soloTurns.throws', 'activeLeg.soloTurns.player']);
            $state = $this->stateService->buildState($match);
            broadcast(new MatchStateUpdated($match))->toOthers();

            return $state;
        });
    }

    private function assertCanEdit(DartMatch $match, User $actor, DartX01SoloActiveTurn $turn): void
    {
        if ($match->host_user_id === $actor->id) {
            return;
        }

        /** @var MatchPlayer|null $player */
        $player = $turn->player()->first();

        if ($player !== null && $player->user_id === $actor->id) {
            return;
        }

        abort(403, 'cannot-edit-turn');
    }

    private function recalculateLegFromTurn(DartMatch $match, DartX01ActiveLeg $leg, DartX01SoloActiveTurn $fromTurn): void
    {
        $turns = DartX01SoloActiveTurn::query()
            ->where('leg_id', $leg->id)
            ->orderBy('id')
            ->with('throws')
            ->get();

        $startIndex = $turns->search(fn (DartX01SoloActiveTurn $turn) => $turn->id === $fromTurn->id);

        if ($startIndex === false) {
            return;
        }

        $remainingByPlayer = [];

        for ($index = 0; $index < $turns->count(); $index++) {
            /** @var DartX01SoloActiveTurn $turn */
            $turn = $turns[$index];
            $playerId = (int) $turn->player_id;

            if ($index < $startIndex) {
                if (! $turn->is_bust) {
                    $remainingByPlayer[$playerId] = $turn->remaining_points;
                }

                continue;
            }

            $remainingBefore = $remainingByPlayer[$playerId]
                ?? $this->startingRemainingForPlayer($leg, $playerId, $turns, $index);

            $playerHasScored = $this->playerHasScoredBeforeTurn($leg, $playerId, $turn->id);

            $dartPayload = $turn->throws
                ->sortBy('throw_number')
                ->map(fn (DartX01SoloActiveThrow $throw) => [
                    'sector' => $throw->sector,
                    'multiplier' => $throw->multiplier,
                ])
                ->values()
                ->all();

            $evaluation = $this->scoring->evaluateTurn(
                $remainingBefore,
                $dartPayload,
                $match->config->in_rule,
                $match->config->out_rule,
                $playerHasScored,
            );

            $turn->update([
                'points_scored' => $evaluation['is_bust'] ? 0 : $evaluation['points_scored'],
                'remaining_points' => $evaluation['is_bust'] ? $remainingBefore : $evaluation['remaining'],
                'is_bust' => $evaluation['is_bust'],
            ]);

            foreach ($evaluation['throws'] as $throwResult) {
                $turn->throws()
                    ->where('throw_number', $throwResult['throw_number'])
                    ->update(['is_leg_winner' => $throwResult['is_leg_winner']]);
            }

            if (! $evaluation['is_bust']) {
                $remainingByPlayer[$playerId] = $evaluation['remaining'];
            }

            if ($evaluation['won']) {
                $leg->update([
                    'status' => 'finished',
                    'winner_player_id' => $playerId,
                ]);

                /** @var MatchPlayer $winner */
                $winner = $match->players()->whereKey($playerId)->firstOrFail();
                $this->playService->finishLegAfterEdit($match, $leg, $winner);

                return;
            }
        }

        $activeId = $this->stateService->resolveActivePlayerId($match, $leg->id);
        if ($activeId !== null) {
            $this->turnTimer->startForPlayer($match, $activeId);
        }
    }

    private function startingRemainingForPlayer(
        DartX01ActiveLeg $leg,
        int $playerId,
        $turns,
        int $currentIndex,
    ): int {
        for ($i = $currentIndex - 1; $i >= 0; $i--) {
            /** @var DartX01SoloActiveTurn $prior */
            $prior = $turns[$i];
            if ((int) $prior->player_id === $playerId && ! $prior->is_bust) {
                return $prior->remaining_points;
            }
        }

        return $leg->starting_points;
    }

    private function playerHasScoredBeforeTurn(DartX01ActiveLeg $leg, int $playerId, int $turnId): bool
    {
        return DartX01SoloActiveTurn::query()
            ->where('leg_id', $leg->id)
            ->where('player_id', $playerId)
            ->where('id', '<', $turnId)
            ->where('is_bust', false)
            ->where('points_scored', '>', 0)
            ->exists();
    }
}
