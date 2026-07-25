<?php

namespace Tests\Feature\Darts;

use App\Models\DartMatch;
use App\Models\User;
use App\Models\UserLocalGuest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\Support\CreatesDartsLobby;
use Tests\TestCase;

class DartsLobbyTest extends TestCase
{
    use CreatesDartsLobby;
    use RefreshDatabase;

    public function test_unverified_user_cannot_access_x01_lobby(): void
    {
        $user = User::factory()->unverified()->create();

        $this->actingAs($user)
            ->get('/darts/x01/multiplayer')
            ->assertRedirect(route('home'))
            ->assertSessionHas('status', 'email-verification-required');
    }

    public function test_verified_user_can_open_x01_lobby(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/darts/x01/multiplayer')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('activeLobby', null));
    }

    public function test_lobby_index_redirects_to_lobby_when_user_already_in_one(): void
    {
        $host = User::factory()->create();
        $match = $this->createDartsLobby($host, mode: 'online');

        $this->actingAs($host)
            ->get('/darts/x01/multiplayer')
            ->assertRedirect(route('darts.x01.lobby.show', $match->uuid));
    }

    public function test_lobby_index_redirects_to_play_when_user_is_in_active_match(): void
    {
        $host = User::factory()->create();
        $match = $this->createDartsLobby($host);
        $this->addGuestToLobby($host, $match, 'Guest Two');
        $match = $this->startDartsMatch($host, $match);

        $this->actingAs($host)
            ->get('/darts/x01/multiplayer')
            ->assertRedirect(route('darts.x01.play', $match->uuid));
    }

    public function test_verified_user_can_create_local_lobby(): void
    {
        $user = User::factory()->create();

        $this->createDartsLobby($user);

        $this->assertDatabaseHas('matches', [
            'host_user_id' => $user->id,
            'status' => 'lobby',
        ]);
    }

    public function test_online_lobby_gets_unique_numeric_dash_code(): void
    {
        $user = User::factory()->create();
        $match = $this->createDartsLobby($user, mode: 'online');

        $this->assertNotNull($match->lobby_code);
        $this->assertMatchesRegularExpression('/^\d{2,4}-\d{2,4}$/', $match->lobby_code);
    }

