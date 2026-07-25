<?php

namespace Tests\Feature\Darts;

use App\Enums\MatchStatus;
use App\Jobs\CompleteDartsMatchJob;
use App\Models\DartMatch;
use App\Models\DartX01ActiveLeg;
use App\Models\DartX01PlayerStat;
use App\Models\DartX01SoloActiveThrow;
use App\Models\DartX01SoloActiveTurn;
use App\Models\User;
use App\Services\Darts\CheckoutCalculationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CreatesDartsLobby;
use Tests\TestCase;

class CheckoutRateEngineTest extends TestCase
{
    use CreatesDartsLobby;
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // A. Contextual checkout rules & validation
    // -------------------------------------------------------------------------

    public function test_system_identifies_valid_checkout_finishes(): void
    {
        $service = app(CheckoutCalculationService::class);

        foreach ([170, 160, 40] as $finishable) {
            $context = $service->checkoutContext($finishable);
            $this->assertTrue($service->isFinishableCheckout($finishable), "Expected {$finishable} to be finishable");
            $this->assertTrue($context['is_in_checkout_range'], "Expected {$finishable} in checkout range");
            $this->assertTrue($context['is_finishable']);
            $this->assertNotEmpty($context['suggested_route'], "Expected route for {$finishable}");
        }

        foreach ([169, 168, 166, 165, 163, 162, 159] as $impossible) {
            $context = $service->checkoutContext($impossible);
            $this->assertFalse($service->isFinishableCheckout($impossible), "Expected {$impossible} to be impossible");
            $this->assertFalse($context['is_in_checkout_range'], "Expected {$impossible} outside checkout range");
            $this->assertEmpty($context['suggested_route']);
        }

        $state = $this->createCheckoutMatch(startingPoints: 40, trackCheckoutRate: true);
        $host = User::query()->findOrFail($state['host_id']);

        $payload = $this->actingAs($host)
            ->getJson("/v1/darts/matches/{$state['match']->uuid}/state")
            ->assertOk()
            ->json('data.current_state.checkout_context');

        $this->assertTrue($payload['is_in_checkout_range']);
        $this->assertTrue($payload['is_finishable']);
    }

    public function test_system_calculates_max_possible_double_attempts_per_turn(): void
    {
        $service = app(CheckoutCalculationService::class);

        $this->assertSame(3, $service->getMaxDoubleAttempts(40, 40, 1));
        $this->assertSame(2, $service->getMaxDoubleAttempts(70, 70, 2));
        $this->assertSame(1, $service->getMaxDoubleAttempts(130, 130, 3));

        $this->assertSame([0, 1, 2, 3], $service->getAllowedDoubleAttempts(40, 40, 1));
        $this->assertSame([0, 1, 2], $service->getAllowedDoubleAttempts(70, 70, 2));
        $this->assertSame([0, 1], $service->getAllowedDoubleAttempts(130, 130, 3));
    }

    // -------------------------------------------------------------------------
    // B. Fast mode (track_checkout_rate = false)
    // -------------------------------------------------------------------------

    public function test_fast_mode_bypasses_double_attempts_prompts(): void
    {
        $state = $this->createCheckoutMatch(startingPoints: 40, trackCheckoutRate: false);
        $host = User::query()->findOrFail($state['host_id']);

        $response = $this->actingAs($host)
            ->postJson("/v1/darts/matches/{$state['match']->uuid}/throws", [
                'points' => 20,
                'dart_count' => 1,
            ])
            ->assertOk()
            ->json('data');

        $hostRow = collect($response['scoreboard'])->firstWhere('player_id', $state['match']->players()->where('user_id', $host->id)->value('id'));
        $this->assertSame(20, $hostRow['remaining_points']);
        $this->assertDatabaseHas('dart_x01_solo_active_turns', [
            'points_scored' => 20,
            'double_attempts' => null,
        ]);
    }

    // -------------------------------------------------------------------------
    // C. Detailed / full mode (track_checkout_rate = true)
    // -------------------------------------------------------------------------

    public function test_detailed_mode_requires_double_attempts_when_in_range(): void
    {
        $state = $this->createCheckoutMatch(startingPoints: 40, trackCheckoutRate: true);
        $host = User::query()->findOrFail($state['host_id']);

        $this->actingAs($host)
            ->postJson("/v1/darts/matches/{$state['match']->uuid}/throws", [
                'points' => 20,
                'dart_count' => 1,
            ])
            ->assertStatus(422);

        $this->actingAs($host)
            ->postJson("/v1/darts/matches/{$state['match']->uuid}/throws", [
                'points' => 20,
                'dart_count' => 1,
                'double_attempts' => 1,
                'throws_detail' => [
                    ['sector' => 10, 'multiplier' => 2],
                ],
            ])
            ->assertOk()
            ->json('data');

        $this->assertDatabaseHas('dart_x01_solo_active_turns', [
            'points_scored' => 20,
            'double_attempts' => 1,
            'remaining_points' => 20,
        ]);
    }

