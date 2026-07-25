<?php

namespace App\Services\Darts;

use App\Enums\MatchStatus;
use App\Events\MatchStateUpdated;
use App\Models\DartMatch;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class MatchPlayLeaveService
{
    public function __construct(
        private readonly MatchAbandonService $abandonService,
    ) {}

    public function leave(DartMatch $match, User $user): void
    {
        DB::transaction(function () use ($match, $user): void {
            $match = DartMatch::query()->whereKey($match->id)->lockForUpdate()->firstOrFail();

            if ($match->status !== MatchStatus::Active) {
                abort(422, 'match-not-active');
            }

            $player = $match->players()->where('user_id', $user->id)->first();

            if ($player === null && $match->host_user_id !== $user->id) {
                abort(403);
            }

            if ($player !== null) {
                $player->delete();
            }

            $registeredRemaining = $match->players()->whereNotNull('user_id')->count();

            if ($registeredRemaining <= 1) {
                $this->abandonService->abandonAndDelete($match, 'all_left');

                return;
            }

            broadcast(new MatchStateUpdated($match->fresh([
                'config', 'players', 'legs', 'activeLeg.soloTurns.throws', 'activeLeg.soloTurns.player',
            ])))->toOthers();
        });
    }

    public function registeredParticipantCount(DartMatch $match): int
    {
        return $match->players()->whereNotNull('user_id')->count();
    }
}
