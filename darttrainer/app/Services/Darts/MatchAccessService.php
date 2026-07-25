<?php

namespace App\Services\Darts;

use App\Enums\MatchStatus;
use App\Models\DartMatch;
use App\Models\User;

class MatchAccessService
{
    public function isParticipant(DartMatch $match, User $user): bool
    {
        if ($match->host_user_id === $user->id) {
            return true;
        }

        return $match->players()->where('user_id', $user->id)->exists();
    }

    public function isHost(DartMatch $match, User $user): bool
    {
        return $match->host_user_id === $user->id;
    }

    public function canAccessPlayBoard(DartMatch $match, User $user): bool
    {
        return $this->isParticipant($match, $user);
    }

    public function canAccessFullState(DartMatch $match, User $user): bool
    {
        return $this->isParticipant($match, $user);
    }

    public function canAccessSpectatorState(DartMatch $match, User $user): bool
    {
        if ($this->isParticipant($match, $user)) {
            return false;
        }

        $match->loadMissing('config');

        return $match->status === MatchStatus::Active
            && (bool) $match->config->is_public;
    }

    public function assertLobbyAccess(DartMatch $match, User $user): void
    {
        if (! $this->isParticipant($match, $user)) {
            abort(403);
        }
    }

    public function assertPlayAccess(DartMatch $match, User $user): void
    {
        if ($this->canAccessPlayBoard($match, $user)) {
            return;
        }

        if ($this->canAccessSpectatorState($match, $user)) {
            return;
        }

        abort(403);
    }

    public function isSpectator(DartMatch $match, User $user): bool
    {
        return ! $this->isParticipant($match, $user)
            && $this->canAccessSpectatorState($match, $user);
    }

    /**
     * @return array{id: int, name: string}|false
     */
    public function broadcastUserPayload(DartMatch $match, User $user): array|false
    {
        if (! $this->isParticipant($match, $user)) {
            return false;
        }

        return ['id' => $user->id, 'name' => $user->name];
    }
}
