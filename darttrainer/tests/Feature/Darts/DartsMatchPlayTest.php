<?php

namespace Tests\Feature\Darts;

use App\Enums\MatchStatus;
use App\Jobs\CompleteDartsMatchJob;
use App\Models\DartMatch;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Tests\Support\CreatesDartsLobby;
use Tests\TestCase;

class DartsMatchPlayTest extends TestCase
{
    use CreatesDartsLobby;
    use RefreshDatabase;

    public function test_active_player_can_submit_throw_and_updates_state(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createActiveMatch($host, $guest);

        $hostPlayer = $match->players()->where('user_id', $host->id)->firstOrFail();

        $response = $this->actingAs($host)
            ->postJson("/v1/darts/matches/{$match->uuid}/throws", [
                'sector' => 20,
                'multiplier' => 1,
            ])
            ->assertOk()
            ->json('data');

        $this->assertSame($hostPlayer->id, $response['current_state']['active_player_id']);
        $this->assertSame(1, $response['current_state']['darts_thrown_this_turn']);
        $this->assertSame(481, $response['scoreboard'][0]['remaining_points']);

        $this->assertDatabaseHas('dart_x01_solo_active_throws', [
            'sector' => 20,
            'multiplier' => 1,
        ]);
    }

    public function test_non_active_player_cannot_throw(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createActiveMatch($host, $guest);

        $this->actingAs($guest)
            ->postJson("/v1/darts/matches/{$match->uuid}/throws", [
                'sector' => 20,
                'multiplier' => 1,
            ])
            ->assertForbidden();
    }

    public function test_match_state_includes_active_player_before_first_throw(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createActiveMatch($host, $guest);

        $hostPlayer = $match->players()->where('user_id', $host->id)->firstOrFail();

        $state = $this->actingAs($host)
            ->getJson("/v1/darts/matches/{$match->uuid}/state")
            ->assertOk()
            ->json('data');

        $this->assertSame($hostPlayer->id, $state['current_state']['active_player_id']);
        $this->assertSame(0, $state['current_state']['darts_thrown_this_turn']);
    }

    public function test_spectator_cannot_throw(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createActiveMatch($host, $guest, publicMatch: true);
        $stranger = User::factory()->create();

        $this->actingAs($stranger)
            ->postJson("/v1/darts/matches/{$match->uuid}/throws", [
                'sector' => 20,
                'multiplier' => 1,
            ])
            ->assertForbidden();
    }

    public function test_bust_restores_previous_score(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createDartsLobby($host, mode: 'online');
        $this->joinDartsLobby($guest, $match);
        $match->config->update(['starting_points' => 50]);
        $match = $this->startDartsMatch($host, $match);

        $response = $this->actingAs($host)->postJson("/v1/darts/matches/{$match->uuid}/throws", [
            'sector' => 20,
            'multiplier' => 3,
        ])->assertOk()->json('data');

        $hostRow = collect($response['scoreboard'])->firstWhere('name', $host->name);
        $this->assertSame(50, $hostRow['remaining_points']);

        $this->assertDatabaseHas('dart_x01_solo_active_turns', [
            'player_id' => $match->players()->where('user_id', $host->id)->value('id'),
            'is_bust' => true,
            'remaining_points' => 50,
        ]);
    }

