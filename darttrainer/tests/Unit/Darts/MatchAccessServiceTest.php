<?php

namespace Tests\Unit\Darts;

use App\Enums\GameType;
use App\Enums\MatchStatus;
use App\Enums\MatchType;
use App\Models\DartMatch;
use App\Models\DartX01MatchConfig;
use App\Models\MatchPlayer;
use App\Models\User;
use App\Services\Darts\MatchAccessService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MatchAccessServiceTest extends TestCase
{
    use RefreshDatabase;

    private MatchAccessService $access;

    protected function setUp(): void
    {
        parent::setUp();
        $this->access = app(MatchAccessService::class);
    }

    public function test_host_is_participant(): void
    {
        [$match, $host] = $this->makeMatch();

        $this->assertTrue($this->access->isParticipant($match, $host));
        $this->assertTrue($this->access->isHost($match, $host));
        $this->assertTrue($this->access->canAccessPlayBoard($match, $host));
        $this->assertTrue($this->access->canAccessFullState($match, $host));
        $this->assertFalse($this->access->isSpectator($match, $host));
    }

    public function test_joined_player_is_participant(): void
    {
        [$match, $host] = $this->makeMatch();
        $player = User::factory()->create();

        MatchPlayer::query()->create([
            'match_id' => $match->id,
            'user_id' => $player->id,
            'display_name' => $player->name,
            'slot' => 2,
            'status' => 'ready',
        ]);

        $this->assertTrue($this->access->isParticipant($match, $player));
        $this->assertFalse($this->access->isHost($match, $player));
        $this->assertTrue($this->access->canAccessPlayBoard($match, $player));
    }

    public function test_stranger_cannot_access_private_active_match(): void
    {
        [$match] = $this->makeMatch(status: MatchStatus::Active, isPublic: false);
        $stranger = User::factory()->create();

        $this->assertFalse($this->access->isParticipant($match, $stranger));
        $this->assertFalse($this->access->canAccessPlayBoard($match, $stranger));
        $this->assertFalse($this->access->canAccessFullState($match, $stranger));
        $this->assertFalse($this->access->canAccessSpectatorState($match, $stranger));
    }

    public function test_stranger_can_spectate_public_active_match(): void
    {
        [$match] = $this->makeMatch(status: MatchStatus::Active, isPublic: true);
        $stranger = User::factory()->create();

        $this->assertFalse($this->access->canAccessPlayBoard($match, $stranger));
        $this->assertFalse($this->access->canAccessFullState($match, $stranger));
        $this->assertTrue($this->access->canAccessSpectatorState($match, $stranger));
        $this->assertTrue($this->access->isSpectator($match, $stranger));
    }

    public function test_public_lobby_does_not_allow_spectator_access(): void
    {
        [$match] = $this->makeMatch(status: MatchStatus::Lobby, isPublic: true);
        $stranger = User::factory()->create();

        $this->assertFalse($this->access->canAccessSpectatorState($match, $stranger));
    }

    public function test_broadcast_payload_denies_stranger(): void
    {
        [$match] = $this->makeMatch();
        $stranger = User::factory()->create();

        $this->assertFalse($this->access->broadcastUserPayload($match, $stranger));
    }

    public function test_broadcast_payload_allows_host(): void
    {
        [$match, $host] = $this->makeMatch();

        $this->assertSame(
            ['id' => $host->id, 'name' => $host->name],
            $this->access->broadcastUserPayload($match, $host),
        );
    }

    /**
     * @return array{0: DartMatch, 1: User}
     */
    private function makeMatch(MatchStatus $status = MatchStatus::Lobby, bool $isPublic = false): array
    {
        $host = User::factory()->create();

        $match = DartMatch::query()->create([
            'game_type' => GameType::DartsX01,
            'match_type' => MatchType::Solo,
            'status' => $status,
            'host_user_id' => $host->id,
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
            'is_public' => $isPublic,
        ]);

        MatchPlayer::query()->create([
            'match_id' => $match->id,
            'user_id' => $host->id,
            'display_name' => $host->name,
            'slot' => 1,
            'status' => 'ready',
        ]);

        return [$match->fresh(['config']), $host];
    }
}
