<?php

namespace App\Services\Darts;

use App\Enums\MatchStatus;
use App\Events\MatchStateUpdated;
use App\Models\DartMatch;
use App\Models\MatchPlayer;
use App\Models\User;

class MatchScoringModeService
{
    public function __construct(
        private readonly MatchStateService $stateService,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function lockCalculatorMode(DartMatch $match, User $actor): array
    {
        if ($match->status !== MatchStatus::Active) {
            abort(422, 'match-not-active');
        }

        $player = $this->resolveActorPlayer($match, $actor);
        $this->applyReducedStatsTier($player);

        $match->refresh();
        $state = $this->stateService->buildState($match);
        broadcast(new MatchStateUpdated($match))->toOthers();

        return $state;
    }

    /**
     * @return array<string, mixed>
     */
    public function switchToBoardMode(DartMatch $match, User $actor): array
    {
        if ($match->status !== MatchStatus::Active) {
            abort(422, 'match-not-active');
        }

        $player = $this->resolveActorPlayer($match, $actor);

        if (($player->stats_tier ?? 'full') !== 'basic') {
            abort(422, 'stats-tier-not-reduced');
        }

        if ($player->scoring_mode !== 'board') {
            $player->update(['scoring_mode' => 'board']);
        }

        $match->refresh();
        $state = $this->stateService->buildState($match);
        broadcast(new MatchStateUpdated($match))->toOthers();

        return $state;
    }

    /**
     * @return array<string, mixed>
     */
    public function switchToCalculatorMode(DartMatch $match, User $actor): array
    {
        if ($match->status !== MatchStatus::Active) {
            abort(422, 'match-not-active');
        }

        $player = $this->resolveActorPlayer($match, $actor);

        if (($player->stats_tier ?? 'full') === 'basic') {
            if ($player->scoring_mode !== 'calculator') {
                $player->update(['scoring_mode' => 'calculator']);
            }

            $match->refresh();
            $state = $this->stateService->buildState($match);
            broadcast(new MatchStateUpdated($match))->toOthers();

            return $state;
        }

        return $this->lockCalculatorMode($match, $actor);
    }

    public function ensureCalculatorMode(MatchPlayer $player): void
    {
        $this->applyReducedStatsTier($player);
    }

    public function assertBoardInputAllowed(MatchPlayer $player): void
    {
        if (($player->scoring_mode ?? 'board') === 'calculator') {
            abort(403, 'calculator-mode-active');
        }
    }

    public function resolveActorPlayer(DartMatch $match, User $actor): MatchPlayer
    {
        $match->loadMissing('players');

        /** @var MatchPlayer|null $player */
        $player = $match->players->firstWhere('user_id', $actor->id);

        if ($player !== null) {
            return $player;
        }

        if ($match->host_user_id === $actor->id) {
            /** @var MatchPlayer|null $guestSlot */
            $guestSlot = $match->players->firstWhere('user_id', null);

            if ($guestSlot !== null) {
                return $guestSlot;
            }
        }

        abort(403, 'not-a-player');
    }

    private function applyReducedStatsTier(MatchPlayer $player): void
    {
        $updates = [];

        if ($player->scoring_mode !== 'calculator') {
            $updates['scoring_mode'] = 'calculator';
        }

        if (($player->stats_tier ?? 'full') !== 'basic') {
            $updates['stats_tier'] = 'basic';
        }

        if ($updates !== []) {
            $player->update($updates);
        }
    }
}
