<?php

namespace App\Services\Darts;

use App\Enums\LobbyInviteStatus;
use App\Enums\LobbyMode;
use App\Enums\MatchStatus;
use App\Events\LobbyInviteDismissed;
use App\Events\LobbyInviteReceived;
use App\Events\LobbyUpdated;
use App\Models\DartMatch;
use App\Models\Friendship;
use App\Models\LobbyInvite;
use App\Models\User;
use App\Services\UserPresenceService;
use Illuminate\Validation\ValidationException;

class LobbyInviteService
{
    public function __construct(
        private readonly MatchLobbyService $lobbyService,
        private readonly PlayerMatchAvailabilityService $availability,
        private readonly UserPresenceService $presence,
    ) {}

    public function sendInvite(DartMatch $match, User $host, User $invitee): LobbyInvite
    {
        $this->assertOnlineLobby($match);
        $this->assertCanInvite($match, $host, $invitee);

        $invite = LobbyInvite::query()->updateOrCreate(
            [
                'match_id' => $match->id,
                'invitee_id' => $invitee->id,
            ],
            [
                'inviter_id' => $host->id,
                'status' => LobbyInviteStatus::Pending,
                'expires_at' => now()->addHours(2),
            ],
        );

        $invite->loadMissing(['match.config', 'inviter']);

        broadcast(new LobbyInviteReceived($invite));
        $this->broadcastLobbyState($match);

        return $invite;
    }

    public function acceptInvite(LobbyInvite $invite, User $user): DartMatch
    {
        $this->assertInvitee($invite, $user);
        $this->assertPendingInvite($invite);

        $match = $invite->match()->with(['config', 'players'])->firstOrFail();

        $this->assertOnlineLobby($match);

        $current = $this->availability->currentMatchFor($user);

        if ($current !== null && $current->id !== $match->id) {
            if ($current->status === MatchStatus::Active) {
                throw ValidationException::withMessages([
                    'invite' => ['invite-unavailable'],
                ]);
            }

            $this->lobbyService->abandonLobby($current, $user);
        }

        $this->availability->assertAvailableForMatch($user, $match);
        $this->lobbyService->addRegisteredUser($match, $user);

        $invite->update(['status' => LobbyInviteStatus::Accepted]);

        return $match->fresh(['players', 'config']);
    }

    public function declineInvite(LobbyInvite $invite, User $user): void
    {
        $this->assertInvitee($invite, $user);
        $this->assertPendingInvite($invite);

        $match = $invite->match;

        $invite->update(['status' => LobbyInviteStatus::Declined]);

        broadcast(new LobbyInviteDismissed($invite->id, $invite->invitee_id));
        $this->broadcastLobbyState($match);
    }

    /**
     * @return list<int>
     */
    public function pendingInviteeIdsFor(DartMatch $match): array
    {
        return LobbyInvite::query()
            ->where('match_id', $match->id)
            ->where('status', LobbyInviteStatus::Pending)
            ->pluck('invitee_id')
            ->map(fn ($id) => (int) $id)
            ->values()
            ->all();
    }

    public function cancelPendingForMatch(DartMatch $match): void
    {
        $pending = LobbyInvite::query()
            ->where('match_id', $match->id)
            ->where('status', LobbyInviteStatus::Pending)
            ->get();

        if ($pending->isEmpty()) {
            return;
        }

        LobbyInvite::query()
            ->where('match_id', $match->id)
            ->where('status', LobbyInviteStatus::Pending)
            ->update(['status' => LobbyInviteStatus::Cancelled]);

        foreach ($pending as $invite) {
            broadcast(new LobbyInviteDismissed($invite->id, $invite->invitee_id));
        }

        $this->broadcastLobbyState($match);
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function pendingInvitesFor(User $user): array
    {
        return LobbyInvite::query()
            ->with(['match.config', 'inviter'])
            ->where('invitee_id', $user->id)
            ->where('status', LobbyInviteStatus::Pending)
            ->whereHas('match', fn ($query) => $query->where('status', MatchStatus::Lobby))
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (LobbyInvite $invite) => $this->serializeInvite($invite))
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public function serializeInvite(LobbyInvite $invite): array
    {
        $invite->loadMissing(['match.config', 'inviter']);

        return [
            'id' => $invite->id,
            'match_uuid' => $invite->match->uuid,
            'host_name' => $invite->inviter->name,
            'lobby_code' => $invite->match->lobby_code,
            'player_count' => $invite->match->players()->count(),
            'created_at' => $invite->created_at?->toIso8601String(),
        ];
    }

    private function assertOnlineLobby(DartMatch $match): void
    {
        if ($match->status !== MatchStatus::Lobby) {
            abort(422, 'lobby-not-ready');
        }

        $match->loadMissing('config');

        if ($match->config->mode !== LobbyMode::Online) {
            abort(422, 'lobby-invite-online-only');
        }
    }

    private function assertCanInvite(DartMatch $match, User $host, User $invitee): void
    {
        if ($match->host_user_id !== $host->id) {
            abort(403);
        }

        if ($host->id === $invitee->id) {
            throw ValidationException::withMessages([
                'invite' => ['invite-self'],
            ]);
        }

        if (! $this->areFriends($host, $invitee)) {
            throw ValidationException::withMessages([
                'invite' => ['invite-not-friend'],
            ]);
        }

        if (! $this->presence->isOnline($invitee)) {
            throw ValidationException::withMessages([
                'invite' => ['invite-offline'],
            ]);
        }

        $activity = $this->availability->activityStatus($invitee);

        if ($activity === 'in_game') {
            throw ValidationException::withMessages([
                'invite' => ['invite-unavailable'],
            ]);
        }

        if (! in_array($activity, ['online', 'in_lobby'], true)) {
            throw ValidationException::withMessages([
                'invite' => ['invite-offline'],
            ]);
        }

        if ($match->players()->where('user_id', $invitee->id)->exists()) {
            throw ValidationException::withMessages([
                'invite' => ['invite-already-in-lobby'],
            ]);
        }

        if ($match->players()->count() >= MatchLobbyService::MAX_LOBBY_PLAYERS) {
            throw ValidationException::withMessages([
                'invite' => ['lobby-full'],
            ]);
        }
    }

    private function assertInvitee(LobbyInvite $invite, User $user): void
    {
        if ($invite->invitee_id !== $user->id) {
            abort(403);
        }
    }

    private function assertPendingInvite(LobbyInvite $invite): void
    {
        if (! $invite->isPending()) {
            abort(422, 'invite-not-pending');
        }

        if ($invite->expires_at !== null && $invite->expires_at->isPast()) {
            $invite->update(['status' => LobbyInviteStatus::Expired]);
            abort(422, 'invite-expired');
        }
    }

    private function areFriends(User $first, User $second): bool
    {
        $friendship = Friendship::findBetween($first, $second);

        return $friendship !== null && $friendship->isAccepted();
    }

    private function broadcastLobbyState(DartMatch $match): void
    {
        broadcast(new LobbyUpdated($match->fresh(['players.user', 'config'])))->toOthers();
    }
}
