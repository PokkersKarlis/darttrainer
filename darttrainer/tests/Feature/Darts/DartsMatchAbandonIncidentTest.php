<?php

namespace Tests\Feature\Darts;

use App\Models\DartMatch;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Support\CreatesDartsLobby;
use Tests\TestCase;

/**
 * Regression tests for “opponent left → remaining player must not see a raw 404”.
 * Add one test per incident/fix in this file.
 */
class DartsMatchAbandonIncidentTest extends TestCase
{
    use CreatesDartsLobby;
    use RefreshDatabase;

    public function test_two_player_leave_deletes_match_from_database(): void
    {
        [$host, $guest, $uuid] = $this->activeTwoPlayerMatch();

        $this->actingAs($guest)
            ->postJson("/v1/darts/matches/{$uuid}/leave")
            ->assertOk();

        $this->assertDatabaseMissing('matches', ['uuid' => $uuid]);
    }

    public function test_remaining_player_play_page_redirects_instead_of_404(): void
    {
        [$host, $guest, $uuid] = $this->activeTwoPlayerMatch();

        $this->actingAs($guest)
            ->postJson("/v1/darts/matches/{$uuid}/leave")
            ->assertOk();

        $response = $this->actingAs($host)->get("/darts/x01/play/{$uuid}");

        $response->assertRedirect(route('darts.x01.match-gone', ['reason' => 'all_left']));
        $this->assertNotSame(404, $response->getStatusCode());
    }

    public function test_leaving_player_play_page_redirects_instead_of_404(): void
    {
        [$host, $guest, $uuid] = $this->activeTwoPlayerMatch();

        $this->actingAs($guest)
            ->postJson("/v1/darts/matches/{$uuid}/leave")
            ->assertOk();

        $response = $this->actingAs($guest)->get("/darts/x01/play/{$uuid}");

        $response->assertRedirect(route('darts.x01.match-gone', ['reason' => 'all_left']));
        $this->assertNotSame(404, $response->getStatusCode());
    }

    public function test_unknown_play_uuid_redirects_instead_of_404(): void
    {
        $user = User::factory()->create();
        $missingUuid = '00000000-0000-4000-8000-000000000001';

        $response = $this->actingAs($user)->get("/darts/x01/play/{$missingUuid}");

        $response->assertRedirect(route('darts.x01.match-gone', ['reason' => 'all_left']));
        $this->assertNotSame(404, $response->getStatusCode());
    }

    public function test_remaining_player_state_api_returns_404_for_polling_handoff(): void
    {
        [$host, $guest, $uuid] = $this->activeTwoPlayerMatch();

        $this->actingAs($guest)
            ->postJson("/v1/darts/matches/{$uuid}/leave")
            ->assertOk();

        $this->actingAs($host)
            ->getJson("/v1/darts/matches/{$uuid}/state")
            ->assertNotFound();
    }

    public function test_remaining_player_throw_api_returns_404_after_abandon(): void
    {
        [$host, $guest, $uuid] = $this->activeTwoPlayerMatch();

        $this->actingAs($guest)
            ->postJson("/v1/darts/matches/{$uuid}/leave")
            ->assertOk();

        $this->actingAs($host)
            ->postJson("/v1/darts/matches/{$uuid}/throws", [
                'sector' => 20,
                'multiplier' => 1,
            ])
            ->assertNotFound();
    }

    public function test_match_gone_page_renders_all_left_copy(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/darts/x01/match-gone?reason=all_left')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('darts/MatchGone')
                ->where('reason', 'all_left'));
    }

    public function test_three_player_leave_keeps_match_alive_for_remaining_players(): void
    {
        $host = User::factory()->create();
        $guestA = User::factory()->create();
        $guestB = User::factory()->create();

        $match = $this->createDartsLobby($host, mode: 'online');
        $this->joinDartsLobby($guestA, $match);
        $this->joinDartsLobby($guestB, $match);
        $match = $this->startDartsMatch($host, $match);
        $uuid = $match->uuid;

        $this->actingAs($guestB)
            ->postJson("/v1/darts/matches/{$uuid}/leave")
            ->assertOk();

        $this->assertDatabaseHas('matches', ['uuid' => $uuid]);

        $this->actingAs($host)
            ->getJson("/v1/darts/matches/{$uuid}/state")
            ->assertOk();

        $this->actingAs($host)
            ->get("/darts/x01/play/{$uuid}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('darts/DartsPlay'));
    }

    /**
     * @return array{0: User, 1: User, 2: string}
     */
    private function activeTwoPlayerMatch(): array
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createDartsLobby($host, mode: 'online');
        $this->joinDartsLobby($guest, $match);
        $match = $this->startDartsMatch($host, $match);

        return [$host, $guest, $match->uuid];
    }
}
