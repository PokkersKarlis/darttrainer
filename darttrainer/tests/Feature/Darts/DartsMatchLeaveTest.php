<?php

namespace Tests\Feature\Darts;

use App\Models\DartMatch;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CreatesDartsLobby;
use Tests\TestCase;

class DartsMatchLeaveTest extends TestCase
{
    use CreatesDartsLobby;
    use RefreshDatabase;

    public function test_leaving_two_player_match_abandons_for_remaining_player(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createActiveMatch($host, $guest);
        $uuid = $match->uuid;

        $this->actingAs($guest)
            ->postJson("/v1/darts/matches/{$uuid}/leave")
            ->assertOk();

        $this->assertDatabaseMissing('matches', ['uuid' => $uuid]);
    }

    /** @see DartsMatchAbandonIncidentTest for redirect / no-404 regression coverage */

    public function test_points_throw_is_accepted(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createActiveMatch($host, $guest);
        $guestPlayer = $match->players()->where('user_id', $guest->id)->firstOrFail();

        $state = $this->actingAs($host)
            ->postJson("/v1/darts/matches/{$match->uuid}/throws", ['points' => 60])
            ->assertOk()
            ->json('data');

        $this->assertSame($guestPlayer->id, $state['current_state']['active_player_id']);
        $this->assertSame(0, $state['current_state']['darts_thrown_this_turn']);
    }

    public function test_invalid_points_throw_is_rejected(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createActiveMatch($host, $guest);

        $this->actingAs($host)
            ->postJson("/v1/darts/matches/{$match->uuid}/throws", ['points' => 181])
            ->assertStatus(422);
    }

    public function test_calculator_mode_locks_player_and_tags_points_throws(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createActiveMatch($host, $guest);
        $hostPlayer = $match->players()->where('user_id', $host->id)->firstOrFail();
        $guestPlayer = $match->players()->where('user_id', $guest->id)->firstOrFail();

        $state = $this->actingAs($host)
            ->postJson("/v1/darts/matches/{$match->uuid}/scoring-mode/calculator")
            ->assertOk()
            ->json('data');

        $hostRow = collect($state['scoreboard'])->firstWhere('player_id', $hostPlayer->id);
        $this->assertSame('calculator', $hostRow['scoring_mode']);
        $this->assertSame('basic', $hostRow['stats_tier']);

        $this->actingAs($host)
            ->postJson("/v1/darts/matches/{$match->uuid}/throws", ['points' => 45])
            ->assertOk();

        $this->assertDatabaseHas('dart_x01_solo_active_throws', [
            'input_source' => 'calculator',
        ]);
    }

    public function test_board_throw_is_rejected_when_calculator_mode_is_locked(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createActiveMatch($host, $guest);

        $this->actingAs($host)
            ->postJson("/v1/darts/matches/{$match->uuid}/scoring-mode/calculator")
            ->assertOk();

        $this->actingAs($host)
            ->postJson("/v1/darts/matches/{$match->uuid}/throws", [
                'sector' => 20,
                'multiplier' => 1,
            ])
            ->assertForbidden()
            ->assertJsonPath('message', 'calculator-mode-active');
    }

    public function test_player_can_switch_back_to_board_after_calculator_lock(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createActiveMatch($host, $guest);
        $hostPlayer = $match->players()->where('user_id', $host->id)->firstOrFail();

        $this->actingAs($host)
            ->postJson("/v1/darts/matches/{$match->uuid}/scoring-mode/calculator")
            ->assertOk();

        $state = $this->actingAs($host)
            ->postJson("/v1/darts/matches/{$match->uuid}/scoring-mode/board")
            ->assertOk()
            ->json('data');

        $hostRow = collect($state['scoreboard'])->firstWhere('player_id', $hostPlayer->id);
        $this->assertSame('board', $hostRow['scoring_mode']);
        $this->assertSame('basic', $hostRow['stats_tier']);

        $this->actingAs($host)
            ->postJson("/v1/darts/matches/{$match->uuid}/throws", [
                'sector' => 20,
                'multiplier' => 1,
            ])
            ->assertOk();
    }

    public function test_board_switch_is_rejected_before_calculator_lock(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createActiveMatch($host, $guest);

        $this->actingAs($host)
            ->postJson("/v1/darts/matches/{$match->uuid}/scoring-mode/board")
            ->assertStatus(422)
            ->assertJsonPath('message', 'stats-tier-not-reduced');
    }

    public function test_calculator_visit_total_advances_turn_to_opponent(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createActiveMatch($host, $guest);
        $hostPlayer = $match->players()->where('user_id', $host->id)->firstOrFail();
        $guestPlayer = $match->players()->where('user_id', $guest->id)->firstOrFail();

        $this->actingAs($host)
            ->postJson("/v1/darts/matches/{$match->uuid}/scoring-mode/calculator")
            ->assertOk();

        $state = $this->actingAs($host)
            ->postJson("/v1/darts/matches/{$match->uuid}/throws", ['points' => 52])
            ->assertOk()
            ->json('data');

        $hostRow = collect($state['scoreboard'])->firstWhere('player_id', $hostPlayer->id);
        $guestRow = collect($state['scoreboard'])->firstWhere('player_id', $guestPlayer->id);

        $this->assertSame(449, $hostRow['remaining_points']);
        $this->assertTrue($guestRow['is_turn']);
        $this->assertSame($guestPlayer->id, $state['current_state']['active_player_id']);
        $this->assertSame(0, $state['current_state']['darts_thrown_this_turn']);

        $turn = \App\Models\DartX01SoloActiveTurn::query()
            ->where('player_id', $hostPlayer->id)
            ->where('turn_number', 1)
            ->firstOrFail();

        $this->assertSame(52, $turn->points_scored);
        $this->assertGreaterThan(0, $turn->throws()->count());
        $this->assertLessThanOrEqual(3, $turn->throws()->count());
    }

    /**
     * @return DartMatch
     */
    private function createActiveMatch(User $host, User $guest): DartMatch
    {
        $match = $this->createDartsLobby($host, mode: 'online');
        $this->joinDartsLobby($guest, $match);

        return $this->startDartsMatch($host, $match);
    }
}
