<?php

namespace Tests\Feature\Darts;

use App\Models\DartMatch;
use App\Models\MatchPlayer;
use App\Models\User;
use App\Models\UserLocalGuest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CreatesDartsLobby;
use Tests\TestCase;

class LobbySetupTest extends TestCase
{
    use CreatesDartsLobby;
    use RefreshDatabase;

    public function test_host_can_set_throw_order_for_three_players(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $third = User::factory()->create();
        $match = $this->createLobbyWithPlayers($host, [$guest, $third]);

        $players = $match->players()->orderBy('slot')->get();
        $reordered = [$players[2]->id, $players[0]->id, $players[1]->id];

        $this->actingAs($host)
            ->patchJson("/darts/x01/multiplayer/{$match->uuid}/throw-order", [
                'player_ids' => $reordered,
            ])
            ->assertOk();

        $match->refresh();
        $this->assertSame($reordered, $match->players()->orderBy('slot')->pluck('id')->all());
    }

    public function test_two_player_first_thrower_moves_selected_player_to_slot_one(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createLobbyWithPlayers($host, [$guest]);

        $guestPlayer = $match->players()->where('user_id', $guest->id)->firstOrFail();

        $this->actingAs($host)
            ->patchJson("/darts/x01/multiplayer/{$match->uuid}/first-thrower", [
                'player_id' => $guestPlayer->id,
            ])
            ->assertOk();

        $match->refresh();
        $first = $match->players()->orderBy('slot')->firstOrFail();
        $this->assertSame($guestPlayer->id, $first->id);
        $this->assertSame(1, $first->slot);
    }

    public function test_active_match_starts_with_reordered_first_thrower(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createLobbyWithPlayers($host, [$guest]);
        $guestPlayer = $match->players()->where('user_id', $guest->id)->firstOrFail();

        $this->actingAs($host)
            ->patchJson("/darts/x01/multiplayer/{$match->uuid}/first-thrower", [
                'player_id' => $guestPlayer->id,
            ])
            ->assertOk();

        $this->updateLobbyConfig($host, $match);
        $match = $this->startDartsMatch($host, $match);

        $state = $this->actingAs($guest)
            ->getJson("/v1/darts/matches/{$match->uuid}/state")
            ->assertOk()
            ->json('data');

        $this->assertSame($guestPlayer->id, $state['current_state']['active_player_id']);
    }

    public function test_host_can_set_custom_starting_points_per_player(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createLobbyWithPlayers($host, [$guest]);
        $guestPlayer = $match->players()->where('user_id', $guest->id)->firstOrFail();

        $this->actingAs($host)
            ->patchJson("/darts/x01/multiplayer/{$match->uuid}/players/{$guestPlayer->id}/starting-points", [
                'starting_points' => 301,
            ])
            ->assertOk();

        $this->assertDatabaseHas('match_players', [
            'id' => $guestPlayer->id,
            'starting_points' => 301,
        ]);
    }

    public function test_custom_starting_points_apply_when_match_begins(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createLobbyWithPlayers($host, [$guest]);
        $guestPlayer = $match->players()->where('user_id', $guest->id)->firstOrFail();

        $this->actingAs($host)
            ->patchJson("/darts/x01/multiplayer/{$match->uuid}/players/{$guestPlayer->id}/starting-points", [
                'starting_points' => 301,
            ]);

        $this->updateLobbyConfig($host, $match, ['starting_points' => 501]);
        $match = $this->startDartsMatch($host, $match);

        $state = $this->actingAs($guest)
            ->getJson("/v1/darts/matches/{$match->uuid}/state")
            ->assertOk()
            ->json('data');

        $guestRow = collect($state['scoreboard'])->firstWhere('player_id', $guestPlayer->id);
        $this->assertSame(301, $guestRow['remaining_points']);
    }

    public function test_local_guest_with_email_can_be_saved_for_future(): void
    {
        $host = User::factory()->create();
        $match = $this->createDartsLobby($host, mode: 'local');

        $this->actingAs($host)
            ->post("/darts/x01/multiplayer/{$match->uuid}/players", [
                'guest_name' => 'Random Guest',
                'guest_email' => 'guest@example.com',
                'save_guest' => true,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('user_local_guests', [
            'user_id' => $host->id,
            'name' => 'Random Guest',
            'email' => 'guest@example.com',
        ]);
    }

    public function test_non_host_cannot_reorder_throw_order(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createLobbyWithPlayers($host, [$guest]);
        $ids = $match->players()->orderBy('slot')->pluck('id')->reverse()->values()->all();

        $this->actingAs($guest)
            ->patchJson("/darts/x01/multiplayer/{$match->uuid}/throw-order", [
                'player_ids' => $ids,
            ])
            ->assertForbidden();
    }

    /**
     * @param  list<User>  $extraUsers
     */
    private function createLobbyWithPlayers(User $host, array $extraUsers): DartMatch
    {
        $match = $this->createDartsLobby($host, mode: 'online');

        foreach ($extraUsers as $user) {
            $this->joinDartsLobby($user, $match);
        }

        foreach ($match->players as $player) {
            if ($player->user_id === null) {
                continue;
            }

            $actor = User::query()->find($player->user_id);
            $this->actingAs($actor)
                ->patch("/darts/x01/multiplayer/{$match->uuid}/players/{$player->id}/ready", [
                    'ready' => true,
                ]);
        }

        return $match->fresh(['players', 'config']);
    }
}
