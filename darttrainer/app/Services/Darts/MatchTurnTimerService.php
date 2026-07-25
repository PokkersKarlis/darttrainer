<?php

namespace App\Services\Darts;

use App\Enums\LobbyMode;
use App\Enums\MatchStatus;
use App\Events\MatchStateUpdated;
use App\Models\DartMatch;
use App\Models\MatchPlayer;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class MatchTurnTimerService
{
    public const TIMEOUT_SECONDS = 180;

    public function startForPlayer(DartMatch $match, int $playerId): void
    {
        if ($match->status !== MatchStatus::Active || ! $this->isTimerEnabled($match)) {
            return;
        }

        $match->update([
            'turn_timer_player_id' => $playerId,
            'turn_timer_expires_at' => now()->addSeconds(self::TIMEOUT_SECONDS),
            'turn_timer_status' => 'running',
        ]);
    }

    public function syncExpiry(DartMatch $match): bool
    {
        if ($match->status !== MatchStatus::Active || ! $this->isTimerEnabled($match)) {
            return false;
        }

        if ($match->turn_timer_status === null
            || $match->turn_timer_expires_at === null
            || $match->turn_timer_status === 'expired'
        ) {
            return false;
        }

        if (now()->lt($match->turn_timer_expires_at)) {
            return false;
        }

        $match->update(['turn_timer_status' => 'expired']);

        return true;
    }

    public function onThrowRecorded(DartMatch $match, bool $turnCompleted, ?int $nextActivePlayerId): void
    {
        if ($match->status !== MatchStatus::Active || ! $this->isTimerEnabled($match)) {
            return;
        }

        if ($turnCompleted && $nextActivePlayerId !== null) {
            $this->startForPlayer($match, $nextActivePlayerId);

            return;
        }

        if ($match->turn_timer_status === 'expired') {
            $match->update([
                'turn_timer_expires_at' => now()->addSeconds(self::TIMEOUT_SECONDS),
                'turn_timer_status' => 'running',
            ]);
        }
    }

    /**
     * @return array<string, mixed>|null
     */
    public function buildTimerPayload(DartMatch $match): ?array
    {
        if (! $this->isTimerEnabled($match)) {
            return null;
        }

        if ($match->status !== MatchStatus::Active
            || $match->turn_timer_player_id === null
            || $match->turn_timer_expires_at === null
            || $match->turn_timer_status === null
        ) {
            return null;
        }

        $match->loadMissing('players');

        /** @var MatchPlayer|null $timedPlayer */
        $timedPlayer = $match->players->firstWhere('id', $match->turn_timer_player_id);

        if ($timedPlayer === null) {
            return null;
        }

        $secondsRemaining = max(0, (int) now()->diffInSeconds($match->turn_timer_expires_at, false));

        return [
            'player_id' => $timedPlayer->id,
            'player_name' => $timedPlayer->display_name,
            'status' => $match->turn_timer_status,
            'expires_at' => $match->turn_timer_expires_at->toIso8601String(),
            'seconds_remaining' => $match->turn_timer_status === 'expired' ? 0 : $secondsRemaining,
            'timeout_seconds' => self::TIMEOUT_SECONDS,
        ];
    }

    public function extend(DartMatch $match, User $user): void
    {
        DB::transaction(function () use ($match, $user): void {
            $match = DartMatch::query()->whereKey($match->id)->lockForUpdate()->firstOrFail();

            if ($match->status !== MatchStatus::Active) {
                abort(422, 'match-not-active');
            }

            if (! $this->isTimerEnabled($match)) {
                abort(422, 'turn-timer-disabled');
            }

            if ($match->turn_timer_status !== 'expired') {
                abort(422, 'turn-timer-not-expired');
            }

            $match->loadMissing('players');
            $timedPlayer = $match->players->firstWhere('id', $match->turn_timer_player_id);

            if ($timedPlayer === null || ! $this->canRespondToTimeout($match, $user, $timedPlayer)) {
                abort(403, 'turn-timer-cannot-respond');
            }

            $match->update([
                'turn_timer_expires_at' => now()->addSeconds(self::TIMEOUT_SECONDS),
                'turn_timer_status' => 'extended',
            ]);
        });

        $match = $match->fresh(['config', 'players', 'legs', 'activeLeg.soloTurns.throws', 'activeLeg.soloTurns.player']);
        broadcast(new MatchStateUpdated($match))->toOthers();
    }

    public function abandon(DartMatch $match, User $user): void
    {
        DB::transaction(function () use ($match, $user): void {
            $match = DartMatch::query()->whereKey($match->id)->lockForUpdate()->firstOrFail();

            if ($match->status !== MatchStatus::Active) {
                abort(422, 'match-not-active');
            }

            if (! $this->isTimerEnabled($match)) {
                abort(422, 'turn-timer-disabled');
            }

            if ($match->turn_timer_status !== 'expired') {
                abort(422, 'turn-timer-not-expired');
            }

            $match->loadMissing('players');
            $timedPlayer = $match->players->firstWhere('id', $match->turn_timer_player_id);

            if ($timedPlayer === null || ! $this->canRespondToTimeout($match, $user, $timedPlayer)) {
                abort(403, 'turn-timer-cannot-respond');
            }

            $uuid = $match->uuid;
            app(MatchAbandonService::class)->abandonAndDelete($match, 'turn_timeout');
        });
    }

    private function canRespondToTimeout(DartMatch $match, User $user, MatchPlayer $timedPlayer): bool
    {
        if ($this->isActiveSide($match, $user, $timedPlayer)) {
            return false;
        }

        return app(MatchAccessService::class)->isParticipant($match, $user);
    }

    private function isActiveSide(DartMatch $match, User $user, MatchPlayer $timedPlayer): bool
    {
        if ($timedPlayer->user_id === $user->id) {
            return true;
        }

        if ($timedPlayer->user_id === null && $match->host_user_id === $user->id) {
            return true;
        }

        return false;
    }

    private function isTimerEnabled(DartMatch $match): bool
    {
        $match->loadMissing('config');

        return $match->config->mode !== LobbyMode::Local;
    }
}
