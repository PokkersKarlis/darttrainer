<?php

namespace Tests\Unit\Darts;

use App\Enums\GameType;
use App\Enums\MatchStatus;
use App\Enums\MatchType;
use App\Models\DartMatch;
use App\Models\DartX01MatchConfig;
use App\Models\MatchPlayer;
use App\Models\User;
use App\Services\Darts\PlayerMatchAvailabilityService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlayerMatchAvailabilityServiceTest extends TestCase
{
    use RefreshDatabase;

    private PlayerMatchAvailabilityService $availability;

    protected function setUp(): void
    {
        parent::setUp();
        $this->availability = app(PlayerMatchAvailabilityService::class);
    }

    public function test_available_user_has_online_activity(): void
    {
        $user = User::factory()->create(['last_seen_at' => now()]);

        $this->assertSame('online', $this->availability->activityStatus($user));
        $this->assertTrue($this->availability->isAvailableForMatch($user));
    }

    public function test_inactive_user_is_away(): void
    {
        $user = User::factory()->create(['last_seen_at' => now()->subHours(2)]);

        $this->assertSame('away', $this->availability->activityStatus($user));
    }

    public function test_user_in_lobby_is_unavailable_for_other_matches(): void
    {
        [$match, $user] = $this->makeMatch(MatchStatus::Lobby);
        $other = $this->makeMatch(MatchStatus::Lobby)[0];

        $this->assertSame('in_lobby', $this->availability->activityStatus($user));
        $this->assertTrue($this->availability->isAvailableForMatch($user, $match));
        $this->assertFalse($this->availability->isAvailableForMatch($user, $other));
    }

    public function test_user_in_active_match_is_in_game(): void
    {
        [, $user] = $this->makeMatch(MatchStatus::Active);

        $this->assertSame('in_game', $this->availability->activityStatus($user));
        $this->assertFalse($this->availability->isAvailableForMatch($user));
    }

    /**
     * @return array{0: DartMatch, 1: User}
     */
    private function makeMatch(MatchStatus $status): array
    {
        $user = User::factory()->create();

        $match = DartMatch::query()->create([
            'game_type' => GameType::DartsX01,
            'match_type' => MatchType::Solo,
            'status' => $status,
            'host_user_id' => $user->id,
        ]);

        DartX01MatchConfig::query()->create([
            'match_id' => $match->id,
            'mode' => 'local',
            'format' => 'first_to',
            'legs_target' => 1,
            'sets_target' => 1,
            'starting_points' => 501,
            'in_rule' => 'straight',
            'out_rule' => 'double',
            'track_checkout_rate' => false,
            'is_public' => false,
        ]);

        MatchPlayer::query()->create([
            'match_id' => $match->id,
            'user_id' => $user->id,
            'display_name' => $user->name,
            'slot' => 1,
            'status' => 'ready',
        ]);

        return [$match, $user];
    }
}
