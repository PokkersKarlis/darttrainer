<?php

namespace Tests\Feature\Darts;

use App\Jobs\CompleteDartsMatchJob;
use App\Models\DartMatch;
use App\Models\User;
use App\Services\Darts\MatchTurnTimerService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Tests\Support\CreatesDartsLobby;
use Tests\TestCase;

class DartsMatchTurnTimerTest extends TestCase
{
    use CreatesDartsLobby;
    use RefreshDatabase;

    public function test_active_match_state_includes_turn_timer(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createActiveMatch($host, $guest);

        $state = $this->actingAs($host)
            ->getJson("/v1/darts/matches/{$match->uuid}/state")
            ->assertOk()
            ->json('data');

        $this->assertNotNull($state['current_state']['turn_timer']);
        $this->assertSame(MatchTurnTimerService::TIMEOUT_SECONDS, $state['current_state']['turn_timer']['timeout_seconds']);
    }

    public function test_local_match_state_has_no_turn_timer(): void
    {
        $host = User::factory()->create();
        $match = $this->createDartsLobby($host, mode: 'local');
        $this->addGuestToLobby($host, $match, 'Local Guest');
        $match = $this->startDartsMatch($host, $match);

        $state = $this->actingAs($host)
            ->getJson("/v1/darts/matches/{$match->uuid}/state")
            ->assertOk()
            ->json('data');

        $this->assertSame('local', $state['config']['mode']);
        $this->assertNull($state['current_state']['turn_timer']);
        $this->assertNull($match->fresh()->turn_timer_status);
    }

    public function test_local_match_rejects_turn_timer_extend_even_with_legacy_timer_data(): void
    {
        $host = User::factory()->create();
        $match = $this->createDartsLobby($host, mode: 'local');
        $this->addGuestToLobby($host, $match, 'Local Guest');
        $match = $this->startDartsMatch($host, $match);

        $hostPlayer = $match->players()->where('user_id', $host->id)->firstOrFail();
        $match->update([
            'turn_timer_player_id' => $hostPlayer->id,
            'turn_timer_expires_at' => now()->subMinute(),
            'turn_timer_status' => 'expired',
        ]);

        $this->actingAs($host)
            ->postJson("/v1/darts/matches/{$match->uuid}/turn-timer/extend")
            ->assertStatus(422);

        $state = $this->actingAs($host)
            ->getJson("/v1/darts/matches/{$match->uuid}/state")
            ->assertOk()
            ->json('data');

        $this->assertNull($state['current_state']['turn_timer']);
    }

    public function test_opponent_can_extend_expired_turn_timer(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createActiveMatch($host, $guest);

        $hostPlayer = $match->players()->where('user_id', $host->id)->firstOrFail();
        $match->update([
            'turn_timer_player_id' => $hostPlayer->id,
            'turn_timer_expires_at' => now()->subMinute(),
            'turn_timer_status' => 'expired',
        ]);

        $this->actingAs($guest)
            ->postJson("/v1/darts/matches/{$match->uuid}/turn-timer/extend")
            ->assertOk();

        $match->refresh();
        $this->assertSame('extended', $match->turn_timer_status);
        $this->assertTrue($match->turn_timer_expires_at->isFuture());
    }

    public function test_active_player_cannot_extend_timer(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createActiveMatch($host, $guest);

        $hostPlayer = $match->players()->where('user_id', $host->id)->firstOrFail();
        $match->update([
            'turn_timer_player_id' => $hostPlayer->id,
            'turn_timer_expires_at' => now()->subMinute(),
            'turn_timer_status' => 'expired',
        ]);

        $this->actingAs($host)
            ->postJson("/v1/darts/matches/{$match->uuid}/turn-timer/extend")
            ->assertForbidden();
    }

    public function test_opponent_can_abandon_expired_match_without_saving_results(): void
    {
        Bus::fake();

        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createActiveMatch($host, $guest);
        $uuid = $match->uuid;

        $hostPlayer = $match->players()->where('user_id', $host->id)->firstOrFail();
        $match->update([
            'turn_timer_player_id' => $hostPlayer->id,
            'turn_timer_expires_at' => now()->subMinute(),
            'turn_timer_status' => 'expired',
        ]);

        $this->actingAs($guest)
            ->postJson("/v1/darts/matches/{$match->uuid}/turn-timer/abandon")
            ->assertOk();

        $this->assertDatabaseMissing('matches', ['uuid' => $uuid]);
        Bus::assertNotDispatched(CompleteDartsMatchJob::class);
    }

    public function test_throw_after_expiry_resets_timer_for_active_player(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createActiveMatch($host, $guest);

        $hostPlayer = $match->players()->where('user_id', $host->id)->firstOrFail();
        $match->update([
            'turn_timer_player_id' => $hostPlayer->id,
            'turn_timer_expires_at' => now()->subMinute(),
            'turn_timer_status' => 'expired',
        ]);

        $this->actingAs($host)
            ->postJson("/v1/darts/matches/{$match->uuid}/throws", [
                'sector' => 20,
                'multiplier' => 1,
            ])
            ->assertOk();

        $match->refresh();
        $this->assertSame('running', $match->turn_timer_status);
        $this->assertTrue($match->turn_timer_expires_at->isFuture());
    }

    private function createActiveMatch(User $host, User $guest): DartMatch
    {
        $match = $this->createDartsLobby($host, mode: 'online');
        $this->joinDartsLobby($guest, $match);

        return $this->startDartsMatch($host, $match);
    }
}
