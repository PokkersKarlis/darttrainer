<?php

namespace App\Services\Darts;

use App\Enums\MatchStatus;
use App\Models\DartMatch;
use App\Models\User;
use App\Services\UserPresenceService;
use Illuminate\Validation\ValidationException;

class PlayerMatchAvailabilityService
{
    public function __construct(
        private readonly UserPresenceService $presence,
    ) {}

    public function currentMatchFor(User $user): ?DartMatch
    {
        return DartMatch::query()
            ->whereIn('status', [MatchStatus::Lobby, MatchStatus::Active])
            ->where(function ($query) use ($user): void {
                $query->where('host_user_id', $user->id)
                    ->orWhereHas('players', fn ($playerQuery) => $playerQuery->where('user_id', $user->id));
            })
            ->latest('id')
            ->first();
    }

    public function activityStatus(User $user): string
    {
        $match = $this->currentMatchFor($user);

        if ($match === null) {
            return $this->presence->isOnline($user) ? 'online' : 'away';
        }

        if ($match->status === MatchStatus::Active) {
            return 'in_game';
        }

        return 'in_lobby';
    }

    public function isAvailableForMatch(User $user, ?DartMatch $targetMatch = null): bool
    {
        $current = $this->currentMatchFor($user);

        if ($current === null) {
            return true;
        }

        if ($targetMatch !== null && $current->id === $targetMatch->id) {
            return true;
        }

        return false;
    }

    /**
     * @return array{uuid: string, mode: string, is_host: bool, status: string, lobby_code: string|null, player_count: int}|null
     */
    public function activeLobbyFor(User $user): ?array
    {
        $match = $this->currentMatchFor($user);

        if ($match === null) {
            return null;
        }

        $match->loadMissing(['config', 'players']);

        return [
            'uuid' => $match->uuid,
            'mode' => $match->config->mode->value,
            'is_host' => $match->host_user_id === $user->id,
            'status' => $match->status->value,
            'lobby_code' => $match->lobby_code,
            'player_count' => $match->players->count(),
        ];
    }

    public function assertAvailableForMatch(User $user, ?DartMatch $targetMatch = null): void
    {
        if ($this->isAvailableForMatch($user, $targetMatch)) {
            return;
        }

        throw ValidationException::withMessages([
            'player' => ['player-unavailable'],
        ]);
    }
}
