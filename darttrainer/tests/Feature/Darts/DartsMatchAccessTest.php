<?php

namespace Tests\Feature\Darts;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CreatesDartsLobby;
use Tests\TestCase;

class DartsMatchAccessTest extends TestCase
{
    use CreatesDartsLobby;
    use RefreshDatabase;

    public function test_stranger_cannot_view_private_lobby(): void
    {
        $host = User::factory()->create();
        $match = $this->createDartsLobby($host);
        $stranger = User::factory()->create();

        $this->actingAs($stranger)
            ->get("/darts/x01/multiplayer/{$match->uuid}")
            ->assertRedirect(route('darts.x01.lobby.index'));
    }

    public function test_stranger_cannot_view_private_active_play_board(): void
    {
        $host = User::factory()->create();
        $match = $this->createDartsLobby($host);
        $this->addGuestToLobby($host, $match, 'Guest Two');
        $match = $this->startDartsMatch($host, $match);
        $stranger = User::factory()->create();

        $this->actingAs($stranger)
            ->get("/darts/x01/play/{$match->uuid}")
            ->assertRedirect(route('darts.x01.match-gone', ['reason' => 'all_left']));
    }

    public function test_stranger_can_view_public_active_match_as_spectator(): void
    {
        $host = User::factory()->create();
        $match = $this->createDartsLobby($host);
        $this->addGuestToLobby($host, $match, 'Guest Two');
        $this->updateLobbyConfig($host, $match, ['is_public' => true]);
        $match = $this->startDartsMatch($host, $match);
        $stranger = User::factory()->create();

        $this->actingAs($stranger)
            ->get("/darts/x01/play/{$match->uuid}")
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('darts/DartsPlay')
                ->where('role', 'spectator')
                ->where('matchUuid', $match->uuid)
            );
    }

    public function test_participant_gets_player_role_on_play_board(): void
    {
        $host = User::factory()->create();
        $match = $this->createDartsLobby($host);
        $this->addGuestToLobby($host, $match, 'Guest Two');
        $this->updateLobbyConfig($host, $match, ['is_public' => true]);
        $match = $this->startDartsMatch($host, $match);

        $this->actingAs($host)
            ->get("/darts/x01/play/{$match->uuid}")
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('darts/DartsPlay')
                ->where('role', 'player')
            );
    }

    public function test_private_match_state_api_returns_403_for_stranger(): void
    {
        $host = User::factory()->create();
        $match = $this->createDartsLobby($host);
        $this->addGuestToLobby($host, $match, 'Guest Two');
        $match = $this->startDartsMatch($host, $match);
        $stranger = User::factory()->create();

        $this->actingAs($stranger)
            ->getJson("/v1/darts/matches/{$match->uuid}/state")
            ->assertForbidden();
    }

    public function test_public_match_state_api_returns_scoreboard_only_for_stranger(): void
    {
        $host = User::factory()->create();
        $match = $this->createDartsLobby($host);
        $this->addGuestToLobby($host, $match, 'Guest Two');
        $this->updateLobbyConfig($host, $match, ['is_public' => true]);
        $match = $this->startDartsMatch($host, $match);
        $stranger = User::factory()->create();

        $response = $this->actingAs($stranger)
            ->getJson("/v1/darts/matches/{$match->uuid}/state")
            ->assertOk()
            ->json('data');

        $this->assertSame('public', $response['visibility']);
        $this->assertArrayHasKey('scoreboard', $response);
        $this->assertArrayNotHasKey('config', $response);
        $this->assertArrayHasKey('name', $response['scoreboard'][0]);
        $this->assertArrayNotHasKey('user_id', $response['scoreboard'][0]);
    }

    public function test_participant_gets_full_match_state(): void
    {
        $host = User::factory()->create();
        $match = $this->createDartsLobby($host);
        $this->addGuestToLobby($host, $match, 'Guest Two');
        $this->updateLobbyConfig($host, $match, ['is_public' => true]);
        $match = $this->startDartsMatch($host, $match);

        $this->actingAs($host)
            ->getJson("/v1/darts/matches/{$match->uuid}/state")
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'match_uuid',
                    'status',
                    'config',
                    'current_state',
                    'scoreboard',
                ],
            ])
            ->assertJsonMissing(['data' => ['visibility' => 'public']]);
    }
}