    public function test_online_lobby_persists_selected_match_type(): void
    {
        $user = User::factory()->create(['last_seen_at' => now()]);

        $this->actingAs($user)
            ->post('/darts/x01/multiplayer', [
                'mode' => 'online',
                'match_type' => 'team',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('matches', [
            'host_user_id' => $user->id,
            'match_type' => 'team',
        ]);
    }

    public function test_host_can_update_match_type_in_lobby(): void
    {
        $host = User::factory()->create(['last_seen_at' => now()]);
        $match = $this->createDartsLobby($host, mode: 'online');

        $this->actingAs($host)
            ->patch("/darts/x01/multiplayer/{$match->uuid}/match-type", [
                'match_type' => 'team',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('matches', [
            'id' => $match->id,
            'match_type' => 'team',
        ]);
    }

    public function test_user_can_join_online_lobby_by_code(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createDartsLobby($host, mode: 'online');

        $this->joinDartsLobby($guest, $match);

        $this->assertDatabaseHas('match_players', [
            'match_id' => $match->id,
            'user_id' => $guest->id,
        ]);
    }

    public function test_join_with_malformed_code_returns_validation_error(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/darts/x01/multiplayer/join', ['lobby_code' => 'ZZZZZZ'])
            ->assertSessionHasErrors('lobby_code');
    }

    public function test_join_with_unknown_valid_code_returns_not_found(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/darts/x01/multiplayer/join', ['lobby_code' => '12-3456'])
            ->assertNotFound();
    }

    public function test_open_lobbies_cannot_share_the_same_code(): void
    {
        $host = User::factory()->create();
        $match = $this->createDartsLobby($host, mode: 'online');

        $this->expectException(\Illuminate\Database\UniqueConstraintViolationException::class);

        DartMatch::query()->create([
            'lobby_code' => $match->lobby_code,
            'game_type' => 'darts_x01',
            'match_type' => 'solo',
            'status' => 'lobby',
            'host_user_id' => User::factory()->create()->id,
        ]);
    }

    public function test_lobby_code_is_cleared_when_match_starts(): void
    {
        $host = User::factory()->create();
        $match = $this->createDartsLobby($host, mode: 'online');

        $this->addGuestToLobby($host, $match, 'Guest Two');
        $match = $this->startDartsMatch($host, $match);

        $this->assertNull($match->lobby_code);
    }

    public function test_freed_lobby_code_can_be_reused(): void
    {
        $host = User::factory()->create();
        $match = $this->createDartsLobby($host, mode: 'online');
        $code = $match->lobby_code;

        $this->addGuestToLobby($host, $match, 'Guest Two');
        $this->startDartsMatch($host, $match);

        $otherHost = User::factory()->create();

        DartMatch::query()->create([
            'lobby_code' => $code,
            'game_type' => 'darts_x01',
            'match_type' => 'solo',
            'status' => 'lobby',
            'host_user_id' => $otherHost->id,
        ]);

        $this->assertDatabaseHas('matches', [
            'lobby_code' => $code,
            'status' => 'lobby',
            'host_user_id' => $otherHost->id,
        ]);
    }

    public function test_host_cannot_start_until_all_players_are_ready(): void
    {
        $host = User::factory()->create(['last_seen_at' => now()]);
        $guest = User::factory()->create(['last_seen_at' => now()]);
        $match = $this->createDartsLobby($host, mode: 'online');
        $this->joinDartsLobby($guest, $match);

        $guestPlayer = $match->fresh()->players()->where('user_id', $guest->id)->firstOrFail();
        $guestPlayer->update(['status' => 'waiting']);

        $this->actingAs($host)
            ->post("/darts/x01/multiplayer/{$match->uuid}/start")
            ->assertStatus(422);

        $this->actingAs($host)
            ->getJson("/v1/darts/matches/{$match->uuid}/lobby")
            ->assertOk()
            ->assertJsonPath('can_proceed', false);
    }

    public function test_player_can_toggle_own_ready_status(): void
    {
        $host = User::factory()->create(['last_seen_at' => now()]);
        $guest = User::factory()->create(['last_seen_at' => now()]);
        $match = $this->createDartsLobby($host, mode: 'online');
        $this->joinDartsLobby($guest, $match);

        $guestPlayer = $match->fresh()->players()->where('user_id', $guest->id)->firstOrFail();

        $this->actingAs($guest)
            ->patch("/darts/x01/multiplayer/{$match->uuid}/players/{$guestPlayer->id}/ready", [
                'ready' => false,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('match_players', [
            'id' => $guestPlayer->id,
            'status' => 'waiting',
        ]);

        $this->actingAs($guest)
            ->patch("/darts/x01/multiplayer/{$match->uuid}/players/{$guestPlayer->id}/ready", [
                'ready' => true,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('match_players', [
            'id' => $guestPlayer->id,
            'status' => 'ready',
        ]);
    }

    public function test_host_can_toggle_guest_ready_status(): void
    {
        $host = User::factory()->create(['last_seen_at' => now()]);
        $match = $this->createDartsLobby($host);
        $this->addGuestToLobby($host, $match, 'Guest Two');

        $guestPlayer = $match->fresh()->players()->whereNull('user_id')->firstOrFail();

        $this->actingAs($host)
            ->patch("/darts/x01/multiplayer/{$match->uuid}/players/{$guestPlayer->id}/ready", [
                'ready' => false,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('match_players', [
            'id' => $guestPlayer->id,
            'status' => 'waiting',
        ]);
    }

    public function test_non_host_cannot_add_players(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $friend = User::factory()->create();
        $match = $this->createDartsLobby($host, mode: 'online');
        $this->joinDartsLobby($guest, $match);

        $this->actingAs($guest)
            ->post("/darts/x01/multiplayer/{$match->uuid}/players", [
                'user_id' => $friend->id,
            ])
            ->assertForbidden();
    }

    public function test_host_can_add_guest_and_optionally_save_to_profile(): void
    {
        $host = User::factory()->create();
        $match = $this->createDartsLobby($host);

        $this->addGuestToLobby($host, $match, 'Local Guest', save: true);

        $this->assertDatabaseHas('match_players', [
            'match_id' => $match->id,
            'display_name' => 'Local Guest',
        ]);
        $this->assertDatabaseHas('user_local_guests', [
            'user_id' => $host->id,
            'name' => 'Local Guest',
        ]);
    }

    public function test_host_can_update_config_including_public_flag(): void
    {
        $host = User::factory()->create();
        $match = $this->createDartsLobby($host);

        $this->updateLobbyConfig($host, $match, [
            'starting_points' => 301,
            'track_checkout_rate' => true,
            'is_public' => true,
        ]);

        $this->assertDatabaseHas('dart_x01_match_configs', [
            'match_id' => $match->id,
            'starting_points' => 301,
            'in_rule' => 'straight',
            'out_rule' => 'double',
            'track_checkout_rate' => true,
            'is_public' => true,
        ]);
    }

    public function test_host_can_update_config_via_json(): void
    {
        $host = User::factory()->create();
        $match = $this->createDartsLobby($host, mode: 'online');

        $this->actingAs($host)
            ->patchJson("/darts/x01/multiplayer/{$match->uuid}/config", [
                'format' => 'first_to',
                'legs_target' => 3,
                'sets_target' => 1,
                'starting_points' => 301,
                'in_rule' => 'straight',
                'out_rule' => 'double',
                'track_checkout_rate' => true,
                'is_public' => true,
            ])
            ->assertOk()
            ->assertJsonPath('data.config.starting_points', 301)
            ->assertJsonPath('data.config.legs_target', 3)
            ->assertJsonPath('data.config.is_public', true);
    }

    public function test_match_players_table_has_no_deprecated_presence_columns(): void
    {
        $this->assertFalse(Schema::hasColumn('match_players', 'is_online'));
        $this->assertFalse(Schema::hasColumn('match_players', 'last_seen_at'));
        $this->assertTrue(Schema::hasColumn('users', 'last_seen_at'));
    }

    public function test_non_host_cannot_update_config(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createDartsLobby($host, mode: 'online');
        $this->joinDartsLobby($guest, $match);

        $this->actingAs($guest)
            ->patch("/darts/x01/multiplayer/{$match->uuid}/config", [
                'format' => 'first_to',
                'legs_target' => 1,
                'sets_target' => 1,
                'starting_points' => 501,
                'in_rule' => 'straight',
                'out_rule' => 'double',
                'track_checkout_rate' => false,
                'is_public' => true,
            ])
            ->assertForbidden();
    }

    public function test_match_cannot_start_with_fewer_than_two_players(): void
    {
        $host = User::factory()->create();
        $match = $this->createDartsLobby($host);

        $this->actingAs($host)
            ->post("/darts/x01/multiplayer/{$match->uuid}/start")
            ->assertStatus(422);
    }

    public function test_host_can_start_match_with_two_players(): void
    {
        $host = User::factory()->create();
        $match = $this->createDartsLobby($host);
        $this->addGuestToLobby($host, $match, 'Guest Two');

        $match = $this->startDartsMatch($host, $match);

        $this->assertSame('active', $match->status->value);
        $this->assertDatabaseHas('dart_x01_active_legs', [
            'match_id' => $match->id,
            'leg_number' => 1,
            'status' => 'active',
        ]);
    }

    public function test_match_state_api_requires_verified_auth(): void
    {
        $user = User::factory()->create();
        $match = $this->createDartsLobby($user);

        $this->actingAs($user)
            ->get("/v1/darts/matches/{$match->uuid}/state")
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'match_uuid',
                    'status',
                    'game_type',
                    'config',
                    'current_state',
                    'scoreboard',
                ],
            ]);
    }

    public function test_host_abandoning_lobby_deletes_match_and_related_rows(): void
    {
        $host = User::factory()->create();
        $match = $this->createDartsLobby($host);
        $matchId = $match->id;

        $this->actingAs($host)
            ->delete("/darts/x01/multiplayer/{$match->uuid}")
            ->assertRedirect(route('darts.x01.lobby.index'));

        $this->assertDatabaseMissing('matches', ['id' => $matchId]);
        $this->assertDatabaseMissing('match_players', ['match_id' => $matchId]);
        $this->assertDatabaseMissing('dart_x01_match_configs', ['match_id' => $matchId]);
    }

    public function test_host_abandoning_lobby_via_json_returns_ok(): void
    {
        $host = User::factory()->create();
        $match = $this->createDartsLobby($host);

        $this->actingAs($host)
            ->deleteJson("/darts/x01/multiplayer/{$match->uuid}")
            ->assertOk()
            ->assertJson(['ok' => true]);

        $this->assertDatabaseMissing('matches', ['id' => $match->id]);
    }

    public function test_non_host_leaving_lobby_removes_only_their_player(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createDartsLobby($host, mode: 'online');
        $this->joinDartsLobby($guest, $match);

        $this->assertDatabaseCount('match_players', 2);

        $this->actingAs($guest)
            ->delete("/darts/x01/multiplayer/{$match->uuid}")
            ->assertRedirect(route('darts.x01.lobby.index'));

        $this->assertDatabaseHas('matches', ['id' => $match->id]);
        $this->assertDatabaseCount('match_players', 1);
        $this->assertDatabaseMissing('match_players', [
            'match_id' => $match->id,
            'user_id' => $guest->id,
        ]);
    }

    public function test_user_cannot_abandon_lobby_they_are_not_in(): void
    {
        $host = User::factory()->create();
        $stranger = User::factory()->create();
        $match = $this->createDartsLobby($host);

        $this->actingAs($stranger)
            ->delete("/darts/x01/multiplayer/{$match->uuid}")
            ->assertForbidden();

        $this->assertDatabaseHas('matches', ['id' => $match->id]);
    }

    public function test_abandoning_active_match_is_not_allowed(): void
    {
        $host = User::factory()->create();
        $match = $this->createDartsLobby($host);
        $this->addGuestToLobby($host, $match, 'Guest Two');
        $match = $this->startDartsMatch($host, $match);

        $this->actingAs($host)
            ->delete("/darts/x01/multiplayer/{$match->uuid}")
            ->assertStatus(422);

        $this->assertDatabaseHas('matches', ['id' => $match->id, 'status' => 'active']);
    }

    public function test_saved_guests_remain_after_lobby_is_abandoned(): void
    {
        $host = User::factory()->create();
        $match = $this->createDartsLobby($host);
        $this->addGuestToLobby($host, $match, 'Saved Guest', save: true);

        $this->actingAs($host)
            ->deleteJson("/darts/x01/multiplayer/{$match->uuid}")
            ->assertOk();

        $this->assertDatabaseHas('user_local_guests', [
            'user_id' => $host->id,
            'name' => 'Saved Guest',
        ]);
    }

    public function test_cannot_create_lobby_while_already_in_lobby(): void
    {
        $host = User::factory()->create();
        $existing = $this->createDartsLobby($host);

        $this->actingAs($host)
            ->post('/darts/x01/multiplayer', [
                'mode' => 'local',
                'match_type' => 'solo',
            ])
            ->assertRedirect(route('darts.x01.lobby.show', $existing->uuid))
            ->assertSessionHas('status', 'already-in-lobby');

        $this->assertDatabaseCount('matches', 1);
    }

    public function test_cannot_invite_friend_who_is_in_another_lobby(): void
    {
        $host = User::factory()->create();
        $busyFriend = User::factory()->create();
        $match = $this->createDartsLobby($host);
        $this->createDartsLobby($busyFriend);

        $this->actingAs($host)
            ->post("/darts/x01/multiplayer/{$match->uuid}/players", [
                'user_id' => $busyFriend->id,
            ])
            ->assertSessionHasErrors('player');

        $this->assertDatabaseMissing('match_players', [
            'match_id' => $match->id,
            'user_id' => $busyFriend->id,
        ]);
    }

    public function test_cannot_invite_friend_who_is_in_active_match(): void
    {
        $host = User::factory()->create();
        $busyFriend = User::factory()->create();
        $match = $this->createDartsLobby($host);

        $busyMatch = $this->createDartsLobby($busyFriend);
        $this->addGuestToLobby($busyFriend, $busyMatch, 'Opponent');
        $this->startDartsMatch($busyFriend, $busyMatch);

        $this->actingAs($host)
            ->post("/darts/x01/multiplayer/{$match->uuid}/players", [
                'user_id' => $busyFriend->id,
            ])
            ->assertSessionHasErrors('player');
    }

    public function test_cannot_join_second_lobby_while_in_first(): void
    {
        $hostA = User::factory()->create();
        $hostB = User::factory()->create();
        $guest = User::factory()->create();

        $lobbyA = $this->createDartsLobby($hostA, mode: 'online');
        $this->joinDartsLobby($guest, $lobbyA);

        $lobbyB = $this->createDartsLobby($hostB, mode: 'online');

        $this->actingAs($guest)
            ->post('/darts/x01/multiplayer/join', [
                'lobby_code' => $lobbyB->lobby_code,
            ])
            ->assertSessionHasErrors('player');
    }

    public function test_friends_list_marks_busy_friend_as_in_lobby(): void
    {
        $host = User::factory()->create();
        $friend = User::factory()->create();

        \App\Models\Friendship::query()->create([
            'requester_id' => $host->id,
            'addressee_id' => $friend->id,
            'status' => \App\Enums\FriendshipStatus::Accepted,
        ]);

        $this->createDartsLobby($friend);

        $this->actingAs($host)
            ->get('/darts/x01/multiplayer')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('friends', 1)
                ->where('friends.0.id', $friend->id)
                ->where('friends.0.activity', 'in_lobby')
            );
    }

    public function test_show_redirects_when_lobby_was_closed(): void
    {
        $host = User::factory()->create();
        $match = $this->createDartsLobby($host);
        $uuid = $match->uuid;

        $match->delete();

        $this->actingAs($host)
            ->get("/darts/x01/multiplayer/{$uuid}")
            ->assertRedirect(route('darts.x01.lobby.index'));
    }

    public function test_show_redirects_when_user_left_lobby_in_other_session(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createDartsLobby($host, mode: 'online');
        $this->joinDartsLobby($guest, $match);

        $this->actingAs($guest)
            ->deleteJson("/darts/x01/multiplayer/{$match->uuid}")
            ->assertOk();

        $this->actingAs($guest)
            ->get("/darts/x01/multiplayer/{$match->uuid}")
            ->assertRedirect(route('darts.x01.lobby.index'));
    }

    public function test_joined_player_is_not_host_on_lobby_page(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createDartsLobby($host, mode: 'online');
        $this->joinDartsLobby($guest, $match);

        $this->actingAs($guest)
            ->get("/darts/x01/multiplayer/{$match->uuid}")
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('isHost', false)
                ->where('lobby.host_user_id', $host->id)
            );

        $this->actingAs($host)
            ->get("/darts/x01/multiplayer/{$match->uuid}")
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('isHost', true));
    }

    public function test_non_host_cannot_start_match(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createDartsLobby($host, mode: 'online');
        $this->joinDartsLobby($guest, $match);
        $this->addGuestToLobby($host, $match, 'Guest Three');

        $this->actingAs($guest)
            ->post("/darts/x01/multiplayer/{$match->uuid}/start")
            ->assertForbidden();
    }

    public function test_participant_can_fetch_lobby_snapshot_api(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createDartsLobby($host, mode: 'online');
        $this->joinDartsLobby($guest, $match);

        $this->actingAs($host)
            ->getJson("/v1/darts/matches/{$match->uuid}/lobby")
            ->assertOk()
            ->assertJsonPath('uuid', $match->uuid)
            ->assertJsonPath('can_proceed', true)
            ->assertJsonCount(2, 'players');

        $this->actingAs($guest)
            ->getJson("/v1/darts/matches/{$match->uuid}/lobby")
            ->assertOk()
            ->assertJsonCount(2, 'players');
    }

    public function test_non_participant_cannot_fetch_lobby_snapshot_api(): void
    {
        $host = User::factory()->create();
        $stranger = User::factory()->create();
        $match = $this->createDartsLobby($host, mode: 'online');

        $this->actingAs($stranger)
            ->getJson("/v1/darts/matches/{$match->uuid}/lobby")
            ->assertForbidden();
    }

    public function test_lobby_snapshot_api_returns_not_found_when_match_is_active(): void
    {
        $host = User::factory()->create();
        $match = $this->createDartsLobby($host);
        $this->addGuestToLobby($host, $match, 'Guest Two');
        $match = $this->startDartsMatch($host, $match);

        $this->actingAs($host)
            ->getJson("/v1/darts/matches/{$match->uuid}/lobby")
            ->assertNotFound();
    }
}
