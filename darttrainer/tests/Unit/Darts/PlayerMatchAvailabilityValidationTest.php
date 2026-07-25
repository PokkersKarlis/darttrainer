<?php

namespace Tests\Unit\Darts;

use App\Models\User;
use App\Services\Darts\PlayerMatchAvailabilityService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class PlayerMatchAvailabilityValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_assert_available_throws_validation_exception_not_http_exception(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user);
        $this->createDartsLobbyFor($user);

        try {
            app(PlayerMatchAvailabilityService::class)->assertAvailableForMatch($user);
            $this->fail('Expected ValidationException was not thrown.');
        } catch (ValidationException $exception) {
            $this->assertArrayHasKey('player', $exception->errors());
            $this->assertSame(['player-unavailable'], $exception->errors()['player']);
        }
    }

    private function createDartsLobbyFor(User $user): void
    {
        $this->actingAs($user)
            ->post('/darts/x01/multiplayer', [
                'mode' => 'local',
                'match_type' => 'solo',
            ]);
    }
}
