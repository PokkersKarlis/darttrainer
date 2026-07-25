<?php

namespace Tests\Feature\Darts;

use App\Enums\FriendshipStatus;
use App\Enums\LobbyInviteStatus;
use App\Events\LobbyInviteReceived;
use App\Models\Friendship;
use App\Models\LobbyInvite;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\Support\CreatesDartsLobby;
use Tests\TestCase;

class LobbyInviteTest extends TestCase
{
    use CreatesDartsLobby;
    use RefreshDatabase;

    public function test_host_can_send_lobby_invite_to_online_friend(): void
    {
        Event::fake([LobbyInviteReceived::class]);

        $host = User::factory()->create(['last_seen_at' => now()]);
        $friend = User::factory()->create(['last_seen_at' => now()]);
        $this->befriend($host, $friend);
        $match = $this->createDartsLobby($host, mode: 'online');

        $this->actingAs($host)
            ->post("/darts/x01/multiplayer/{$match->uuid}/invites", [
                'user_id' => $friend->id,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('lobby_invites', [
            'match_id' => $match->id,
            'inviter_id' => $host->id,
            'invitee_id' => $friend->id,
            'status' => LobbyInviteStatus::Pending->value,
        ]);

        Event::assertDispatched(LobbyInviteReceived::class, fn (LobbyInviteReceived $event) => $event->invite->invitee_id === $friend->id);
    }

    public function test_invitee_sees_pending_invite_in_shared_props(): void
    {
        $host = User::factory()->create(['last_seen_at' => now()]);
        $friend = User::factory()->create(['last_seen_at' => now()]);
        $this->befriend($host, $friend);
        $match = $this->createDartsLobby($host, mode: 'online');

        $this->actingAs($host)
            ->post("/darts/x01/multiplayer/{$match->uuid}/invites", [
                'user_id' => $friend->id,
            ])
            ->assertRedirect();

        $this->actingAs($friend)
            ->get('/')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('pendingLobbyInvites', 1)
                ->where('pendingLobbyInvites.0.match_uuid', $match->uuid)
                ->where('pendingLobbyInvites.0.host_name', $host->name)
            );
    }

    public function test_invitee_can_accept_lobby_invite_and_join_lobby(): void
    {
        $host = User::factory()->create(['last_seen_at' => now()]);
        $friend = User::factory()->create(['last_seen_at' => now()]);
        $this->befriend($host, $friend);
        $match = $this->createDartsLobby($host, mode: 'online');

        $this->actingAs($host)
            ->post("/darts/x01/multiplayer/{$match->uuid}/invites", [
                'user_id' => $friend->id,
            ]);

        $invite = LobbyInvite::query()->firstOrFail();

        $this->actingAs($friend)
            ->post("/darts/x01/lobby-invites/{$invite->id}/accept")
            ->assertRedirect(route('darts.x01.lobby.show', $match->uuid));

        $this->assertDatabaseHas('match_players', [
            'match_id' => $match->id,
            'user_id' => $friend->id,
        ]);

        $this->assertDatabaseHas('lobby_invites', [
            'id' => $invite->id,
            'status' => LobbyInviteStatus::Accepted->value,
        ]);
    }

    public function test_invitee_can_decline_lobby_invite(): void
    {
        $host = User::factory()->create(['last_seen_at' => now()]);
        $friend = User::factory()->create(['last_seen_at' => now()]);
        $this->befriend($host, $friend);
        $match = $this->createDartsLobby($host, mode: 'online');

        $this->actingAs($host)
            ->post("/darts/x01/multiplayer/{$match->uuid}/invites", [
                'user_id' => $friend->id,
            ]);

        $invite = LobbyInvite::query()->firstOrFail();

        $this->actingAs($friend)
            ->post("/darts/x01/lobby-invites/{$invite->id}/decline")
            ->assertRedirect();

        $this->assertDatabaseHas('lobby_invites', [
            'id' => $invite->id,
            'status' => LobbyInviteStatus::Declined->value,
        ]);

        $this->assertDatabaseMissing('match_players', [
            'match_id' => $match->id,
            'user_id' => $friend->id,
        ]);
    }

    public function test_cannot_invite_friend_who_is_in_active_match(): void
    {
        $host = User::factory()->create(['last_seen_at' => now()]);
        $busyFriend = User::factory()->create(['last_seen_at' => now()]);
        $this->befriend($host, $busyFriend);
        $match = $this->createDartsLobby($host, mode: 'online');

        $busyMatch = $this->createDartsLobby($busyFriend);
        $this->addGuestToLobby($busyFriend, $busyMatch, 'Opponent');
        $this->startDartsMatch($busyFriend, $busyMatch);

        $this->actingAs($host)
            ->post("/darts/x01/multiplayer/{$match->uuid}/invites", [
                'user_id' => $busyFriend->id,
            ])
            ->assertSessionHasErrors('invite');

        $this->assertDatabaseCount('lobby_invites', 0);
    }

    public function test_can_invite_friend_who_is_in_another_lobby(): void
    {
        Event::fake([LobbyInviteReceived::class, \App\Events\LobbyUpdated::class]);

        $host = User::factory()->create(['last_seen_at' => now()]);
        $friendInLobby = User::factory()->create(['last_seen_at' => now()]);
        $this->befriend($host, $friendInLobby);
        $match = $this->createDartsLobby($host, mode: 'online');
        $this->createDartsLobby($friendInLobby, mode: 'online');

        $this->actingAs($host)
            ->post("/darts/x01/multiplayer/{$match->uuid}/invites", [
                'user_id' => $friendInLobby->id,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('lobby_invites', [
            'match_id' => $match->id,
            'invitee_id' => $friendInLobby->id,
            'status' => LobbyInviteStatus::Pending->value,
        ]);
    }

    public function test_invitee_can_accept_invite_and_leave_previous_lobby(): void
    {
        $host = User::factory()->create(['last_seen_at' => now()]);
        $otherHost = User::factory()->create(['last_seen_at' => now()]);
        $friend = User::factory()->create(['last_seen_at' => now()]);
        $this->befriend($host, $friend);
        $targetMatch = $this->createDartsLobby($host, mode: 'online');
        $previousMatch = $this->createDartsLobby($otherHost, mode: 'online');
        $this->joinDartsLobby($friend, $previousMatch);

        $this->actingAs($host)
            ->post("/darts/x01/multiplayer/{$targetMatch->uuid}/invites", [
                'user_id' => $friend->id,
            ]);

        $invite = LobbyInvite::query()->where('match_id', $targetMatch->id)->firstOrFail();

        $this->actingAs($friend)
            ->post("/darts/x01/lobby-invites/{$invite->id}/accept")
            ->assertRedirect(route('darts.x01.lobby.show', $targetMatch->uuid));

        $this->assertDatabaseMissing('match_players', [
            'match_id' => $previousMatch->id,
            'user_id' => $friend->id,
        ]);

        $this->assertDatabaseHas('match_players', [
            'match_id' => $targetMatch->id,
            'user_id' => $friend->id,
        ]);
    }

    public function test_cannot_invite_offline_friend(): void
    {
        $host = User::factory()->create(['last_seen_at' => now()]);
        $friend = User::factory()->create(['last_seen_at' => now()->subHour()]);
        $this->befriend($host, $friend);
        $match = $this->createDartsLobby($host, mode: 'online');

        $this->actingAs($host)
            ->post("/darts/x01/multiplayer/{$match->uuid}/invites", [
                'user_id' => $friend->id,
            ])
            ->assertSessionHasErrors('invite');

        $this->assertDatabaseCount('lobby_invites', 0);
    }

    public function test_cannot_invite_non_friend(): void
    {
        $host = User::factory()->create(['last_seen_at' => now()]);
        $stranger = User::factory()->create(['last_seen_at' => now()]);
        $match = $this->createDartsLobby($host, mode: 'online');

        $this->actingAs($host)
            ->post("/darts/x01/multiplayer/{$match->uuid}/invites", [
                'user_id' => $stranger->id,
            ])
            ->assertSessionHasErrors('invite');

        $this->assertDatabaseCount('lobby_invites', 0);
    }

    public function test_non_host_cannot_send_lobby_invite(): void
    {
        $host = User::factory()->create(['last_seen_at' => now()]);
        $guest = User::factory()->create(['last_seen_at' => now()]);
        $friend = User::factory()->create(['last_seen_at' => now()]);
        $this->befriend($guest, $friend);
        $match = $this->createDartsLobby($host, mode: 'online');
        $this->joinDartsLobby($guest, $match);

        $this->actingAs($guest)
            ->post("/darts/x01/multiplayer/{$match->uuid}/invites", [
                'user_id' => $friend->id,
            ])
            ->assertForbidden();

        $this->assertDatabaseCount('lobby_invites', 0);
    }

    public function test_online_lobby_cannot_directly_add_registered_user(): void
    {
        $host = User::factory()->create(['last_seen_at' => now()]);
        $friend = User::factory()->create(['last_seen_at' => now()]);
        $this->befriend($host, $friend);
        $match = $this->createDartsLobby($host, mode: 'online');

        $this->actingAs($host)
            ->post("/darts/x01/multiplayer/{$match->uuid}/players", [
                'user_id' => $friend->id,
            ])
            ->assertSessionHasErrors('player');

        $this->assertDatabaseMissing('match_players', [
            'match_id' => $match->id,
            'user_id' => $friend->id,
        ]);
    }

    public function test_pending_invites_cancel_when_lobby_starts(): void
    {
        $host = User::factory()->create(['last_seen_at' => now()]);
        $invitedFriend = User::factory()->create(['last_seen_at' => now()]);
        $joiningFriend = User::factory()->create(['last_seen_at' => now()]);
        $this->befriend($host, $invitedFriend);
        $match = $this->createDartsLobby($host, mode: 'online');

        $this->actingAs($host)
            ->post("/darts/x01/multiplayer/{$match->uuid}/invites", [
                'user_id' => $invitedFriend->id,
            ]);

        $inviteId = LobbyInvite::query()->value('id');

        $this->joinDartsLobby($joiningFriend, $match);
        $this->startDartsMatch($host, $match->fresh());

        $this->assertDatabaseHas('lobby_invites', [
            'id' => $inviteId,
            'status' => LobbyInviteStatus::Cancelled->value,
        ]);
    }

    private function befriend(User $requester, User $addressee): void
    {
        Friendship::query()->create([
            'requester_id' => $requester->id,
            'addressee_id' => $addressee->id,
            'status' => FriendshipStatus::Accepted,
        ]);
    }
}