    public function test_detailed_mode_stores_individual_dart_sectors_for_hitmap(): void
    {
        $state = $this->createCheckoutMatch(startingPoints: 80, trackCheckoutRate: true);
        $host = User::query()->findOrFail($state['host_id']);

        $this->actingAs($host)
            ->postJson("/v1/darts/matches/{$state['match']->uuid}/throws", [
                'points' => 40,
                'dart_count' => 2,
                'checkout_dart' => 2,
                'double_attempts' => 1,
                'throws_detail' => [
                    ['sector' => 20, 'multiplier' => 1],
                    ['sector' => 10, 'multiplier' => 2],
                ],
            ])
            ->assertOk();

        $this->assertDatabaseHas('dart_x01_solo_active_throws', [
            'sector' => 20,
            'multiplier' => 1,
            'input_source' => 'calculator',
        ]);

        $this->assertDatabaseHas('dart_x01_solo_active_throws', [
            'sector' => 10,
            'multiplier' => 2,
            'input_source' => 'calculator',
        ]);
    }

    public function test_checkout_percentage_calculation_accuracy(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createDartsLobby($host, mode: 'online');
        $this->joinDartsLobby($guest, $match);
        $this->updateLobbyConfig($host, $match, [
            'legs_target' => 3,
            'track_checkout_rate' => true,
        ]);
        $match = $this->startDartsMatch($host, $match);
        $player = $match->players()->where('user_id', $host->id)->firstOrFail();

        $match->update([
            'status' => MatchStatus::Finished,
            'winner_id' => $host->id,
            'finished_at' => now(),
        ]);

        $match->legs()->delete();

        foreach ([1, 2, 3] as $legNumber) {
            $leg = DartX01ActiveLeg::query()->create([
                'match_id' => $match->id,
                'leg_number' => $legNumber,
                'starting_points' => 501,
                'status' => 'finished',
                'winner_player_id' => $player->id,
            ]);

            $checkoutTurn = match ($legNumber) {
                1, 2 => ['points' => 40, 'remaining' => 0, 'double_attempts' => 2, 'checkout' => true],
                default => ['points' => 20, 'remaining' => 40, 'double_attempts' => 2, 'checkout' => false],
            };

            $turns = [
                ['points' => 100, 'remaining' => 401, 'double_attempts' => null, 'checkout' => false],
                ['points' => 80, 'remaining' => 321, 'double_attempts' => null, 'checkout' => false],
                $checkoutTurn,
            ];

            foreach ($turns as $index => $turnData) {
                $turn = DartX01SoloActiveTurn::query()->create([
                    'leg_id' => $leg->id,
                    'player_id' => $player->id,
                    'turn_number' => $index + 1,
                    'points_scored' => $turnData['points'],
                    'double_attempts' => $turnData['double_attempts'],
                    'remaining_points' => $turnData['remaining'],
                    'is_bust' => false,
                ]);

                DartX01SoloActiveThrow::query()->create([
                    'turn_id' => $turn->id,
                    'throw_number' => 1,
                    'sector' => 20,
                    'multiplier' => 1,
                    'input_source' => 'calculator',
                    'is_leg_winner' => $turnData['checkout'],
                ]);
            }
        }

        (new CompleteDartsMatchJob($match->id))->handle();

        $stats = DartX01PlayerStat::query()->where('user_id', $host->id)->firstOrFail();
        $this->assertSame(6, $stats->checkout_attempts);
        $this->assertSame(2, $stats->checkout_successes);
        $this->assertSame(33.33, (float) $stats->checkout_percentage);
    }

    /**
     * @return array{match: DartMatch, host_id: int}
     */
    private function createCheckoutMatch(int $startingPoints, bool $trackCheckoutRate): array
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createDartsLobby($host, mode: 'online');
        $this->joinDartsLobby($guest, $match);
        $this->updateLobbyConfig($host, $match, [
            'legs_target' => 3,
            'track_checkout_rate' => $trackCheckoutRate,
        ]);
        $match = $this->startDartsMatch($host, $match);
        $match->config->update(['starting_points' => $startingPoints]);
        $match->activeLeg?->update(['starting_points' => $startingPoints]);

        return [
            'match' => $match->fresh(['config', 'activeLeg']),
            'host_id' => $host->id,
        ];
    }
}