    public function test_checkout_finishes_leg_and_match_on_first_to_one(): void
    {
        Bus::fake();

        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createDartsLobby($host, mode: 'online');
        $this->joinDartsLobby($guest, $match);
        $match->config->update(['starting_points' => 40]);
        $match = $this->startDartsMatch($host, $match);

        $this->actingAs($host)
            ->postJson("/v1/darts/matches/{$match->uuid}/throws", [
                'sector' => 20,
                'multiplier' => 2,
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'finished');

        $match->refresh();
        $this->assertSame(MatchStatus::Finished, $match->status);
        $this->assertSame($host->id, $match->winner_id);

        Bus::assertDispatched(CompleteDartsMatchJob::class);
    }

    public function test_turn_advances_after_three_darts(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createActiveMatch($host, $guest);

        foreach ([20, 19, 18] as $sector) {
            $this->actingAs($host)->postJson("/v1/darts/matches/{$match->uuid}/throws", [
                'sector' => $sector,
                'multiplier' => 1,
            ])->assertOk();
        }

        $state = $this->actingAs($host)
            ->getJson("/v1/darts/matches/{$match->uuid}/state")
            ->assertOk()
            ->json('data');

        $guestPlayer = $match->players()->where('user_id', $guest->id)->firstOrFail();
        $this->assertSame($guestPlayer->id, $state['current_state']['active_player_id']);
    }

    public function test_active_player_alternates_after_both_complete_first_visit(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createActiveMatch($host, $guest);

        $hostPlayer = $match->players()->where('user_id', $host->id)->firstOrFail();
        $guestPlayer = $match->players()->where('user_id', $guest->id)->firstOrFail();

        foreach ([20, 19, 18] as $sector) {
            $this->actingAs($host)->postJson("/v1/darts/matches/{$match->uuid}/throws", [
                'sector' => $sector,
                'multiplier' => 1,
            ])->assertOk();
        }

        foreach ([20, 19, 18] as $sector) {
            $this->actingAs($guest)->postJson("/v1/darts/matches/{$match->uuid}/throws", [
                'sector' => $sector,
                'multiplier' => 1,
            ])->assertOk();
        }

        $state = $this->actingAs($host)
            ->getJson("/v1/darts/matches/{$match->uuid}/state")
            ->assertOk()
            ->json('data');

        $this->assertSame($hostPlayer->id, $state['current_state']['active_player_id']);
        $this->assertSame(0, $state['current_state']['darts_thrown_this_turn']);

        $this->actingAs($host)->postJson("/v1/darts/matches/{$match->uuid}/throws", [
            'sector' => 20,
            'multiplier' => 1,
        ])->assertOk();

        $this->actingAs($guest)->postJson("/v1/darts/matches/{$match->uuid}/throws", [
            'sector' => 20,
            'multiplier' => 1,
        ])->assertForbidden();
    }

    public function test_host_can_throw_for_local_guest(): void
    {
        $host = User::factory()->create();
        $match = $this->createDartsLobby($host);
        $this->addGuestToLobby($host, $match, 'Local Guest');
        $match = $this->startDartsMatch($host, $match);

        $this->actingAs($host)->postJson("/v1/darts/matches/{$match->uuid}/throws", [
            'sector' => 20,
            'multiplier' => 1,
        ])->assertOk();

        $guestPlayer = $match->players()->whereNull('user_id')->firstOrFail();

        foreach ([20, 19, 18] as $sector) {
            $this->actingAs($host)->postJson("/v1/darts/matches/{$match->uuid}/throws", [
                'sector' => $sector,
                'multiplier' => 1,
            ])->assertOk();
        }

        $state = $this->actingAs($host)
            ->getJson("/v1/darts/matches/{$match->uuid}/state")
            ->assertOk()
            ->json('data');

        $this->assertSame($guestPlayer->id, $state['current_state']['active_player_id']);
    }

    public function test_host_can_throw_for_registered_friend_in_local_match(): void
    {
        $host = User::factory()->create();
        $friend = User::factory()->create();
        $match = $this->createDartsLobby($host, mode: 'local');

        $this->actingAs($host)->post("/darts/x01/multiplayer/{$match->uuid}/players", [
            'user_id' => $friend->id,
        ])->assertRedirect();

        $match = $this->startDartsMatch($host, $match->fresh());
        $friendPlayer = $match->players()->where('user_id', $friend->id)->firstOrFail();

        $this->actingAs($host)->postJson("/v1/darts/matches/{$match->uuid}/throws", [
            'sector' => 20,
            'multiplier' => 1,
        ])->assertOk();

        foreach ([19, 18, 17] as $sector) {
            $this->actingAs($host)->postJson("/v1/darts/matches/{$match->uuid}/throws", [
                'sector' => $sector,
                'multiplier' => 1,
            ])->assertOk();
        }

        $state = $this->actingAs($host)
            ->getJson("/v1/darts/matches/{$match->uuid}/state")
            ->assertOk()
            ->json('data');

        $this->assertSame($friendPlayer->id, $state['current_state']['active_player_id']);
    }

    public function test_invalid_dart_is_rejected(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createActiveMatch($host, $guest);

        $this->actingAs($host)
            ->postJson("/v1/darts/matches/{$match->uuid}/throws", [
                'sector' => 25,
                'multiplier' => 3,
            ])
            ->assertStatus(422);
    }

    public function test_scoreboard_includes_separate_leg_and_match_averages(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createActiveMatch($host, $guest);

        foreach ([20, 20, 20] as $sector) {
            $this->actingAs($host)->postJson("/v1/darts/matches/{$match->uuid}/throws", [
                'sector' => $sector,
                'multiplier' => 1,
            ])->assertOk();
        }

        $state = $this->actingAs($host)
            ->getJson("/v1/darts/matches/{$match->uuid}/state")
            ->assertOk()
            ->json('data');

        $hostRow = collect($state['scoreboard'])->firstWhere('name', $host->name);
        $this->assertEquals(60.0, $hostRow['average_3pad_leg']);
        $this->assertEquals(60.0, $hostRow['average_3pad_match']);
        $this->assertEquals(60.0, $hostRow['average_3pad']);
    }

    private function createActiveMatch(User $host, User $guest, bool $publicMatch = false): DartMatch
    {
        $match = $this->createDartsLobby($host, mode: 'online');
        $this->joinDartsLobby($guest, $match);

        if ($publicMatch) {
            $this->updateLobbyConfig($host, $match, ['is_public' => true]);
        }

        return $this->startDartsMatch($host, $match);
    }
}
