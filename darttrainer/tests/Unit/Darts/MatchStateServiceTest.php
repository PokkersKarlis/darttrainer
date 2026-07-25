<?php

namespace Tests\Unit\Darts;

use App\Enums\GameType;
use App\Enums\MatchStatus;
use App\Enums\MatchType;
use App\Models\DartMatch;
use App\Models\DartX01ActiveLeg;
use App\Models\DartX01MatchConfig;
use App\Models\DartX01SoloActiveThrow;
use App\Models\DartX01SoloActiveTurn;
use App\Models\MatchPlayer;
use App\Models\User;
use App\Services\Darts\MatchStateService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MatchStateServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_spectator_state_redacts_sensitive_fields(): void
    {
        $host = User::factory()->create();

        $match = DartMatch::query()->create([
            'game_type' => GameType::DartsX01,
            'match_type' => MatchType::Solo,
            'status' => MatchStatus::Active,
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
            'track_checkout_rate' => true,
            'is_public' => true,
        ]);

        MatchPlayer::query()->create([
            'match_id' => $match->id,
            'user_id' => $host->id,
            'display_name' => $host->name,
            'slot' => 1,
            'status' => 'playing',
        ]);

        MatchPlayer::query()->create([
            'match_id' => $match->id,
            'display_name' => 'Guest',
            'slot' => 2,
            'status' => 'playing',
        ]);

        $service = app(MatchStateService::class);
        $state = $service->buildSpectatorState($match->fresh(['config', 'players']));

        $this->assertSame('public', $state['visibility']);
        $this->assertArrayNotHasKey('config', $state);
        $this->assertArrayHasKey('scoreboard', $state);
        $this->assertCount(2, $state['scoreboard']);
        $this->assertArrayHasKey('name', $state['scoreboard'][0]);
        $this->assertArrayNotHasKey('user_id', $state['scoreboard'][0]);
        $this->assertArrayNotHasKey('player_id', $state['scoreboard'][0]);
    }

    public function test_match_average_aggregates_all_legs(): void
    {
        $host = User::factory()->create();

        $match = DartMatch::query()->create([
            'game_type' => GameType::DartsX01,
            'match_type' => MatchType::Solo,
            'status' => MatchStatus::Active,
            'host_user_id' => $host->id,
        ]);

        DartX01MatchConfig::query()->create([
            'match_id' => $match->id,
            'mode' => 'local',
            'format' => 'first_to',
            'legs_target' => 3,
            'sets_target' => 1,
            'starting_points' => 501,
            'in_rule' => 'straight',
            'out_rule' => 'double',
            'track_checkout_rate' => false,
            'is_public' => false,
        ]);

        $player = MatchPlayer::query()->create([
            'match_id' => $match->id,
            'user_id' => $host->id,
            'display_name' => $host->name,
            'slot' => 1,
            'status' => 'playing',
        ]);

        $finishedLeg = DartX01ActiveLeg::query()->create([
            'match_id' => $match->id,
            'leg_number' => 1,
            'starting_points' => 501,
            'status' => 'finished',
            'winner_player_id' => $player->id,
        ]);

        $activeLeg = DartX01ActiveLeg::query()->create([
            'match_id' => $match->id,
            'leg_number' => 2,
            'starting_points' => 501,
            'status' => 'active',
        ]);

        $finishedTurn = DartX01SoloActiveTurn::query()->create([
            'leg_id' => $finishedLeg->id,
            'player_id' => $player->id,
            'turn_number' => 1,
            'points_scored' => 40,
            'is_bust' => false,
            'remaining_points' => 461,
        ]);

        DartX01SoloActiveThrow::query()->create([
            'turn_id' => $finishedTurn->id,
            'throw_number' => 1,
            'sector' => 20,
            'multiplier' => 2,
            'input_source' => 'board',
            'is_leg_winner' => false,
        ]);

        $activeTurn = DartX01SoloActiveTurn::query()->create([
            'leg_id' => $activeLeg->id,
            'player_id' => $player->id,
            'turn_number' => 1,
            'points_scored' => 60,
            'is_bust' => false,
            'remaining_points' => 441,
        ]);

        foreach ([1, 2, 3] as $throwNumber) {
            DartX01SoloActiveThrow::query()->create([
                'turn_id' => $activeTurn->id,
                'throw_number' => $throwNumber,
                'sector' => 20,
                'multiplier' => 1,
                'input_source' => 'board',
                'is_leg_winner' => false,
            ]);
        }

        $state = app(MatchStateService::class)->buildState(
            $match->fresh(['config', 'players', 'legs.soloTurns.throws', 'activeLeg.soloTurns.throws', 'activeLeg.soloTurns.player']),
        );

        $row = collect($state['scoreboard'])->firstWhere('player_id', $player->id);

        $this->assertSame(60.0, $row['average_3pad_leg']);
        $this->assertSame(75.0, $row['average_3pad_match']);
    }
}
